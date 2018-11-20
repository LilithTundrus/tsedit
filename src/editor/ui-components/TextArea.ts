// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import Editor from '../Editor';
import KeyHandler from '../KeyHandler';
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
    shadowContent: string[];
    viewOffSet: number;
    textArea: blessed.Widgets.BoxElement;
    keyHandler: KeyHandler;
    verticalScrollOffset: number = 0;

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

            // Have this read the content of the new file vs the old (could be challenging depending
            // on if the editor started with a file or not)

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
    }

    // This will move the view of the editor 1 character to the left, using
    // the 'shadow' version of the document
    leftShiftText() {
        let lines = this.getVisibleLines();

        fs.writeFileSync('./LEFT.txt', this.viewOffSet + '\n')

        // if (this.viewOffSet !== 1) {
        //     lines.forEach((line, index) => {
        //         this.textArea.setLine(index + this.verticalScrollOffset, this.shadowContent[index + this.verticalScrollOffset].substring(this.viewOffSet));
        //     });
        // } else {
        lines.forEach((line, index) => {
            this.textArea.setLine(index + this.verticalScrollOffset, this.shadowContent[index + this.verticalScrollOffset].substring(this.viewOffSet));
        });
        // }

    }

    // This will move the view of the editor 1 character to the right, using
    // the 'shadow' version of the document
    rightshiftText() {
        let lines = this.getVisibleLines();

        fs.writeFileSync('./RIGHT.txt', this.viewOffSet + '\n')


        lines.forEach((line, index) => {
            this.textArea.setLine(index + this.verticalScrollOffset, line.substring(1));

        });
    }

    reformTextUpArrow() {
        let previousVisibleLineIndex = this.verticalScrollOffset - 1;
        let trueContent = this.shadowContent[previousVisibleLineIndex].substring(this.viewOffSet);
        this.textArea.setLine(previousVisibleLineIndex, trueContent);
    }

    reformTextDownArrow() {
        let visibleLines = this.getVisibleLines();
        let nextVisibleLineIndex = visibleLines.length + this.verticalScrollOffset;
        let trueContent = this.shadowContent[nextVisibleLineIndex].substring(this.viewOffSet);
        this.textArea.setLine(nextVisibleLineIndex, trueContent);
    }

    getViewOffset() {
        return this.viewOffSet;
    }

    setViewOffset(newOffset: number) {
        this.viewOffSet = newOffset;
    }


    getRelativeTop() {
        let relativeBottom = this.textArea.getScroll();
        let relativeTop = relativeBottom - this.textArea.height;

        if (relativeBottom == 0) {
            relativeTop = 0;
        }

        return relativeTop;
    }


    getRelativeBottom() {
        let relativeBottom: any = this.textArea.getScroll();
        if (relativeBottom == 0) {
            relativeBottom = this.textArea.height;
        }
        return relativeBottom;
    }

    getVisibleLines() {
        let visibleLines = [];

        for (let i = this.verticalScrollOffset; i < this.textArea.height - 2 + this.verticalScrollOffset; i++) {
            visibleLines.push(this.textArea.getLine(i))
        }
        return visibleLines;
    }
}