import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageItem from './MessageItem'; // Adjust path as needed
import { LangGraphMessage } from '../sal'; // Adjust path

// Mock any SAL context or props MessageItem might need if it directly uses them.
// For VSCodeSal, if it's instantiated globally or through context, mock it.
// If MessageItem is pure and only receives props, this might not be strictly necessary
// unless a hook inside MessageItem tries to use a context provided by VSCodeSal.
// Given current MessageItem, it's a pure component taking props, so direct SAL mocking isn't critical
// unless a child component or hook it uses relies on it.
// vi.mock('../sal/VSCodeSal', () => ({ VSCodeSal: vi.fn() }));

describe('MessageItem Component', () => {
  it('renders user message correctly with content and sender', () => {
    const message: LangGraphMessage = {
      id: 'user-msg-1',
      sender: 'user',
      content: 'This is a user message.',
      timestamp: new Date().toISOString(), // Ensure timestamp is a string if that's what the component expects
    };
    render(<MessageItem message={message} />);

    // Check for sender display (e.g., "user")
    // The current MessageItem.tsx displays message.sender in a div with class message-sender
    const senderElement = screen.getByText(message.sender); // Or more specific query if text is modified
    expect(senderElement).toBeInTheDocument();

    // Check for message content
    const contentElement = screen.getByText(message.content);
    expect(contentElement).toBeInTheDocument();
  });

  it('renders bot message correctly with content and sender', () => {
    const message: LangGraphMessage = {
      id: 'bot-msg-1',
      sender: 'bot',
      content: 'This is a bot response.',
      timestamp: new Date().toISOString(),
    };
    render(<MessageItem message={message} />);

    const senderElement = screen.getByText(message.sender);
    expect(senderElement).toBeInTheDocument();

    const contentElement = screen.getByText(message.content);
    expect(contentElement).toBeInTheDocument();
  });

  it('displays timestamp if provided', () => {
    const timestamp = new Date();
    const message: LangGraphMessage = {
      id: 'msg-with-ts-1',
      sender: 'system',
      content: 'System message with timestamp.',
      timestamp: timestamp.toISOString(),
    };
    render(<MessageItem message={message} />);

    // Check if the timestamp (or its formatted version) is in the document
    // The current component formats it as toLocaleTimeString()
    const expectedTimeDisplay = timestamp.toLocaleTimeString();
    const timeElement = screen.getByText(expectedTimeDisplay);
    expect(timeElement).toBeInTheDocument();
  });

  it('applies user-specific styling (conceptual check via class or style)', () => {
    const userMessage: LangGraphMessage = {
      id: 'user-style-check',
      sender: 'user',
      content: 'User style test',
      timestamp: new Date().toISOString(),
    };
    const { container } = render(<MessageItem message={userMessage} />);
    // Example: Check if a specific class or style is applied for user messages
    // This depends on how MessageItem.tsx implements styling differences
    const messageItemDiv = container.querySelector('.message-item'); // Assuming .message-item is the main div
    expect(messageItemDiv).toHaveClass('user-message'); // Conceptual: if you add 'user-message' class for user
    // Or check computed style if specific styles are applied directly
    // expect(messageItemDiv).toHaveStyle('align-self: flex-end'); // As per current MessageItem.tsx
  });

  it('applies bot-specific styling (conceptual check via class or style)', () => {
    const botMessage: LangGraphMessage = {
      id: 'bot-style-check',
      sender: 'bot',
      content: 'Bot style test',
      timestamp: new Date().toISOString(),
    };
    const { container } = render(<MessageItem message={botMessage} />);
    const messageItemDiv = container.querySelector('.message-item');
    expect(messageItemDiv).toHaveClass('bot-message'); // Conceptual: if you add 'bot-message' class
    // expect(messageItemDiv).toHaveStyle('align-self: flex-start'); // As per current MessageItem.tsx
  });
});
