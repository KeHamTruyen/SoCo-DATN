import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Lock, Globe } from 'lucide-react';
import { PageLayout } from './Layout/PageLayout';
import groupService, { Group } from '../services/group.service';

export function GroupsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const [search, setSearch] = useState('');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const [myGroupsResponse, discoverResponse] = await Promise.all([
          groupService.getMyGroups(),
          groupService.getGroups(1, 50, search || undefined),
        ]);
        setMyGroups(myGroupsResponse.data);
        setDiscoverGroups(discoverResponse.data);
      } catch (err) {
        console.error('Error loading groups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [search]);

  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningGroupId(groupId);
      await groupService.joinGroup(groupId);
      const detail = await groupService.getGroupById(groupId);
      setMyGroups((prev) => [detail.data, ...prev.filter((item) => item.id !== groupId)]);
      setDiscoverGroups((prev) =>
        prev.map((item) => (item.id === groupId ? { ...item, isMember: true } : item))
      );
    } catch (err) {
      console.error('Error joining group:', err);
    } finally {
      setJoiningGroupId(null);
    }
  };

  return (
    <PageLayout activePage="groups">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm nhóm..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`flex-1 py-4 text-sm ${
                activeTab === 'my-groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              Nhóm của tôi ({myGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-4 text-sm ${
                activeTab === 'discover' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              Khám phá
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Đang tải danh sách nhóm...</p>
        ) : activeTab === 'my-groups' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.length === 0 ? (
              <p className="text-sm text-gray-500">Bạn chưa tham gia nhóm nào.</p>
            ) : (
              myGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
                >
                  <div className="aspect-video bg-gray-100">
                    {group.coverImageUrl && (
                      <img src={group.coverImageUrl} alt={group.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm mb-2 line-clamp-2">{group.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {group.privacy === 'PUBLIC' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        <span>{group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{(group.membersCount || group._count?.members || 0).toLocaleString()} thành viên</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {discoverGroups.length === 0 ? (
              <p className="text-sm text-gray-500">Không tìm thấy nhóm phù hợp.</p>
            ) : (
              discoverGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {group.avatarUrl && (
                        <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button className="text-left" onClick={() => navigate(`/group/${group.id}`)}>
                        <h3 className="text-lg mb-1">{group.name}</h3>
                      </button>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{group.description || 'Không có mô tả'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {group.privacy === 'PUBLIC' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          <span>{group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{(group.membersCount || group._count?.members || 0).toLocaleString()} thành viên</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.isMember || joiningGroupId === group.id}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-start disabled:opacity-60"
                    >
                      {group.isMember ? 'Đã tham gia' : joiningGroupId === group.id ? 'Đang xử lý...' : 'Tham gia'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
