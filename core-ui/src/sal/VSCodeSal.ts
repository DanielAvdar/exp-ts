// core-ui/src/sal/VSCodeSal.ts
import { ServiceAbstractionLayer, LangGraphMessage, ExtensionSettings } from './index';

// Provided by VS Code in the webview environment
declare function acquireVsCodeApi(): {
  postMessage(message: any): void;
  getState(): any;
  setState(newState: any): void;
};

const vscodeApi = acquireVsCodeApi();

export class VSCodeSal implements ServiceAbstractionLayer {
  private messageListeners: Array<(message: LangGraphMessage) => void> = [];
  private settingsListeners: Array<(settings: ExtensionSettings) => void> = [];
  private pendingRequests: Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void }> = new Map();

  constructor() {
    window.addEventListener('message', event => {
      const message = event.data; // Data from the extension host
      this.log('info', `VSCodeSal (webview): Received message from host: ${JSON.stringify(message)}`);

      switch (message.type) {
        case 'sal/messageToUi':
          if (this.isValidLangGraphMessage(message.payload)) {
            // Ensure timestamp is a string as it comes from postMessage
            const receivedMessage = {
              ...message.payload,
              timestamp: typeof message.payload.timestamp === 'string' ? message.payload.timestamp : new Date(message.payload.timestamp).toISOString(),
            };
            this.messageListeners.forEach(callback => callback(receivedMessage));
          } else {
            this.log('error', `VSCodeSal (webview): Invalid LangGraphMessage received: ${JSON.stringify(message.payload)}`);
          }
          break;
        case 'sal/settingsToUi':
          // Add validation if necessary for settings structure
          this.settingsListeners.forEach(callback => callback(message.payload as ExtensionSettings));
          break;
        case 'sal/responseFromExtension':
          const request = this.pendingRequests.get(message.requestId);
          if (request) {
            if (message.error) {
              request.reject(message.error);
            } else {
              request.resolve(message.payload);
            }
            this.pendingRequests.delete(message.requestId);
          }
          break;
      }
    });
    this.log('info', 'VSCodeSal (webview) initialized.');
    // Optionally, notify extension host that SAL is ready
    // vscodeApi.postMessage({ type: 'sal/uiSalReady' });
  }

  // Basic validation for LangGraphMessage
  private isValidLangGraphMessage(payload: any): payload is LangGraphMessage {
    if (!payload || typeof payload.id !== 'string' ||
        !['user', 'bot', 'system'].includes(payload.sender) ||
        typeof payload.content !== 'string') {
      return false;
    }
    // Timestamp can be a string (ISO format) or a Date object (less likely after postMessage)
    if (typeof payload.timestamp !== 'string' && !(payload.timestamp instanceof Date)) {
        // If it's not a string, and not a Date, it might be problematic.
        // For robustness, we could try to parse it if it's a number (epoch time)
        // but for now, we'll be strict or rely on the transformation in the handler.
        // This example assumes it should be a string (ISO) if not a Date.
        // Let's adjust to be more flexible for postMessage stringification:
        if (typeof payload.timestamp !== 'string') return false;
        if (isNaN(new Date(payload.timestamp).getTime())) return false; // Check if the string is a valid date
    }
    return true;
  }


  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  private postRequestToExtension<T>(command: string, payload?: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const requestId = this.generateRequestId();
        this.pendingRequests.set(requestId, { resolve, reject });
        try {
            vscodeApi.postMessage({ type: 'sal/commandFromUi', requestId, command, payload });
        } catch (e) {
            this.log('error', `Failed to postRequestToExtension: ${command}, ${e}`);
            this.pendingRequests.delete(requestId);
            reject(e);
        }
    });
  }

  async sendMessageToLangGraph(message: LangGraphMessage): Promise<void> {
    const serializableMessage = {
        ...message,
        timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : (typeof message.timestamp === 'string' ? message.timestamp : new Date().toISOString()),
    };
    try {
        vscodeApi.postMessage({ type: 'sal/messageToExtension', payload: serializableMessage });
    } catch (e) {
        this.log('error', `Failed to sendMessageToLangGraph: ${e}`);
        // Potentially reject a promise if the interface expected one, though SAL is fire-and-forget here.
        throw e; // Re-throw if this method should signal failure
    }
  }

  onMessageReceived(callback: (message: LangGraphMessage) => void): () => void {
    this.messageListeners.push(callback);
    this.log('info', `onMessageReceived: listener added. Total: ${this.messageListeners.length}`);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
      this.log('info', `onMessageReceived: listener removed. Total: ${this.messageListeners.length}`);
    };
  }

  // Renamed from getSettings to getExtensionSettings to match SAL interface
  async getExtensionSettings(): Promise<ExtensionSettings> {
    this.log('info', 'Requesting extension settings from host.');
    return this.postRequestToExtension<ExtensionSettings>('getExtensionSettings');
  }

  // Renamed from updateSettings to updateExtensionSettings to match SAL interface
  async updateExtensionSettings(settingsToUpdate: Partial<ExtensionSettings>): Promise<void> {
    this.log('info', `Requesting update to extension settings: ${JSON.stringify(settingsToUpdate)}`);
    // Ensure settingsToUpdate is serializable (should be if it's Partial<ExtensionSettings>)
    return this.postRequestToExtension<void>('updateExtensionSettings', settingsToUpdate);
  }

  // Renamed from onSettingsChanged to onExtensionSettingsChanged to match SAL interface
  onExtensionSettingsChanged(callback: (newSettings: ExtensionSettings) => void): () => void {
    this.settingsListeners.push(callback);
    this.log('info', `onExtensionSettingsChanged: listener added. Total: ${this.settingsListeners.length}`);
    return () => {
      this.settingsListeners = this.settingsListeners.filter(cb => cb !== callback);
      this.log('info', `onExtensionSettingsChanged: listener removed. Total: ${this.settingsListeners.length}`);
    };
  }

  log(level: 'info' | 'warn' | 'error', logData: any): void {
    let serializableMessage;
    if (typeof logData === 'string') {
        serializableMessage = logData;
    } else if (logData instanceof Error) {
        serializableMessage = `Error: ${logData.message}${logData.stack ? `\nStack: ${logData.stack}` : ''}`;
    } else {
        try {
            serializableMessage = JSON.stringify(logData);
        } catch (e) {
            serializableMessage = 'VSCodeSal: Could not serialize log data.';
        }
    }

    // Avoid recursion if log is called from postMessage itself in some error path
    if (serializableMessage.includes("sal/logFromUi")) return;

    try {
        vscodeApi.postMessage({
            type: 'sal/logFromUi',
            payload: { level, message: `[UI ${level}]: ${serializableMessage}` }
        });
    } catch (e) {
        // If postMessage itself fails, log to console as a last resort.
        console[level === 'error' ? 'error' : 'log'](`[UI Fallback Log - ${level}]: ${serializableMessage}`, e);
    }
  }
}
