import { Server } from "socket.io";

let io = null;

/**
 * Map of userId -> Set<socketId> to track online users across tabs/devices
 */
const onlineUsers = new Map();

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:5173",
                process.env.FRONTEND_URL,
            ].filter(Boolean),
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        socket.on("user:online", (userId) => {
            if (!userId) return;
            socket.userId = userId;
            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }
            onlineUsers.get(userId).add(socket.id);
            socket.join(`user:${userId}`);
            console.log(`👤 User online: ${userId}`);
        });

        socket.on("conversation:join", (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });

        socket.on("conversation:leave", (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        socket.on("message:typing", ({ conversationId, userId }) => {
            socket
                .to(`conversation:${conversationId}`)
                .emit("message:typing", { userId });
        });

        socket.on("message:stop_typing", ({ conversationId, userId }) => {
            socket
                .to(`conversation:${conversationId}`)
                .emit("message:stop_typing", { userId });
        });

        socket.on("disconnect", () => {
            const userId = socket.userId;
            if (userId && onlineUsers.has(userId)) {
                onlineUsers.get(userId).delete(socket.id);
                if (onlineUsers.get(userId).size === 0) {
                    onlineUsers.delete(userId);
                }
            }
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    console.log("✅ WebSocket (Socket.io) initialized");
    return io;
}

export function getIO() {
    if (!io) {
        throw new Error(
            "Socket.io not initialized. Call initSocket(httpServer) first.",
        );
    }
    return io;
}

export function isUserOnline(userId) {
    return onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;
}

export function getOnlineUsers() {
    return onlineUsers;
}
