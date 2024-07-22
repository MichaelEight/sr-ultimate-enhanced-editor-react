// src/contexts/MessageContext.jsx
import React, { createContext, useState, useContext } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    const addMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    return (
        <MessageContext.Provider value={{ messages, addMessage, progress, setProgress, progressMessage, setProgressMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => useContext(MessageContext);
export default MessageContext;
