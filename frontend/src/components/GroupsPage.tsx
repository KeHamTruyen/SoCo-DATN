import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Lock, Globe, Loader2, AlertCircle, UserPlus, Plus } from 'lucide-react';
import { PageLayout } from './Layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import groupService, { type Group } from '../services/group.service';

export function GroupsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    privacy: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'SECRET'
  });

  useEffect(() => {
    if (!user) return;

    const fetchGroups = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [myRes, discoverRes] = await Promise.all([
          groupService.getMyGroups({ q: searchQuery, page: 1, limit: 30 }),
          groupService.listGroups({ q: searchQuery, page: 1, limit: 30, membership: 'discover' })
        ]);

        setMyGroups(myRes.data || []);
        setDiscoverGroups(discoverRes.data || []);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Không thể tải danh sách nhóm');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, searchQuery]);

  const visibleGroups = useMemo(
    () => (activeTab === 'my-groups' ? myGroups : discoverGroups),
    [activeTab, myGroups, discoverGroups]
  );

  const handleJoinGroup = async (groupId: string) => {
    try {
      setJoiningGroupId(groupId);
      await groupService.joinGroup(groupId);

      const joinedGroup = discoverGroups.find((group) => group.id === groupId);
      if (joinedGroup) {
        const nextJoined = {
          ...joinedGroup,
          isMember: true,
          membersCount: (joinedGroup.membersCount || 0) + 1
        };
        setMyGroups((prev) => [nextJoined, ...prev.filter((group) => group.id !== groupId)]);
      }
      setDiscoverGroups((prev) => prev.filter((group) => group.id !== groupId));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Không thể tham gia nhóm');
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      setErrorMessage('');

      const response = await groupService.createGroup({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        privacy: createForm.privacy
      });

      const created = response.data;
      setMyGroups((prev) => [created, ...prev]);
      setDiscoverGroups((prev) => prev.filter((group) => group.id !== created.id));
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', privacy: 'PUBLIC' });
      setActiveTab('my-groups');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Không thể tạo nhóm mới');
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <PageLayout activePage="groups">
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="groups">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h1 className="text-xl">Nhóm</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-inline-icon inline-flex flex-row items-center gap-2 px-4 py-2 min-w-[120px] rounded-lg bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
              style={{
                flexDirection: 'row',
                whiteSpace: 'nowrap',
                minWidth: '120px'
              }}
            >
              <Plus className="w-4 h-4 shrink-0" />
              Tạo nhóm
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhóm..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
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
              Khám phá ({discoverGroups.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : errorMessage ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700">{errorMessage}</p>
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            {activeTab === 'my-groups'
              ? 'Bạn chưa tham gia nhóm nào.'
              : 'Không có nhóm phù hợp với từ khóa tìm kiếm.'}
          </div>
        ) : activeTab === 'my-groups' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow text-left"
              >
                <div className="aspect-video relative bg-gray-100">
                  <img
                    src={
                      group.coverImageUrl ||
                      group.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=DBEAFE&color=1D4ED8`
                    }
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
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
                      <span>{(group.membersCount || group._count?.members || 0).toLocaleString('vi-VN')} thành viên</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {discoverGroups.map((group) => {
              const isJoining = joiningGroupId === group.id;
              return (
                <div key={group.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigate(`/group/${group.id}`)}
                      className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
                    >
                      <img
                        src={
                          group.avatarUrl ||
                          group.coverImageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=DBEAFE&color=1D4ED8`
                        }
                        alt={group.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => navigate(`/group/${group.id}`)} className="text-left">
                        <h3 className="text-lg mb-1 line-clamp-1">{group.name}</h3>
                      </button>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{group.description || 'Chưa có mô tả cho nhóm này.'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {group.privacy === 'PUBLIC' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          <span>{group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{(group.membersCount || group._count?.members || 0).toLocaleString('vi-VN')} thành viên</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={isJoining}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-start disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Tham gia
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg">Tạo nhóm mới</h2>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="groupName">Tên nhóm</label>
                <input
                  id="groupName"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ví dụ: Cộng đồng mua sắm thông minh"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1" htmlFor="groupDescription">Mô tả</label>
                <textarea
                  id="groupDescription"
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Mô tả ngắn về mục đích của nhóm"
                />
              </div>

              <div>
                <label className="block text-sm mb-1" htmlFor="groupPrivacy">Quyền riêng tư</label>
                <select
                  id="groupPrivacy"
                  value={createForm.privacy}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, privacy: e.target.value as 'PUBLIC' | 'PRIVATE' | 'SECRET' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PUBLIC">Công khai</option>
                  <option value="PRIVATE">Riêng tư</option>
                  <option value="SECRET">Bí mật</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-inline-icon px-4 py-2 min-w-[120px] rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 inline-flex flex-row items-center gap-2 whitespace-nowrap"
                  style={{
                    flexDirection: 'row',
                    whiteSpace: 'nowrap',
                    minWidth: '120px'
                  }}
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  Tạo nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
