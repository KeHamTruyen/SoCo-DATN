import { useState } from 'react';
import { Search, Send, MoreVertical, Phone, Video, Paperclip, Smile } from 'lucide-react';
import { User, Message } from '../App';
import { PageLayout } from './Layout';

interface MessagesPageProps {
  currentUser: User;
  onNavigate: (page: any) => void;
  onLogout: () => void;
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

export function MessagesPage({ currentUser, onNavigate, onLogout }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      timestamp: '5 phút trước',
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
      timestamp: '1 giờ trước',
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
      timestamp: '3 giờ trước',
      unread: 0
    },
    {
      id: '4',
      user: {
        id: '5',
        name: 'Hoàng Văn Nam',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        online: false
      },
      lastMessage: 'Laptop này còn bảo hành bao lâu vậy bạn?',
      timestamp: '1 ngày trước',
      unread: 0
    }
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

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Mock send message
      alert(`Tin nhắn đã gửi: ${messageText}`);
      setMessageText('');
    }
  };

  return (
    <PageLayout
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={0}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tin nhắn..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedConversation === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="relative">
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
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConv ? (
          <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConversation(null)} className="lg:hidden">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img src={selectedConv.user.avatar} alt={selectedConv.user.name} className="w-10 h-10 rounded-full" />
                  {selectedConv.user.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-sm">{selectedConv.user.name}</p>
                  <p className="text-xs text-gray-500">{selectedConv.user.online ? 'Đang hoạt động' : 'Không hoạt động'}</p>
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.senderId === currentUser.id ? 'order-2' : 'order-1'}`}>
                    {message.senderId !== currentUser.id && (
                      <img src={selectedConv.user.avatar} alt="" className="w-8 h-8 rounded-full mb-1" />
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.senderId === currentUser.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              ))}
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
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
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
