import React from 'react';
import { LangGraphMessage } from '../sal';

interface MessageItemProps {
  message: LangGraphMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const itemStyle: React.CSSProperties = {
    marginBottom: '10px',
    padding: '8px 12px',
    borderRadius: '15px',
    maxWidth: '70%',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isUser ? '#007bff' : '#e9ecef',
    color: isUser ? 'white' : 'black',
    textAlign: isUser ? 'right' : 'left',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column', // Ensure items stack vertically
    alignItems: isUser ? 'flex-end' : 'flex-start', // Align item bubble to right/left
  };


  return (
    <div style={containerStyle}>
      <div className={`message-item ${isUser ? 'user-message' : 'bot-message'}`} style={itemStyle}>
        <div className="message-sender" style={{ fontSize: '0.8em', opacity: 0.8, marginBottom: '2px' }}>
          {message.sender}
        </div>
        <div className="message-content">
          {message.content}
        </div>
        {message.timestamp && (
          <div className="message-timestamp" style={{ fontSize: '0.7em', opacity: 0.7, marginTop: '3px' }}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
