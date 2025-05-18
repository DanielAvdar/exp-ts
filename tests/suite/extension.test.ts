import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual([1, 2, 3].indexOf(5), -1);
    assert.strictEqual([1, 2, 3].indexOf(0), -1);
  });
});

suite('Extension Integration Test', () => {
  // Increase the timeout for the extension activation test
  test('Extension should be activated', async function () {
    // Set a longer timeout (5 seconds) for this specific test
    this.timeout(5000);

    // Get the extension
    const extension = vscode.extensions.getExtension('vscode-samples.vsc-chat');
    assert.ok(extension);

    // Ensure it's activated
    if (!extension.isActive) {
      await extension.activate();
    }
    assert.ok(extension.isActive);
  });

  test('Should have registered commands', () => {
    // Test that commands are registered
    return vscode.commands.getCommands(true).then(commands => {
      assert.ok(commands.includes('vsc-chat.openChat'));
      assert.ok(commands.includes('vsc-chat.selectProvider'));
    });
  });
});
