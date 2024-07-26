import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    const addMessage = (msg) => {
        setMessages(prevMessages => [...prevMessages, msg]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return (
        <MessageContext.Provider value={{ messages, addMessage, clearMessages, progress, setProgress, progressMessage, setProgressMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => useContext(MessageContext);
