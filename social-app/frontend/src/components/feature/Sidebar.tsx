'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/feature/ThemeToggle';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { href: '/feed', label: 'Bảng tin' },
    { href: '/explore', label: 'Khám phá' },
    { href: `/profile/${user?.id}`, label: 'Hồ sơ' },
    { href: '/notifications', label: 'Thông báo' },
    { href: '/messages', label: 'Tin nhắn' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-surface-dark border-r border-border dark:border-border-dark h-screen sticky top-0 overflow-y-auto flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        {/* Logo */}
        <Link href="/feed" className="block mb-6">
          <h2 className="text-2xl font-bold text-accent hover:text-accent-dark transition cursor-pointer">Astra</h2>
        </Link>
        
        {/* Menu Navigation */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/feed');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-primary dark:text-primary-dark hover:bg-surface dark:hover:bg-surface-dark'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar (User Info + Theme + Logout) */}
        <div className="mt-8 pt-8 border-t border-border dark:border-border-dark">
          <div className="px-4 py-2 mb-4">
            <p className="text-sm font-bold text-primary dark:text-primary-dark truncate">
              {user?.displayName || 'Người dùng'}
            </p>
            <p className="text-xs text-secondary dark:text-secondary-dark truncate">
              @{user?.username || 'username'}
            </p>
          </div>
          
          <div className="space-y-2">
            {/* Component này đã được sửa ở trên */}
            <ThemeToggle />
            
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-3 rounded-lg transition font-medium text-left text-primary dark:text-primary-dark hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
