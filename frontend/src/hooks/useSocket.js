// src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

const useSocket = (setProgress) => {
    useEffect(() => {
        socket.on('progress', (data) => {
            // setProgress(data.progress);
        });

        return () => {
            socket.off('progress');
        };
    }, [setProgress]);
};

export default useSocket;
