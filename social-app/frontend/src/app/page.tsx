'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleBackground from '@/components/feature/SimpleBackground';
import ThemeToggle from '@/components/feature/ThemeToggle';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (token && storedUser) {
      // Redirect to feed if already logged in
      router.push('/feed');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Đang tải...</div>;
  }

  return (
    <main className="min-h-screen bg-background relative">
      <SimpleBackground />
      {/* Navigation */}
      <nav className="border-b border-border dark:border-border-dark bg-white dark:bg-surface-dark sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-accent hover:text-accent-dark transition cursor-pointer">
            Astra
          </Link>
          <div className="flex gap-3 items-center">
            <ThemeToggle />
            <Link href="/login" className="px-6 py-2 text-primary dark:text-primary-dark font-medium hover:bg-gray-100 dark:hover:bg-surface-dark rounded-lg transition">
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition"
            >
              Tham gia ngay
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white dark:bg-surface-dark py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <h1 className="text-5xl sm:text-6xl font-bold text-primary dark:text-primary-dark mb-6 leading-tight">
                Kết nối với mọi người xung quanh bạn
              </h1>
              <p className="text-xl text-secondary dark:text-secondary-dark mb-8 leading-relaxed">
                Chia sẻ suy nghĩ, hình ảnh và khoảnh khắc với bạn bè. Xây dựng cộng đồng. Tự do thể hiện bản thân.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-lg transition text-lg text-center"
                >
                  Tạo tài khoản
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 border-2 border-primary dark:border-primary-dark text-primary dark:text-primary-dark hover:bg-gray-50 dark:hover:bg-surface-dark rounded-lg font-semibold transition text-lg text-center"
                >
                  Đã có tài khoản?
                </Link>
              </div>
            </div>

            {/* Right content - Stats */}
            <div className="bg-gray-50 dark:bg-surface-dark rounded-xl p-8 border border-border dark:border-border-dark">
              <div className="space-y-8">
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">10K+</div>
                  <p className="text-secondary dark:text-secondary-dark text-lg">Thành viên hoạt động</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">50K+</div>
                  <p className="text-secondary dark:text-secondary-dark text-lg">Bài viết mỗi ngày</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">100%</div>
                  <p className="text-secondary dark:text-secondary-dark text-lg">Miễn phí & Mở cho mọi người</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Do */}
      <section className="bg-background py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary dark:text-primary-dark mb-4">Bạn Có Thể Làm Gì</h2>
            <p className="text-xl text-secondary dark:text-secondary-dark">Tự do chia sẻ và kết nối không giới hạn</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Share Posts */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border dark:border-border-dark">
              <h3 className="text-2xl font-bold text-primary dark:text-primary-dark mb-3">Chia Sẻ Bài Viết</h3>
              <p className="text-secondary dark:text-secondary-dark mb-6">
                Viết, chia sẻ ảnh, video hoặc bất cứ điều gì bạn nghĩ. Tiếng nói của bạn quan trọng.
              </p>
              <Link href="/register" className="text-accent font-semibold hover:text-accent-dark transition">
                Bắt đầu chia sẻ →
              </Link>
            </div>

            {/* Connect & Follow */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border dark:border-border-dark">
              <h3 className="text-2xl font-bold text-primary dark:text-primary-dark mb-3">Kết Nối & Theo Dõi</h3>
              <p className="text-secondary dark:text-secondary-dark mb-6">
                Tìm bạn bè, theo dõi người sáng tạo và xây dựng cộng đồng xung quanh sở thích chung.
              </p>
              <Link href="/register" className="text-accent font-semibold hover:text-accent-dark transition">
                Tìm bạn bè →
              </Link>
            </div>

            {/* Engage & Comment */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-8 border border-border dark:border-border-dark">
              <h3 className="text-2xl font-bold text-primary dark:text-primary-dark mb-3">Tương Tác & Bình Luận</h3>
              <p className="text-secondary dark:text-secondary-dark mb-6">
                Thích, bình luận và trả lời bài viết. Có những cuộc trò chuyện thật với người thật.
              </p>
              <Link href="/register" className="text-accent font-semibold hover:text-accent-dark transition">
                Bắt đầu tương tác →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="bg-white dark:bg-surface-dark py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-primary dark:text-primary-dark mb-12 text-center">Tại Sao Tham Gia Astra?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-2">Tự Do Hoàn Toàn</h3>
                <p className="text-secondary dark:text-secondary-dark">
                  Đăng những gì bạn muốn, khi bạn muốn. Không có thuật toán che giấu nội dung của bạn. Người thật xem bài viết thật.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-2">Quyền Riêng Tư Của Bạn</h3>
                <p className="text-secondary dark:text-secondary-dark">
                  Kiểm soát ai xem bài viết của bạn. Cài đặt quyền riêng tư cho bạn quyền kiểm soát hoàn toàn dữ liệu của mình.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-2">Cộng Đồng Toàn Cầu</h3>
                <p className="text-secondary dark:text-secondary-dark">
                  Kết nối với mọi người từ khắp nơi trên thế giới có chung sở thích và đam mê với bạn.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-2">Không Spam, Không Quảng Cáo</h3>
                <p className="text-secondary dark:text-secondary-dark">
                  100% miễn phí, không có chi phí ẩn, không có quảng cáo phiền toái làm lộn xộn bảng tin của bạn.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-2">Truy Cập Mọi Nơi</h3>
                <p className="text-secondary dark:text-secondary-dark">
                  Luôn kết nối trên web, mobile và bất cứ đâu. Cuộc sống xã hội của bạn, luôn bên cạnh bạn.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary dark:text-primary-dark mb-2">Thể Hiện Bản Thân</h3>
                <p className="text-secondary dark:text-secondary-dark">
                  Tạo hồ sơ đại diện cho con người bạn. Tùy chỉnh, chia sẻ và phát triển theo cách của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary dark:bg-surface-dark text-white dark:text-primary-dark py-12 border-t border-gray-200 dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="block">
                <h4 className="font-bold mb-4 text-lg hover:text-white/80 dark:hover:text-primary-dark/80 transition cursor-pointer">Astra</h4>
              </Link>
              <p className="text-white/60 dark:text-secondary-dark text-sm">Kết nối tự do. Chia sẻ tự do. Là chính mình.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Sản Phẩm</h4>
              <ul className="space-y-2 text-white/60 dark:text-secondary-dark text-sm">
                <li><Link href="/feed" className="hover:text-white dark:hover:text-primary-dark transition">Bảng tin</Link></li>
                <li><Link href="/" className="hover:text-white dark:hover:text-primary-dark transition">Khám phá</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-white/60 dark:text-secondary-dark text-sm">
                <li><Link href="/help" className="hover:text-white dark:hover:text-primary-dark transition">Trung tâm trợ giúp</Link></li>
                <li><Link href="/contact" className="hover:text-white dark:hover:text-primary-dark transition">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Pháp Lý</h4>
              <ul className="space-y-2 text-white/60 dark:text-secondary-dark text-sm">
                <li><Link href="/privacy" className="hover:text-white dark:hover:text-primary-dark transition">Quyền riêng tư</Link></li>
                <li><Link href="/terms" className="hover:text-white dark:hover:text-primary-dark transition">Điều khoản</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 dark:border-border-dark pt-8 text-center text-white/60 dark:text-secondary-dark text-sm">
            <p>&copy; 2025 Astra. Yên bình, ma mị, chill.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
