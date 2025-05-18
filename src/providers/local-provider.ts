import axios from 'axios';
import * as vscode from 'vscode';
import { ChatCompletionRequest, ChatCompletionResponse, ProviderSettings } from '../models/chat';
import { LLMProvider } from './provider';

/**
 * Local LLM Provider implementation (e.g., Ollama)
 */
export class LocalProvider implements LLMProvider {
  public readonly name = 'local';
  public settings: ProviderSettings;

  constructor() {
    this.settings = {
      endpoint:
        vscode.workspace.getConfiguration('vsc-chat.local').get('endpoint') ||
        'http://localhost:11434',
      model: 'llama3',
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  public async initialize(): Promise<void> {
    if (!this.settings.endpoint) {
      const endpoint = await vscode.window.showInputBox({
        prompt: 'Enter your local LLM endpoint (e.g., http://localhost:11434 for Ollama)',
        ignoreFocusOut: true,
        value: 'http://localhost:11434',
      });

      if (endpoint) {
        this.settings.endpoint = endpoint;
        await vscode.workspace
          .getConfiguration('vsc-chat.local')
          .update('endpoint', endpoint, true);
      } else {
        throw new Error('Local LLM endpoint is required');
      }
    }
  }

  public async getAvailableModels(): Promise<string[]> {
    try {
      if (!this.settings.endpoint) {
        await this.initialize();
      }

      // For Ollama
      const response = await axios.get(`${this.settings.endpoint}/api/tags`);
      return response.data.models.map((model: { name: string }) => model.name);
    } catch (error) {
      console.error('Error fetching models:', error);
      return ['llama3', 'mistral', 'gemma'];
    }
  }

  public async sendChatCompletionRequest(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      if (!this.settings.endpoint) {
        await this.initialize();
      }

      // Format for Ollama API
      const messages = request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await axios.post(`${this.settings.endpoint}/api/chat`, {
        model: request.model || this.settings.model,
        messages: messages,
        stream: false,
        options: {
          temperature: request.temperature || this.settings.temperature,
        },
      });

      return {
        message: {
          role: 'assistant',
          content: response.data.message.content,
        },
      };
    } catch (error) {
      console.error('Error sending chat completion request:', error);
      throw new Error(
        `Local LLM API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.getAvailableModels();
      return true;
    } catch {
      return false;
    }
  }
}
