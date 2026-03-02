import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

/**
 * Initialize Socket.IO server
 * @param {http.Server} server - HTTP server instance
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true
    }
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userData = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Emit user online status
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Handle joining a conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on('message:send', (data) => {
      const { conversationId, message } = data;
      
      // Broadcast to conversation room (excluding sender)
      socket.to(`conversation:${conversationId}`).emit('message:new', {
        conversationId,
        message
      });

      console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
    });

    // Handle message read
    socket.on('message:read', (data) => {
      const { conversationId, messageIds } = data;
      
      // Broadcast to conversation room
      socket.to(`conversation:${conversationId}`).emit('message:read', {
        conversationId,
        messageIds,
        readBy: socket.userId
      });

      console.log(`Messages marked as read in conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { conversationId } = data;
      
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: socket.userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      
      // Emit user offline status
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Emit to specific user
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit to conversation room
 */
export const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation:${conversationId}`).emit(event, data);
  }
};

/**
 * Send notification to specific user via Socket.IO
 */
export const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
    console.log(`📬 Notification sent to user ${userId}:`, notification.type);
  }
};

/**
 * Emit notification count update to user
 */
export const emitNotificationCount = (userId, count) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:count', { count });
  }
};

export default { 
  initSocket, 
  getIO, 
  emitToUser, 
  emitToConversation,
  sendNotificationToUser,
  emitNotificationCount
};
