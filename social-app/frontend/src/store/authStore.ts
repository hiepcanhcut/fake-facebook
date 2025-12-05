import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data as { accessToken: string; refreshToken: string; user: User };

      api.setAccessToken(accessToken);
      api.setRefreshToken(refreshToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', {
        email,
        username,
        password,
        displayName,
      });

      const { accessToken, refreshToken, user } = response.data as { accessToken: string; refreshToken: string; user: User };

      api.setAccessToken(accessToken);
      api.setRefreshToken(refreshToken);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      let message = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      // Kiểm tra các loại lỗi kết nối
      if (!error?.response) {
        // Không có response nghĩa là lỗi network
        message = 'Không thể kết nối đến server. Vui lòng đảm bảo backend đang chạy tại http://localhost:3001';
      } else if (error?.code === 'ECONNREFUSED' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error') || error?.message?.includes('timeout')) {
        message = 'Không thể kết nối đến server. Vui lòng đảm bảo backend đang chạy tại http://localhost:3001';
      } else if (error?.response?.data?.message) {
        // Lỗi từ server (ví dụ: email đã tồn tại)
        if (error.response.data.message.includes('already exists') || error.response.data.message.includes('Email or username')) {
          message = 'Email hoặc tên người dùng đã tồn tại. Vui lòng thử lại với thông tin khác.';
        } else {
          message = error.response.data.message;
        }
      } else if (error?.message) {
        message = error.message;
      }
      
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    api.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({
        user: response.data as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/users/profile', data);
      set({
        user: response.data as User,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
}));
