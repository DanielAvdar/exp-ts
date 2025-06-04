import React from 'react';
import MessageItem from './MessageItem';
import { LangGraphMessage } from '../sal';

interface MessageListProps {
  messages: LangGraphMessage[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list" style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
      {messages.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start chatting!</p>
      ) : (
        messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))
      )}
    </div>
  );
};

export default MessageList;
