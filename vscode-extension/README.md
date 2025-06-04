# LangGraph Chat UI - VS Code Extension

This VS Code extension provides a chat interface for interacting with Python LangGraph services. It embeds the Core Chat UI.

## Development

### Prerequisites

-   Node.js (version specified in `.github/workflows/build-test.yml`, e.g., 18.x or 20.x)
-   npm
-   VS Code

### Setup

1.  **Clone the repository.**
2.  **Install dependencies for Core UI**:
    ```bash
    cd core-ui # Assuming core-ui is a sibling directory or adjust path
    npm install
    ```
3.  **Build Core UI**:
    ```bash
    # Still in core-ui directory
    npm run build
    ```
    This generates the UI bundle in `core-ui/dist/`.
4.  **Copy Core UI bundle to the extension**:
    - Create a directory `vscode-extension/core-ui-bundle`.
    - Copy the contents of `core-ui/dist/` into `vscode-extension/core-ui-bundle/`.
    *(This step might be automated by a higher-level build script in a real project).*
    ```bash
    # Example: from the repository root
    # mkdir -p vscode-extension/core-ui-bundle
    # cp -r core-ui/dist/* vscode-extension/core-ui-bundle/
    ```
5.  **Install dependencies for the extension**:
    ```bash
    cd ../vscode-extension # Or adjust path from wherever you are
    npm install
    ```
6.  **Compile the extension**:
    ```bash
    # Still in vscode-extension directory
    npm run compile
    ```
    Or use the watch script for continuous compilation during development:
    ```bash
    npm run watch
    ```

### Running and Debugging the Extension

1.  Open the `vscode-extension` folder in VS Code.
2.  Press `F5` (or go to "Run and Debug" view and click the "Run Extension" play button). This will:
    -   Execute the `npm: compile` preLaunchTask (defined in `.vscode/launch.json`).
    -   Launch a new VS Code window (Extension Development Host) with the extension loaded.
3.  In the Extension Development Host window, open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run the command "Start LangGraph Chat". This should open the chat webview.

### Running Tests

```bash
# In vscode-extension directory
npm test
```

### Packaging

```bash
# In vscode-extension directory
npm run package-vsix
```
This will generate a `.vsix` file in the `vscode-extension` directory. This requires the `core-ui-bundle/` to be present and populated as per the setup steps.

## Structure

-   `src/extension.ts`: Main entry point for the extension.
-   `src/sal/index.ts`: Type definitions for the Service Abstraction Layer, copied from `core-ui`.
-   `LangGraphChatViewProvider.ts` (within `src/extension.ts` or separate file): Class responsible for managing the webview panel and communication with the Core UI.
-   `core-ui-bundle/`: Contains the pre-built static assets of the Core Chat UI, copied from `core-ui/dist/`.
```
