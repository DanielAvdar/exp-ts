import * as assert from 'assert';
import '../test-setup';

// Standalone unit tests that don't require VS Code API
describe('Standalone Unit Tests', () => {
  describe('formatChatMessage', () => {
    // Simplified utility function that formats chat messages
    function formatChatMessage(role: string, content: string): { role: string; content: string } {
      return { role, content };
    }

    it('should format chat messages correctly', () => {
      const result = formatChatMessage('user', 'Hello, world!');
      assert.deepStrictEqual(result, { role: 'user', content: 'Hello, world!' });
    });

    it('should handle empty messages', () => {
      const result = formatChatMessage('assistant', '');
      assert.deepStrictEqual(result, { role: 'assistant', content: '' });
    });
  });
});
