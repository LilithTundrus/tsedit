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


    mainKeyHandler() {
        // This is where all 'standard' keys go
    }

    leftArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            if (cursor.x > 2) {
                this.editorInstance.program.cursorBackward();
                this.editorInstance.screen.render();
                let lines = this.editorInstance.textArea.getVisibleLines();
                fs.writeFileSync('./LINES.txt', lines.join('\n'));
            }
        });
    }

    rightArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y 
        // position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            if (cursor.x < this.editorInstance.screen.width - 1) {
                this.editorInstance.program.cursorForward();
                this.editorInstance.screen.render();
            } else {
                // Horiztonally scroll the text if the current line is greater than the 
                // width of the editing window
                this.editorInstance.textArea.rightshiftText();
                this.editorInstance.screen.render();
                this.editorInstance.textArea.viewOffSet++;
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
                this.editorInstance.program.cursorUp();
                this.editorInstance.screen.render();
            }
            // Scroll the text up by one line
            else if (cursor.y == 3 && this.editorInstance.textArea.textArea.getScrollPerc() > 0) {
                this.editorInstance.textArea.textArea.scroll(-1);
                this.editorInstance.screen.render();
                // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3 
                // (less cursor jank)
                this.editorInstance.program.cursorPos(2, cursor.x - 1);
                this.editorInstance.screen.render();
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
                this.editorInstance.program.cursorDown();
                this.editorInstance.screen.render();
            }
            // Scroll the text down by one
            else if (cursor.y == this.editorInstance.screen.height - 1) {
                this.editorInstance.textArea.textArea.scroll(1);
                this.editorInstance.screen.render();
                // For some reason the screen - 2 is what sets the cursor to the bottom position 
                // that's needed
                let relativeBottomHeight = this.editorInstance.screen.height - 2;
                this.editorInstance.program.cursorPos(relativeBottomHeight, cursor.x - 1);
                this.editorInstance.screen.render();
                this.editorInstance.textArea.verticalScrollOffset++;
            }
        });
    }

}