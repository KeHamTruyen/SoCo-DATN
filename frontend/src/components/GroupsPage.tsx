import { useState } from 'react';
import { Search, Users, Plus, Lock, Globe, TrendingUp } from 'lucide-react';
import { User } from '../App';
import { PageLayout } from './Layout/PageLayout';

interface GroupsPageProps {
  currentUser: User;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function GroupsPage({ currentUser, onNavigate, onLogout }: GroupsPageProps) {
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');

  const myGroups = [
    {
      id: '1',
      name: 'Cộng đồng thời trang Việt Nam',
      members: 12540,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      privacy: 'public',
      newPosts: 24
    },
    {
      id: '2',
      name: 'Săn sale đồ công nghệ',
      members: 8920,
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      privacy: 'private',
      newPosts: 15
    },
    {
      id: '3',
      name: 'Review sản phẩm chân thật',
      members: 15300,
      image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
      privacy: 'public',
      newPosts: 8
    }
  ];

  const discoverGroups = [
    {
      id: '4',
      name: 'Mua bán đồ cũ Hà Nội',
      members: 45200,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      privacy: 'public',
      description: 'Cộng đồng mua bán trao đổi đồ cũ tại Hà Nội'
    },
    {
      id: '5',
      name: 'Thời trang công sở',
      members: 28100,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
      privacy: 'public',
      description: 'Chia sẻ và tư vấn phong cách công sở'
    },
    {
      id: '6',
      name: 'Sneaker Việt Nam',
      members: 32400,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      privacy: 'private',
      description: 'Cộng đồng yêu thích giày sneaker'
    }
  ];

  return (
    <PageLayout 
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      activePage="groups"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhóm..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`flex-1 py-4 text-sm ${
                activeTab === 'my-groups'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Nhóm của tôi ({myGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-4 text-sm ${
                activeTab === 'discover'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Khám phá
            </button>
          </div>
        </div>

        {/* My Groups */}
        {activeTab === 'my-groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video relative">
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                  {group.newPosts > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                      {group.newPosts} bài mới
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm mb-2 line-clamp-2">{group.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {group.privacy === 'public' ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      <span>{group.privacy === 'public' ? 'Công khai' : 'Riêng tư'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.members.toLocaleString()} thành viên</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discover Groups */}
        {activeTab === 'discover' && (
          <div className="space-y-4">
            {discoverGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{group.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {group.privacy === 'public' ? (
                          <Globe className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                        <span>{group.privacy === 'public' ? 'Công khai' : 'Riêng tư'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{group.members.toLocaleString()} thành viên</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Đang phát triển</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-start">
                    Tham gia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
