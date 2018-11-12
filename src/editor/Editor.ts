// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies



// This is the main editor class that puts all of the pieces together 
// to create a functioning application


export default class Editor {
    private filePath: string;
    private editorState: string;

    constructor(filePath?: string) {
        this.filePath = filePath;

        if (!this.filePath) {
            this.startEditorBlank();
        }
    }

    private startEditorBlank() {

    }

    private startEditor() {

    }
}
