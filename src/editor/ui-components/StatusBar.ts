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
    // The editorInstance allows us to access feature from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;

    constructor(editorInstance: Editor) {

    }

    setInfoSection() {

    }

    updateRows() {

    }

    updateColumns() {

    }

    private constructStatusBarText() {
        
    }
}