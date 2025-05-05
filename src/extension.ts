import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as marked from 'marked';
import { ChatMessage, ChatCompletionRequest } from './models/chat';
import { LLMProvider } from './providers/provider';
import { OpenAIProvider } from './providers/openai-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { LocalProvider } from './providers/local-provider';

export function activate(context: vscode.ExtensionContext) {
	console.log('LLM Chat extension is now active');

	// Create provider instances
	const providers = new Map<string, LLMProvider>();
	providers.set('openai', new OpenAIProvider());
	providers.set('anthropic', new AnthropicProvider());
	providers.set('local', new LocalProvider());

	// Track currently active provider
	let currentProvider: LLMProvider | undefined;
	
	// Store webview panel reference
	let chatPanel: vscode.WebviewPanel | undefined;
	
	// Store chat history
	let chatHistory: ChatMessage[] = [];

	// Register commands
	const openChatCommand = vscode.commands.registerCommand('vsc-chat.openChat', () => {
		// If panel already exists, show it
		if (chatPanel) {
			chatPanel.reveal(vscode.ViewColumn.Beside);
			return;
		}

		// Otherwise, create a new panel
		chatPanel = vscode.window.createWebviewPanel(
			'llm-chat',
			'LLM Chat',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview'))
				]
			}
		);

		// Set webview HTML content
		chatPanel.webview.html = getWebviewContent(context);

		// Handle webview messages
		chatPanel.webview.onDidReceiveMessage(async (message) => {
			try {
				switch (message.type) {
					case 'initialize':
						await initializeProvider(message.provider);
						break;

					case 'changeProvider':
						await initializeProvider(message.provider);
						// Clear chat history when changing providers
						chatHistory = [];
						break;

					case 'sendMessage':
						await handleUserMessage(message.message, message.model);
						break;

					case 'openSettings':
						vscode.commands.executeCommand('workbench.action.openSettings', 'vsc-chat');
						break;

					case 'showError':
						vscode.window.showErrorMessage(message.message);
						break;
						
					case 'clearHistory':
						chatHistory = [];
						break;
				}
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
				chatPanel?.webview.postMessage({
					type: 'error',
					message: errorMessage
				});
				vscode.window.showErrorMessage(`LLM Chat error: ${errorMessage}`);
			}
		});

		// Clean up when panel is closed
		chatPanel.onDidDispose(() => {
			chatPanel = undefined;
		});
	});

	const selectProviderCommand = vscode.commands.registerCommand('vsc-chat.selectProvider', async () => {
		const providerNames = Array.from(providers.keys());
		const selectedProvider = await vscode.window.showQuickPick(providerNames, {
			placeHolder: 'Select LLM Provider'
		});

		if (selectedProvider) {
			vscode.workspace.getConfiguration('vsc-chat').update('defaultProvider', selectedProvider, true);
			
			if (chatPanel) {
				await initializeProvider(selectedProvider);
				// Clear chat history when changing providers
				chatHistory = [];
			}
		}
	});

	context.subscriptions.push(openChatCommand, selectProviderCommand);

	async function initializeProvider(providerName: string) {
		// Get provider
		const provider = providers.get(providerName);
		if (!provider) {
			throw new Error(`Provider ${providerName} not found`);
		}

		try {
			// Initialize provider
			await provider.initialize();
			currentProvider = provider;

			// Get available models
			const models = await provider.getAvailableModels();

			// Update webview with available models
			chatPanel?.webview.postMessage({
				type: 'updateModels',
				models
			});
		} catch (error) {
			throw new Error(`Failed to initialize provider ${providerName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async function handleUserMessage(message: string, model: string) {
		if (!currentProvider) {
			throw new Error('No LLM provider initialized');
		}

		try {
			 // Add user message to chat history
			const userMessage: ChatMessage = { role: 'user', content: message };
			chatHistory.push(userMessage);
			
			// Create request with full chat history for context
			const request: ChatCompletionRequest = {
				messages: [...chatHistory],
				model
			};

			// Send request to provider
			const response = await currentProvider.sendChatCompletionRequest(request);
			
			// Add assistant response to chat history
			chatHistory.push(response.message);

			// Format markdown for display
			const formattedContent = marked.parse(response.message.content) as string;

			// Send response back to webview
			chatPanel?.webview.postMessage({
				type: 'addMessage',
				role: 'assistant',
				content: formattedContent
			});
		} catch (error) {
			throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	function getWebviewContent(context: vscode.ExtensionContext): string {
		// Read HTML template
		const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'chat-view.html');
		
		if (fs.existsSync(htmlPath)) {
			return fs.readFileSync(htmlPath, 'utf8');
		} else {
			// Fallback if file doesn't exist
			return `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="UTF-8">
					<title>LLM Chat</title>
					<style>
						body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
					</style>
				</head>
				<body>
					<h1>LLM Chat</h1>
					<p>Error: Chat view template not found. Please reinstall the extension.</p>
				</body>
				</html>
			`;
		}
	}
}

export function deactivate() {
	// Clean up resources when extension is deactivated
}
