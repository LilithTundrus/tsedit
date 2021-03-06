// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import Editor from './Editor';
import LeftArrow from './keyHandlers/LeftArrow';
import RightArrow from './keyHandlers/RightArrow';
import Enter from './keyHandlers/Enter';
import Backspace from './keyHandlers/Backspace';

// Used for debugging
import * as fs from 'fs';
import { program } from 'blessed';

// This file contains the class for handling key events for the Editor Class's
// textArea UI component

// TODO: any offsets for horizontal need to be handled internally in the textarea class
// TODO: Refactor and split this all out...

// TODO: Make sure that this all works correctly, sometimes scrolling vertically can cause issues
export default class KeyHandler {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;
    private rightArrow: RightArrow;
    private leftArrow: LeftArrow;
    private enter: Enter;
    private backspace: Backspace

    constructor(editorInstance) {
        this.editorInstance = editorInstance;
        this.leftArrow = new LeftArrow(this.editorInstance);
        this.rightArrow = new RightArrow(this.editorInstance);
        this.enter = new Enter(this.editorInstance);
    }

    // The main keyHandler, accepts any standard character that's not handled elsewhere.
    // The cursor is aquired through an argument to prevent event listener overflow from blessed

    // TODO: When in a scroll offset and the text is shorter than the current offset and a character
    // is inserted on that line, make sure the view snaps back to that line
    // This needs to happen for ALL keys

    // TODO: Fix the issue where scrolling left/right doesn't alwyas properly update the visible text,
    // at the moment I think it has something to do with how the lines aren't being taken into account that
    // aren't visible at the moment or something like that since scrolling up/down over the affected lines
    // 'fixes' the issue. Looks more like it's due to up arrow and the fact that the PREVIOUS lines need 
    // to be calculated

    // So right now, It seems like it's a rendering/text insertion issue? It's still happening but the actual 
    // length of the text can be scrolled to the right using the right arrow keys... this makes no sense

    // TODO: get this onto the mini dell laptop for performance testing!!

    mainKeyHandler(character, cursor) {
        // This is where all 'standard' keys go (keys not handled elsewhere)

        // If the cursor is less than the right visual bound of the textArea
        if (cursor.x < this.editorInstance.screen.width - 1) {
            // Variable to get the current offset number for the line the cursor is on,
            // including the scrolling position of the textArea
            let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

            // Get the line of text that the cursor is on minus the borders of the screen
            let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

            // If there's no text to begin with, this check should avoid text going onto a new line
            if (cursor.x == 2 && currentLineText.length < 1) {
                this.mainKeyHandlerBlankLine(cursor, character);
            }
            // If the cursor is at the beginning of the line, this will insert the character
            // at the start of the line in front of all other text
            else if (cursor.x == 2 && currentLineText.length > 1) {
                this.mainkeyHandlerFirstColumnInsert(cursor, character);
            }
            // If the cursor is at the end, the character will be inserted
            // in between the text before and after the cursor and the view will shift
            else if (cursor.x >= currentLineText.length + 1) {
                this.mainkeyHandlerBasicEndOfLineHandler(cursor, character);
            }
            // If the cursor is somehwere in the middle of the textArea, it's an insert
            // and the character will be inserted in between the text before and after the cursor
            else {
                this.mainkeyHandlerAnyColumnInsert(cursor, character);
            }
            // Always render the screen to be sure the changes made correctly appear
            this.editorInstance.screen.render();
        } else {
            // Shift the horizontal scroll 1 to the right and add the character
            // to the current line.
            this.mainKeyHandelerAdvancedEndOfLineHandler(cursor, character);
        }
    }

    // This is literally only handling 'blank' lines, and for one character
    private mainKeyHandlerBlankLine(cursor, character: string) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // If the viewOffset is not zero, the line may not be actually blank
        if (this.editorInstance.textArea.viewOffSet > 0) {
            // Update the real data with the given character at the proper position
            this.editorInstance.textArea.shadowContent[currentLineOffset] =
                shadowLineText.slice(0, this.editorInstance.textArea.viewOffSet) + character +
                shadowLineText.slice(this.editorInstance.textArea.viewOffSet)
        } else {
            // The character should be the only thing to be added to the line since the
            // view offset is zero
            this.editorInstance.textArea.shadowContent[currentLineOffset] = character;
        }
        // Add the character to the beginning of the line in the view window
        this.editorInstance.textArea.textArea.setLine(currentLineOffset, character);
        // Render the text change/any other changes
        this.editorInstance.screen.render();

        // Specific to the space key, the cursor does not automatically move forward
        if (character === ' ') this.editorInstance.program.cursorForward();
        // Else, no cursor shift is needed since it is automatic in most cases
    }

    // TODO: when the view is more than the current line's length and doesn't show,
    // 'snap' the view back to the column where the text is being entered
    private mainkeyHandlerFirstColumnInsert(cursor, character: string) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // Get the line of text that the cursor is  on minus the borders of the screen
        let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // Add the character to the beginning of the line
        let newLineText = character + currentLineText;

        // Function-scoped view offset shortcuts and calculated cusor offset
        let localViewOffset = this.editorInstance.textArea.viewOffSet;
        let cursorOffset = cursor.x - 1;

        // REAL Text BEFORE the cursor
        let preText = shadowLineText.slice(0, localViewOffset + cursorOffset);
        // REAL Text AFTER the cursor
        let postText = shadowLineText.slice(localViewOffset + cursorOffset);

        if (this.editorInstance.textArea.viewOffSet > 0) {
            // If the length of the current line's text is MORE than the current viewOffset
            if (shadowLineText.length > this.editorInstance.textArea.viewOffSet) {

                // Update the real data with the given character
                this.editorInstance.textArea.shadowContent[currentLineOffset] =
                    preText + character + postText;
                // Make sure the insert occurs correctly, even when the view is shifted
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);
                // Left shift the text so the character just inserted is visible
                this.editorInstance.textArea.leftShiftText();
                this.editorInstance.textArea.viewOffSet--;
                // Render the text change
                this.editorInstance.screen.render();
                // Offset the auto-cursor-restore to move the cursor back to the
                // last position it was in before the text change
                this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x + 1);
            } else {
                // TODO: Handle this?
            }
        }
        else {
            // Update the real data with the given character
            this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;
            // Update the viewable line with the given character
            this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);
            // Render the text change
            this.editorInstance.screen.render();
            // Offset the auto-cursor-restore to move the cursor back to the
            // last position it was in before the text change
            this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x);
        }
    }

    // This is only handling text insertion at the end of the line
    private mainkeyHandlerBasicEndOfLineHandler(cursor, character: string) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // Get the line of text that the cursor is  on minus the borders of the screen
        let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // Add the character to the end of the line, the cursor auto-renders
        // and moves forward on its own in this case
        let newLineText = currentLineText + character;
        this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);

        // TODO: See if these are any different, or even if this ever occurs!
        if (this.editorInstance.textArea.viewOffSet > 0) {
            // Update the real data with the given character
            let newText = shadowLineText + character;
            this.editorInstance.textArea.shadowContent[currentLineOffset] = newText;
        } else {
            // Update the real data with the given character
            let newText = shadowLineText + character;
            this.editorInstance.textArea.shadowContent[currentLineOffset] = newText;
        }

        // Render the text change/any other changes
        this.editorInstance.screen.render();

        // Specific to the space key, the cursor does not automatically move forward
        if (character === ' ') this.editorInstance.program.cursorForward();
        // Else, no cursor shift is needed since it is automatic in most cases
    }

    // TODO: this can still sometimes not work right, oldtext newtext can sometimes become oldtextnewtext
    private mainkeyHandlerAnyColumnInsert(cursor, character: string) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // Get the line of text that the cursor is  on minus the borders of the screen
        let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // String portion BEFORE the insert (visual, not actual)
        let startingString = currentLineText.substring(0, cursor.x - 2);
        // String portion AFTER the insert (visual, not actual)
        let endingString = currentLineText.substring(cursor.x - 2);

        // Add the character in between the 2 strings 
        let newLineText = startingString + character + endingString;
        // Set the current line to the new line with the new character inserted (visually)
        this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);

        // Function-scoped view offset shortcuts and calculated cusor offset
        let localViewOffset = this.editorInstance.textArea.viewOffSet;
        let cursorOffset = cursor.x - 1;

        // REAL Text BEFORE the cursor
        let preText = shadowLineText.slice(0, localViewOffset + cursorOffset);
        // REAL Text AFTER the cursor
        let postText = shadowLineText.slice(localViewOffset + cursorOffset);

        // Update the real data with the given character
        if (this.editorInstance.textArea.viewOffSet > 0) {
            // Insert the character into the 'true' string at the correct position
            // The ending string can be used here since it has all information after the
            // inserted character
            this.editorInstance.textArea.shadowContent[currentLineOffset] =
                preText + character + postText;
        } else {
            // Just set the real content to the text on screen since the real text is the same
            // as the visual text
            this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;
        }

        // Render the text change
        this.editorInstance.screen.render();
        // Move the cursor back to where it was before the text was added
        this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x);
    }

    // This will insert text into the 'real' string and move the text forward one
    // so the text can keep naturally scroll and be entered properly
    // NOTE: This sometimes may not work. Need to fix
    private mainKeyHandelerAdvancedEndOfLineHandler(cursor, character: string) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // Get the line of text that the cursor is  on minus the borders of the screen
        let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // String portion BEFORE the insert (visual, not actual)
        let startingString = currentLineText.substring(0, cursor.x - 2);
        // String portion AFTER the insert (visual, not actual)
        let endingString = currentLineText.substring(cursor.x - 2);

        // Add the character in between the 2 strings (visually)
        let newLineText = startingString + character + endingString;

        // Function-scoped view offset shortcuts and calculated cusor offset
        let localViewOffset = this.editorInstance.textArea.viewOffSet;
        let cursorOffset = cursor.x - 1;

        // REAL Text BEFORE the cursor
        let preText = shadowLineText.slice(0, localViewOffset + cursorOffset);
        // REAL Text AFTER the cursor
        let postText = shadowLineText.slice(localViewOffset + cursorOffset);

        // Set the current line to the new line with the new character inserted (visually)
        this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);
        // Render the text change
        this.editorInstance.screen.render();

        // Update the real data with the given character
        if (this.editorInstance.textArea.viewOffSet > 0) {
            // Insert the character into the 'true' string at the correct position
            // The ending string can be used here since it has all information after the
            // inserted character
            this.editorInstance.textArea.shadowContent[currentLineOffset] =
                preText + character + postText;
            this.editorInstance.textArea.rightshiftText();
            this.editorInstance.textArea.viewOffSet++;
        } else {
            // The 'true' content should be set to the pretext and post text since the 
            // test is now longer than the editing area by 1
            this.editorInstance.textArea.shadowContent[currentLineOffset] =
                preText + character + postText;

            // Right shift all visible text since the inserted character is at the end
            // and the next character needs to be visible
            this.editorInstance.textArea.rightshiftText();
            // Increase the horizontal viewOffset by one since the text has been shifted right
            this.editorInstance.textArea.viewOffSet++;
        }

        // Render the text change
        this.editorInstance.screen.render();
        // Move the cursor back to where it was before the text was added
        this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x - 1);
    }

    backspaceHandler() {
        this.editorInstance.program.getCursor((err, cursor) => {

            // This is where all 'standard' keys go (keys not handled elsewhere)

            // If the cursor is less than the right visual bound of the textArea
            if (cursor.x < this.editorInstance.screen.width - 1) {
                // Variable to get the current offset number for the line the cursor is on,
                // including the scrolling position of the textArea
                let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

                // Get the line of text that the cursor is on minus the borders of the screen
                let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

                // If there's no text to begin with
                if (cursor.x == 2 && currentLineText.length < 1) {
                    this.backspace.backspaceHandlerBlankLine(cursor);
                }
                // If the cursor is at the beginning of the line
                else if (cursor.x == 2 && currentLineText.length > 1) {
                    this.backspace.backspaceHandlerStartOfLine(cursor);
                }
                // If the cursor is at the end
                else if (cursor.x >= currentLineText.length + 1) {
                    this.backspace.backspaceHandlerEndOfLine(cursor);
                }
                // If the cursor is somehwere in the middle of the textArea, it's an insert
                // and the character will be inserted in between the text before and after the cursor
                else {
                    this.backspace.backspaceHandlerAnyColumn(cursor);
                }
                // Always render the screen to be sure the changes made correctly appear
                this.editorInstance.screen.render();
            } else {
                // TODO: this should be handled
            }
        });
    }

    // TODO: Make sure all of this actually works
    enterHandler() {
        this.editorInstance.program.getCursor((err, cursor) => {
            // If cursor is at the beginning of the line
            if (cursor.x == 2) {
                this.enter.enterHandlerStartOfLine(cursor);
                this.editorInstance.textArea.verticalScrollOffset++;
            }
            // Cursor is at the 'end' of the line (still checks for the viewOffset)
            else if (cursor.x >= this.editorInstance.screen.width - 1) {
                this.enter.enterHandlerEndOfLine(cursor);
            } else {
                // Cursor is in the middle somewhere, a check for the viewoffset still needs to occur
                // along with handling when the line
                this.enter.enterHandlerAnyColumnInsert(cursor);
            }
        });
    }

    tabHandler() {
        // This will need a lot of work, should be similar to the main keyhandler
    }

    // TODO: Make sure the statusbar column and row data gets updated here
    leftArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // If the cursor is not at the end of the line the cursor is on, move it backwards one
            if (cursor.x > 2) {
                this.leftArrow.leftArrowHandlerBasic(cursor);
            }
            else if (cursor.x == 2 && this.editorInstance.textArea.viewOffSet == 0) {
                this.leftArrow.leftArrowHandlerNoOffset(cursor);
            }
            // If the viewOffset for the textArea isn't 0, scroll the textArea to the left by 1
            else if (cursor.x == 2 && this.editorInstance.textArea.viewOffSet !== 0) {
                this.leftArrow.leftArrowHandlerShiftText(cursor);
            }
            // TODO: Rework this and the set cols to simply work on any keypress event
            this.editorInstance.statusBar.setRows(this.editorInstance.textArea.verticalScrollOffset + 1);
            this.editorInstance.statusBar.setColumns(cursor.x + this.editorInstance.textArea.viewOffSet)
        });
    }

    // TODO: Make sure the statusbar column and row data gets updated here
    rightArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // If the cursor is not at the end of the line the cursor is on, move it forward one
            if (cursor.x < this.editorInstance.screen.width - 1) {
                this.rightArrow.rightArrowHandlerBasic(cursor);
            }
            // Horiztonally scroll the text right by 1 if the current line is greater than the
            // width of the editing window
            else {
                this.rightArrow.rightHandlerForwwardShift(cursor);
            }
            this.editorInstance.statusBar.setRows(this.editorInstance.textArea.verticalScrollOffset + 1);
            this.editorInstance.statusBar.setColumns(cursor.x + this.editorInstance.textArea.viewOffSet)
        });
    }

    // TODO: have this and the down arrow handler behave differently depending on the length of the
    // next/previous line that acts more like an editor should
    upArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {

            // If the cursor is in top bound of the editing window plus the menubar height
            if (cursor.y > 3) {
                // If the cursor isn't at the top of the textArea, move it up by one
                this.editorInstance.program.cursorUp();
                // Render the cursor change
                this.editorInstance.screen.render();
                this.editorInstance.textArea.verticalScrollOffset--;
            }
            // Scroll the text up by one line if the textarea isn't at 0% scroll
            else if (cursor.y == 3 && this.editorInstance.textArea.textArea.getScrollPerc() > 0) {
                // Scroll the textArea's visible contents up by one
                this.editorInstance.textArea.textArea.scroll(-1);

                // Make sure that the previous line is on the right horizontal scroll index
                this.editorInstance.textArea.reformTextUpArrow();
                // Render the text reforms
                this.editorInstance.screen.render();

                // Keep the cursor in its previous position
                // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3 
                // (less cursor jank)
                this.editorInstance.program.cursorPos(2, cursor.x - 1);
                // Render the cursor change
                this.editorInstance.screen.render();
                // Reduce the verticalScrollOffset by one to match the blessed scroll index
                this.editorInstance.textArea.verticalScrollOffset--;
                this.editorInstance.textArea.internalVerticalOffset--;
            } else {
                // TODO: Make this a preference that can be set
                // Default terminal bell when input is registered but a further scroll cannot be performed
                // this.editorInstance.program.bell();
                this.editorInstance.textArea.reformTextUpArrow()
            }
            this.editorInstance.statusBar.setRows(this.editorInstance.textArea.verticalScrollOffset + 1);
        });
    }

    // TODO: have this shift the text left/right depending on the next line's length compared to the current line
    downArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y position 
        // of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {

            // This visually keeps the cursor within bottom bound of the editing window,
            // accounting for the extra the statusbar height
            if (cursor.y < this.editorInstance.screen.height - 1) {
                // If the cursor isn't at the bottom of the textArea, move it down by one
                this.editorInstance.program.cursorDown();
                this.editorInstance.screen.render();
                this.editorInstance.textArea.verticalScrollOffset++;
            }
            // Scroll the text down by one if the cursor is at the bottom of the textArea
            else if (cursor.y == this.editorInstance.screen.height - 1) {
                // This AND check prevents a crash that occurs when on the last line of the 
                // text being edited
                if (this.editorInstance.textArea.textArea.getScrollPerc() !== 100 && this.editorInstance.textArea.shadowContent.length > this.editorInstance.textArea.textArea.height) {

                    // Scroll the textArea down by one
                    this.editorInstance.textArea.textArea.scroll(1);
                    // Ensure the scroll rendered before the text reform function is called
                    this.editorInstance.screen.render();

                    // Make sure that the next line is on the right horizontal scroll index
                    this.editorInstance.textArea.reformTextDownArrow();
                    // Render the text reform
                    this.editorInstance.screen.render();

                    // Keep the cursor in its previous position
                    // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3
                    // (less cursor jank)
                    let relativeBottomHeight = this.editorInstance.screen.height - 2;
                    this.editorInstance.program.cursorPos(relativeBottomHeight, cursor.x - 1);
                    // Render the cursor change
                    this.editorInstance.screen.render();
                    // Increase the verticalScrollOffset by one to match the blessed scroll index
                    this.editorInstance.textArea.verticalScrollOffset++;
                    this.editorInstance.textArea.internalVerticalOffset++;

                    fs.writeFileSync('./vertical.txt', this.editorInstance.textArea.verticalScrollOffset)
                } else {
                    // TODO: This should be an option eventually for enabling/disabling sound

                    // Emit a beep/noise when the the textArea cannot scroll any more
                    // this.editorInstance.program.bell();
                }
            }

            this.editorInstance.statusBar.setRows(this.editorInstance.textArea.verticalScrollOffset + 1);
        });
    }

    // TODO: Make sure the statusbar column and row data gets updated here
    homeHandler() {
        let viewOffset = this.editorInstance.textArea.viewOffSet;
        this.editorInstance.program.getCursor((err, cursor) => {
            // If there is a view offset for the textArea
            // TODO: Have this only snap back to the START of the current line
            if (viewOffset > 0) {
                // Shift the text back to zero
                this.editorInstance.textArea.leftShiftText(viewOffset);
                // Render the text shift
                this.editorInstance.screen.render();
                // Set the actual offset value to zero
                this.editorInstance.textArea.viewOffSet = 0;
                // Move the cursor to the start of the current line
                this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                // Render the cursor change
                this.editorInstance.screen.render();
            } else {
                // Simply move the cursor to the beginning of the line
                this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                // Render the cursor change
                this.editorInstance.screen.render();
            }
        });
    }

    // TODO: Make sure the statusbar column and row data gets updated here
    endHandler() {
        let viewOffset = this.editorInstance.textArea.viewOffSet;

        // This callback returns an err and data object, the data object has the x/y position 
        // of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Variable to get the current offset number for the line the cursor is on,
            // including the scrolling position of the textArea
            let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

            // Get the line of text that the cursor is  on minus the borders of the screen
            let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

            // Shadow line is the 'true' line, not just the edit view
            let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];
            let shadowLineLength = shadowLineText.length;
            // Not really sure why this is the calculation needed, but it works
            let textAreaLength = this.editorInstance.textArea.textArea.width - 3;

            // If the text is in a horizontally scrolling state
            if (viewOffset > 0) {
                // If the text's length is less than the screen, the cursor just needs to move
                if (currentLineText.length < this.editorInstance.textArea.textArea.width) {
                    this.editorInstance.program.cursorPos(cursor.y - 1, currentLineText.length + 1);
                } else {
                    let currentShadowLineLength = shadowLineLength - viewOffset;
                    let claculatedShiftAmmount = currentShadowLineLength - textAreaLength;

                    // Right shift the text by the length of the current line minus the view window
                    this.editorInstance.textArea.rightshiftText(claculatedShiftAmmount);

                    // Render the text shift
                    this.editorInstance.screen.render();
                    // Keep the cursor right against the right bound of the textArea
                    // (this can sometimes get moved due to the redraw of the text)
                    let screenWidthWithUIOffsets = this.editorInstance.screen.width - 2;
                    this.editorInstance.program.cursorPos(cursor.y - 1, screenWidthWithUIOffsets);
                    // Render the cursor change
                    this.editorInstance.screen.render();
                    // Set the actual offset value to the length of the line
                    this.editorInstance.textArea.viewOffSet = currentShadowLineLength;
                }
            }
            // No calculation needs to be made to account for the current offset since it's zero
            else {
                // If the text's length is less than the screen, the cursor just needs to move
                if (currentLineText.length < this.editorInstance.textArea.textArea.width) {
                    this.editorInstance.program.cursorPos(cursor.y - 1, currentLineText.length + 1);
                }
                // A bit of calculation needs to be done otherwise
                else {
                    // Shorthand for the length of the true text minus the length of the 
                    // textArea UI component
                    let claculatedShiftAmmount = shadowLineLength - textAreaLength;
                    // Right shift the text by the length of the current line minus the view window
                    this.editorInstance.textArea.rightshiftText(claculatedShiftAmmount);
                    // Render the text shift
                    this.editorInstance.screen.render();
                    // Keep the cursor right against the right bound of the textArea
                    // (this can sometimes get moved due to the redraw of the text)
                    let screenWidthWithUIOffsets = this.editorInstance.screen.width - 2;
                    this.editorInstance.program.cursorPos(cursor.y - 1, screenWidthWithUIOffsets);
                    // Render the cursor change
                    this.editorInstance.screen.render();
                    // Set the actual offset value to the length of the line
                    this.editorInstance.textArea.viewOffSet = claculatedShiftAmmount;
                }
            }
        });
    }

}