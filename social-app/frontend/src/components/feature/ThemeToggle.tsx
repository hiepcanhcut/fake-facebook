'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');

  // 1. Chỉ chạy logic check theme sau khi trình duyệt đã tải xong (Fix lỗi Hydration)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // 2. Nếu chưa mount xong, render 1 div rỗng để giữ chỗ (Tránh lỗi lệch giao diện Server/Client)
  if (!mounted) {
    return <div className="h-[48px] w-full bg-transparent" />; 
  }

  return (
    <button
      onClick={toggleTheme}
      // Style cho giống các item khác trong Sidebar
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary dark:text-primary-dark hover:bg-surface dark:hover:bg-surface-dark transition text-left"
    >
      {/* 3. Dùng thẻ SPAN, tuyệt đối không dùng thẻ button ở đây */}
      <span className="text-xl">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
      <span className="font-medium">
        {theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}
      </span>
    </button>
  );
}