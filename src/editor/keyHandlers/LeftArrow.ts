// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import Editor from '../Editor';
// Used for debugging
import * as fs from 'fs';

// This class contains all methods for the right arrow key within the TextArea

export default class LeftArrow {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance) {
        this.editorInstance = editorInstance;
    }

    leftArrowHandlerBasic(cursor) {
        this.editorInstance.program.cursorBackward();
        this.editorInstance.screen.render();
    }

    leftArrowHandlerNoOffset(cursor) {
        // If the cursor is at the top of the view windwow AND the textArea
        // is not at the first scroll line
        if (cursor.y == 3 && this.editorInstance.textArea.textArea.getScrollPerc() > 0) {
            // Set the line to the 'true' content before it is seen

            // Scroll the textArea's visible contents up by one
            this.editorInstance.textArea.textArea.scroll(-1);

            // Make sure that the previous line is on the right horizontal scroll index
            this.editorInstance.textArea.reformTextUpArrow();
            // Render the text reforms
            this.editorInstance.screen.render();

            // Move the view to the END of the next line here if it's greater than the width
            // of the textArea
            let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

            // Get the line of text that the cursor is  on minus the borders of the screen
            let previousLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset - 1);

            // The 'true' text for the current line
            let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset - 1];

            // Keep the cursor in its previous position
            // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3 
            // (less cursor jank)
            this.editorInstance.program.cursorPos(2, cursor.x - 1);
            // Render the cursor change
            this.editorInstance.screen.render();
            // Reduce the verticalScrollOffset by one to match the blessed scroll index
            this.editorInstance.textArea.verticalScrollOffset--;
            this.editorInstance.textArea.internalVerticalOffset--;

            if (shadowLineText.length > this.editorInstance.textArea.textArea.width) {
                this.editorInstance.textArea.keyHandler.endHandler();
            }
        } else if (cursor.y > 3) {
            this.editorInstance.program.cursorUp();
            // Reduce the verticalScrollOffset by one to match the blessed scroll index
            this.editorInstance.textArea.verticalScrollOffset--;
        }
    }

    leftArrowHandlerShiftText(cursor) {
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
}