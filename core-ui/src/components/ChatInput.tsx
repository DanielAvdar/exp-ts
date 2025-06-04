import React, { useState } from 'react';
import { ServiceAbstractionLayer, LangGraphMessage } from '../sal'; // Assuming SAL interface is in sal/index.ts

interface ChatInputProps {
  // Callback to App.tsx or ChatWindow.tsx to handle sending logic
  onSendMessage: (content: string) => void;
  // SAL instance can be passed if direct interaction is needed,
  // though often the actual call is abstracted to a handler like onSendMessage.
  salInstance: ServiceAbstractionLayer;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, salInstance }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim()) {
      // Call the passed-in handler, which in turn will use the SAL
      onSendMessage(inputValue.trim());
      setInputValue(''); // Clear input after sending
    }
  };

  // Example of direct SAL usage if needed (though onSendMessage is preferred for App.tsx to manage state)
  // const handleDirectSALSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();
  //   if (inputValue.trim()) {
  //     const newMessage: LangGraphMessage = {
  //       id: Date.now().toString(), // Consider more robust ID generation
  //       sender: 'user',
  //       content: inputValue.trim(),
  //       timestamp: new Date().toISOString(),
  //     };
  //     try {
  //       await salInstance.sendMessageToLangGraph(newMessage);
  //       setInputValue('');
  //       // Note: The message will appear in the list via the onMessageReceived subscription in App.tsx
  //     } catch (error) {
  //       console.error("Failed to send message directly via SAL:", error);
  //       // Potentially display an error to the user
  //     }
  //   }
  // };

  return (
    <form onSubmit={handleSubmit} className="chat-input" style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type a message..."
        style={{ flexGrow: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
      />
      <button type="submit" style={{ marginLeft: '10px', padding: '10px 15px', border: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '5px', cursor: 'pointer' }}>
        Send
      </button>
    </form>
  );
};

export default ChatInput;
