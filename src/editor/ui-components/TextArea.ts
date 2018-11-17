// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import Editor from '../Editor';

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the textArea textbox, where the actual text being edited will be displayed

export default class textArea {
    // The editorInstance allows us to access feature from the Editor class instance to do things
    // like change state, etc.
    private editorInstance: Editor;
    private content;

    textArea: any;

    constructor(editorInstance: Editor, content) {
        this.editorInstance = editorInstance;
        this.content = content;

        this.textArea = blessed.box(<any>{
            // Parent option for the component, controls how the element interacts with others
            parent: this.editorInstance.screen,

            // Component relative position options

            // The top of this element should be the parent width plus 1
            top: 1,


            // Component size options

            // Keep the width of this element to 100% of the screen
            width: '100%+1',
            // Height should be the entire screen minus 1 because of the statusBar (not doing this hide part of the text entry window)
            height: '100%-1',


            // Key related options

            // Allow input of the element
            input: true,
            // Dissallow default keys
            keys: false,
            // Set the element to support all key inputs
            keyable: true,


            // Content control options

            // Don't capture SGR blessed escape codes, that could cause issues
            tags: false,
            // Don't shrink the text box if the window resizes
            shrink: false,
            // Dissallow text to wrap down the the next line (not documented)
            wrap: true,
            visible: true,


            // Alignment options

            // Left align the text for this element
            align: 'left',


            // Scrolling options

            // Allow the element to be scrollable
            scrollable: true,
            // Always allow the element to be scrollable, even if the content is shorter
            // than the height of the windows
            alwaysScroll: true,
            // Scrollbar styles, using extended characters here
            scrollbar: {
                ch: '█',
                track: {
                    bg: 'black',
                    ch: '░'
                },
            },
            // Limit the maximum content to 16,000 lines (at least initially)
            baseLimit: 16000,

            // Border options
            border: {
                type: 'line'
            },


            // Styling options

            // This style matches the DOS edit theme
            style: {
                fg: 'bold',
                bg: 'blue',
                border: {
                    fg: 'light-grey',
                },
                label: {
                    fg: 'black',
                    bg: 'light-grey'
                }
            },

            // Content/label options

            // The label is a string that 
            label: this.editorInstance.filePath,
            content: this.content,
        });


        // Quit on Control-W
        // TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
        this.textArea.key(['C-w'], () => {

            // Have this read the content of the new file vs the old (could be challenging depending
            // on if the editor started with a file or not)

            return process.exit(0);
        });
    }



}