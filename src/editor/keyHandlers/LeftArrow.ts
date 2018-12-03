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