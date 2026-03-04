import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import followService, { FollowUser } from '../services/follow.service';

type FollowTab = 'followers' | 'following';

interface FollowListModalProps {
  userId: string;
  initialTab: FollowTab;
  onClose: () => void;
}

export function FollowListModal({ userId, initialTab, onClose }: FollowListModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FollowTab>(initialTab);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (activeTab === 'followers') {
          const response = await followService.getFollowers(userId, 1, 50);
          setFollowers(response.data);
        } else {
          const response = await followService.getFollowing(userId, 1, 50);
          setFollowing(response.data);
        }
      } catch (err) {
        console.error('Error loading follow list:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, userId]);

  const list = activeTab === 'followers' ? followers : following;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg">Kết nối</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'followers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Người theo dõi
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeTab === 'following' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Đang theo dõi
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải danh sách...</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-gray-500">
              {activeTab === 'followers' ? 'Chưa có người theo dõi.' : 'Chưa theo dõi ai.'}
            </p>
          ) : (
            <div className="space-y-3">
              {list.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(`/profile/${item.username}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                >
                  <img
                    src={
                      item.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName || item.username)}`
                    }
                    alt={item.fullName || item.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{item.fullName || item.username}</p>
                    <p className="text-xs text-gray-500 truncate">@{item.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
