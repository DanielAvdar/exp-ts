import axios from 'axios';
import { ChatCompletionRequest, ChatCompletionResponse, ProviderSettings } from '../models/chat';
import { LLMProvider } from './provider';
import { IConfigProvider, VsCodeConfigProvider } from '../services/config-provider';

/**
 * OpenAI API client - core functionality that doesn't depend on VS Code
 */
export class OpenAIApiClient {
  constructor(private apiKey: string | undefined) {}

  /**
   * Set the API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Fetch available models from OpenAI API
   */
  async fetchModels(apiKey: string): Promise<string[]> {
    try {
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data
        .filter((model: { id: string }) => model.id.includes('gpt'))
        .map((model: { id: string }) => model.id);
    } catch (error) {
      console.error('Error fetching models:', error);
      return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
  }

  /**
   * Send a chat completion request to OpenAI API
   */
  async sendChatRequest(
    request: ChatCompletionRequest,
    apiKey: string
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
}

/**
 * OpenAI LLM Provider implementation with VS Code integration
 */
export class OpenAIProvider implements LLMProvider {
  public readonly name = 'openai';
  public settings: ProviderSettings;
  private apiClient: OpenAIApiClient;
  private configProvider: IConfigProvider;

  constructor(configProvider?: IConfigProvider) {
    // Use the provided config provider or create a default VS Code one
    this.configProvider = configProvider || new VsCodeConfigProvider('vsc-chat.openai');

    // Initialize with default settings
    this.settings = {
      apiKey: this.configProvider.getApiKey(),
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 1000,
    };

    // Create the API client
    this.apiClient = new OpenAIApiClient(this.settings.apiKey);
  }

  public async initialize(): Promise<void> {
    if (!this.settings.apiKey) {
      const apiKey = await this.configProvider.promptForApiKey();

      if (apiKey) {
        this.settings.apiKey = apiKey;
        this.apiClient.setApiKey(apiKey);
        await this.configProvider.saveApiKey(apiKey);
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

      if (!this.settings.apiKey) {
        throw new Error('API key is required to fetch models');
      }

      return await this.apiClient.fetchModels(this.settings.apiKey);
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

      if (!this.settings.apiKey) {
        throw new Error('API key is required to send chat completion request');
      }

      return await this.apiClient.sendChatRequest(
        {
          model: request.model || this.settings.model,
          messages: request.messages,
          temperature: request.temperature || this.settings.temperature,
          maxTokens: request.maxTokens || this.settings.maxTokens,
        },
        this.settings.apiKey
      );
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
    } catch {
      return false;
    }
  }
}
