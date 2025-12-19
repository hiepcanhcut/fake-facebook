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

  @Get(':id/posts')
  async getUserPosts(@Param('id') id: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    let skip = 0;
    let take = 10;

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 10);
      skip = (pageNum - 1) * limitNum;
      take = limitNum;
    }

    return this.usersService.getUserPosts(id, skip, take);
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
  async updateProfile(@Request() req: any, @Body() body: { displayName?: string; bio?: string; introduction?: string }) {
    return this.usersService.updateUserProfile(req.user.sub, body);
  }
}
