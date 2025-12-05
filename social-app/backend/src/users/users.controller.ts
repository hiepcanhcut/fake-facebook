import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    if (!query || query.length < 2) {
      return [];
    }
    return this.usersService.searchUsers(query);
  }

  @Get(':id')
  async getUserProfile(@Param('id') id: string, @Request() req?: any) {
    const currentUserId = req?.user?.sub;
    return this.usersService.getUserProfile(id, currentUserId);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followUser(@Param('id') id: string, @Request() req: any) {
    return this.usersService.followUser(id, req.user.sub);
  }

  @Post(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(@Param('id') id: string, @Request() req: any) {
    return this.usersService.followUser(id, req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() body: { displayName?: string; bio?: string }) {
    return this.usersService.updateUserProfile(req.user.sub, body);
  }
}
