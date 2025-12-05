import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiConfig {
  baseURL?: string;
  timeout?: number;
}

class ApiClient {
  private api: AxiosInstance;
  private readonly tokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  constructor(config?: ApiConfig) {
    // Get API URL from environment or default
    const apiUrl = config?.baseURL || 
                   (typeof window !== 'undefined' && (window as any).__API_URL__) ||
                   process.env.NEXT_PUBLIC_API_URL || 
                   'http://localhost:3001/api';
    
    this.api = axios.create({
      baseURL: apiUrl,
      timeout: config?.timeout || 10000, // Giảm timeout để phát hiện lỗi nhanh hơn
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - attach token
    this.api.interceptors.request.use((config: any) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - handle 401 and refresh token
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle network errors
        if (!error.response) {
          // Check if it's a connection error
          if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
            const networkError = new Error('Không thể kết nối đến server. Vui lòng đảm bảo backend đang chạy tại http://localhost:3001');
            (networkError as any).isNetworkError = true;
            console.error('Network error:', error);
            return Promise.reject(networkError);
          }
          const networkError = new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng của bạn.');
          (networkError as any).isNetworkError = true;
          return Promise.reject(networkError);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.api.post('/auth/refresh', {
                refreshToken,
              });

              const { accessToken } = response.data;
              this.setAccessToken(accessToken);

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  setAccessToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setRefreshToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      // Redirect to login if needed
      window.location.href = '/login';
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: any) {
    return this.api.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: any) {
    return this.api.post<T>(url, data, config);
  }

  // Upload FormData with optional progress callback
  async uploadForm<T>(url: string, formData: FormData, onProgress?: (progress: number) => void) {
    // Try using the configured axios instance first. If the request returns a 404
    // (common when NEXT_PUBLIC_API_URL is set to a relative path like '/api' and
    // the request hits the Next dev server), retry against the explicit backend
    // host (localhost:3001) to be resilient during local development.
    try {
      return await this.api.post<T>(url, formData, {
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
    } catch (err: any) {
      // If user sees 404 Cannot POST /api/uploads from the frontend server,
      // retry against the explicit backend URL to work around relative BASE_URL config.
      const status = err?.response?.status;
      if (status === 404) {
        try {
          console.warn('uploadForm: 404 detected, retrying against explicit backend host');
          const backendBase = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http'))
            ? process.env.NEXT_PUBLIC_API_URL
            : 'http://localhost:3001/api';

          const base = backendBase.replace(/\/$/, '');
          const path = url.startsWith('/') ? url : `/${url}`;
          const full = `${base}${path}`;

          // Manually include Authorization header if available
          const token = this.getAccessToken();
          const headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          return await axios.post<T>(full, formData, {
            headers,
            onUploadProgress: (progressEvent: any) => {
              if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percent);
              }
            },
          });
        } catch (err2) {
          return Promise.reject(err2);
        }
      }

      return Promise.reject(err);
    }
  }

  async put<T>(url: string, data?: any, config?: any) {
    return this.api.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: any) {
    return this.api.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: any) {
    return this.api.delete<T>(url, config);
  }

  // Upload file
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>) {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    // Let the browser/axios set the correct multipart boundary header.
    return this.api.post<T>(url, formData);
  }
}

// Create singleton instance
const api = new ApiClient();

export default api;
export { ApiClient };
