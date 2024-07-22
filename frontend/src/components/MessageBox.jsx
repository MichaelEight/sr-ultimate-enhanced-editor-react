// src/components/MessageBox.jsx
import React from 'react';
import { useMessage } from '../contexts/MessageContext';
import '../assets/styles/MessageBox.css'; // Import the CSS file for styling

const MessageBox = () => {
    const { messages } = useMessage();

    return (
        <div className="message-box">
            {messages.map((msg, index) => (
                <div key={index} className="message">
                    {msg}
                </div>
            ))}
        </div>
    );
};

export default MessageBox;
