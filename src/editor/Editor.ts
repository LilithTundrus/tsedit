// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';

// This is the main editor class that puts all of the pieces together 
// to create a functioning application


export default class Editor {
    private filePath: string;

    // The editor's 'state' is whether or not it's editing a new or existing file
    private editorState: string;

    // Create the blessed program object to associate with the blessed screen for the class
    private program = blessed.program();

    // Declared as any since blessed's typings aren't correct
    private cursorOptions: any = {
        artificial: true,
        shape: 'line',
        blink: true,
        color: null
    }

    private screen = blessed.screen({
        smartCSR: true,
        // Autopad screen elements unless no padding it explicitly required
        autoPadding: true,
        // Associate the generated program to the screen
        program: this.program,
        // Used, but often doesn't work in windows
        cursor: this.cursorOptions
    });
    
    constructor(filePath?: string) {
        this.filePath = filePath;

        if (!this.filePath) {
            this.startEditorBlank();
        }
    }

    /** Start the editor in a state where an empty file is being worked on
     * @private
     * @memberof Editor
     */
    private startEditorBlank() {

    }

    private startEditor() {

    }
}
