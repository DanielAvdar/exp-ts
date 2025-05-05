// Mock VS Code module for standalone unit tests
const vscode = {
  window: {
    showInformationMessage: function () {
      return Promise.resolve();
    },
    showErrorMessage: function () {
      return Promise.resolve();
    },
    showInputBox: function () {
      return Promise.resolve('mock-input');
    },
    createOutputChannel: function () {
      return {
        appendLine: function () {},
        show: function () {},
        clear: function () {},
      };
    },
  },
  workspace: {
    getConfiguration: function () {
      return {
        get: function () {
          return null;
        },
        update: function () {
          return Promise.resolve();
        },
      };
    },
  },
  commands: {
    registerCommand: function () {},
    executeCommand: function () {
      return Promise.resolve();
    },
  },
  Uri: {
    parse: function () {
      return {};
    },
    file: function () {
      return {};
    },
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

module.exports = vscode;
