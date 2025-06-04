import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { LangGraphMessage, ServiceAbstractionLayer } from '../sal';

interface ChatWindowProps {
  messages: LangGraphMessage[];
  onSendMessage: (content: string) => void;
  salInstance: ServiceAbstractionLayer; // Pass SAL instance if ChatInput needs it directly
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, salInstance }) => {
  return (
    <div className="chat-window" style={{ width: '400px', height: '600px', display: 'flex', flexDirection: 'column', border: '1px solid #ccc' }}>
      <h2 style={{ textAlign: 'center', margin: '0', padding: '10px', borderBottom: '1px solid #ccc' }}>Chat</h2>
      <MessageList messages={messages} />
      <ChatInput onSendMessage={onSendMessage} salInstance={salInstance} />
    </div>
  );
};

export default ChatWindow;
