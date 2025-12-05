import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || 'super-secret-access-key-change-me',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
