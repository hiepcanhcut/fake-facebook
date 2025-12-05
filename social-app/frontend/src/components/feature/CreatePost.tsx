'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';

export default function CreatePost() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { user } = useAuthStore();

  // Giả sử store của bạn có hàm addPost để cập nhật UI ngay lập tức
  // Nếu chưa có, bạn có thể reload lại list bài viết
  const { fetchPosts } = usePostStore();

  // Revoke object URLs when previews change/unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('Files selected:', files);
    if (!files) return;

    const arr = Array.from(files);
    console.log('Files array:', arr);
    setSelectedFiles(arr);

    // Create previews
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    setUploadError(null);
    setUploadProgress(0);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUploadError(null);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow creating a post when there is no text but there are selected files
    if (!content.trim() && selectedFiles.length === 0) return;

    setLoading(true);
    setUploadError(null);

    try {
      // If there are files selected, upload them in a single multipart request
      let mediaUrls: string[] = [];
      if (selectedFiles.length > 0) {
        try {
          setUploadError(null);
          setUploadProgress(0);
          const form = new FormData();
          selectedFiles.forEach((f) => form.append('file', f));

          // Use direct axios call with explicit auth header for FormData
          const axios = (await import('axios')).default;
          const token = api.getAccessToken();
          const res = await axios.post('http://localhost:3001/api/uploads', form, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
            onUploadProgress: (progressEvent: any) => {
              if (progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percent);
              }
            },
          });

          const data = res.data as any;
          console.log('Upload response:', data);
          if (data?.files && Array.isArray(data.files)) {
            mediaUrls = data.files.map((f: any) => f.url).filter(Boolean);
            console.log('Extracted mediaUrls:', mediaUrls);
          }
        } catch (err: any) {
          console.error('File upload failed:', err);
          // Provide more details to the user: HTTP status and message when available
          const status = err?.response?.status;
          const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
          setUploadError(status ? `Lỗi upload: ${status} — ${serverMsg}` : (err?.message || 'Upload thất bại'));
          setLoading(false);
          return; // abort post creation when upload fails
        }
      }

      // Gọi API tạo bài viết với mediaUrls
      console.log('Creating post with content:', content, 'mediaUrls:', mediaUrls);
      await api.post('/posts', { content, mediaUrls });

      // Reset form
      setContent('');
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      setUploadError(null);

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

          <div className="mt-3">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFilesChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-dark"
            />
            {previews.length > 0 && (
              <div className="mt-3 flex gap-3 overflow-x-auto items-start">
                {previews.map((p, idx) => (
                  <div key={p} className="relative w-28 h-28 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="absolute top-1 right-1 z-10 bg-white/80 rounded-full p-0.5 text-xs hover:bg-white"
                      aria-label="Xóa file"
                    >
                      ✕
                    </button>
                    {selectedFiles[idx]?.type.startsWith('video') ? (
                      <video src={p} className="w-full h-full object-cover" />
                    ) : (
                      <img src={p} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
            {previews.length > 0 && (
              <div className="mt-2">
                <button type="button" onClick={clearSelectedFiles} className="text-sm text-secondary hover:text-accent">Xóa tất cả</button>
              </div>
            )}
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div className="h-2 bg-accent" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-secondary mt-1">Đang tải: {uploadProgress}%</p>
              </div>
            )}
            {uploadError && (
              <p className="text-red-600 text-sm mt-2">Lỗi upload: {uploadError}</p>
            )}
          </div>

          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={loading || (!content.trim() && selectedFiles.length === 0)}
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
