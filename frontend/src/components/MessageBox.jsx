// src/components/MessageBox.jsx
import React from 'react';
import { useMessage } from '../contexts/MessageContext';
import '../assets/styles/MessageBox.css'; // Import the CSS file for styling

const MessageBox = () => {
    const { messages, clearMessages } = useMessage();

    return (
        <div className="message-box">
            <button onClick={clearMessages} className="clear-button">Clear Log</button>
            {messages.map((msg, index) => (
                <div key={index} className="message">
                    {msg}
                </div>
            ))}
        </div>
    );
};

export default MessageBox;
