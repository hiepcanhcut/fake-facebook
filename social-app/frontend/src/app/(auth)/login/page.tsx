'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import SimpleBackground from '@/components/feature/SimpleBackground';
import ThemeToggle from '@/components/feature/ThemeToggle';

export default function Login() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/feed');
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-primary flex items-center justify-center relative">
      <SimpleBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border dark:border-border-dark shadow-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-end mb-4">
              <ThemeToggle />
            </div>
            <Link href="/" className="block">
              <div className="text-3xl font-bold text-accent mb-2 hover:text-accent-dark transition cursor-pointer">Astra</div>
            </Link>
            <p className="text-secondary dark:text-secondary-dark">Kết nối với cộng đồng của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-primary dark:text-primary-dark mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-primary dark:text-primary-dark placeholder-secondary dark:placeholder-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary dark:text-primary-dark mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg text-primary dark:text-primary-dark placeholder-secondary dark:placeholder-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-surface dark:bg-surface-dark rounded-lg border border-border dark:border-border-dark">
            <p className="text-xs font-semibold text-secondary dark:text-secondary-dark uppercase mb-2">Thông tin demo</p>
            <p className="text-sm text-primary dark:text-primary-dark">Email: <code className="bg-white dark:bg-background-dark px-2 py-1 rounded text-accent">demo@example.com</code></p>
            <p className="text-sm text-primary dark:text-primary-dark">Mật khẩu: <code className="bg-white dark:bg-background-dark px-2 py-1 rounded text-accent">password</code></p>
          </div>

          {/* Sign Up Link */}
          <p className="text-secondary dark:text-secondary-dark text-sm mt-6 text-center">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-accent hover:text-accent-dark font-semibold transition">
              Đăng ký miễn phí
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
