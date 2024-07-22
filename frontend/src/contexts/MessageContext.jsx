// src/context/MessageContext.jsx
import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);

    const addMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    return (
        <MessageContext.Provider value={{ messages, addMessage }}>
            {children}
        </MessageContext.Provider>
    );
};
