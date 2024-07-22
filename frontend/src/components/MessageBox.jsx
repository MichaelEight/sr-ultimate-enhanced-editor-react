// src/components/MessageBox.jsx
import React, { useContext } from 'react';
import { MessageContext } from '../contexts/MessageContext';

const MessageBox = () => {
    const { messages } = useContext(MessageContext);

    return (
        <div className="message-box">
            <textarea rows="10" cols="50" value={messages.join('\n')} readOnly />
        </div>
    );
};

export default MessageBox;
