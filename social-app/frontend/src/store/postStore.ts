import { create } from 'zustand';
import api from '@/lib/api';

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

interface PostStore {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;

  // Actions
  fetchPosts: (page?: number) => Promise<void>;
  fetchPostsForUser: (userId: string, page?: number) => Promise<void>;
  createPost: (content: string, mediaUrls?: string[]) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<Post>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePostStore = create<PostStore>((set) => ({
  posts: [],
  isLoading: false,
  error: null,
  hasMore: true,
  page: 0,

  fetchPosts: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/posts?page=${page}&limit=10`);
      const { posts, hasMore } = response.data as { posts: Post[]; hasMore: boolean };
      set((state) => ({
        posts: page === 1 ? posts : [...state.posts, ...posts],
        hasMore: hasMore,
        page,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể tải bài viết. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
    }
  },

  fetchPostsForUser: async (userId: string, page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/${userId}/posts?page=${page}&limit=10`);
      const { posts, hasMore } = response.data as { posts: Post[]; hasMore: boolean };
      set((state) => ({
        posts: page === 1 ? posts : [...state.posts, ...posts],
        hasMore: hasMore,
        page,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể tải bài viết của người dùng. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
    }
  },

  createPost: async (content: string, mediaUrls?: string[]): Promise<Post> => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/posts', { content, mediaUrls: mediaUrls || [] });
      const newPost = response.data as Post;
      set((state) => ({
        posts: [newPost, ...state.posts],
        isLoading: false,
      }));
      return newPost;
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể tạo bài viết. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deletePost: async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể xóa bài viết. Vui lòng thử lại.';
      set({ error: message });
      throw error;
    }
  },

  updatePost: async (postId: string, content: string): Promise<Post> => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/posts/${postId}`, { content });
      const updated = response.data as Post;
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updated : p)),
        isLoading: false,
      }));
      return updated;
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể cập nhật bài viết. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  likePost: async (postId: string) => {
    try {
      await api.post(`/posts/${postId}/like`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isLiked: true, likes: post.likes + 1 }
            : post
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể thích bài viết. Vui lòng thử lại.';
      set({ error: message });
      throw error;
    }
  },

  unlikePost: async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}/like`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isLiked: false, likes: post.likes - 1 }
            : post
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Không thể bỏ thích bài viết. Vui lòng thử lại.';
      set({ error: message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set({ posts: [], isLoading: false, error: null, hasMore: true, page: 0 }),
}));
