"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export default function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const { user } = useAuthStore();
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments, postId]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: newComment,
      });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!showComments && comments.length > 0 && (
        <button
          onClick={() => setShowComments(true)}
          className="text-sm text-secondary dark:text-secondary-dark hover:text-accent transition mb-2"
        >
          Xem {comments.length} bình luận
        </button>
      )}

      {showComments && (
        <div className="space-y-4">
          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 px-4 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-primary dark:text-primary-dark placeholder-secondary dark:placeholder-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-surface dark:bg-surface-dark rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center text-accent font-semibold">
                    {comment.author.displayName?.[0] || comment.author.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary dark:text-primary-dark text-sm">
                        {comment.author.displayName || comment.author.username}
                      </span>
                      <span className="text-xs text-secondary dark:text-secondary-dark">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Comment content or editor */}
                    {editingId === comment.id ? (
                      <div>
                        <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-2 border border-border rounded mb-2" />
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            try {
                              await api.patch(`/posts/comments/${comment.id}`, { content: editingText });
                              // reload comments
                              await loadComments();
                              setEditingId(null);
                              setEditingText('');
                            } catch (err) { console.error(err); }
                          }} className="px-3 py-1 bg-accent text-white rounded">Lưu</button>
                          <button onClick={() => { setEditingId(null); setEditingText(''); }} className="px-3 py-1 border rounded">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-primary dark:text-primary-dark text-sm">{comment.content}</p>
                    )}

                    <div className="mt-2 flex gap-3 text-xs text-secondary">
                      <button onClick={() => setReplyInputs(prev => ({ ...prev, [comment.id]: prev[comment.id] || '' }))} className="hover:text-accent">Trả lời</button>
                      {user?.id === comment.author.id && (
                        <>
                          <button onClick={() => { setEditingId(comment.id); setEditingText(comment.content); }} className="hover:text-accent">Chỉnh sửa</button>
                          <button onClick={async () => { if (!confirm('Xóa bình luận?')) return; try { await api.delete(`/posts/comments/${comment.id}`); await loadComments(); } catch (err) { console.error(err); } }} className="hover:text-red-500">Xóa</button>
                        </>
                      )}
                    </div>

                    {/* Reply input */}
                    {replyInputs[comment.id] !== undefined && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const content = replyInputs[comment.id]?.trim();
                        if (!content) return;
                        try {
                          const resp = await api.post(`/posts/${postId}/comments`, { content, parentId: comment.id });
                          // append reply locally or reload
                          await loadComments();
                          setReplyInputs(prev => ({ ...prev, [comment.id]: '' }));
                        } catch (err) { console.error(err); }
                      }} className="mt-2">
                        <input type="text" value={replyInputs[comment.id] || ''} onChange={(e) => setReplyInputs(prev => ({ ...prev, [comment.id]: e.target.value }))} placeholder="Viết trả lời..." className="w-full p-2 border border-border rounded mb-2" />
                        <div className="flex gap-2">
                          <button type="submit" className="px-3 py-1 bg-accent text-white rounded">Gửi</button>
                          <button type="button" onClick={() => setReplyInputs(prev => { const copy = { ...prev }; delete copy[comment.id]; return copy; })} className="px-3 py-1 border rounded">Hủy</button>
                        </div>
                      </form>
                    )}

                    {/* Replies list */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 space-y-2 pl-8">
                        {comment.replies.map((r) => (
                          <div key={r.id} className="bg-surface dark:bg-surface-dark rounded p-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-sm">{r.author.displayName || r.author.username}</div>
                                <div className="text-xs text-secondary">{new Date(r.createdAt).toLocaleString('vi-VN')}</div>
                              </div>
                              {user?.id === r.author.id && (
                                <div className="flex gap-2 text-xs">
                                  <button onClick={async () => { setEditingId(r.id); setEditingText(r.content); }} className="hover:text-accent">Sửa</button>
                                  <button onClick={async () => { if (!confirm('Xóa phản hồi?')) return; try { await api.delete(`/posts/comments/${r.id}`); await loadComments(); } catch (err) { console.error(err); } }} className="hover:text-red-500">Xóa</button>
                                </div>
                              )}
                            </div>
                            {editingId === r.id ? (
                              <div className="mt-2">
                                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-2 border border-border rounded mb-2" />
                                <div className="flex gap-2">
                                  <button onClick={async () => { try { await api.patch(`/posts/comments/${r.id}`, { content: editingText }); await loadComments(); setEditingId(null); setEditingText(''); } catch (err) { console.error(err); } }} className="px-3 py-1 bg-accent text-white rounded">Lưu</button>
                                  <button onClick={() => { setEditingId(null); setEditingText(''); }} className="px-3 py-1 border rounded">Hủy</button>
                                </div>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm">{r.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showComments && (
            <button
              onClick={() => setShowComments(false)}
              className="text-sm text-secondary dark:text-secondary-dark hover:text-accent transition"
            >
              Ẩn bình luận
            </button>
          )}
        </div>
      )}
    </div>
  );
}

