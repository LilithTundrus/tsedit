// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import Editor from '../Editor';


// This class contains all methods for the right arrow key within the TextArea

export default class RightArrow {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance) {
        this.editorInstance = editorInstance;
    }

    rightArrowHandlerBasic(cursor) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // If the cursor is less than the current view offset plus the length of the current line's
        // 'true' text
        if (cursor.x - 1 <= this.editorInstance.textArea.viewOffSet + shadowLineText.length) {
            // This is the most simple action to happen for the right arrow
            this.editorInstance.program.cursorForward();
            this.editorInstance.screen.render();
        }
        // Else, the end of the line has been reach and a reflow of the text and the cursor can 
        // occur
        else {
            // If the cursor's y position is NOT at the bottom of the textArea
            if (cursor.y < this.editorInstance.screen.height - 1) {
                // Then the screen needs to reflow down to the next line and 
                // update the vertical offset
                this.editorInstance.program.cursorPos(cursor.y, 1);
                // Since the cursor is on the next line, the offset needs to be updated to reflect that
                this.editorInstance.textArea.verticalScrollOffset++;
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
                    this.editorInstance.program.cursorPos(relativeBottomHeight, 1);
                    // Render the cursor change
                    this.editorInstance.screen.render();
                    // Increase the verticalScrollOffset by one to match the blessed scroll index
                    this.editorInstance.textArea.verticalScrollOffset++;
                    this.editorInstance.textArea.internalVerticalOffset++;
                }
                // Also make sure that if the cursor is at the bottom of the screen that ALL
                // of the text scrolls
            }
        }
    }

    rightHandlerForwwardShift(cursor) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        // If the current line's length is greater than the viewoffset plus the cursor position
        if (shadowLineText.length >= this.editorInstance.textArea.viewOffSet + cursor.x - 1) {
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
        } else {
            // Reflow down to the next line
            if (cursor.y < this.editorInstance.screen.height - 1) {
                this.editorInstance.textArea.leftShiftText(this.editorInstance.textArea.viewOffSet);
                this.editorInstance.textArea.viewOffSet = 0;
                // Since the cursor is on the next line, the offset needs to be updated to reflect that
                this.editorInstance.textArea.verticalScrollOffset++;
                // Render the text reform
                this.editorInstance.screen.render();

                // reflow down to the next line and update the vertical offset
                this.editorInstance.program.cursorPos(cursor.y, 1);
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

                    this.editorInstance.textArea.leftShiftText(this.editorInstance.textArea.viewOffSet);
                    this.editorInstance.textArea.viewOffSet = 0;

                    // Make sure that the next line is on the right horizontal scroll index
                    this.editorInstance.textArea.reformTextDownArrow();
                    // Render the text reform
                    this.editorInstance.screen.render();

                    // Keep the cursor in its previous position
                    // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3
                    // (less cursor jank)

                    // Render the changes
                    this.editorInstance.screen.render();

                    let relativeBottomHeight = this.editorInstance.screen.height - 2;
                    this.editorInstance.program.cursorPos(relativeBottomHeight, 1);

                    // Increase the verticalScrollOffset by one to match the blessed scroll index
                    this.editorInstance.textArea.verticalScrollOffset++;
                    this.editorInstance.textArea.internalVerticalOffset++;
                }
            }
        }
    }

}