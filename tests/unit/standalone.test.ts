import * as assert from 'assert';
import '../test-setup';

// Simple utility functions that we can test without VS Code
function formatChatMessage(message: { role: string; content: string }): string {
  if (!message.content || !message.role) {
    return '';
  }

  const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);
  return `${role}: ${message.content}`;
}

describe('Standalone Unit Tests', () => {
  describe('formatChatMessage', () => {
    it('should format chat messages correctly', () => {
      const message = { role: 'user', content: 'Hello, world!' };
      const formatted = formatChatMessage(message);
      assert.strictEqual(formatted, 'User: Hello, world!');

      const assistantMessage = { role: 'assistant', content: 'How can I help?' };
      const formattedAssistant = formatChatMessage(assistantMessage);
      assert.strictEqual(formattedAssistant, 'Assistant: How can I help?');
    });

    it('should handle empty messages', () => {
      const emptyMessage = { role: 'user', content: '' };
      const formatted = formatChatMessage(emptyMessage);
      assert.strictEqual(formatted, '');

      const noContent = { role: 'user', content: undefined } as any;
      const formattedNoContent = formatChatMessage(noContent);
      assert.strictEqual(formattedNoContent, '');
    });
  });
});
