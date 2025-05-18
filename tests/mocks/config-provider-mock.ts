import { IConfigProvider } from '../../src/services/config-provider';

/**
 * Mock implementation of IConfigProvider for testing
 */
export class MockConfigProvider implements IConfigProvider {
  private apiKey: string | undefined;
  public promptCalled = false;
  public saveCalled = false;

  constructor(initialApiKey?: string) {
    this.apiKey = initialApiKey;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  async saveApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    this.saveCalled = true;
  }

  async promptForApiKey(): Promise<string | undefined> {
    this.promptCalled = true;
    // If set to 'simulate-cancel', return undefined to simulate user cancellation
    return this.apiKey === 'simulate-cancel' ? undefined : 'test-prompted-key';
  }

  // Helper method to reset tracking flags for test assertions
  reset(): void {
    this.promptCalled = false;
    this.saveCalled = false;
  }
}
