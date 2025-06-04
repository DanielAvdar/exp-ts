import React, { useState, useEffect } from 'react';
import { ServiceAbstractionLayer, LangGraphMessage } from './sal';
import ChatWindow from './components/ChatWindow';
// import './styles/main.css'; // Assuming main.css is imported elsewhere or not needed for this component directly

interface AppProps {
  salInstance: ServiceAbstractionLayer;
}

const App: React.FC<AppProps> = ({ salInstance }) => {
  const [messages, setMessages] = useState<LangGraphMessage[]>([]);

  useEffect(() => {
    // Define the callback function for receiving messages
    const handleMessageReceived = (newMessage: LangGraphMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Subscribe to message updates from the SAL
    salInstance.onMessageReceived(handleMessageReceived);

    // Optional: Clean up subscription when the component unmounts
    // This depends on how salInstance.onMessageReceived is implemented.
    // If it returns an unsubscribe function, you would call it here.
    // return () => {
    //   // salInstance.unsubscribeFromMessageUpdates(handleMessageReceived);
    // };
  }, [salInstance]); // Re-run effect if salInstance changes

  // Function to send a message via SAL - to be passed to ChatInput
  const handleSendMessage = async (content: string) => {
    const newMessage: LangGraphMessage = {
      id: Date.now().toString(), // Temporary ID generation
      sender: 'user',
      content: content,
      timestamp: new Date().toISOString(),
    };
    try {
      await salInstance.sendMessageToLangGraph(newMessage);
      // Optionally, add the user's message to the UI immediately
      // or wait for the SAL to echo it back via onMessageReceived
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="app-container">
      {/* Pass messages and the sendMessage handler to ChatWindow */}
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        salInstance={salInstance}
      />
    </div>
  );
};

export default App;
