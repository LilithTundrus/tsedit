// Using ES6 strict mode (not 100% needed, but ensure that the compiled JS is in strict mode)
'use strict';

// Set of keyname strings for checking against within the main keypress event
// Any keys that need custom code should go here

let customKeys = new Set();
customKeys.add('pageup');
customKeys.add('pagedown');
customKeys.add('left');
customKeys.add('right');
customKeys.add('up');
customKeys.add('down');
customKeys.add('enter');
customKeys.add('backspace');
customKeys.add('tab');
customKeys.add('space');

// Export the set to be used by the main script/wherever else it's needed
export default customKeys;