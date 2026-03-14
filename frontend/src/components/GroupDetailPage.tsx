import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users,
  Search,
  Globe,
  Lock,
  UserPlus,
  UserCheck,
  Loader2,
  AlertCircle,
  MessageCircle,
  ThumbsUp,
  Share2,
  Image as ImageIcon,
  Video,
  Smile
} from 'lucide-react';
import { PageLayout } from './Layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import groupService, { type Group, type GroupMember } from '../services/group.service';

type GroupDetailData = Group & {
  members?: GroupMember[];
  isMember?: boolean;
  memberRole?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | null;
};

interface FeedPost {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorRole: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
}

export function GroupDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: groupId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');
  const [memberQuery, setMemberQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [group, setGroup] = useState<GroupDetailData | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [composerText, setComposerText] = useState('');

  useEffect(() => {
    if (!groupId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [groupRes, membersRes] = await Promise.all([
          groupService.getGroupById(groupId),
          groupService.getGroupMembers(groupId, { page: 1, limit: 50 })
        ]);

        setGroup(groupRes.data);
        setMembers(membersRes.data || []);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Không thể tải thông tin nhóm');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  useEffect(() => {
    if (!group || members.length === 0) return;

    const firstMember = members[0];
    const secondMember = members[1] || members[0];

    const seededPosts: FeedPost[] = [
      {
        id: `seed-${group.id}-1`,
        authorName: firstMember.user.fullName,
        authorUsername: firstMember.user.username,
        authorAvatar:
          firstMember.user.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(firstMember.user.fullName)}&background=DBEAFE&color=1D4ED8`,
        authorRole: firstMember.role,
        content: `Chào mừng mọi người đến với nhóm ${group.name}. Hãy chia sẻ kinh nghiệm, review và câu hỏi để cùng nhau học hỏi nhé.`,
        createdAt: '2 giờ trước',
        likes: 12,
        comments: 6,
        shares: 1
      },
      {
        id: `seed-${group.id}-2`,
        authorName: secondMember.user.fullName,
        authorUsername: secondMember.user.username,
        authorAvatar:
          secondMember.user.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(secondMember.user.fullName)}&background=DBEAFE&color=1D4ED8`,
        authorRole: secondMember.role,
        content: 'Mọi người thường mua sản phẩm ở đâu để có giá tốt và hàng chính hãng? Mình đang tổng hợp nguồn uy tín để ghim lên đầu nhóm.',
        imageUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200',
        createdAt: '1 ngày trước',
        likes: 28,
        comments: 14,
        shares: 3
      }
    ];

    setFeedPosts(seededPosts);
  }, [group, members]);

  useEffect(() => {
    if (!groupId || activeTab !== 'members') return;

    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const response = await groupService.getGroupMembers(groupId, {
          page: 1,
          limit: 50,
          q: memberQuery || undefined
        });
        setMembers(response.data || []);
      } catch {
        // Keep existing list if search fails.
      } finally {
        setLoadingMembers(false);
      }
    };

    const timeout = setTimeout(fetchMembers, 250);
    return () => clearTimeout(timeout);
  }, [groupId, activeTab, memberQuery]);

  const admins = useMemo(
    () => members.filter((member) => member.role === 'ADMIN' || member.role === 'MODERATOR'),
    [members]
  );

  const newestMembers = useMemo(() => members.slice(0, 6), [members]);

  const handleJoinLeave = async () => {
    if (!groupId || !group) return;

    try {
      setActionLoading(true);
      setErrorMessage('');

      if (group.isMember) {
        await groupService.leaveGroup(groupId);
      } else {
        await groupService.joinGroup(groupId);
      }

      const [groupRes, membersRes] = await Promise.all([
        groupService.getGroupById(groupId),
        groupService.getGroupMembers(groupId, { page: 1, limit: 50 })
      ]);
      setGroup(groupRes.data);
      setMembers(membersRes.data || []);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Không thể cập nhật trạng thái nhóm');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePost = () => {
    const content = composerText.trim();
    if (!content || !group || !user) return;

    const optimisticPost: FeedPost = {
      id: `local-${Date.now()}`,
      authorName: user.fullName,
      authorUsername: user.username,
      authorAvatar:
        user.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=DBEAFE&color=1D4ED8`,
      authorRole: (group.memberRole || 'MEMBER') as 'ADMIN' | 'MODERATOR' | 'MEMBER',
      content,
      createdAt: 'Vừa xong',
      likes: 0,
      comments: 0,
      shares: 0
    };

    setFeedPosts((prev) => [optimisticPost, ...prev]);
    setComposerText('');
  };

  if (!user) {
    return (
      <PageLayout activePage="groups" showFooter={false}>
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout activePage="groups" showFooter={false}>
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  if (!group) {
    return (
      <PageLayout activePage="groups" showFooter={false}>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">{errorMessage || 'Không tìm thấy nhóm'}</p>
          <button
            onClick={() => navigate('/groups')}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Quay lại danh sách nhóm
          </button>
        </div>
      </PageLayout>
    );
  }

  const groupAvatar =
    group.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=DBEAFE&color=1D4ED8`;

  return (
    <PageLayout activePage="groups" showFooter={false}>
      <div className="space-y-4 pb-10">
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="relative h-44 md:h-56 bg-gradient-to-r from-blue-100 to-cyan-100">
            {group.coverImageUrl ? (
              <img
                src={group.coverImageUrl}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.7),transparent_45%),radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.3),transparent_40%)]" />
            )}
          </div>

          <div className="px-4 md:px-6 pb-3">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-10 md:-mt-14">
              <div className="flex items-end gap-4">
                <img
                  src={groupAvatar}
                  alt={group.name}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-xl border-4 border-white object-cover bg-white shadow-sm"
                />
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl text-gray-900">{group.name}</h1>
                    {group.privacy === 'PUBLIC' ? (
                      <Globe className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {(group.membersCount || group._count?.members || 0).toLocaleString('vi-VN')} thành viên
                    {'  •  '}
                    {(group.postsCount || 0).toLocaleString('vi-VN')} bài viết
                    {'  •  '}
                    {group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoinLeave}
                disabled={actionLoading}
                className={`btn-inline-icon px-5 py-2 rounded-lg text-white disabled:opacity-60 ${
                  group.isMember ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : group.isMember ? (
                  <UserCheck className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {group.isMember ? 'Rời nhóm' : 'Tham gia nhóm'}
              </button>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-2 flex items-center gap-6 text-sm">
              {[
                { key: 'posts', label: 'Bài viết' },
                { key: 'members', label: `Thành viên (${(group.membersCount || group._count?.members || 0).toLocaleString('vi-VN')})` },
                { key: 'about', label: 'Giới thiệu' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'posts' | 'members' | 'about')}
                  className={`pb-2 ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {activeTab === 'posts' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {group.isMember && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=DBEAFE&color=1D4ED8`
                      }
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <input
                      type="text"
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      placeholder={`Bạn muốn chia sẻ gì trong nhóm ${group.name}?`}
                      className="w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <button className="btn-inline-icon px-3 py-1.5 rounded-md hover:bg-gray-100">
                        <ImageIcon className="w-4 h-4 text-green-600" />
                        Ảnh
                      </button>
                      <button className="btn-inline-icon px-3 py-1.5 rounded-md hover:bg-gray-100">
                        <Video className="w-4 h-4 text-red-600" />
                        Video
                      </button>
                      <button className="btn-inline-icon px-3 py-1.5 rounded-md hover:bg-gray-100">
                        <Smile className="w-4 h-4 text-yellow-500" />
                        Cảm xúc
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={!composerText.trim()}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      Đăng
                    </button>
                  </div>
                </div>
              )}

              {feedPosts.map((post) => (
                <article key={post.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{post.authorName}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{post.authorRole}</span>
                      </div>
                      <p className="text-xs text-gray-500">@{post.authorUsername} • {post.createdAt}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-gray-800 leading-relaxed">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Bài viết nhóm"
                      className="mt-3 rounded-lg w-full max-h-[420px] object-cover"
                    />
                  )}

                  <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                    <span>{post.likes} lượt thích</span>
                    <span>{post.comments} bình luận • {post.shares} chia sẻ</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-100 grid grid-cols-3 gap-2">
                    <button className="btn-inline-icon py-2 rounded-md hover:bg-gray-100 text-sm text-gray-600">
                      <ThumbsUp className="w-4 h-4" />
                      Thích
                    </button>
                    <button className="btn-inline-icon py-2 rounded-md hover:bg-gray-100 text-sm text-gray-600">
                      <MessageCircle className="w-4 h-4" />
                      Bình luận
                    </button>
                    <button className="btn-inline-icon py-2 rounded-md hover:bg-gray-100 text-sm text-gray-600">
                      <Share2 className="w-4 h-4" />
                      Chia sẻ
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-base mb-3">Giới thiệu</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {group.description || 'Nhóm này chưa có mô tả.'}
                </p>
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                  <p>{group.privacy === 'PUBLIC' ? 'Nhóm công khai' : 'Nhóm riêng tư'}</p>
                  <p>{(group.membersCount || group._count?.members || 0).toLocaleString('vi-VN')} thành viên</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-base mb-3">Quản trị viên</h3>
                {admins.length === 0 ? (
                  <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>
                ) : (
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center gap-3">
                        <img
                          src={
                            admin.user.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.user.fullName)}&background=EFF6FF&color=1D4ED8`
                          }
                          alt={admin.user.fullName}
                          className="w-9 h-9 rounded-full"
                        />
                        <div>
                          <p className="text-sm">{admin.user.fullName}</p>
                          <p className="text-xs text-gray-500">{admin.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h3 className="text-base mb-3">Thành viên mới</h3>
                <div className="grid grid-cols-3 gap-2">
                  {newestMembers.map((member) => (
                    <button key={member.id} className="text-center">
                      <img
                        src={
                          member.user.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.fullName)}&background=EFF6FF&color=1D4ED8`
                        }
                        alt={member.user.fullName}
                        className="w-14 h-14 rounded-lg object-cover mx-auto"
                      />
                      <p className="text-xs mt-1 truncate">{member.user.fullName}</p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        )}

        {activeTab === 'members' && (
          <section className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={memberQuery}
                onChange={(e) => setMemberQuery(e.target.value)}
                placeholder="Tìm kiếm thành viên..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {loadingMembers ? (
              <div className="py-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500">Không tìm thấy thành viên phù hợp.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          member.user.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.fullName)}&background=EFF6FF&color=1D4ED8`
                        }
                        alt={member.user.fullName}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm">{member.user.fullName}</p>
                        <p className="text-xs text-gray-500">@{member.user.username}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{member.role}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'about' && (
          <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Mô tả nhóm</p>
              <p className="text-gray-700">{group.description || 'Chưa có mô tả cho nhóm này.'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Quyền riêng tư</p>
              <p className="text-gray-700">{group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Số lượng thành viên</p>
              <p className="text-gray-700">{(group.membersCount || group._count?.members || 0).toLocaleString('vi-VN')} người</p>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
