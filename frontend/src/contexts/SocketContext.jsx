import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNotification } from './NotificationContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { showSuccess, showError, showInfo } = useNotification();

    useEffect(() => {
        // Connect to WebSocket server
        const socketInstance = io('http://localhost:3001', {
            transports: ['websocket', 'polling']
        });

        socketInstance.on('connect', () => {
            console.log('🔌 WebSocket connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
            setIsConnected(false);
        });

        // Handle post status updates
        socketInstance.on('post:status', (data) => {
            console.log('📥 Post status update:', data);
            // This can be used to update UI in real-time
        });

        // Handle notifications
        socketInstance.on('notification', (data) => {
            console.log('📥 Notification:', data);

            switch (data.type) {
                case 'success':
                    showSuccess(data.message);
                    break;
                case 'error':
                    showError(data.message);
                    break;
                case 'info':
                case 'warning':
                    showInfo(data.message);
                    break;
                default:
                    showInfo(data.message);
            }
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
