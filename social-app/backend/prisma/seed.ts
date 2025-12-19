import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      username: 'demo',
      displayName: 'Người dùng Demo',
      password: 'password',
      bio: 'Xin chào! Tôi là người dùng demo của ứng dụng mạng xã hội Astra.',
      introduction: `Chào mọi người!

Tôi là một lập trình viên đam mê công nghệ và phát triển phần mềm. Tôi thích học hỏi những điều mới và chia sẻ kiến thức với cộng đồng.

Sở thích của tôi:
- Lập trình web với React và Node.js
- Học machine learning và AI
- Chơi thể thao và đọc sách
- Nấu ăn và du lịch

Tôi tin rằng công nghệ có thể thay đổi thế giới theo hướng tốt đẹp hơn. Hãy cùng nhau xây dựng cộng đồng tích cực và sáng tạo!`,
    },
  });

  console.log('Demo user created:', demoUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
