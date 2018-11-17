// Using ES5 strict mode
'use strict';

// Default order of blessed component options
let options = {
    // Parent option for the component
    parent,

    // Component relative position options
    left,
    right,
    top,
    bottom,
    position,

    // Component size options
    width,
    height,
    padding,

    // Key related options
    input,
    keys,
    keyable,

    // Content control options
    name,
    tags,
    shrink,
    wrap,
    visible,
    detatched,

    // Alignment options
    align,
    valign,

    // Scrolling options
    scrollable,
    alwaysScroll,
    scrollbar: {
        ch,
        track: {
            bg,
            ch
        },
    },
    baseLimit,

    // Border options
    border: {
        type
    },

    // Styling options
    style: {
        bg,
        fg,
        border: {
            bg,
            fg
        },
        label: {
            bg,
            fg
        }
    },

    // Shadow option
    shadow,

    // Content/label options
    label,
    content,
};