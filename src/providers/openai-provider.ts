import axios from 'axios';
import * as vscode from 'vscode';
import { ChatCompletionRequest, ChatCompletionResponse, ProviderSettings } from '../models/chat';
import { LLMProvider } from './provider';

/**
 * OpenAI LLM Provider implementation
 */
export class OpenAIProvider implements LLMProvider {
  public readonly name = 'openai';
  public settings: ProviderSettings;

  constructor() {
    this.settings = {
      apiKey: vscode.workspace.getConfiguration('vsc-chat.openai').get('apiKey'),
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  public async initialize(): Promise<void> {
    if (!this.settings.apiKey) {
      const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your OpenAI API key',
        ignoreFocusOut: true,
        password: true,
      });

      if (apiKey) {
        this.settings.apiKey = apiKey;
        await vscode.workspace.getConfiguration('vsc-chat.openai').update('apiKey', apiKey, true);
      } else {
        throw new Error('OpenAI API key is required');
      }
    }
  }

  public async getAvailableModels(): Promise<string[]> {
    try {
      if (!this.settings.apiKey) {
        await this.initialize();
      }

      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${this.settings.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data
        .filter((model: any) => model.id.includes('gpt'))
        .map((model: any) => model.id);
    } catch (error) {
      console.error('Error fetching models:', error);
      return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
  }

  public async sendChatCompletionRequest(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      if (!this.settings.apiKey) {
        await this.initialize();
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: request.model || this.settings.model,
          messages: request.messages,
          temperature: request.temperature || this.settings.temperature,
          max_tokens: request.maxTokens || this.settings.maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${this.settings.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        message: {
          role: 'assistant',
          content: response.data.choices[0].message.content,
        },
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('Error sending chat completion request:', error);
      throw new Error(
        `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.getAvailableModels();
      return true;
    } catch (error) {
      return false;
    }
  }
}
