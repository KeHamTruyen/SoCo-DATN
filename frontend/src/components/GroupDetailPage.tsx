import { useState } from 'react';
import { ArrowLeft, Users, MoreVertical, Settings, Bell, BellOff, Search, Image as ImageIcon, Video, Calendar, Link as LinkIcon, MapPin, Globe, Lock, UserPlus, UserCheck, Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';

export function GroupDetailPage() {
  const { user } = useAuth();
  const { id: groupId } = useParams<{ id: string }>();
  
  if (!user || !groupId) {
    return <div>Loading...</div>;
  }
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'media' | 'about'>('posts');
  const [isMember, setIsMember] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState('');

  // Mock group data based on groupId
  const groupData = {
    '1': {
      id: '1',
      name: 'Cộng đồng Thời trang Việt',
      description: 'Nơi chia sẻ và thảo luận về xu hướng thời trang, mua sắm và review sản phẩm thời trang Việt Nam',
      cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
      avatar: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
      members: 12500,
      posts: 3420,
      privacy: 'public',
      category: 'Thời trang',
      createdAt: '15 tháng 3, 2023',
      admins: [
        { id: '1', name: 'Nguyễn Văn A', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', role: 'Admin' }
      ]
    },
    '2': {
      id: '2',
      name: 'Đam mê Công nghệ',
      description: 'Cộng đồng yêu thích công nghệ, chia sẻ kiến thức và đánh giá thiết bị điện tử',
      cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
      avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      members: 8900,
      posts: 2150,
      privacy: 'public',
      category: 'Công nghệ',
      createdAt: '22 tháng 5, 2023',
      admins: [
        { id: '2', name: 'Trần Thị B', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', role: 'Admin' }
      ]
    }
  };

  const group = groupData[groupId as keyof typeof groupData] || groupData['1'];

  const posts = [
    {
      id: '1',
      author: {
        id: '1',
        name: 'Nguyễn Văn A',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        role: 'Admin'
      },
      content: 'Vừa nhận được bộ sưu tập mới từ thương hiệu local! Chất lượng tuyệt vời, giá cả phải chăng. Ai quan tâm inbox mình nhé! 🔥',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      likes: 124,
      comments: 28,
      shares: 12,
      timestamp: '2 giờ trước',
      isLiked: false
    },
    {
      id: '2',
      author: {
        id: '3',
        name: 'Lê Thị C',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        role: 'Member'
      },
      content: 'Mọi người có tips gì để phối đồ đi làm vừa chuyên nghiệp vừa trendy không? Chia sẻ với mình với 💕',
      likes: 89,
      comments: 45,
      shares: 5,
      timestamp: '5 giờ trước',
      isLiked: true
    },
    {
      id: '3',
      author: {
        id: '4',
        name: 'Phạm Văn D',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        role: 'Member'
      },
      content: 'Review áo sơ mi này: chất vải mềm mại, form dáng chuẩn, giá 350k. Rất đáng mua! Link shop ở comment bên dưới 👇',
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      likes: 156,
      comments: 34,
      shares: 18,
      timestamp: '1 ngày trước',
      isLiked: false
    }
  ];

  const members = [
    { id: '1', name: 'Nguyễn Văn A', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', role: 'Admin', joinedAt: 'Admin' },
    { id: '2', name: 'Trần Thị B', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', role: 'Moderator', joinedAt: 'Moderator' },
    { id: '3', name: 'Lê Thị C', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', role: 'Member', joinedAt: '2 tháng trước' },
    { id: '4', name: 'Phạm Văn D', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', role: 'Member', joinedAt: '1 tháng trước' },
    { id: '5', name: 'Hoàng Thị E', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', role: 'Member', joinedAt: '3 tuần trước' },
    { id: '6', name: 'Vũ Văn F', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', role: 'Member', joinedAt: '2 tuần trước' }
  ];

  const mediaItems = [
    { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
    { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400' },
    { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
    { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400' },
    { id: '5', type: 'image', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
    { id: '6', type: 'image', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400' }
  ];

  const handleJoinGroup = () => {
    setIsMember(!isMember);
  };

  const handleToggleNotifications = () => {
    setNotificationsOn(!notificationsOn);
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      console.log('New post:', newPost);
      setNewPost('');
      setShowPostModal(false);
      alert('Bài viết đã được đăng!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => onNavigate('groups')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg">Nhóm</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-64 bg-gray-200">
        <img
          src={group.cover}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Group Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 mb-6">
          <div className="flex items-end gap-4">
            <img
              src={group.avatar}
              alt={group.name}
              className="w-32 h-32 rounded-lg border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl text-white">{group.name}</h1>
                    {group.privacy === 'public' ? (
                      <Globe className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <span>{group.members.toLocaleString()} thành viên</span>
                    <span>•</span>
                    <span>{group.posts.toLocaleString()} bài viết</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          {isMember ? (
            <>
              <button
                onClick={handleJoinGroup}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Đã tham gia
              </button>
              <button
                onClick={handleToggleNotifications}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  notificationsOn
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {notificationsOn ? (
                  <>
                    <Bell className="w-4 h-4" />
                    Thông báo: Bật
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4" />
                    Thông báo: Tắt
                  </>
                )}
              </button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleJoinGroup}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Tham gia nhóm
              </button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </button>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {[
              { key: 'posts', label: 'Bài viết', count: group.posts },
              { key: 'members', label: 'Thành viên', count: group.members },
              { key: 'media', label: 'Ảnh & Video', count: mediaItems.length },
              { key: 'about', label: 'Giới thiệu' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-4 text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1 text-gray-400">({tab.count.toLocaleString()})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {/* Create Post */}
                {isMember && (
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <button
                        onClick={() => setShowPostModal(true)}
                        className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        Bạn đang nghĩ gì?
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">Ảnh</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Video className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-600">Video</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Sự kiện</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Posts List */}
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{post.author.name}</span>
                            {post.author.role !== 'Member' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                {post.author.role}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{post.timestamp}</p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-700 mb-3">{post.content}</p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt=""
                        className="w-full rounded-lg mb-3"
                      />
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current text-red-500' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm">{post.shares}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm thành viên..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{member.name}</span>
                            {member.role !== 'Member' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                {member.role}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{member.joinedAt}</p>
                        </div>
                      </div>
                      {member.role === 'Member' && (
                        <button className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Theo dõi
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-3 gap-2">
                  {mediaItems.map((item) => (
                    <div key={item.id} className="aspect-square">
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg mb-4">Giới thiệu</h3>
                <p className="text-gray-700 mb-6">{group.description}</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {group.privacy === 'public' ? (
                      <>
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm">Nhóm công khai</p>
                          <p className="text-xs text-gray-500">Ai cũng có thể xem nhóm và thành viên</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm">Nhóm riêng tư</p>
                          <p className="text-xs text-gray-500">Chỉ thành viên mới xem được nội dung</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm">{group.members.toLocaleString()} thành viên</p>
                      <p className="text-xs text-gray-500">+120 thành viên tuần này</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm">Được tạo ngày {group.createdAt}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm mb-3">Quản trị viên</h4>
                  <div className="space-y-2">
                    {group.admins.map((admin) => (
                      <div key={admin.id} className="flex items-center gap-3">
                        <img
                          src={admin.avatar}
                          alt={admin.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Group Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm mb-3">Hoạt động</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hôm nay</span>
                  <span className="text-sm">24 bài viết mới</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tuần này</span>
                  <span className="text-sm">156 bài viết</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tháng này</span>
                  <span className="text-sm">892 bài viết</span>
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm mb-3">Quản trị viên</h3>
              <div className="space-y-2">
                {group.admins.map((admin) => (
                  <div key={admin.id} className="flex items-center gap-3">
                    <img
                      src={admin.avatar}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm">{admin.name}</p>
                      <p className="text-xs text-gray-500">{admin.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Groups */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm mb-3">Nhóm gợi ý</h3>
              <div className="space-y-3">
                {[
                  { id: '1', name: 'Mẹo Mua Sắm Online', members: 9300, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400' },
                  { id: '2', name: 'Đồ Handmade Việt', members: 5600, image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400' }
                ].map((group) => (
                  <div key={group.id} className="flex items-center gap-3">
                    <img
                      src={group.image}
                      alt={group.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.members.toLocaleString()} thành viên</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg">Tạo bài viết</h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">Đăng trong {group.name}</p>
                </div>
              </div>

              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                rows={6}
                autoFocus
              />

              <div className="flex items-center gap-2 mt-4 p-3 border border-gray-300 rounded-lg">
                <span className="text-sm text-gray-600">Thêm vào bài viết:</span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-red-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <LinkIcon className="w-5 h-5 text-blue-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
