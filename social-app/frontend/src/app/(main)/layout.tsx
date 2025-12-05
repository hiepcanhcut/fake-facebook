'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/feature/Sidebar';
import SimpleBackground from '@/components/feature/SimpleBackground';
import { useAuthStore } from '@/store/authStore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!user) {
      fetchCurrentUser();
    }
  }, [router, user, fetchCurrentUser]);

  return (
    <div className="flex min-h-screen bg-background relative">
      <SimpleBackground />
      <Sidebar />
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
