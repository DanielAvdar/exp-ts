export interface LangGraphMessage {
  // Unique identifier for the message
  id: string;
  // The sender of the message, e.g., "user", "bot", "system"
  sender: string;
  // The content of the message
  content: string;
  // Optional timestamp of when the message was created
  timestamp?: string;
  // Optional metadata for the message
  metadata?: Record<string, any>;
}

export interface ExtensionSettings {
  // Setting to enable or disable the extension
  enabled: boolean;
  // Example of a specific setting for the extension
  apiKey?: string;
  // Other settings specific to the extension's functionality
  [key: string]: any;
}

export interface ServiceAbstractionLayer {
  // Method to send a message to the LangGraph backend
  sendMessageToLangGraph(message: LangGraphMessage): Promise<void>;

  // Method to receive messages from the LangGraph backend
  // The callback will be invoked with a new message
  onMessageReceived(callback: (message: LangGraphMessage) => void): () => void; // Added return type for unsubscribe

  // Method to get current extension settings
  getExtensionSettings(): Promise<ExtensionSettings>;

  // Method to update extension settings
  updateExtensionSettings(settings: Partial<ExtensionSettings>): Promise<void>; // Use Partial for updates

  // Method to subscribe to changes in extension settings
  onExtensionSettingsChanged(callback: (settings: ExtensionSettings) => void): () => void; // Added return type for unsubscribe

  // Method for logging from the SAL implementation
  log(level: 'info' | 'warn' | 'error', message: string | object): void;
}
