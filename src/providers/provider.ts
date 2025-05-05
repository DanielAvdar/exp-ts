import { ChatCompletionRequest, ChatCompletionResponse, ProviderSettings } from '../models/chat';

/**
 * Interface for LLM providers
 */
export interface LLMProvider {
    // Provider name
    readonly name: string;
    
    // Provider-specific settings
    settings: ProviderSettings;
    
    // Initialize provider
    initialize(): Promise<void>;
    
    // Get available models
    getAvailableModels(): Promise<string[]>;
    
    // Send chat completion request
    sendChatCompletionRequest(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
    
    // Test connection to provider
    testConnection(): Promise<boolean>;
}