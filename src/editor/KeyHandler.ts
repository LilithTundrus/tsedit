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
    mainKeyHandler(character, cursor) {
        // This is where all 'standard' keys go (keys not handled elsewhere)

        // ON EACH OF THESE, THE SHADOW LINE MUST BE UPDATED AS WELL
        if (cursor.x < this.editorInstance.screen.width - 1) {

            // Variable to get the current offset number for the line the cursor is on,
            // including the scrolling position of the textArea
            let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

            // Get the line of text that the cursor is sitting on minus the borders of the screen
            let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

            // If there's no text to begin with, this check should avoid text going onto a new line
            if (cursor.x == 2 && currentLineText.length < 1) {
                // Update the real data with the given character
                this.editorInstance.textArea.shadowContent[currentLineOffset] = character;
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
                this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;

                // Update the viewable line with the given character
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);
                // Render the text change
                this.editorInstance.screen.render();
                // Offset the auto-cursor-restore to move the cursor back to the
                // last position it was in before the text change
                this.editorInstance.program.cursorPos(cursor.y - 1, cursor.x);
            }
            // If the cursor is at the end
            else if (cursor.x >= currentLineText.length + 1) {
                // Add the character to the end of the line, the cursor auto-renders
                // and moves forward on its own in this case
                let newLineText = currentLineText + character;
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);

                // Update the real data with the given character
                this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;

                // No cursor shift is needed since it is automatic on this case
            }
            // If the cursor is somehwere in the middle (it's an insert)
            else {
                // String portion BEFORE the insert
                let startingString = currentLineText.substring(0, cursor.x - 2);
                // String portion AFTER the insert
                let endingString = currentLineText.substring(cursor.x - 2);

                // Add the character in between the 2 strings
                let newLineText = startingString + character + endingString;
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, newLineText);

                // Update the real data with the given character
                this.editorInstance.textArea.shadowContent[currentLineOffset] = newLineText;

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

    leftArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            if (cursor.x > 2) {
                // If the cursor is not at the start of the line, move it backwards one
                this.editorInstance.program.cursorBackward();
                this.editorInstance.screen.render();
            } else if (cursor.x == 2 && this.editorInstance.textArea.viewOffSet == 0) {
                // Do nothing (for now)
            } else if (cursor.x == 2 && this.editorInstance.textArea.viewOffSet !== 0) {
                // Check if the viewOffset for the textArea isn't 0
                // Scroll the textArea to the left by 1
                this.editorInstance.textArea.viewOffSet--;
                this.editorInstance.textArea.leftShiftText();
                this.editorInstance.screen.render();
                // Keep the cursor right against the left bound of the textArea
                // (this can sometimes get moved due to the redraw of the text)
                this.editorInstance.program.cursorPos(cursor.y - 1, 2);
            }
        });
    }

    rightArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor

        // fs.writeFileSync('./shadow.txt', this.editorInstance.textArea.shadowContent.join('\n'));

        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            if (cursor.x < this.editorInstance.screen.width - 1) {
                // If the cursor is not at the end of the line, move it forward one
                this.editorInstance.program.cursorForward();
                this.editorInstance.screen.render();
            } else {
                // Horiztonally scroll the text right by 1 if the current line is greater than the
                // width of the editing window
                this.editorInstance.textArea.viewOffSet++;
                this.editorInstance.textArea.rightshiftText();
                this.editorInstance.screen.render();
                // Keep the cursor right against the right bound of the textArea
                // (this can sometimes get moved due to the redraw of the text)
                let screenWidthWithUIOffsets = this.editorInstance.screen.width - 3;
                this.editorInstance.program.cursorPos(cursor.y - 1, screenWidthWithUIOffsets);
            }
        });
    }

    upArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;

            // This keeps the cursor in top bound of the editing window plus the menubar height
            if (cursor.y > 3) {
                // If the cursor isn't at the top of the textArea, move it up by one
                this.editorInstance.program.cursorUp();
                this.editorInstance.screen.render();
            }
            // Scroll the text up by one line
            else if (cursor.y == 3 && this.editorInstance.textArea.textArea.getScrollPerc() > 0) {
                // Scroll the textArea's visible contents up by one
                this.editorInstance.textArea.textArea.scroll(-1);

                // Make sure that the previous line is on the right horizontal scroll index
                this.editorInstance.textArea.reformTextUpArrow();
                this.editorInstance.screen.render();

                // Keep the cursor in its previous position
                // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3 
                // (less cursor jank)
                this.editorInstance.program.cursorPos(2, cursor.x - 1);
                this.editorInstance.screen.render();
                // Reduce the verticalScrollOffset by one to match the blessed scroll function
                this.editorInstance.textArea.verticalScrollOffset--;
            }
        });
    }

    downArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y position 
        // of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;

            // This visually keeps the cursor in bottom bound of the editing window,
            // plus the statusbar height
            if (cursor.y < this.editorInstance.screen.height - 1) {
                // If the cursor isn't at the bottom of the textArea, move it down by one
                this.editorInstance.program.cursorDown();
                this.editorInstance.screen.render();
            }
            // Scroll the text down by one if the cursor is at the bottom of the textArea
            else if (cursor.y == this.editorInstance.screen.height - 1) {
                this.editorInstance.textArea.textArea.scroll(1);
                this.editorInstance.screen.render();

                // TODO: Fix a crash that occurs when on the last line of the text being edited

                // Make sure that the next line is on the right horizontal scroll index
                this.editorInstance.textArea.reformTextDownArrow();
                this.editorInstance.screen.render();

                // Keep the cursor in its previous position
                // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3 
                // (less cursor jank)
                let relativeBottomHeight = this.editorInstance.screen.height - 2;
                this.editorInstance.program.cursorPos(relativeBottomHeight, cursor.x - 1);
                this.editorInstance.screen.render();
                // Increase the verticalScrollOffset by one to match the blessed scroll function
                this.editorInstance.textArea.verticalScrollOffset++;
            }
        });
    }

}