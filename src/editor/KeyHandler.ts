// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import Editor from './Editor';


// This file contains the class for handling key events for the Editor Class's
// textArea UI component

export default class KeyHandler {

    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance) {
        this.editorInstance = editorInstance;


    }

    leftArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            if (cursor.x > 2) {
                this.editorInstance.program.cursorBackward();
                this.editorInstance.screen.render();
            }
        });
    }

    rightArrowHandler() {
        // This callback returns an err and data object, the data object has the x/y position of the cursor
        this.editorInstance.program.getCursor((err, cursor) => {
            // Ignore errors until a proper error system is put in place
            if (err) return;
            // Use the custom right keyHandler, passing the needed objects for blessed operations
            if (cursor.x < this.editorInstance.screen.width - 1) {
                this.editorInstance.program.cursorForward();
                this.editorInstance.screen.render();
            }
        });
    }

}