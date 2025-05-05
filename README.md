# VS Code LLM Chat Extension

A Visual Studio Code extension that allows you to chat with different LLM (Large Language Model) providers directly within your editor.

## Features

- Chat with multiple LLM providers in a dedicated panel
- Support for different providers:
  - OpenAI (ChatGPT, GPT-4)
  - Anthropic (Claude)
  - Local models (via Ollama)
- Select from available models for each provider
- Conversation history with context retention
- Markdown rendering for code blocks and formatting
- Easy configuration via VS Code settings

## Requirements

- VS Code 1.74.0 or higher
- API keys for OpenAI and/or Anthropic (if using those providers)
- Local LLM setup (e.g., Ollama) if using local models

## Installation

1. Clone this repository
2. Run `make install` to install dependencies
3. Press F5 to run the extension in development mode

## Usage

1. Open the command palette (Ctrl+Shift+P / Cmd+Shift+P) and search for "Open LLM Chat"
2. Select your desired LLM provider from the dropdown
3. Type your message in the input box and press Enter or click Send
4. View the response in the chat panel

## Configuration

You can configure the extension through VS Code settings:

1. Open VS Code settings (File > Preferences > Settings)
2. Search for "LLM Chat"
3. Configure the following settings:
   - `vsc-chat.defaultProvider`: Default LLM provider
   - `vsc-chat.openai.apiKey`: API key for OpenAI
   - `vsc-chat.anthropic.apiKey`: API key for Anthropic
   - `vsc-chat.local.endpoint`: Endpoint for local model (default: http://localhost:11434)

## Development

This extension is built using:
- TypeScript
- VS Code Extension API
- WebView API for the chat UI

### Build
```
npm run compile
```

### Test
```
make test
```

### Lint
```
make lint
```

## Adding a New Provider

To add a new LLM provider:

1. Create a new file in `src/providers/` that implements the `LLMProvider` interface
2. Add the provider to the providers map in `extension.ts`
3. Update the UI in `chat-view.html` to include the new provider option
4. Update the configuration in `package.json` to include settings for the new provider

## License

[MIT](LICENSE)
