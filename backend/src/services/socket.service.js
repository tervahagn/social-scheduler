import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.io server
 */
export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });

    console.log('✅ WebSocket server initialized');
    return io;
}

/**
 * Get Socket.io instance
 */
export function getSocket() {
    return io;
}

/**
 * Emit post status update to all connected clients
 */
export function emitPostStatus(postId, status, data = {}) {
    if (io) {
        io.emit('post:status', {
            postId,
            status,
            timestamp: new Date().toISOString(),
            ...data
        });
        console.log(`📤 Emitted post:status for post ${postId}: ${status}`);
    }
}

/**
 * Emit notification to all connected clients
 */
export function emitNotification(type, message, data = {}) {
    if (io) {
        io.emit('notification', {
            type, // 'success', 'error', 'info', 'warning'
            message,
            timestamp: new Date().toISOString(),
            ...data
        });
        console.log(`📤 Emitted notification: ${type} - ${message}`);
    }
}
