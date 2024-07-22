// src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';
import { useMessage } from '../contexts/MessageContext';

const socket = io('http://localhost:5000');

const useSocket = (setProgress, setProgressMessage) => {
    const { addMessage } = useMessage();

    useEffect(() => {
        socket.on('progress', (data) => {
            setProgress(data.progress);
            setProgressMessage(data.message);
        });

        socket.on('message', (data) => {
            addMessage(data.message);
        });

        return () => {
            socket.off('progress');
            socket.off('message');
        };
    }, [addMessage, setProgress, setProgressMessage]);
};

export default useSocket;
