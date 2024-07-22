// src/contexts/MessageContext.jsx
import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext();

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

export const useMessage = () => {
    return useContext(MessageContext);
};
