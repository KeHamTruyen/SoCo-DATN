import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../services/message.service';
import { Notification } from '../services/notification.service';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string, attachmentUrl?: string) => void;
  markAsRead: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  onNewMessage: (callback: (data: { conversationId: string; message: Message }) => void) => () => void;
  onMessageRead: (callback: (data: { conversationId: string; userId: string }) => void) => () => void;
  onUserTyping: (callback: (data: { conversationId: string; userId: string; username: string; isTyping: boolean }) => void) => () => void;
  onUserOnline: (callback: (data: { userId: string }) => void) => () => void;
  onUserOffline: (callback: (data: { userId: string }) => void) => () => void;
  onNewNotification: (callback: (notification: Notification) => void) => () => void;
  onNotificationCount: (callback: (data: { count: number }) => void) => () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No auth token found, skipping Socket.IO connection');
      return;
    }

    // Initialize socket connection with JWT authentication
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting Socket.IO...');
      newSocket.disconnect();
    };
  }, []); // Empty dependency - only connect once on mount

  // Join a conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('conversation:join', conversationId);
      console.log('Joined conversation:', conversationId);
    }
  }, [socket]);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('conversation:leave', conversationId);
      console.log('Left conversation:', conversationId);
    }
  }, [socket]);

  // Send a message via Socket.IO (real-time)
  const sendMessage = useCallback((conversationId: string, content: string, attachmentUrl?: string) => {
    if (socket) {
      socket.emit('message:send', {
        conversationId,
        content,
        attachmentUrl,
      });
    }
  }, [socket]);

  // Mark messages as read
  const markAsRead = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('message:read', { conversationId });
    }
  }, [socket]);

  // Start typing indicator
  const startTyping = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('typing:start', { conversationId });
    }
  }, [socket]);

  // Stop typing indicator
  const stopTyping = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('typing:stop', { conversationId });
    }
  }, [socket]);

  // Listen for new messages
  const onNewMessage = useCallback((callback: (data: { conversationId: string; message: Message }) => void) => {
    if (!socket) return () => {};
    
    socket.on('message:new', callback);
    
    // Return cleanup function
    return () => {
      socket.off('message:new', callback);
    };
  }, [socket]);

  // Listen for message read events
  const onMessageRead = useCallback((callback: (data: { conversationId: string; userId: string }) => void) => {
    if (!socket) return () => {};
    
    socket.on('message:read', callback);
    
    return () => {
      socket.off('message:read', callback);
    };
  }, [socket]);

  // Listen for typing events
  const onUserTyping = useCallback((callback: (data: { conversationId: string; userId: string; username: string; isTyping: boolean }) => void) => {
    if (!socket) return () => {};
    
    const typingStartHandler = (data: any) => {
      callback({ ...data, isTyping: true });
    };
    
    const typingStopHandler = (data: any) => {
      callback({ ...data, isTyping: false });
    };
    
    socket.on('typing:start', typingStartHandler);
    socket.on('typing:stop', typingStopHandler);
    
    return () => {
      socket.off('typing:start', typingStartHandler);
      socket.off('typing:stop', typingStopHandler);
    };
  }, [socket]);

  // Listen for user online events
  const onUserOnline = useCallback((callback: (data: { userId: string }) => void) => {
    if (!socket) return () => {};
    
    socket.on('user:online', callback);
    
    return () => {
      socket.off('user:online', callback);
    };
  }, [socket]);

  // Listen for user offline events
  const onUserOffline = useCallback((callback: (data: { userId: string }) => void) => {
    if (!socket) return () => {};
    
    socket.on('user:offline', callback);
    
    return () => {
      socket.off('user:offline', callback);
    };
  }, [socket]);

  // Listen for new notifications
  const onNewNotification = useCallback((callback: (notification: Notification) => void) => {
    if (!socket) return () => {};
    
    socket.on('notification:new', callback);
    
    return () => {
      socket.off('notification:new', callback);
    };
  }, [socket]);

  // Listen for notification count updates
  const onNotificationCount = useCallback((callback: (data: { count: number }) => void) => {
    if (!socket) return () => {};
    
    socket.on('notification:count', callback);
    
    return () => {
      socket.off('notification:count', callback);
    };
  }, [socket]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    onNewMessage,
    onMessageRead,
    onUserTyping,
    onUserOnline,
    onUserOffline,
    onNewNotification,
    onNotificationCount,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use Socket context
export const useSocket = (): SocketContextValue => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
