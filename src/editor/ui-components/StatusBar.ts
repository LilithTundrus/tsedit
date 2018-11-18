// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import Editor from '../Editor';

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the statusBar box, a single-height box that spans the entire window,
// this part of the screen displays helpful information about the current status of
// the document 


export default class StatusBar {
    // The editorInstance allows us to access features from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;
    statusBar: blessed.Widgets.TextElement;

    private statusInfo = '< Press Ctrl + W to quit >';
    private row = 0;
    private column = 0;

    constructor(editorInstance: Editor) {
        this.editorInstance = editorInstance;

        // Create the statusBar UI element as a blessed text element type (box)
        this.statusBar = blessed.text({
            // Parent option for the component
            parent: this.editorInstance.screen,

            // Component relative position options

            // Set the bottom of the statusBar element to be the bottom of the screen and then up
            // (minus) 1 (declared as any due to typings being fussy)
            bottom: <any>'bottom' - 1,


            // Component size options

            // Set the statusBar element to 100% of the screen
            width: '100%',
            // Height of the element should
            height: 1,
            // Padding of 1 for the left and right of the statusBar
            padding: {
                left: 1,
                right: 1
            },


            // Content control options
            // Don't capture SGR blessed escape codes, that could cause issues
            tags: false,
            // Don't shrink the text box if the window resizes
            shrink: false,


            // Styling options

            style: {
                fg: 'black',
                bg: 'light-grey',
            },


            // Content/label options

            content: '',
        });

        this.constructStatusBarText();
    }

    getInfoSection() {
        return this.statusInfo;
    }

    setInfoSection(newStatus: string) {
        this.statusInfo = newStatus;
    }

    getRows() {
        return this.row;
    }

    setRows(newRow: number) {
        this.row = newRow;
    }

    getColumns() {
        return this.column;
    }

    setColumns(newColumn: number) {
        this.column = newColumn;
    }

    private constructStatusBarText() {
        // This function will take each section of the statusbar and reconstruct it
        this.statusBar.setContent(`Line:${this.row} | Col:${this.column} \t ${this.statusInfo}`);
    }
}