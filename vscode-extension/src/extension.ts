import * as vscode from 'vscode';
import * as fs from 'fs';
// import * as path from 'path'; // Usually not needed if using vscode.Uri.joinPath
import { LangGraphMessage, ExtensionSettings } from './sal'; // SAL interfaces

// Define a type for messages sent from the webview to the extension via VSCodeSal
interface WebviewToExtensionMessage {
    type: string;
    requestId?: string; // For request-response patterns
    command?: string;   // For commands like 'getSettings'
    payload?: any;
}


export class LangGraphChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'langgraphChatView'; // Example, can be defined in package.json if contributing a view
    private static _panel: vscode.WebviewPanel | undefined;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (LangGraphChatViewProvider._panel) {
            LangGraphChatViewProvider._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            'langgraphChat', // Identifies the type of the webview. Used internally
            'LangGraph Chat', // Title of the panel displayed to the user
            column || vscode.ViewColumn.One, // Editor column to show the new webview panel in.
            {
                // Enable javascript in the webview
                enableScripts: true,
                // Restrict the webview to only loading content from our extension's `core-ui-bundle` directory.
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'core-ui-bundle')]
            }
        );

        LangGraphChatViewProvider._panel = panel;
        const provider = new LangGraphChatViewProvider(panel, extensionUri);
        panel.onDidDispose(() => provider.dispose(), null, provider._disposables);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: WebviewToExtensionMessage) => {
                console.log(`[ExtensionHost] Received message from webview: ${JSON.stringify(message)}`);
                switch (message.type) {
                    case 'sal/messageToExtension':
                        const userMessage = message.payload as LangGraphMessage;
                        console.log('[ExtensionHost] User message:', userMessage.content);
                        // Simulate bot response
                        const botResponse: LangGraphMessage = {
                            id: `bot-${Date.now()}`,
                            sender: 'bot',
                            content: `Extension Host echo: "${userMessage.content}"`,
                            timestamp: new Date().toISOString()
                        };
                        this.sendMessageToUi('sal/messageToUi', botResponse);
                        return;
                    case 'sal/commandFromUi':
                        if (message.command === 'getExtensionSettings') {
                            const mockSettings: ExtensionSettings = {
                                enabled: true,
                                apiKey: 'mock-api-key-from-extension'
                            };
                            this._panel?.webview.postMessage({
                                type: 'sal/responseFromExtension',
                                requestId: message.requestId,
                                payload: mockSettings
                            });
                        } else if (message.command === 'updateExtensionSettings') {
                            console.log('[ExtensionHost] Received updateSettings command with payload:', message.payload);
                            // In a real scenario, save settings and then confirm
                             this._panel?.webview.postMessage({
                                type: 'sal/responseFromExtension',
                                requestId: message.requestId,
                                payload: null // Indicate success with no specific data
                            });
                            // Optionally, broadcast updated settings if they changed
                            // this.sendMessageToUi('sal/settingsToUi', newSettings);
                        }
                        return;
                    case 'sal/logFromUi':
                        const logPayload = message.payload as { level: string, message: string };
                        console.log(`[Webview SAL Log - ${logPayload.level.toUpperCase()}]: ${logPayload.message}`);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public sendMessageToUi(type: string, payload: any) {
        this._panel?.webview.postMessage({ type, payload });
    }

    private _update() {
        if (!this._panel) {
            return;
        }
        // For now, a very basic HTML. Later, this will load the bundled React app.
        this._panel.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>LangGraph Chat</title>
                <style>body, html, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }</style>
            </head>
            <body>
                <div id="root"></div>
                <h1>Loading Core UI... This will be replaced by the actual UI bundle.</h1>
                <p>If you see this, the VS Code extension host is working, but the React UI bundle is not yet integrated here.</p>
                <!--
                    In a later step, script tags will be added here to load the bundled core-ui javascript and css.
                    Example:
                    <script nonce="YOUR_NONCE_HERE" src="${this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'core-ui-bundle', 'main.js'))}"></script>
                    <link href="${this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'core-ui-bundle', 'main.css'))}" rel="stylesheet">
                -->
            </body>
            </html>`;
    }

    public dispose() {
        LangGraphChatViewProvider._panel = undefined;

        // Clean up our resources
        this._panel?.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    // This method is required for WebviewViewProvider, but we are using WebviewPanel directly
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        // This would be implemented if we were contributing a view to a sidebar, for example.
        // For a standalone panel, this is not directly used in this setup.
        throw new Error("Method not implemented for direct WebviewPanel usage via createWebviewPanel.");
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "langgraph-chat-ui" is now active!');

    let disposable = vscode.commands.registerCommand('langgraph-chat-ui.startChat', () => {
        // vscode.window.showInformationMessage('Start LangGraph Chat command activated!');
        LangGraphChatViewProvider.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (LangGraphChatViewProvider._panel) {
        LangGraphChatViewProvider._panel.dispose();
    }
}
