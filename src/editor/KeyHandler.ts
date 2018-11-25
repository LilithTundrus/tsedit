// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import Editor from './Editor';
// Used for debugging
import * as fs from 'fs';

// This file contains the class for handling key events for the Editor Class's
// textArea UI component

export default class KeyHandler {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance) {
        this.editorInstance = editorInstance;
    }

    // The main keyyHandler, accepts any standard character that's not handled elsewhere.
    // The cursor is aquired through an argument to prevent event listener overflow from blessed

    // TODO: When in a scroll offset and the text is shorter than the current offset and a character
    // is inserted on that line, make sure the view snaps back to that line

    // TODO: TEST ALL FUNCTIONS A LOT

    // TODO: There's an issue with text insertion on the vertical scroll where it inserts
    // characters in between text incorrectly, like so: aaa inserting bbb at the beginning turns into abbbaa
    mainKeyHandler(character, cursor) {
        // This is where all 'standard' keys go (keys not handled elsewhere)

        if (cursor.x < this.editorInstance.screen.width - 1) {

            // Variable to get the current offset number for the line the cursor is on,
            // including the scrolling position of the textArea
            let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

            // Get the line of text that the cursor is sitting on minus the borders of the screen
            let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

            let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

            // If there's no text to begin with, this check should avoid text going onto a new line
            if (cursor.x == 2 && currentLineText.length < 1) {
                // Update the real data with the given character
                if (this.editorInstance.textArea.viewOffSet > 0) {
                    this.editorInstance.textArea.shadowContent[currentLineOffset] =
                        shadowLineText.slice(0, this.editorInstance.textArea.viewOffSet) + character +
                        shadowLineText.slice(this.editorInstance.textArea.viewOffSet)
                } else {
                    this.editorInstance.textArea.shadowContent[currentLineOffset] = character;
                }
                // Add the character to the beginning of the line
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, character);
                // Render the text change
                this.editorInstance.screen.render();
                // No cursor shift is needed since it is automatic on this case
            }
            // If cursor is at the beginning of the line, this will
            // move the rest of the text forward and insert the character
            else if (cursor.x == 2 && currentLineText.length > 1) {

                // Add the character to the beginning of the line
                let newLineText = character + currentLineText;

                // Update the real data with the given character
                if (this.editorInstance.textArea.viewOffSet > 0) {
                    // Make sure the insert occurs correctly, even when the view is shifted
                    this.editorInstance.textArea.shadowContent[currentLineOffset] =
                        /* shadowLineText.slice(0, this.editorInstance.textArea.viewOffSet + 2) + */ character +
                        shadowLineText.slice(this.editorInstance.textArea.viewOffSet + 2)
                    // this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);
                } else {
                    this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;
                    // Update the viewable line with the given character
                    this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);
                }


                // Render the text change
                this.editorInstance.screen.render();
                // Offset the auto-cursor-restore to move the cursor back to the
                // last position it was in before the text change
                this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x);
            }
            // If the cursor is at the end (this only works when the view offset is zero)
            else if (cursor.x >= currentLineText.length + 1) {
                // Add the character to the end of the line, the cursor auto-renders
                // and moves forward on its own in this case
                let newLineText = currentLineText + character;
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);

                // Update the real data with the given character
                if (this.editorInstance.textArea.viewOffSet > 0) {
                    this.editorInstance.textArea.shadowContent[currentLineOffset] =
                        shadowLineText + character;
                } else {
                    this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;
                }

                // No cursor shift is needed since it is automatic on this case
            }
            // If the cursor is somehwere in the middle (it's an insert)
            else {
                // String portion BEFORE the insert (visual, not actual)
                let startingString = currentLineText.substring(0, cursor.x - 2);
                // String portion AFTER the insert (this is the entire string after the cursor)
                let endingString = currentLineText.substring(cursor.x - 2);

                // Add the character in between the 2 strings
                let newLineText = startingString + character + endingString;
                // Set the current line to the new line with the new character inserted
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);

                // Update the real data with the given character
                if (this.editorInstance.textArea.viewOffSet > 0) {
                    let textBeforeCursor = shadowLineText.slice(0, this.editorInstance.textArea.viewOffSet + cursor.x - 1);
                    let textAfterCursor = shadowLineText.slice(this.editorInstance.textArea.viewOffSet + cursor.x - 1)

                    // Insert the character into the 'true' string at the correct position
                    // The ending string can be used here since it has all information after the
                    // inserted character
                    this.editorInstance.textArea.shadowContent[currentLineOffset] =
                        textBeforeCursor + character + textAfterCursor;

                } else {
                    this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;
                }

                // Render the text change
                this.editorInstance.screen.render();
                // Move the cursor back to where it was before the text was added
                this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x);
            }

            // Always render the screen to be sure the changes made correctly appear
            this.editorInstance.screen.render();
        } else {
            // Shift the horizontal scroll 1 to the right and add the character
        }
    }

    spaceHandler() {

    }

    leftArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            // If the cursor is not at the end of the line the cursor is on, move it backwards one
            if (cursor.x > 2) {
                this.editorInstance.program.cursorBackward();
                this.editorInstance.screen.render();
            }
            else if (cursor.x == 2 && this.editorInstance.textArea.viewOffSet == 0) {
                // Do nothing (for now)
            }
            // If the viewOffset for the textArea isn't 0, scroll the textArea to the left by 1
            else if (cursor.x == 2 && this.editorInstance.textArea.viewOffSet !== 0) {
                // TODO: prevent the cursor from moving past the current line's text length

                // Decrease the horizontal view offset of the textArea by one
                this.editorInstance.textArea.viewOffSet--;
                // Visually shift all visible text to the left by one
                this.editorInstance.textArea.leftShiftText();
                // Render the text shift
                this.editorInstance.screen.render();
                // Keep the cursor right against the left bound of the textArea
                // (this can sometimes get moved due to the redraw of the text)
                this.editorInstance.program.cursorPos(cursor.y - 1, 1);
            }
        });
    }

    rightArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            // If the cursor is not at the end of the line the cursor is on, move it forward one
            if (cursor.x < this.editorInstance.screen.width - 1) {
                this.editorInstance.program.cursorForward();
                this.editorInstance.screen.render();
            }
            // Horiztonally scroll the text right by 1 if the current line is greater than the
            // width of the editing window
            else {
                // TODO: prevent the cursor from moving past the current line's text length

                // Increase the horizontal view offset of the textArea by one
                this.editorInstance.textArea.viewOffSet++;
                // Visually shift all visible text to the right by one
                this.editorInstance.textArea.rightshiftText();
                // Render the text shift
                this.editorInstance.screen.render();
                // Keep the cursor right against the right bound of the textArea
                // (this can sometimes get moved due to the redraw of the text)
                let screenWidthWithUIOffsets = this.editorInstance.screen.width - 2;
                this.editorInstance.program.cursorPos(cursor.y - 1, screenWidthWithUIOffsets);
            }
        });
    }

    // TODO: have this shift the text left/right depending on the previous line's length compared to the current line
    upArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;

            // If the cursor is in top bound of the editing window plus the menubar height
            if (cursor.y > 3) {
                // If the cursor isn't at the top of the textArea, move it up by one
                this.editorInstance.program.cursorUp();
                // Render the cursor change
                this.editorInstance.screen.render();
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
            }
        });
    }

    // TODO: have this shift the text left/right depending on the next line's length compared to the current line
    downArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y position 
        // of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;

            // This visually keeps the cursor in bottom bound of the editing window,
            // accounting for the extra the statusbar height
            if (cursor.y < this.editorInstance.screen.height - 1) {
                // If the cursor isn't at the bottom of the textArea, move it down by one
                this.editorInstance.program.cursorDown();
                this.editorInstance.screen.render();
            }
            // Scroll the text down by one if the cursor is at the bottom of the textArea
            else if (cursor.y == this.editorInstance.screen.height - 1) {
                // This AND check prevents a crash that occurs when on the last line of the 
                // text being edited
                if (this.editorInstance.textArea.textArea.getScrollPerc() !== 100) {

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
                }
            }
        });
    }

    homeHandler() {
        let viewOffset = this.editorInstance.textArea.viewOffSet;
        // This callback returns an err and data object, the data object has the x/y position 
        // of the cursor
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

    endHandler() {
        let viewOffset = this.editorInstance.textArea.viewOffSet;

        // This callback returns an err and data object, the data object has the x/y position 
        // of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Variable to get the current offset number for the line the cursor is on,
            // including the scrolling position of the textArea
            let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

            // Get the line of text that the cursor is sitting on minus the borders of the screen
            let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

            // Shadow line is the 'true' line, not just the edit view
            let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];
            let shadowLineLength = shadowLineText.length;
            // Not really sure why this is the calculation needed, but it works
            let textAreaLength = this.editorInstance.textArea.textArea.width - 3;

            // If the text is in a horizontally scrolling state
            if (viewOffset > 0) {
                // This will need a bit of work
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
                    this.editorInstance.textArea.viewOffSet = currentShadowLineLength - 1;
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