'use client';

export default function Notifications() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">Thông báo</h1>
        <div className="bg-white rounded-xl p-8 border border-border text-center">
          <p className="text-secondary">Chưa có thông báo nào. Bạn sẽ nhận được thông báo khi có người thích, bình luận hoặc theo dõi bạn.</p>
        </div>
      </div>
    </div>
  );
}

