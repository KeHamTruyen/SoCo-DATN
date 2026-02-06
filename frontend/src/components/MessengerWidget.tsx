import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Search, Phone, Video, MoreVertical, Smile, Paperclip } from 'lucide-react';
import { User, Message } from '../App';

interface MessengerWidgetProps {
  currentUser: User;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export function MessengerWidget({ currentUser }: MessengerWidgetProps) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('messengerWidget_isOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save isOpen state to localStorage
  useEffect(() => {
    localStorage.setItem('messengerWidget_isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const conversations: Conversation[] = [
    {
      id: '1',
      user: {
        id: '2',
        name: 'Trần Thị Mai',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        online: true
      },
      lastMessage: 'Sản phẩm còn hàng không shop?',
      timestamp: '5 phút',
      unread: 2
    },
    {
      id: '2',
      user: {
        id: '3',
        name: 'Lê Văn Hoàng',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
        online: true
      },
      lastMessage: 'Cảm ơn bạn nhiều nhé!',
      timestamp: '1 giờ',
      unread: 0
    },
    {
      id: '3',
      user: {
        id: '4',
        name: 'Phạm Thị Lan',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        online: false
      },
      lastMessage: 'Bạn có thể giao hàng cho mình vào sáng mai được không?',
      timestamp: '3 giờ',
      unread: 0
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      senderId: '2',
      receiverId: '1',
      content: 'Chào bạn! Mình muốn hỏi về sản phẩm này',
      timestamp: '10:30',
      read: true
    },
    {
      id: '2',
      senderId: '1',
      receiverId: '2',
      content: 'Chào bạn! Bạn muốn hỏi gì về sản phẩm ạ?',
      timestamp: '10:32',
      read: true
    },
    {
      id: '3',
      senderId: '2',
      receiverId: '1',
      content: 'Sản phẩm còn hàng không shop?',
      timestamp: '10:35',
      read: true
    },
    {
      id: '4',
      senderId: '2',
      receiverId: '1',
      content: 'Và có thể giao hàng trong ngày không?',
      timestamp: '10:35',
      read: false
    }
  ];

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0);
  const selectedConv = conversations.find(c => c.id === selectedConversation);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Mock send message
      setMessageText('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConversationClick = (convId: string) => {
    setSelectedConversation(convId);
    setIsMinimized(false);
  };

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
            {selectedConv && !isMinimized ? (
              <>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="hover:bg-blue-700 p-1 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <img src={selectedConv.user.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm">{selectedConv.user.name}</p>
                  <p className="text-xs opacity-90">{selectedConv.user.online ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                </div>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Đoạn chat</span>
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
                  {conversations
                    .filter(conv => 
                      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleConversationClick(conv.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <img src={conv.user.avatar} alt={conv.user.name} className="w-12 h-12 rounded-full" />
                        {conv.user.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm truncate">{conv.user.name}</span>
                          <span className="text-xs text-gray-500">{conv.timestamp}</span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread > 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unread}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[75%] ${message.senderId === currentUser.id ? 'flex-row-reverse' : 'flex-row'}`}>
                        {message.senderId !== currentUser.id && (
                          <img src={selectedConv.user.avatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                        )}
                        <div>
                          <div
                            className={`px-3 py-2 rounded-2xl ${
                              message.senderId === currentUser.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${message.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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