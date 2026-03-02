import { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Paperclip, Smile, ArrowLeft } from 'lucide-react';
import { PageLayout } from './Layout';
import messageService, { Conversation, Message as APIMessage } from '../services/message.service';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

interface TypingUser {
  userId: string;
  username: string;
  conversationId: string;
}

export function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<APIMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onMessageRead,
    onUserTyping,
    onUserOnline,
    onUserOffline,
  } = useSocket();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Setup Socket.IO event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Listen for new messages
    const unsubscribeNewMessage = onNewMessage((data) => {
      console.log('New message received:', data);
      
      // Update conversation list (move to top + update last message)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessage: data.message.content,
                lastMessageAt: data.message.createdAt,
                unreadCount: conv.id === selectedConversation ? (conv.unreadCount ?? 0) : (conv.unreadCount ?? 0) + 1,
              }
            : conv
        ).sort((a, b) => new Date(b.lastMessageAt ?? b.updatedAt).getTime() - new Date(a.lastMessageAt ?? a.updatedAt).getTime())
      );

      // If message is for current conversation, add to messages
      if (data.conversationId === selectedConversation) {
        const normalizedMessage: APIMessage = {
          ...data.message,
          attachmentUrl: data.message.attachmentUrl ?? null,
          readAt: data.message.readAt ?? null,
          sender: data.message.sender ? {
            id: data.message.sender.id,
            username: data.message.sender.username,
            fullName: data.message.sender.fullName,
            avatarUrl: data.message.sender.avatarUrl || null,
            isVerified: false // Default since Socket.IO doesn't send this
          } : undefined
        };
        setMessages((prev) => [...prev, normalizedMessage]);
        // Mark as read if we're viewing the conversation
        markAsRead(data.conversationId);
        scrollToBottom();
      }
    });

    // Listen for message read events
    const unsubscribeMessageRead = onMessageRead((data) => {
      if (data.conversationId === selectedConversation) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.conversationId === data.conversationId && msg.senderId === user.id
              ? { ...msg, isRead: true, readAt: new Date().toISOString() }
              : msg
          )
        );
      }
    });

    // Listen for typing events
    const unsubscribeTyping = onUserTyping((data) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          // Add user to typing list
          if (!prev.find((u) => u.userId === data.userId && u.conversationId === data.conversationId)) {
            return [...prev, { userId: data.userId, username: data.username, conversationId: data.conversationId }];
          }
        } else {
          // Remove user from typing list
          return prev.filter((u) => !(u.userId === data.userId && u.conversationId === data.conversationId));
        }
        return prev;
      });
    });

    // Listen for online/offline events
    const unsubscribeOnline = onUserOnline((data) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    const unsubscribeOffline = onUserOffline((data) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Cleanup listeners
    return () => {
      unsubscribeNewMessage();
      unsubscribeMessageRead();
      unsubscribeTyping();
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [isConnected, selectedConversation, user.id]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (selectedConversation && isConnected) {
      joinConversation(selectedConversation);
      return () => {
        leaveConversation(selectedConversation);
      };
    }
  }, [selectedConversation, isConnected]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response = await messageService.getUserConversations();
      setConversations(response.data.conversations);
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
      setMessages(response.messages);
      
      // Mark messages as read
      if (isConnected) {
        markAsRead(conversationId);
      }
      
      // Update unread count in conversations
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

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      const newMessage = await messageService.sendMessage(selectedConversation, {
        content: messageText.trim(),
      });

      // Add message to local state
      setMessages((prev) => [...prev, newMessage]);

      // Update conversation last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: messageText.trim(), lastMessageAt: newMessage.createdAt }
            : conv
        )
      );

      setMessageText('');
      
      // Stop typing indicator
      if (isConnected) {
        stopTyping(selectedConversation);
      }

      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (!selectedConversation || !isConnected) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    if (text.trim()) {
      startTyping(selectedConversation);

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConversation);
      }, 3000);
    } else {
      stopTyping(selectedConversation);
    }
  };

  const handleSearchConversations = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadConversations();
      return;
    }

    try {
      const results = await messageService.searchConversations(query.trim());
      setConversations(results.data.conversations);
    } catch (error) {
      console.error('Failed to search conversations:', error);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const otherParticipant = selectedConv?.participants.find((p) => p.user.id !== user.id)?.user;
  const isOtherUserOnline = otherParticipant ? onlineUsers.has(otherParticipant.id) : false;
  const currentTypingUsers = typingUsers.filter((u) => u.conversationId === selectedConversation);

  return (
    <PageLayout
      activePage="messages"
      showFooter={false}
      showMobileNav={true}
      padding={false}
      maxWidth="full"
    >
      <div className="h-[calc(100vh-64px)] flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Conversations List */}
        <div className={`w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchConversations(e.target.value)}
                placeholder="Tìm kiếm tin nhắn..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            {!isConnected && (
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded">
                🔄 Đang kết nối lại...
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="p-4 text-center text-gray-500">Đang tải...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Chưa có cuộc trò chuyện nào</div>
            ) : (
              conversations.map((conv) => {
                const otherUser = conv.participants.find((p) => p.user.id !== user.id)?.user;
                if (!otherUser) return null;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <img src={otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser.fullName}`} alt={otherUser.fullName} className="w-12 h-12 rounded-full" />
                      {onlineUsers.has(otherUser.id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{otherUser.fullName}</span>
                        <span className="text-xs text-gray-500">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}</p>
                    </div>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConv && otherParticipant ? (
          <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConversation(null)} className="lg:hidden">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img
                    src={otherParticipant.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant.fullName}`}
                    alt={otherParticipant.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                  {isOtherUserOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{otherParticipant.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {isOtherUserOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages ? (
                <div className="text-center text-gray-500">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
              ) : (
                messages.map((message, index) => {
                  const isCurrentUser = message.senderId === user.id;
                  const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 items-end max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isCurrentUser && showAvatar && (
                          <img
                            src={otherParticipant.avatarUrl || `https://ui-avatars.com/api/?name=${otherParticipant.fullName}`}
                            alt=""
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        {!isCurrentUser && !showAvatar && <div className="w-8" />}
                        
                        <div>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isCurrentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-xs text-gray-500">
                              {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isCurrentUser && message.isRead && (
                              <span className="text-xs text-blue-600">✓✓</span>
                            )}
                            {isCurrentUser && !message.isRead && (
                              <span className="text-xs text-gray-400">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Typing indicator */}
              {currentTypingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <p className="text-sm text-gray-600">
                      {currentTypingUsers[0].username} đang nhập...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                  disabled={isSendingMessage}
                />
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSendingMessage}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-gray-500">Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
