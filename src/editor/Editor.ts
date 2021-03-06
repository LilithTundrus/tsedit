// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import * as fs from 'fs';
import * as path from 'path';
import TextArea from './ui-components/TextArea';
import StatusBar from './ui-components/StatusBar';
import { editorState } from '../interfaces';

// TODO: Document literally everything going on!!!

// TODO: On change to the text, the filepath should have a * to indicate that it has not
// been saved

// TODO: Add scroll arrows using ASCII that actually work (saving and restoring the cursor in
// the right order with other UI updates should be how to do it)

// TODO: Get everything currently in place FULLY working!!!!


// This is the main editor class that puts all of the pieces together 
// to create a functioning application
export default class Editor {

    // Variable for holding the given path to the file being edited
    filePath: string;

    // The editor's 'state' is going to be something that evolves over time
    editorState: string;

    // Create the blessed program object to associate with the blessed screen for the editor class
    program = blessed.program();

    // These are the cursor options for blessed. Declared as any since blessed's typings 
    // aren't correct
    private cursorOptions: any = {
        artificial: true,
        shape: 'line',
        blink: true,
        color: null
    };

    // Blessed's screen element for setting basic options about how the terminal should operate
    screen = blessed.screen({
        smartCSR: true,
        // Autopad screen elements unless no padding it explicitly required
        autoPadding: true,
        // Associate the generated program to the screen
        program: this.program,
        // Used, but often doesn't work in windows
        cursor: this.cursorOptions
    });

    // This is the editor's instance of the textArea class
    textArea: TextArea;
    // This is the editor's instance of the statusBar class
    statusBar: StatusBar;

    // State variable for handling state changes for the editor/anything else that must be shared
    state: editorState;

    /** Creates an instance of Editor.
     * @param {string} [filePath]
     * @memberof Editor
     */
    constructor(filePath?: string) {
        // Initialize the state of the editor
        this.state = {
            currentPath: '',
            resolvedFilePath: '',
            relativePath: filePath,
            fileName: ''
        };

        if (!filePath) {
            this.startEditorBlank();
        } else {
            // Set the relative path state for the editor
            this.state.relativePath = filePath;
            // Set the current path state to the directory that the editor was started from
            this.state.currentPath = __dirname;
            // Get the FULL path to the current file and set the path to the editor's state
            let resolvedPath = path.resolve(this.state.currentPath, this.state.relativePath);
            this.state.resolvedFilePath = resolvedPath;
            // Get the file's name on its own and set the fileName editor state variable
            let fileName = path.basename(this.state.resolvedFilePath);
            this.state.fileName = fileName;

            // First, make sure the path exists
            if (!fs.existsSync(this.state.relativePath)) {
                console.log(`\nFile ${this.state.relativePath} does not exist.`);
                process.exit(1);
            }

            // Variable to hold the contents of the file being read and used throughout the classs
            let contents: Buffer;

            // Try and read the file
            try {
                contents = fs.readFileSync(this.state.relativePath);
                this.startEditor(contents);
            }
            // Else, print an error that the file cannot be opened after starting the editor
            catch (err) {
                console.log(`Could not read file ${this.state.relativePath}: ${err}`);
                process.exit(1);
            }
        }
    }

    /** Start the editor in a state where an empty file is being worked on
     * @private
     * @memberof Editor
     */
    startEditorBlank() {
        // Set the title of the terminal window (if any title bar exists)
        this.screen.title = `TS-EDIT - Untitled`;

        // Initialize all classes needed to construct the base UI
        this.textArea = new TextArea(this, '');
        this.statusBar = new StatusBar(this);

        // Set the label of the textArea to indicate what file is being edited
        this.textArea.textArea.setLabel(`Untitled`);
        // The filename state should match the label of the editor
        this.state.fileName = 'Untitled';

        // Append each UI element to the blessed screen
        this.screen.append(this.textArea.textArea);
        this.screen.append(this.statusBar.statusBar);

        // Reset the cursor position before rendering the UI
        this.screen.program.getCursor((err, data) => {
            this.screen.program.cursorUp(this.screen.height);
            this.screen.program.cursorBackward(this.screen.width);
            // Put the cursor at line 1, column 1 of the editing window, including the UI
            this.screen.program.cursorForward(1);
            this.screen.program.cursorDown(2);
        });

        // Render the screen so all changes are ensured to show up
        this.screen.render();
        // Focus the textArea to start out
        this.textArea.textArea.focus();
    }

    /** Start the editor in a state where the text is already provided
     * @private
     * @memberof Editor
     */
    startEditor(contents: Buffer) {
        let parsedContent: string;
        // Try to read the passed content buffer 
        try {
            parsedContent = contents.toString();
        }
        // Else, print an error that the file cannot be opened
        catch (err) {
            console.log(`\nCould not convert buffer to string: ${err}`);
            return process.exit(0);
        }

        // Set the title of the terminal window (if any title bar exists)
        this.screen.title = `TS-EDIT - ${this.state.resolvedFilePath}`;

        // Initialize all classes needed to construct the base UI
        this.textArea = new TextArea(this, parsedContent);
        this.statusBar = new StatusBar(this);

        // Set the label of the textArea to indicate what file is being edited
        this.textArea.textArea.setLabel(`${this.state.fileName}`);

        // Append each UI element to the blessed screen
        this.screen.append(this.textArea.textArea);
        this.screen.append(this.statusBar.statusBar);

        // Reset the cursor position before rendering the UI
        this.screen.program.getCursor((err, data) => {
            this.screen.program.cursorUp(this.screen.height);
            this.screen.program.cursorBackward(this.screen.width);
            // Put the cursor at line 1, column 1 of the editing window, including the UI
            this.screen.program.cursorForward(1);
            this.screen.program.cursorDown(2);
        });

        // Render the screen so all changes are ensured to show up
        this.screen.render();
        // Focus the textArea to start out
        this.textArea.textArea.focus();
    }


    /** Update the terminal's title with a given new file path string
     * @param {string} newFilePath
     * @memberof Editor
     */
    setWindowFilePath(newFilePath: string) {
        this.screen.title = `TS-EDIT - ${newFilePath}`;
    }
}