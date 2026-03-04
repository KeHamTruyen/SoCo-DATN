import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Globe, Lock, Users } from 'lucide-react';
import { PageLayout } from './Layout';
import groupService, { Group, GroupMember } from '../services/group.service';

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingMembership, setProcessingMembership] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupResponse, membersResponse] = await Promise.all([
          groupService.getGroupById(id),
          groupService.getMembers(id, 1, 50),
        ]);
        setGroup(groupResponse.data);
        setMembers(membersResponse.data);
      } catch (err) {
        console.error('Error loading group detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const adminMembers = useMemo(
    () => members.filter((member) => member.role === 'ADMIN' || member.role === 'MODERATOR'),
    [members]
  );

  const handleToggleMembership = async () => {
    if (!group || !id) return;
    try {
      setProcessingMembership(true);
      if (group.isMember) {
        await groupService.leaveGroup(id);
        setGroup({ ...group, isMember: false, membersCount: Math.max(0, group.membersCount - 1) });
      } else {
        await groupService.joinGroup(id);
        setGroup({ ...group, isMember: true, membersCount: group.membersCount + 1 });
      }
    } catch (err) {
      console.error('Error toggling group membership:', err);
    } finally {
      setProcessingMembership(false);
    }
  };

  if (loading) {
    return (
      <PageLayout activePage="groups">
        <p className="text-sm text-gray-500">Đang tải nhóm...</p>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout activePage="groups">
        <p className="text-sm text-gray-500">Không tìm thấy nhóm.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="groups">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách nhóm</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="h-48 bg-gray-100">
            {group.coverImageUrl && (
              <img src={group.coverImageUrl} alt={group.name} className="w-full h-full object-cover" />
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl">{group.name}</h1>
                  {group.privacy === 'PUBLIC' ? (
                    <Globe className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <p className="text-gray-600 mb-2">{group.description || 'Không có mô tả nhóm.'}</p>
                <div className="text-sm text-gray-500">
                  {(group.membersCount || group._count?.members || 0).toLocaleString()} thành viên
                </div>
              </div>

              <button
                onClick={handleToggleMembership}
                disabled={processingMembership}
                className={`px-5 py-2 rounded-lg ${
                  group.isMember
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } disabled:opacity-60`}
              >
                {processingMembership
                  ? 'Đang xử lý...'
                  : group.isMember
                    ? 'Rời nhóm'
                    : 'Tham gia nhóm'}
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 text-sm ${activeTab === 'posts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Bài viết
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 text-sm ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Thành viên ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-4 text-sm ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              Giới thiệu
            </button>
          </div>
        </div>

        {activeTab === 'posts' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">
              Backend hiện tại chưa có API bài viết theo nhóm. Trang này đã kết nối membership nhóm;
              khi BE bổ sung group-post endpoints có thể nối trực tiếp vào tab này.
            </p>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
            {members.length === 0 ? (
              <p className="text-sm text-gray-500">Nhóm chưa có thành viên.</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        member.user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          member.user.fullName || member.user.username
                        )}`
                      }
                      alt={member.user.fullName || member.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm">{member.user.fullName || member.user.username}</p>
                      <p className="text-xs text-gray-500">@{member.user.username}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">{member.role}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span>{(group.membersCount || group._count?.members || 0).toLocaleString()} thành viên</span>
              </div>
              <div className="flex items-center gap-3">
                {group.privacy === 'PUBLIC' ? (
                  <>
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span>Nhóm công khai</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-400" />
                    <span>Nhóm riêng tư</span>
                  </>
                )}
              </div>
              <div>
                <h4 className="mb-2">Quản trị viên</h4>
                <div className="space-y-2">
                  {adminMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có dữ liệu quản trị viên.</p>
                  ) : (
                    adminMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <img
                          src={
                            member.user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              member.user.fullName || member.user.username
                            )}`
                          }
                          alt={member.user.fullName || member.user.username}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm">{member.user.fullName || member.user.username}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
