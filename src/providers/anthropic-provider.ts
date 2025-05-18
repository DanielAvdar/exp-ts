import axios from 'axios';
import * as vscode from 'vscode';
import { ChatCompletionRequest, ChatCompletionResponse, ProviderSettings } from '../models/chat';
import { LLMProvider } from './provider';

/**
 * Anthropic LLM Provider implementation
 */
export class AnthropicProvider implements LLMProvider {
  public readonly name = 'anthropic';
  public settings: ProviderSettings;

  constructor() {
    this.settings = {
      apiKey: vscode.workspace.getConfiguration('vsc-chat.anthropic').get('apiKey'),
      model: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  public async initialize(): Promise<void> {
    if (!this.settings.apiKey) {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your Anthropic API key',
        ignoreFocusOut: true,
        password: true,
      });

      if (apiKey) {
        this.settings.apiKey = apiKey;
        await vscode.workspace
          .getConfiguration('vsc-chat.anthropic')
          .update('apiKey', apiKey, true);
      } else {
        throw new Error('Anthropic API key is required');
      }
    }
  }

  public async getAvailableModels(): Promise<string[]> {
    // Anthropic doesn't have a models endpoint, return supported models
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
    ];
  }

  public async sendChatCompletionRequest(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      if (!this.settings.apiKey) {
        await this.initialize();
      }

      // Convert chat format to Anthropic format
      const messages = request.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: request.model || this.settings.model,
          messages: messages,
          temperature: request.temperature || this.settings.temperature,
          max_tokens: request.maxTokens || this.settings.maxTokens,
        },
        {
          headers: {
            'x-api-key': this.settings.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        message: {
          role: 'assistant',
          content: response.data.content[0].text,
        },
        usage: {
          promptTokens: 0, // Anthropic doesn't provide token counts in the same way
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('Error sending chat completion request:', error);
      throw new Error(
        `Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.settings.apiKey) {
        await this.initialize();
      }

      // Simple health check
      await axios.get('https://api.anthropic.com/v1/messages', {
        headers: {
          'x-api-key': this.settings.apiKey,
          'anthropic-version': '2023-06-01',
        },
      });

      return true;
    } catch {
      return false;
    }
  }
}
