import { ServiceAbstractionLayer, LangGraphMessage, ExtensionSettings } from './index';

export class MockSal implements ServiceAbstractionLayer {
  private messageListeners: Array<(message: LangGraphMessage) => void> = [];
  private settingsListeners: Array<(settings: ExtensionSettings) => void> = [];
  private settings: ExtensionSettings;
  private messageHistory: LangGraphMessage[] = [];

  constructor() {
    this.log('MockSal initialized');
    this.settings = { enabled: true, apiKey: 'defaultMockApiKey' };

    // Optional: Send a welcome message after a short delay
    setTimeout(() => {
      const welcomeMessage: LangGraphMessage = {
        id: `msg-${Date.now()}`,
        sender: 'bot',
        content: 'Welcome to the Mock Chat! How can I help you today?',
        timestamp: new Date().toISOString(),
      };
      this.publishMessage(welcomeMessage);
    }, 1000);
  }

  public log(message: string, ...args: any[]): void {
    console.log(`[MockSal] ${message}`, ...args);
  }

  private publishMessage(message: LangGraphMessage): void {
    this.log('Publishing message:', message);
    this.messageHistory.push(message);
    this.messageListeners.forEach(listener => listener(message));
  }

  public async sendMessageToLangGraph(message: LangGraphMessage): Promise<void> {
    this.log('sendMessageToLangGraph received:', message);
    // Echo user's message immediately
    this.publishMessage({ ...message, id: `usr-${Date.now()}` });

    // Simulate bot response
    return new Promise(resolve => {
      setTimeout(() => {
        const botResponse: LangGraphMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          content: `Mock response to: "${message.content}"`,
          timestamp: new Date().toISOString(),
          metadata: {
            processingTime: Math.random() * 1000,
          },
        };
        this.publishMessage(botResponse);
        resolve();
      }, 500 + Math.random() * 1000); // Simulate network delay
    });
  }

  public onMessageReceived(callback: (message: LangGraphMessage) => void): void {
    this.log('Registering message listener');
    this.messageListeners.push(callback);
    // Optionally, send history or a welcome message upon new subscription
    // this.messageHistory.forEach(msg => callback(msg)); // Send history
  }

  public async getExtensionSettings(): Promise<ExtensionSettings> {
    this.log('getExtensionSettings called');
    return Promise.resolve(this.settings);
  }

  public async updateExtensionSettings(newSettings: ExtensionSettings): Promise<void> {
    this.log('updateExtensionSettings called with:', newSettings);
    this.settings = { ...this.settings, ...newSettings };
    this.settingsListeners.forEach(listener => listener(this.settings));
    this.log('Settings updated:', this.settings);
    return Promise.resolve();
  }

  public onExtensionSettingsChanged(callback: (settings: ExtensionSettings) => void): void {
    this.log('Registering settings listener');
    this.settingsListeners.push(callback);
    // Optionally, send current settings upon new subscription
    // callback(this.settings);
  }

  // Utility to remove a listener if needed (not strictly part of SAL interface but good for mocks)
  public removeMessageListener(callback: (message: LangGraphMessage) => void): void {
    this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    this.log('Message listener removed');
  }

  public removeSettingsListener(callback: (settings: ExtensionSettings) => void): void {
    this.settingsListeners = this.settingsListeners.filter(cb => cb !== callback);
    this.log('Settings listener removed');
  }
}
