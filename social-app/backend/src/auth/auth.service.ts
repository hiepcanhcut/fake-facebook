import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  password: string;
}

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
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async validateUserCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwt.sign(payload),
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
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.generateRefreshToken(newUser.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        displayName: newUser.displayName || '',
        password: newUser.password,
      },
    };
  }

  async validateUser(payload: any): Promise<User | null> {
    if (!payload || !payload.sub) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName || '',
      password: user.password,
    };
  }

  private generateRefreshToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId, type: 'refresh' },
      { secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key', expiresIn: '7d' },
    );
  }
}
