'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { usePostStore } from '@/store/postStore';

// ... (Giữ nguyên interface UserProfile)

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser, setUser } = useAuthStore();
  
  // Lấy fetchPostsForUser nhưng KHÔNG cho vào dependency array nếu không chắc chắn nó ổn định
  const { posts, fetchPostsForUser } = usePostStore();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState(''); // Thêm state lỗi để debug

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      // Nếu không có token, tắt loading để tránh treo, rồi mới redirect
      setLoading(false); 
      router.push('/login');
      return;
    }

    // Load user từ localStorage nếu chưa có trong store
    if (storedUser && !currentUser) {
      setUser(JSON.parse(storedUser));
    }

    const initData = async () => {
      console.log("🚀 Bắt đầu tải profile cho ID:", userId);
      try {
        // 1. Tải thông tin User
        const response = await api.get(`/users/${userId}`);
        console.log("✅ Đã lấy xong profile:", response.data);
        
        setProfile(response.data);
        setIsFollowing(response.data.isFollowing || false);

        // 2. Tải bài viết (Gọi song song hoặc tuần tự đều được)
        // Lưu ý: Nếu fetchPostsForUser lỗi, ta vẫn muốn hiển thị profile, nên có thể tách try/catch hoặc để chung tùy logic
        await fetchPostsForUser(userId, 1);
        
      } catch (err: any) {
        console.error("❌ Lỗi tải trang cá nhân:", err);
        setError(err.message || 'Có lỗi xảy ra');
      } finally {
        console.log("🏁 Kết thúc loading");
        setLoading(false); // Luôn chạy
      }
    };

    initData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, router]); // Bỏ fetchPostsForUser ra để tránh loop nếu function này không ổn định

  // ... (Phần logic handleFollowToggle giữ nguyên)

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-secondary">Đang tải... (Vui lòng mở Console F12 nếu quá lâu)</div>;
  }

  // Thêm giao diện hiển thị lỗi
  if (error) {
     return <div className="min-h-screen bg-white flex flex-col items-center justify-center text-red-500 gap-4">
        <p>Lỗi: {error}</p>
        <button onClick={() => window.location.reload()} className="underline">Thử lại</button>
     </div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-secondary">Không tìm thấy người dùng</div>;
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    // ... (Phần return JSX giữ nguyên như cũ của bạn)
    <div className="flex-1">
      <div className="max-w-3xl mx-auto p-4">
        <button
          onClick={() => router.push('/feed')}
          className="text-accent hover:text-accent-dark mb-6 font-medium transition"
        >
          ← Quay lại bảng tin
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 border border-border mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">{profile.displayName}</h1>
              <p className="text-secondary">@{profile.username}</p>
            </div>
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-white border border-accent text-accent hover:bg-accent hover:text-white'
                    : 'bg-accent text-white hover:bg-accent-dark'
                }`}
              >
                {followLoading ? 'Đang xử lý...' : (isFollowing ? 'Đang theo dõi' : 'Theo dõi')}
              </button>
            )}
          </div>

          {profile.bio && (
            <p className="text-primary mb-6">{profile.bio}</p>
          )}

          <div className="flex gap-8">
            <div>
              <p className="text-secondary text-sm">Bài viết</p>
              <p className="text-2xl font-bold text-accent">{profile.postCount}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Người theo dõi</p>
              <p className="text-2xl font-bold text-accent">{profile.followers}</p>
            </div>
            <div>
              <p className="text-secondary text-sm">Đang theo dõi</p>
              <p className="text-2xl font-bold text-accent">{profile.following}</p>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div>
          <h2 className="text-xl font-bold text-primary mb-4">Bài viết của {profile.displayName}</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-border text-center shadow-sm">
              <p className="text-secondary">Chưa có bài viết nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl p-6 border border-border shadow-sm">
                  <p className="text-primary mb-4 whitespace-pre-wrap">{post.content}</p>
                  <div className="flex gap-6 text-secondary text-sm">
                    <span className="flex items-center gap-1">
                      {post.isLiked ? '❤️' : '🤍'} {post.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {post.comments || 0}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}