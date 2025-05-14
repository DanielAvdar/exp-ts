import * as assert from 'assert';
import '../test-setup';
import { OpenAIApiClient } from '../../src/providers/openai-provider';
import * as sinon from 'sinon';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { ChatCompletionRequest } from '../../src/models/chat';

describe('OpenAIApiClient', () => {
  let apiClient: OpenAIApiClient;
  let axiosMock: InstanceType<typeof AxiosMockAdapter>;
  const testApiKey = 'test-api-key-123';

  beforeEach(() => {
    // Create a new axios mock
    axiosMock = new AxiosMockAdapter(axios);

    // Create a new API client
    apiClient = new OpenAIApiClient(testApiKey);
  });

  afterEach(() => {
    // Restore all mocks
    sinon.restore();
    axiosMock.reset();
  });

  describe('fetchModels', () => {
    it('should fetch available models from OpenAI API', async () => {
      // Mock the OpenAI API response
      axiosMock.onGet('https://api.openai.com/v1/models').reply(200, {
        data: [
          { id: 'gpt-4o' },
          { id: 'gpt-3.5-turbo' },
          { id: 'text-davinci-003' }, // This one should be filtered out
          { id: 'gpt-4-turbo' },
        ],
      });

      // Get models
      const models = await apiClient.fetchModels(testApiKey);

      // Assert the response
      assert.strictEqual(models.length, 3);
      assert.ok(models.includes('gpt-4o'));
      assert.ok(models.includes('gpt-3.5-turbo'));
      assert.ok(models.includes('gpt-4-turbo'));
      assert.ok(!models.includes('text-davinci-003'));
    });

    it('should handle API errors and return default models', async () => {
      // Mock an API error
      axiosMock.onGet('https://api.openai.com/v1/models').reply(500);

      // Get models (should not throw)
      const models = await apiClient.fetchModels(testApiKey);

      // Should return default models
      assert.strictEqual(models.length, 3);
      assert.ok(models.includes('gpt-4o'));
    });
  });

  describe('sendChatRequest', () => {
    it('should send a chat completion request to OpenAI API', async () => {
      // Mock the OpenAI API response
      axiosMock.onPost('https://api.openai.com/v1/chat/completions').reply(200, {
        choices: [
          {
            message: {
              content: 'This is a test response from OpenAI',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      });

      // Send a message
      const request: ChatCompletionRequest = {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Hello, world!' }],
        temperature: 0.7,
        maxTokens: 1000,
      };

      const response = await apiClient.sendChatRequest(request, testApiKey);

      // Assert the response
      assert.strictEqual(response.message.content, 'This is a test response from OpenAI');
      assert.strictEqual(response.usage?.promptTokens, 10);
      assert.strictEqual(response.usage?.completionTokens, 20);
      assert.strictEqual(response.usage?.totalTokens, 30);
    });

    it('should throw an error when API request fails', async () => {
      // Mock an API error
      axiosMock.onPost('https://api.openai.com/v1/chat/completions').reply(500);

      // Send a message and expect it to throw
      try {
        const request: ChatCompletionRequest = {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Hello, world!' }],
          temperature: 0.7,
          maxTokens: 1000,
        };

        await apiClient.sendChatRequest(request, testApiKey);
        assert.fail('Expected sendChatRequest to throw an error');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.ok(error.message.includes('OpenAI API error'));
      }
    });
  });
});
