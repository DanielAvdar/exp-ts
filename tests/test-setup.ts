// Basic test setup for unit tests
import * as path from 'path';
import * as sinon from 'sinon';
// Fix the import error by using require for module-alias since TypeScript has issues with the typings
// eslint-disable-next-line @typescript-eslint/no-require-imports
const moduleAlias = require('module-alias');

// Create our mock VS Code module before any imports can use it
const mockVscode = {
  window: {
    showInformationMessage: sinon.stub().resolves(),
    showErrorMessage: sinon.stub().resolves(),
    showInputBox: sinon.stub().resolves('mock-input'),
    createOutputChannel: sinon.stub().returns({
      appendLine: sinon.stub(),
      show: sinon.stub(),
      clear: sinon.stub(),
    }),
  },
  workspace: {
    getConfiguration: sinon.stub().returns({
      get: sinon.stub().returns('test-api-key'),
      update: sinon.stub().resolves(),
    }),
  },
  commands: {
    registerCommand: sinon.stub(),
    executeCommand: sinon.stub().resolves(),
  },
  Uri: {
    parse: sinon.stub(),
    file: sinon.stub(),
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  ViewColumn: {
    Active: -1,
    Beside: -2,
    One: 1,
    Two: 2,
  },
};

// Make the mock available to tests
(global as unknown as Record<string, unknown>).vscode = mockVscode;

// Set up module aliases for testing
moduleAlias.addAlias('@src', path.join(__dirname, '../src'));
moduleAlias.addAlias('@providers', path.join(__dirname, '../src/providers'));
moduleAlias.addAlias('@models', path.join(__dirname, '../src/models'));
moduleAlias.addAlias('vscode', path.join(__dirname, './mocks/vscode-mock.js'));
