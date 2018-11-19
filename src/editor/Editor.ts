// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Node/NPM dependencies
import * as blessed from 'blessed';
import * as fs from 'fs';
import TextArea from './ui-components/TextArea';
import StatusBar from './ui-components/StatusBar';

// This is the main editor class that puts all of the pieces together 
// to create a functioning application

export default class Editor {
    filePath: string;

    // The editor's 'state' is going to be something that evolves over time
    editorState: string;

    // Create the blessed program object to associate with the blessed screen for the class
    program = blessed.program();

    // These are the cursor options for blessed. Declared as any since blessed's typings 
    // aren't correct
    private cursorOptions: any = {
        artificial: true,
        shape: 'line',
        blink: true,
        color: null
    }

    screen = blessed.screen({
        smartCSR: true,
        // Autopad screen elements unless no padding it explicitly required
        autoPadding: true,
        // Associate the generated program to the screen
        program: this.program,
        // Used, but often doesn't work in windows
        cursor: this.cursorOptions
    });

    textArea: TextArea;
    statusBar: StatusBar;

    /** Creates an instance of Editor.
     * @param {string} [filePath]
     * @memberof Editor
     */
    constructor(filePath?: string) {
        this.filePath = filePath;

        if (!this.filePath) {
            this.startEditorBlank();
        } else {
            // First, make sure the path exists
            if (!fs.existsSync(this.filePath)) {
                console.log(`\nFile ${this.filePath} does not exist.`);
                process.exit(1);
            }

            let contents;

            // Try and read the file, else print an error that the file cannot be opened after launching the editor
            try {
                contents = fs.readFileSync(this.filePath);
                this.startEditor(contents);
            } catch (err) {
                console.log(`Could not read file ${this.filePath}: ${err}`);
                process.exit(1);
            }
        }
    }

    /** Start the editor in a state where an empty file is being worked on
     * @private
     * @memberof Editor
     */
    private startEditorBlank() {
        // Get this one working first!
        
    }

    /** Start the editor in a state where the text is already provided
     * @private
     * @memberof Editor
     */
    private startEditor(contents) {
        // TODO: Make sure the contents arg is a string, if not, convert the buffer
        let parsedContent: string;
        try {
            parsedContent = contents.toString();
        } catch (err) {
            console.log(`\nCould not convert buffer to string: ${err}`);
            return process.exit(0);
        }

        // TODO: On change to the text, the filepath should have a * to indicate that it has not
        // been saved

        // TODO: The first thing to do should be a navigable textArea, horiztonally and vertically
        // that allows for text entry and proper flow

        // Set the title of the terminal window (if any) -- this will eventually take cli arguments
        // for reading a file to be edited
        this.screen.title = `TS-EDIT - ${this.filePath}`;

        // Initialize all classes needed to construct the UI
        this.textArea = new TextArea(this, parsedContent);
        this.statusBar = new StatusBar(this);

        this.textArea.textArea.setLabel(`${this.filePath}`);

        // Append each UI element to the blessed screen
        this.screen.append(this.textArea.textArea);
        this.screen.append(this.statusBar.statusBar);

        // Reset the cursor position before rendering the UI
        this.screen.program.getCursor((err, data) => {
            this.screen.program.cursorUp(this.screen.height);
            this.screen.program.cursorBackward(this.screen.width);
            // Put the cursor at line 1 column one of the editing window
            this.screen.program.cursorForward(1);
            this.screen.program.cursorDown(2);
            this.screen.render();
        });

        this.screen.render();
        this.textArea.textArea.focus();
    }

    // TODO: Things that need to be shared across UI components should go here
    // Stuff like, getting and setting the state of the editor/etc.
}
