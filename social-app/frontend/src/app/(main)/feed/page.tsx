'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePostStore } from '@/store/postStore';
import { useAuthStore } from '@/store/authStore';
import CommentSection from '@/components/feature/CommentSection';

export default function Feed() {
  const router = useRouter();
  const { posts = [], fetchPosts, createPost, likePost, unlikePost, deletePost, updatePost, isLoading, error: postError } = usePostStore();
  const { user, setUser } = useAuthStore();
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Revoke object URLs when previews change/unmount
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [previews]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }

    fetchPosts(1);
    setMounted(true);
  }, [router, user, setUser]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow creating a post when there is no text but there are selected files
    if (!newPost.trim() && selectedFiles.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const api = (await import('@/lib/api')).default;

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

      await createPost(newPost, mediaUrls.length ? mediaUrls : undefined);
      setNewPost('');
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      setUploadError(null);
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || 'Không thể tạo bài viết. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleEditStart = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditingContent(content);
  };
  const [editingSaving, setEditingSaving] = useState(false);

  const handleEditSave = async (postId: string) => {
    if (!editingContent.trim()) return;
    setEditingSaving(true);
    try {
      // Use store's updatePost to optimistically update UI
      await updatePost(postId, editingContent);
      setEditingPostId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Edit post error:', err);
    } finally {
      setEditingSaving(false);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const requestDeletePost = (postId: string) => {
    setConfirmDeleteId(postId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleteLoading(true);
    try {
      await deletePost(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Delete post error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const api = (await import('@/lib/api')).default;
      await api.post(`/posts/${postId}/comments`, { content });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      await fetchPosts(1);
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  if (!mounted || !user) {
    return <div className="flex-1 flex items-center justify-center text-secondary">Đang tải...</div>;
  }

  return (
    <div className="flex-1">
      <div className="max-w-2xl mx-auto p-4">
        {/* Create Post Form */}
        <div className="bg-white rounded-xl p-4 border border-border mb-4 shadow-sm">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-semibold">
              {user.displayName?.[0] || user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <Link href={`/profile/${user.id}`} className="font-semibold text-primary hover:text-accent transition">
                {user.displayName || user.username}
              </Link>
            </div>
          </div>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              className="w-full px-4 py-3 bg-white border border-border rounded-lg text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              rows={3}
            />
            <div className="mt-3">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFilesChange}
                className=""
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
            {(error || postError) && (
              <p className="text-red-600 text-sm mt-2">{error || postError}</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={loading || isLoading || (!newPost.trim() && selectedFiles.length === 0)}
                className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {loading || isLoading ? 'Đang đăng...' : 'Đăng'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {isLoading && posts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-border text-center">
              <p className="text-secondary">Đang tải bài viết...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-border text-center">
              <p className="text-secondary">Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <Link href={`/profile/${post.author?.id || post.authorId}`}>
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-semibold cursor-pointer hover:opacity-80 transition">
                      {post.author?.displayName?.[0] || post.author?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/profile/${post.author?.id || post.authorId}`} className="font-semibold text-primary hover:text-accent transition">
                      {post.author?.displayName || post.author?.username || 'Người dùng'}
                    </Link>
                    <p className="text-secondary text-xs">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {user?.id === (post.author?.id || post.authorId) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditStart(post.id, post.content)}
                        className="text-secondary hover:text-accent text-sm transition"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => requestDeletePost(post.id)}
                        className="text-secondary hover:text-red-500 text-sm transition"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-primary mb-4 whitespace-pre-wrap pl-[52px]">{post.content}</p>
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className="pl-[52px] mb-4 grid grid-cols-1 gap-3">
                    {post.mediaUrls.map((m) => (
                      <div key={m} className="w-full h-64 bg-gray-100 rounded overflow-hidden">
                        {/\.(mp4|avi|mov|mkv|webm|ogv)$/i.test(m) ? (
                          <video src={m} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={m} alt="media" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-6 text-secondary text-sm border-t border-border pt-3">
                  <button 
                    onClick={() => handleLike(post.id, post.isLiked || false)}
                    className={`hover:text-accent transition flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                  >
                    {post.isLiked ? '❤️' : '🤍'} <span>{post.likes || 0}</span>
                  </button>
                  <button 
                    onClick={() => {
                      const newSet = new Set(expandedComments);
                      if (newSet.has(post.id)) {
                        newSet.delete(post.id);
                      } else {
                        newSet.add(post.id);
                      }
                      setExpandedComments(newSet);
                    }}
                    className="hover:text-accent transition flex items-center gap-2"
                  >
                    💬 <span>{post.comments || 0}</span>
                  </button>
                </div>
                {expandedComments.has(post.id) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="mb-4">
                      <textarea 
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        placeholder="Viết bình luận..."
                        className="w-full p-2 border border-border rounded-lg text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                        rows={2}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="mt-2 px-3 py-1 bg-accent text-white text-sm rounded hover:opacity-90 transition"
                      >
                        Trả lời
                      </button>
                    </div>
                    <CommentSection postId={post.id} />
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingPostId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-lg">
              <h3 className="text-lg font-semibold text-primary mb-4">Sửa bài viết</h3>
              <textarea 
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full p-3 border border-border rounded-lg text-primary bg-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={6}
              />
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => handleEditSave(editingPostId!)}
                  disabled={editingSaving}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {editingSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button 
                  onClick={() => {
                    setEditingPostId(null);
                    setEditingContent('');
                  }}
                  className="flex-1 px-4 py-2 border border-border text-primary rounded-lg hover:bg-border transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
              <h3 className="text-lg font-semibold text-primary mb-4">Xác nhận xóa</h3>
              <p className="text-sm text-secondary mb-4">Bạn có chắc muốn xóa bài viết này? Hành động không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-border text-primary rounded-lg hover:bg-border transition"
                  disabled={deleteLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
