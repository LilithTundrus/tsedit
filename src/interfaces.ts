// This interface contains all state options for TS-Edit
export interface editorState {
    unsavedWork?: boolean,
    newFile?: boolean,
    currentPath: string,
    relativePath: string,
    resolvedFilePath: string
    fileName?: string
}