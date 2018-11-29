// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import Editor from '../Editor';
import KeyHandler from '../KeyHandler';
import customKeys from '../custom-keys';
// Used for debugging
import * as fs from 'fs';

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the textArea textbox, where the actual text being edited will be displayed

export default class TextArea {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;
    private content;
    // The shadowContent will be used to update the actual text being edited
    // For example, any time a line's content is change, it will first occur
    // in the shadow content and THEN be visually updated on the screen.
    shadowContent: string[];
    // Used to store the offset of the horizontal view of the text being edited
    viewOffSet: number;
    textArea: blessed.Widgets.BoxElement;
    keyHandler: KeyHandler;
    // Used to store the vertical offset from the first line
    verticalScrollOffset: number = 0;
    // Used to keep a way to get visible lines
    internalVerticalOffset: number = 0;

    constructor(editorInstance: Editor, content) {
        this.editorInstance = editorInstance;
        this.content = content;
        this.keyHandler = new KeyHandler(editorInstance);


        // Create the textArea blessed box (declared as any due to some typings being incorrect)
        this.textArea = blessed.box(<any>{
            // Parent option for the component, controls how the element interacts with others
            parent: this.editorInstance.screen,

            // Component relative position options

            // The top of this element should be the parent width plus 1
            top: 1,


            // Component size options

            // Keep the width of this element to 100% of the screen
            width: '100%+1',
            // Height should be the entire screen minus 1 because of the statusBar 
            // (not doing this would hide part of the text entry window)
            height: '100%-1',


            // Key related options

            // Allow input of the element
            input: true,
            // Dissallow default key mappings
            keys: false,
            // Set the element to support all key inputs
            keyable: true,


            // Content control options

            // Don't capture SGR blessed escape codes, that could cause issues
            tags: false,
            // Don't shrink the text box if the window resizes
            shrink: false,
            // Dissallow text to wrap down the the next line (not documented but still works)
            wrap: false,
            visible: true,


            // Alignment options

            // Left align the text for this element
            align: 'left',


            // Scrolling options

            // Allow the element to be scrollable
            scrollable: true,
            // Always allow the element to be scrollable, even if the content is shorter
            // than the height of the windows
            alwaysScroll: true,
            // Scrollbar styles, using extended characters here to 
            // represent the scroll location character
            scrollbar: {
                ch: '█',
                track: {
                    bg: 'black',
                    ch: '░'
                },
            },
            // Limit the maximum content to 16,000 lines (at least initially)
            baseLimit: 16000,


            // Border options

            border: {
                type: 'line'
            },


            // Styling options

            // This style matches the DOS edit theme
            style: {
                fg: 'bold',
                bg: 'blue',
                border: {
                    fg: 'light-grey',
                },
                label: {
                    fg: 'black',
                    bg: 'light-grey'
                }
            },

            // Content/label options

            // The label is a string that sits on the top left corner of the element,
            // this is similar to a title windows
            label: this.editorInstance.filePath,
            // The content is what text the box should display
            content: this.content,
        });

        // This is the content that gets updated along with the content that can be seen on
        // screen
        // Any horizontal movement should NOT effect this array BUT any text addition,
        // modification or removal WILL

        // This may get messy but it is doable!
        this.shadowContent = this.textArea.getLines();

        this.editorInstance.screen.render();
        // Set the viewOffset to zero to prevent NaN calculations in certain situations
        this.viewOffSet = 0;
        // Construct each key listener for the textArea
        this.registerKeyListeners();
    }

    /** Register the key listeners for the textArea element
     * @private
     * @memberof TextArea
     */
    private registerKeyListeners() {

        // Quit on Control-W
        // TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
        this.textArea.key(['C-w'], () => {
            // Have this read the content of the new file vs the old 
            // (could be challenging depending on if the editor started with a file or not)
            return process.exit(0);
        });

        this.textArea.key('left', () => {
            this.keyHandler.leftArrowHandler();
        });

        this.textArea.key('right', () => {
            this.keyHandler.rightArrowHandler();
        });

        this.textArea.key('up', () => {
            this.keyHandler.upArrowHandler();
        });

        this.textArea.key('down', () => {
            this.keyHandler.downArrowHandler();
        });

        this.textArea.key('space', () => {
            // Determine where to insert the character that was entered based on the cursor position
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.editorInstance.program.getCursor((err, cursor) => {
                this.keyHandler.mainKeyHandler(' ', cursor);
            });
        });

        this.textArea.key('home', () => {
            this.keyHandler.homeHandler();
        });

        this.textArea.key('end', () => {
            this.keyHandler.endHandler();
        });

        this.textArea.key('enter', () => {
            this.keyHandler.enterHandler();
        });


        this.textArea.on('keypress', (ch, key) => {
            // Return on undefined, these are keys we can handle elsewhere 
            // (undefined means it isn't a display character)
            if (ch == undefined) return;
            // If the key is already handled elsewhere, return
            else if (customKeys.has(key.name)) return;
            // This shouldn't be needed, but the \r code sometimes gets into here
            if (ch === '\r') return;

            // Determine where to insert the character that was entered based on the cursor position
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.editorInstance.program.getCursor((err, cursor) => {

                return this.keyHandler.mainKeyHandler(ch, cursor);
            });
        });

        // Test file writing function
        // TODO: This should be aware of whether or not the editor has a file already/etc.
        this.textArea.key(['C-s'], () => {
            // TODO: this needs to be doing a lot more eventually
            // Remove the cursor from the text that for SOME REASON shows up
            fs.writeFileSync('test', this.editorInstance.textArea.shadowContent.join('\n').replace('', '').replace('', ''));
        });
    }

    // This will move the view of the editor 1 character to the left, using
    // the 'shadow' version of the document
    // TODO: this can sometimes not work correctly and improperly display text

    leftShiftText(ammount?: number) {
        if (!ammount) ammount = 0;
        // Get all currently visible lines as an array
        let lines = this.getVisibleLines();

        lines.forEach((line, index) => {
            // Current line index is the iterated index plus the vertical scroll offset
            let currentLineIndex = index + this.internalVerticalOffset;
            // The 'true' text is the same index in the shadowContent array
            let trueText = this.shadowContent[currentLineIndex];
            // Set the current line to the 'true' text by 1 to the left
            if (this.viewOffSet == 0) {
                this.textArea.setLine(currentLineIndex, trueText.substring(0));
            } else {
                this.textArea.setLine(currentLineIndex, trueText.substring(this.viewOffSet - ammount));
            }
        });
    }

    // This will move the view of the editor 1 character to the right, using
    // the 'shadow' version of the document
    // TODO: this can sometimes not work correctly and improperly display text

    rightshiftText(ammount?: number) {
        if (!ammount) ammount = 0;
        // Get all currently visible lines as an array
        let lines = this.getVisibleLines();

        // TODO: there's an issue with this where the text isn't shifted properly on all lines

        lines.forEach((line, index) => {
            // Set the currently iterated line to the line minus one character of the string
            // The right shifting of text doesn't need to know what the true text is (for now)
            this.textArea.setLine(index + this.internalVerticalOffset, line.substring(1 + ammount));
        });
    }

    // This function ensures that on a vertical scroll, the next line is still on the right
    // horizontal view offset
    reformTextUpArrow() {
        // Get all currently visible lines as an array
        let visibleLines = this.getVisibleLines();

        // Get the previous line index to what is currently visible
        let previousVisibleLineIndex = this.internalVerticalOffset - 1 + visibleLines.length - 1;

        // Get the 'true' text of the next line, plus the view offset
        let trueContent = this.shadowContent[previousVisibleLineIndex].substring(this.viewOffSet);
        // Set the line to the 'true' content before it is seen
        this.textArea.setLine(previousVisibleLineIndex, trueContent);
    }

    // This function ensures that on a vertical scroll, the previous line is still on the right
    // horizontal view offset
    reformTextDownArrow() {
        // Get all currently visible lines as an array
        let visibleLines = this.getVisibleLines();
        // Get the next line index to what is currently visible
        let nextVisibleLineIndex = visibleLines.length + this.internalVerticalOffset;

        // Get the 'true' text of the next line, plus the view offset
        let trueContent = this.shadowContent[nextVisibleLineIndex].substring(this.viewOffSet);
        // Set the line to the 'true' content before it is seen
        this.textArea.setLine(nextVisibleLineIndex, trueContent);
    }

    getViewOffset() {
        return this.viewOffSet;
    }

    setViewOffset(newOffset: number) {
        this.viewOffSet = newOffset;
    }

    /** Get the relative top number for the screen
     * @returns
     * @memberof TextArea
     */
    getRelativeTop() {
        // Attempts to get the current scroll index of the textArea
        let relativeBottom = this.textArea.getScroll();
        // Top of the scren should be the bottom of the screen minus the height
        let relativeTop = relativeBottom - this.textArea.height;

        // if the number is zero, then there is no offset to be calculated, it is zero (hopefully)
        if (relativeBottom == 0) {
            relativeTop = 0;
        }

        return relativeTop;
    }

    /** Get the relative bottom number for the screen
     * @returns
     * @memberof TextArea
     */
    getRelativeBottom() {
        // Attempts to get the current scroll index of the textArea
        let relativeBottom: any = this.textArea.getScroll();
        // If this number is zero so the textArea is not scrolling,
        // therefore it is the height of the textArea (hopefully)
        if (relativeBottom == 0) {
            relativeBottom = this.textArea.height;
        }
        return relativeBottom;
    }

    // TODO: this need a fix after the offset being changed to per-line
    // the cusror probably needs to be ignored and maybe using something like the blessed
    // getscroll() method and subtracting the screen will work...
    // Basically the offset needs to be used but the visible text before and after it can get weird

    /** Return the visible lines of the textArea as an array
     * @returns
     * @memberof TextArea
     */
    getVisibleLines() {
        let visibleLines = [];
        // Relative height of the textArea itself
        let textAreaRelativeHeight = this.textArea.height - 2;
        // Offset is just shorthand for the class's vertical offset
        let offset = this.internalVerticalOffset;

        for (let i = offset; i < textAreaRelativeHeight + offset; i++) {
            // Push the current line to the temporary array
            visibleLines.push(this.textArea.getLine(i));
        }
        return visibleLines;
    }

    // Basic function to get the scrolling cursor offset (used frequently for each key)
    calculateScrollingOffset(cursor) {
        // Get the cursor position relative to the textArea (minus the menubar and the texarea's borders)
        let cursorYRelative = cursor.y - 3;
        // Position of the cursor relative to the BOTTOM of the textArea
        let cursorYFromRelativeBottom = this.textArea.height - cursorYRelative;

        // getscroll() is the LAST line of the textarea
        // For some the cursor.y relative offset must be removed (add 3)
        let currentLineScrollOffset = this.textArea.getScroll() - cursorYFromRelativeBottom + 3;

        if (this.textArea.getScroll() == 0) currentLineScrollOffset = cursorYRelative;

        return this.verticalScrollOffset;
    }
}