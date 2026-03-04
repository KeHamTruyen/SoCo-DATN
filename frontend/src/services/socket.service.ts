import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;

  private getSocketUrl() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  }

  connect(userId: string) {
    this.currentUserId = userId;
    if (!this.socket) {
      this.socket = io(this.getSocketUrl(), {
        withCredentials: true,
      });
    }

    if (this.socket.connected) {
      this.socket.emit('user:online', userId);
    } else {
      this.socket.on('connect', () => {
        if (this.currentUserId) {
          this.socket?.emit('user:online', this.currentUserId);
        }
      });
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.currentUserId = null;
  }

  joinConversation(conversationId: string) {
    this.socket?.emit('conversation:join', conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit('conversation:leave', conversationId);
  }

  emitTyping(conversationId: string, userId: string) {
    this.socket?.emit('message:typing', { conversationId, userId });
  }

  emitStopTyping(conversationId: string, userId: string) {
    this.socket?.emit('message:stop_typing', { conversationId, userId });
  }

  onMessageNew(handler: (payload: any) => void) {
    this.socket?.on('message:new', handler);
  }

  offMessageNew(handler: (payload: any) => void) {
    this.socket?.off('message:new', handler);
  }

  onTyping(handler: (payload: { userId: string }) => void) {
    this.socket?.on('message:typing', handler);
  }

  offTyping(handler: (payload: { userId: string }) => void) {
    this.socket?.off('message:typing', handler);
  }

  onStopTyping(handler: (payload: { userId: string }) => void) {
    this.socket?.on('message:stop_typing', handler);
  }

  offStopTyping(handler: (payload: { userId: string }) => void) {
    this.socket?.off('message:stop_typing', handler);
  }
}

export default new SocketService();
