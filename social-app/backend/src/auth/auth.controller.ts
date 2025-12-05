import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '@prisma/client';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    // Validate user credentials first
    const user = await this.authService.validateUserCredentials(body.email, body.password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(
    @Body() body: { email: string; username: string; password: string; displayName: string },
  ) {
    return this.authService.register(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const user = await this.authService.validateUser(req.user);
    return user;
  }

  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    // TODO: Implement refresh token validation
    return { accessToken: 'new-token' };
  }
}
