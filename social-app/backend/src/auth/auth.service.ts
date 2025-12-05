import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client'; // Import User từ Prisma để chuẩn nhất

// Xóa interface User tự tạo đi, dùng cái của Prisma ở trên
// export interface User { ... } 

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

@Injectable()
export class AuthService {
  // Bạn đặt tên là 'jwt', nên bên dưới phải dùng 'this.jwt'
  constructor(private jwt: JwtService, private prisma: PrismaService) {
    this.seedDemoUser();
  }

  private async seedDemoUser() {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: 'demo@example.com' },
      });
      if (!existingUser) {
        await this.prisma.user.create({
          data: {
            email: 'demo@example.com',
            username: 'demo',
            displayName: 'Demo User',
            password: 'password', // Lưu ý: thực tế nên mã hóa password
          },
        });
      }
    } catch (err) {
      // Bỏ qua lỗi nếu DB chưa sẵn sàng
    }
  }

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      // SỬA 1: Đổi access_token thành accessToken cho khớp với Frontend
      accessToken: this.jwt.sign(payload), 
      // SỬA 2: Dùng 'this.jwt' thay vì 'this.jwtService'
      refreshToken: this.generateRefreshToken(user.id),
      user: user, 
    };
  }

  async register(registerDto: RegisterRequest): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new Error('Email or username already exists');
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        username: registerDto.username,
        displayName: registerDto.displayName,
        password: registerDto.password,
      },
    });

    const payload = { sub: newUser.id, username: newUser.username };
    
    // Dùng this.jwt.sign cho gọn và đồng bộ
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.generateRefreshToken(newUser.id);

    return {
      accessToken,
      refreshToken,
      user: newUser,
    };
  }

  async validateUser(payload: any): Promise<User | null> {
    if (!payload || !payload.sub) {
      return null;
    }
  
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
  
    return user;
  }

  private generateRefreshToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key', expiresIn: '7d' },
    );
  }
}