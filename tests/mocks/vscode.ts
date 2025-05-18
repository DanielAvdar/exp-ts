// VS Code API mock for unit testing
import * as sinon from 'sinon';

export const mockVscode = {
  window: {
    showInformationMessage: sinon.stub(),
    showErrorMessage: sinon.stub(),
    showInputBox: sinon.stub(),
    createOutputChannel: sinon.stub().returns({
      appendLine: sinon.stub(),
      show: sinon.stub(),
      clear: sinon.stub(),
    }),
  },
  workspace: {
    getConfiguration: sinon.stub(),
  },
  Uri: {
    parse: sinon.stub(),
    file: sinon.stub(),
  },
  commands: {
    registerCommand: sinon.stub(),
    executeCommand: sinon.stub(),
  },
};
