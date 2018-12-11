// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import Editor from '../Editor';


// This class contains all methods for the backspace key within the TextArea

export default class Backspace {
    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance) {
        this.editorInstance = editorInstance;
    }

    // NOTE: These should mirror the main character insert for the most part except that the character is removed rather
    // than inserted

    backspaceHandlerStartOfLine() {

    }

    backspaceHandlerAnyColumn() {

    }


    backspaceHandlerEndOfLine() {

    }
}