import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Send } from 'lucide-react';
import { PageLayout } from './Layout';
import { useAuth } from '../contexts/AuthContext';
import messageService, { Conversation, MessageItem } from '../services/message.service';
import socketService from '../services/socket.service';

export function MessagesPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId) || null;

  const selectedPeer = useMemo(() => {
    if (!selectedConversation || !user) return null;
    const peer = selectedConversation.participants.find((p) => p.userId !== user.id);
    return peer?.user || null;
  }, [selectedConversation, user]);

  useEffect(() => {
    if (!user) return;
    socketService.connect(user.id);

    const handleMessageNew = (newMessage: MessageItem) => {
      setConversations((prev) =>
        prev.map((item) =>
          item.id === newMessage.conversationId ? { ...item, lastMessage: newMessage } : item
        )
      );

      if (newMessage.conversationId === selectedConversationId) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        if (newMessage.senderId !== user.id) {
          messageService.markRead(newMessage.conversationId).catch(() => {});
        }
      }
    };

    const handleTyping = ({ userId }: { userId: string }) => {
      if (selectedPeer && userId === selectedPeer.id) {
        setIsPeerTyping(true);
      }
    };

    const handleStopTyping = ({ userId }: { userId: string }) => {
      if (selectedPeer && userId === selectedPeer.id) {
        setIsPeerTyping(false);
      }
    };

    socketService.onMessageNew(handleMessageNew);
    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);

    return () => {
      socketService.offMessageNew(handleMessageNew);
      socketService.offTyping(handleTyping);
      socketService.offStopTyping(handleStopTyping);
    };
  }, [selectedConversationId, selectedPeer, user]);

  useEffect(() => {
    if (!selectedConversationId) return;
    socketService.joinConversation(selectedConversationId);
    setIsPeerTyping(false);

    return () => {
      socketService.leaveConversation(selectedConversationId);
    };
  }, [selectedConversationId]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const response = await messageService.getConversations();
        setConversations(response.data);
        const preselectConversationId = searchParams.get('conversationId');
        if (preselectConversationId) {
          const exists = response.data.some((item) => item.id === preselectConversationId);
          if (exists) {
            setSelectedConversationId(preselectConversationId);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await messageService.getMessages(selectedConversationId);
        setMessages(response.data);
        await messageService.markRead(selectedConversationId);
        setConversations((prev) =>
          prev.map((item) =>
            item.id === selectedConversationId ? { ...item, unreadCount: 0 } : item
          )
        );
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversationId]);

  if (!user) return null;

  const filteredConversations = conversations.filter((conv) => {
    const peer = conv.participants.find((p) => p.userId !== user.id)?.user;
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    return `${peer?.fullName || ''} ${peer?.username || ''}`.toLowerCase().includes(keyword);
  });

  const handleSendMessage = async () => {
    if (!selectedConversationId || !messageText.trim()) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      const response = await messageService.sendMessage(selectedConversationId, content);
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === response.data.id)) return prev;
        return [...prev, response.data];
      });
      setConversations((prev) =>
        prev.map((item) =>
          item.id === selectedConversationId ? { ...item, lastMessage: response.data } : item
        )
      );
      if (user) {
        socketService.emitStopTyping(selectedConversationId, user.id);
      }
      setIsPeerTyping(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageText(content);
    }
  };

  return (
    <PageLayout activePage="messages" showFooter={false} padding={false} maxWidth="full">
      <div className="h-[calc(100vh-64px)] flex overflow-hidden max-w-7xl mx-auto w-full">
        <div
          className={`w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col ${
            selectedConversationId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tin nhắn..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <p className="p-4 text-sm text-gray-500">Đang tải cuộc trò chuyện...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Chưa có cuộc trò chuyện nào.</p>
            ) : (
              filteredConversations.map((conv) => {
                const peer = conv.participants.find((p) => p.userId !== user.id)?.user;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      selectedConversationId === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <img
                      src={
                        peer?.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          peer?.fullName || peer?.username || 'User'
                        )}`
                      }
                      alt={peer?.fullName || peer?.username || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm truncate">{peer?.fullName || peer?.username}</span>
                        <span className="text-xs text-gray-500">
                          {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString('vi-VN') : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {selectedConversation ? (
          <div className={`flex-1 flex flex-col bg-white ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <button onClick={() => setSelectedConversationId(null)} className="lg:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <img
                src={
                  selectedPeer?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedPeer?.fullName || selectedPeer?.username || 'User'
                  )}`
                }
                alt={selectedPeer?.fullName || selectedPeer?.username || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm">{selectedPeer?.fullName || selectedPeer?.username}</p>
                <p className="text-xs text-gray-500">@{selectedPeer?.username}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có tin nhắn nào.</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-md ${
                        message.senderId === user.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content || '[Tin nhắn đã xóa]'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMessageText(value);
                    if (!user || !selectedConversationId) return;

                    if (value.trim()) {
                      socketService.emitTyping(selectedConversationId, user.id);
                      if (typingTimeoutRef.current) {
                        window.clearTimeout(typingTimeoutRef.current);
                      }
                      typingTimeoutRef.current = window.setTimeout(() => {
                        socketService.emitStopTyping(selectedConversationId, user.id);
                      }, 1200);
                    } else {
                      socketService.emitStopTyping(selectedConversationId, user.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            {isPeerTyping && (
              <p className="px-4 pb-3 text-xs text-gray-500">Đối phương đang nhập...</p>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-gray-500">Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
