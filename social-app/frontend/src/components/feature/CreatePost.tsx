'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  
  // Giả sử store của bạn có hàm addPost để cập nhật UI ngay lập tức
  // Nếu chưa có, bạn có thể reload lại list bài viết
  const { fetchPosts } = usePostStore(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      // Gọi API tạo bài viết
      await api.post('/posts', { content });
      
      // Reset form
      setContent('');
      
      // Load lại feed để hiện bài mới nhất
      // (Hoặc dùng hàm addPostToState nếu bạn muốn tối ưu không gọi lại API)
      await fetchPosts(1); 
      
    } catch (error) {
      console.error('Lỗi đăng bài:', error);
      alert('Không thể đăng bài viết. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-border dark:border-border-dark shadow-sm mb-6">
      <div className="flex gap-4">
        {/* Avatar tạm thời (hoặc lấy từ user.avatar nếu có) */}
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">
          {user?.displayName?.[0] || 'U'}
        </div>

        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Bạn đang nghĩ gì, ${user?.displayName || 'bạn tôi'}?`}
            className="w-full bg-gray-50 dark:bg-background-dark border-none rounded-lg p-3 text-primary dark:text-primary-dark focus:ring-2 focus:ring-accent focus:outline-none resize-none min-h-[100px]"
          />
          
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}