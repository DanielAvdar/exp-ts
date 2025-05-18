import * as assert from 'assert';
import '../test-setup';
import { OpenAIProvider, OpenAIApiClient } from '../../src/providers/openai-provider';
import { MockConfigProvider } from '../mocks/config-provider-mock';
import * as sinon from 'sinon';
import { ChatCompletionRequest, ChatCompletionResponse } from '../../src/models/chat';

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let mockConfig: MockConfigProvider;
  let apiClientStub: sinon.SinonStubbedInstance<OpenAIApiClient>;

  beforeEach(() => {
    // Create a mock config provider
    mockConfig = new MockConfigProvider('test-api-key');

    // Create the provider with the mock config
    provider = new OpenAIProvider(mockConfig);

    // Replace the real API client with a stubbed one
    apiClientStub = sinon.createStubInstance(OpenAIApiClient);
    (provider as unknown as { apiClient: typeof apiClientStub }).apiClient = apiClientStub;
  });

  afterEach(() => {
    sinon.restore();
    mockConfig.reset();
  });

  describe('initialize', () => {
    it('should not prompt for API key if one is already configured', async () => {
      await provider.initialize();

      // Verify the prompt wasn't called since we already had a key
      assert.strictEqual(mockConfig.promptCalled, false);
    });

    it('should prompt for API key if none is configured', async () => {
      // Set up a provider with no API key
      mockConfig = new MockConfigProvider(undefined);
      provider = new OpenAIProvider(mockConfig);
      (provider as unknown as { apiClient: typeof apiClientStub }).apiClient = apiClientStub;

      await provider.initialize();

      // Verify the prompt was called
      assert.strictEqual(mockConfig.promptCalled, true);
      // Verify the API key was saved
      assert.strictEqual(mockConfig.saveCalled, true);
      // Verify the API key was updated in settings
      assert.strictEqual(provider.settings.apiKey, 'test-prompted-key');
    });

    it('should throw an error if user cancels API key prompt', async () => {
      // Set up a provider that will simulate cancellation
      mockConfig = new MockConfigProvider('simulate-cancel');
      provider = new OpenAIProvider(mockConfig);
      (provider as unknown as { apiClient: typeof apiClientStub }).apiClient = apiClientStub;

      // Force settings to have no API key to trigger the prompt
      provider.settings.apiKey = undefined;

      try {
        await provider.initialize();
        assert.fail('Expected an error to be thrown');
      } catch (error) {
        assert.ok(error instanceof Error);
        assert.strictEqual(error.message, 'OpenAI API key is required');
      }
    });
  });

  describe('getAvailableModels', () => {
    it('should call the API client with the correct API key', async () => {
      // Set up the stub to return some models
      apiClientStub.fetchModels.resolves(['model1', 'model2']);

      const result = await provider.getAvailableModels();

      // Verify the API client was called with the correct API key
      assert.ok(apiClientStub.fetchModels.calledOnceWith('test-api-key'));
      // Verify the result was returned correctly
      assert.deepStrictEqual(result, ['model1', 'model2']);
    });

    it('should initialize if no API key is set', async () => {
      // Set up a provider with no API key
      mockConfig = new MockConfigProvider(undefined);
      provider = new OpenAIProvider(mockConfig);
      (provider as unknown as { apiClient: typeof apiClientStub }).apiClient = apiClientStub;

      // Set up the stub to return some models
      apiClientStub.fetchModels.resolves(['model1', 'model2']);

      await provider.getAvailableModels();

      // Verify initialize was called (by checking if prompt was called)
      assert.strictEqual(mockConfig.promptCalled, true);
    });
  });

  describe('sendChatCompletionRequest', () => {
    it('should call the API client with the correct request', async () => {
      // Set up the stub to return a mock response
      const mockResponse: ChatCompletionResponse = {
        message: { role: 'assistant', content: 'Test response' },
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
      };
      apiClientStub.sendChatRequest.resolves(mockResponse);

      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'custom-model',
        temperature: 0.5,
        maxTokens: 500,
      };

      const result = await provider.sendChatCompletionRequest(request);

      // Verify the API client was called with the correct request
      assert.ok(apiClientStub.sendChatRequest.calledOnce);
      const [sentRequest, apiKey] = apiClientStub.sendChatRequest.getCall(0).args;
      assert.strictEqual(apiKey, 'test-api-key');
      assert.strictEqual(sentRequest.model, 'custom-model');
      assert.strictEqual(sentRequest.temperature, 0.5);
      assert.strictEqual(sentRequest.maxTokens, 500);

      // Verify the result was returned correctly
      assert.deepStrictEqual(result, mockResponse);
    });

    it('should use default settings when request options are not provided', async () => {
      // Set up the stub to return a mock response
      apiClientStub.sendChatRequest.resolves({
        message: { role: 'assistant', content: 'Test response' },
      });

      // Only provide messages, no other options
      const request: ChatCompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await provider.sendChatCompletionRequest(request);

      // Verify the API client was called with default settings
      const [sentRequest] = apiClientStub.sendChatRequest.getCall(0).args;
      assert.strictEqual(sentRequest.model, 'gpt-4o'); // Default model
      assert.strictEqual(sentRequest.temperature, 0.7); // Default temperature
      assert.strictEqual(sentRequest.maxTokens, 1000); // Default maxTokens
    });
  });
});
