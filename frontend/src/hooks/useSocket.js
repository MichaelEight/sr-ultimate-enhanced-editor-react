// src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';
import { useMessage } from '../contexts/MessageContext';

const socket = io('http://localhost:5000');

const useSocket = () => {
    const { addMessage, setProgress, setProgressMessage } = useMessage();

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

    return { setProgress, setProgressMessage, addMessage };
};

export default useSocket;
