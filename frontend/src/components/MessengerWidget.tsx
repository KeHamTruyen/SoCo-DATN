import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Search, Phone, Video, Smile, Paperclip } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import messageService, { Conversation as APIConversation, Message as APIMessage } from '../services/message.service';

export function MessengerWidget() {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('messengerWidget_isOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<APIConversation[]>([]);
  const [messages, setMessages] = useState<APIMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onUserOnline,
    onUserOffline,
  } = useSocket();

  // Save isOpen state to localStorage
  useEffect(() => {
    localStorage.setItem('messengerWidget_isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  // Load conversations when widget opens
  useEffect(() => {
    if (isOpen && currentUser) {
      loadConversations();
    }
  }, [isOpen, currentUser]);

  // Setup socket listeners
  useEffect(() => {
    if (!isConnected || !currentUser) return;

    // Listen for new messages
    const unsubscribeNewMessage = onNewMessage((data) => {
      const isOwnMessage = data.message?.senderId === currentUser.id;
      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessage: data.message.content,
                lastMessageAt: data.message.createdAt,
                unreadCount:
                  conv.id === selectedConversation || isOwnMessage
                    ? (conv.unreadCount ?? 0)
                    : (conv.unreadCount ?? 0) + 1,
              }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt ?? b.updatedAt).getTime() - new Date(a.lastMessageAt ?? a.updatedAt).getTime())
      );

      // If message is for current conversation, add to messages
      if (data.conversationId === selectedConversation) {
        setMessages((prev) =>
          prev.some((msg) => msg.id === data.message.id)
            ? prev
            : [...prev, data.message]
        );
      }
    });

    // Listen for online/offline status
    const unsubscribeOnline = onUserOnline((data) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    const unsubscribeOffline = onUserOffline((data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [isConnected, currentUser, selectedConversation, onNewMessage, onUserOnline, onUserOffline]);

  // Join/leave conversation when selection changes
  useEffect(() => {
    if (selectedConversation && currentUser) {
      joinConversation(selectedConversation);
      loadMessages(selectedConversation);
      return () => {
        leaveConversation(selectedConversation);
      };
    }
  }, [selectedConversation, currentUser, joinConversation, leaveConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConversation]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await messageService.getUserConversations();
      const convs = response.data.conversations.map((conv: APIConversation) => ({
        ...conv,
        lastMessage: conv.messages?.[0]?.content || '',
        lastMessageAt: conv.messages?.[0]?.createdAt || conv.updatedAt
      }));
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await messageService.getConversationMessages(conversationId);
      const nextMessages = Array.isArray(response?.messages)
        ? response.messages
        : Array.isArray(response?.data?.messages)
          ? response.data.messages
          : [];
      setMessages(nextMessages);

      // Persist read status so unread badge stays cleared after reload
      await messageService.markMessagesAsRead(conversationId);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !currentUser) return;

    try {
      const message = await messageService.sendMessage(selectedConversation, { 
        content: messageText.trim() 
      });
      setMessages((prev) =>
        prev.some((msg) => msg.id === message.id)
          ? prev
          : [...prev, message]
      );
      setMessageText('');
      
      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? {
                ...conv,
                lastMessage: messageText.trim(),
                lastMessageAt: new Date().toISOString(),
              }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt ?? b.updatedAt).getTime() - new Date(a.lastMessageAt ?? a.updatedAt).getTime())
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConversationClick = (convId: string) => {
    setSelectedConversation(convId);
    setIsMinimized(false);
    
    // Mark conversation as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === convId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0);
  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConv?.participants.find((p) => p.user.id !== currentUser?.id)?.user;
  const isOtherUserOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;
  
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find((p) => p.user.id !== currentUser?.id)?.user;
    return otherUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>
    );
  }

  if (!currentUser) {
    return null;
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ`;
    return `${Math.floor(diffInMinutes / 1440)} ngày`;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <div
        className={`bg-white rounded-lg shadow-2xl transition-all ${
          isMinimized ? 'h-14' : 'h-[480px]'
        } w-[320px] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedConv && otherParticipant && !isMinimized ? (
              <>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="hover:bg-blue-700 p-1 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img 
                  src={otherParticipant.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant.fullName}&background=random`} 
                  alt="" 
                  className="w-8 h-8 rounded-full" 
                />
                <div>
                  <p className="text-sm font-medium">{otherParticipant.fullName}</p>
                  <p className="text-xs opacity-90">{isOtherUserOnline ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                </div>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Đoạn chat</span>
                {totalUnread > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {totalUnread}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedConv && !isMinimized && (
              <>
                <button className="p-1.5 hover:bg-blue-700 rounded-full">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-blue-700 rounded-full">
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-blue-700 rounded-full"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedConversation(null);
                setIsMinimized(false);
              }}
              className="p-1.5 hover:bg-blue-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Content */}
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoadingConversations ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-sm text-gray-500">Đang tải...</div>
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-sm text-gray-500">Chưa có đoạn chat nào</div>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const otherUser = conv.participants.find((p) => p.user.id !== currentUser.id)?.user;
                      if (!otherUser) return null;
                      const isOnline = onlineUsers.has(otherUser.id);
                      
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handleConversationClick(conv.id)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative flex-shrink-0">
                            <img 
                              src={otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser.fullName}&background=random`} 
                              alt={otherUser.fullName} 
                              className="w-12 h-12 rounded-full object-cover" 
                            />
                            {isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium truncate">{otherUser.fullName}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(conv.lastMessageAt || conv.updatedAt)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${(conv.unreadCount ?? 0) > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                              {conv.lastMessage || 'Chưa có tin nhắn'}
                            </p>
                          </div>
                          {(conv.unreadCount ?? 0) > 0 && (
                            <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                              {(conv.unreadCount ?? 0) > 9 ? '9+' : conv.unreadCount}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-sm text-gray-500">Đang tải tin nhắn...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-sm text-gray-500">Chưa có tin nhắn nào</div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.senderId === currentUser.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!isCurrentUser && otherParticipant && (
                              <img 
                                src={otherParticipant.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant.fullName}&background=random`} 
                                alt="" 
                                className="w-7 h-7 rounded-full flex-shrink-0 object-cover" 
                              />
                            )}
                            <div>
                              <div
                                className={`px-3 py-2 rounded-2xl ${
                                  isCurrentUser
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-900'
                                }`}
                              >
                                <p className="text-sm break-words">{message.content}</p>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0">
                      <Paperclip className="w-4 h-4 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Aa"
                      className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button className="p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0">
                      <Smile className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}