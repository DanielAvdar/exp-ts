import * as vscode from 'vscode';

/**
 * Interface for configuration provider - abstracts VS Code's configuration API
 * This allows us to inject a mock implementation for testing
 */
export interface IConfigProvider {
  getApiKey(): string | undefined;
  saveApiKey(apiKey: string): Promise<void>;
  promptForApiKey(): Promise<string | undefined>;
}

/**
 * VS Code implementation of the ConfigProvider interface
 */
export class VsCodeConfigProvider implements IConfigProvider {
  constructor(private readonly configSection: string) {}

  getApiKey(): string | undefined {
    return vscode.workspace.getConfiguration(this.configSection).get('apiKey');
  }

  async saveApiKey(apiKey: string): Promise<void> {
    await vscode.workspace.getConfiguration(this.configSection).update('apiKey', apiKey, true);
  }

  async promptForApiKey(): Promise<string | undefined> {
    return vscode.window.showInputBox({
      prompt: `Enter your ${this.configSection} API key`,
      ignoreFocusOut: true,
      password: true,
    });
  }
}
