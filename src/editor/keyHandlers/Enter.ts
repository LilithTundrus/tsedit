// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import Editor from '../Editor';


// This class contains all methods for the enter key within the TextArea

export default class Enter {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance) {
        this.editorInstance = editorInstance;
    }
    // TODO: make sure these update the row and columen
    enterHandlerStartOfLine(cursor) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        if (this.editorInstance.textArea.viewOffSet > 0) {
            // Function-scoped view offset shortcuts and calculated cusor offset
            let localViewOffset = this.editorInstance.textArea.viewOffSet;
            let cursorOffset = cursor.x - 1;

            // REAL Text BEFORE the cursor
            let preText = shadowLineText.substring(0, localViewOffset + cursorOffset);
            // REAL Text AFTER the cursor
            let postText = shadowLineText.substring(localViewOffset + cursorOffset);

            // Insert the new line BELOW the current line so the content flows down by one,
            // copying how a lot of editors work when enter is hit at the start of a line
            this.editorInstance.textArea.textArea.insertLine(currentLineOffset + 1, postText);

            // Render the line changes
            this.editorInstance.screen.render();

            // Update the current 'real' lines 
            this.editorInstance.textArea.shadowContent[currentLineOffset] = preText;
            // Insert the second half of the string on the line below
            this.editorInstance.textArea.shadowContent.splice(currentLineOffset + 1, 0, postText);

            this.editorInstance.textArea.leftShiftText(localViewOffset);
            this.editorInstance.textArea.viewOffSet = 0;

            // Render the line changes
            this.editorInstance.screen.render();

            // Set the cursor back to the beginning of the current line if 
            // it is not at the bottom of the textArea
            if (cursor.y < this.editorInstance.screen.height - 1) {
                this.editorInstance.program.cursorPos(cursor.y, 1);

            }
            else {
                // Scroll the textArea by one
                this.editorInstance.textArea.textArea.scroll(1);
                // Put the cursor at the start of the current line
                this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                // Increase the verticalScrollOffset by one to match the blessed scroll index
                this.editorInstance.textArea.verticalScrollOffset++;
                // Also increase the internal offset since the textArea scrolled
                this.editorInstance.textArea.internalVerticalOffset++;
            }

            // Render the cursor change
            this.editorInstance.screen.render();
        } else {
            // Insert a blank line ABOVE the current line so the content flows down by one,
            // copying how a lot of editors work when enter is hit at the start of a line
            this.editorInstance.textArea.textArea.insertLine(currentLineOffset, '');
            // Render the line change
            this.editorInstance.screen.render();

            // Set the cursor back to the beginning of the current line if 
            // it is not at the bottom of the textArea
            if (cursor.y < this.editorInstance.screen.height - 1) {
                this.editorInstance.program.cursorPos(cursor.y, 1);
            }
            else {
                // Scroll the textArea by one
                this.editorInstance.textArea.textArea.scroll(1);
                // Put the cursor at the start of the current line
                this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                // Increase the verticalScrollOffset by one to match the blessed scroll index
                this.editorInstance.textArea.verticalScrollOffset++;
                // Also increase the internal offset since the textArea scrolled
                this.editorInstance.textArea.internalVerticalOffset++;
            }
            // Render the cursor change
            this.editorInstance.screen.render();
            // update the line to in the 'real' text
            this.editorInstance.textArea.shadowContent.splice(currentLineOffset, 0, '');
        }
    }

    enterHandlerAnyColumnInsert(cursor) {
        // Variable to get the current offset number for the line the cursor is on,
        // including the scrolling position of the textArea
        let currentLineOffset = this.editorInstance.textArea.calculateScrollingOffset(cursor);

        // Get the line of text that the cursor is  on minus the borders of the screen
        let currentLineText = this.editorInstance.textArea.textArea.getLine(currentLineOffset);

        // The 'true' text for the current line
        let shadowLineText = this.editorInstance.textArea.shadowContent[currentLineOffset];

        if (this.editorInstance.textArea.viewOffSet > 0) {
            let localViewOffset = this.editorInstance.textArea.viewOffSet;
            let cursorOffset = cursor.x - 1;

            // REAL Text BEFORE the cursor
            let preText = shadowLineText.substring(0, localViewOffset + cursorOffset);
            // REAL Text AFTER the cursor
            let postText = shadowLineText.substring(localViewOffset + cursorOffset);

            // Insert the new line BELOW the current line so the content flows down by one,
            // copying how a lot of editors work when enter is hit at the start of a line
            this.editorInstance.textArea.textArea.insertLine(currentLineOffset + 1, postText);

            // Render the line changes
            this.editorInstance.screen.render();

            // Update the current 'real' lines 
            this.editorInstance.textArea.shadowContent[currentLineOffset] = preText;
            // Insert the second half of the string on the line below
            this.editorInstance.textArea.shadowContent.splice(currentLineOffset + 1, 0, postText);

            this.editorInstance.textArea.leftShiftText(localViewOffset);
            this.editorInstance.textArea.viewOffSet = 0;

            // Render the line changes
            this.editorInstance.screen.render();

            // Set the cursor back to the beginning of the current line if 
            // it is not at the bottom of the textArea
            if (cursor.y < this.editorInstance.screen.height - 1) {
                this.editorInstance.program.cursorPos(cursor.y, 1);
                // Increase the verticalScrollOffset by one to match the blessed scroll index
                this.editorInstance.textArea.verticalScrollOffset++;
            } else {
                // Scroll the textArea by one
                this.editorInstance.textArea.textArea.scroll(1);
                // Put the cursor at the start of the current line
                this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                // Increase the verticalScrollOffset by one to match the blessed scroll index
                this.editorInstance.textArea.verticalScrollOffset++;
                // Also increase the internal offset since the textArea scrolled
                this.editorInstance.textArea.internalVerticalOffset++;
            }

            // Render the cursor change
            this.editorInstance.screen.render();
        } else {
            // If the cursor is at the END of the current line's text
            if (cursor.x - 2 == currentLineText.length) {
                // Insert a blank line BELOW the current line so the content flows down by one,
                // copying how a lot of editors work when enter is hit at the end of a line
                this.editorInstance.textArea.textArea.insertLine(currentLineOffset + 1, '');
                // Render the line change
                this.editorInstance.screen.render();

                // Set the cursor back to the beginning of the next line if 
                // it is not at the bottom of the textArea
                if (cursor.y < this.editorInstance.screen.height - 1) {
                    this.editorInstance.program.cursorPos(cursor.y, 1);
                    this.editorInstance.textArea.verticalScrollOffset++;
                } else {
                    // Scroll the textArea by one
                    this.editorInstance.textArea.textArea.scroll(1);
                    // Put the cursor at the start of the current line
                    this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                    // Increase the verticalScrollOffset by one to match the blessed scroll index
                    this.editorInstance.textArea.verticalScrollOffset++;
                    // Also increase the internal offset since the textArea scrolled
                    this.editorInstance.textArea.internalVerticalOffset++;
                }
                let nextLineIndex = currentLineOffset + 1;
                this.editorInstance.textArea.shadowContent.splice(nextLineIndex, 0, '');

                // Render the line change
                this.editorInstance.screen.render();
            }
            // Else, the text is somehwere in the middle so it needs to be split down to the next line
            else {
                // Function-scoped view offset shortcuts and calculated cusor offset
                let localViewOffset = this.editorInstance.textArea.viewOffSet;
                let cursorOffset = cursor.x - 2;

                // REAL Text BEFORE the cursor
                let preText = shadowLineText.substring(0, localViewOffset + cursorOffset);
                // REAL Text AFTER the cursor
                let postText = shadowLineText.substring(localViewOffset + cursorOffset);

                // Insert the new line BELOW the current line so the content flows down by one,
                // copying how a lot of editors work when enter is hit at the start of a line
                this.editorInstance.textArea.textArea.insertLine(currentLineOffset + 1, postText);
                // Set the previous line to the text BEFORE the cursor
                this.editorInstance.textArea.textArea.setLine(currentLineOffset, preText);

                // Render the line changes
                this.editorInstance.screen.render();

                // Update the current 'real' lines 
                this.editorInstance.textArea.shadowContent[currentLineOffset] = preText;
                // Insert the second half of the string on the line below
                this.editorInstance.textArea.shadowContent.splice(currentLineOffset + 1, 0, postText);

                // Render the line changes
                this.editorInstance.screen.render();

                // Set the cursor back to the beginning of the current line if 
                // it is not at the bottom of the textArea
                if (cursor.y < this.editorInstance.screen.height - 1) {
                    this.editorInstance.program.cursorPos(cursor.y, 1);
                    // Increase the verticalScrollOffset by one to match the blessed scroll index
                    this.editorInstance.textArea.verticalScrollOffset++;
                } else {
                    // Scroll the textArea by one
                    this.editorInstance.textArea.textArea.scroll(1);
                    // Put the cursor at the start of the current line
                    this.editorInstance.program.cursorPos(cursor.y - 1, 1);
                    // Increase the verticalScrollOffset by one to match the blessed scroll index
                    this.editorInstance.textArea.verticalScrollOffset++;
                    // Also increase the internal offset since the textArea scrolled
                    this.editorInstance.textArea.internalVerticalOffset++;
                }

                // Render the cursor change
                this.editorInstance.screen.render();
            }
        }
    }

    enterHandler() {

    }

}