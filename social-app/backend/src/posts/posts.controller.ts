import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(@Request() req: any, @Body() body: { content: string; mediaUrls?: string[] }) {
    try {
      console.log('Creating post for user:', req.user);
      return await this.postsService.createPost(req.user.sub, body.content, body.mediaUrls || []);
    } catch (error) {
      console.error('Post creation error:', error);
      throw error;
    }
  }

  @Get()
  async getPosts(@Query('page') page?: string, @Query('limit') limit?: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    // Support both page/limit and skip/take formats
    let skipNum = 0;
    let takeNum = 20;
    
    if (page && limit) {
      // page/limit format: page=1, limit=10
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 20);
      skipNum = (pageNum - 1) * limitNum;
      takeNum = limitNum;
    } else {
      // skip/take format
      skipNum = skip ? parseInt(skip) : 0;
      takeNum = take ? parseInt(take) : 20;
    }
    
    return this.postsService.getPosts(skipNum, takeNum);
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string, @Request() req: any) {
    const post = await this.postsService.deletePost(id, req.user.sub);
    if (!post) {
      return { error: 'Post not found or unauthorized' };
    }
    return { success: true };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async likePost(@Param('id') id: string, @Request() req: any) {
    return this.postsService.likePost(id, req.user.sub);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(@Param('id') id: string, @Request() req: any, @Body() body: { content: string; parentId?: string }) {
    return this.postsService.addComment(id, req.user.sub, body.content, body.parentId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(@Param('id') id: string, @Request() req: any, @Body() body: { content: string }) {
    const updated = await this.postsService.updatePost(id, req.user.sub, body.content);
    if (!updated) return { error: 'Post not found or unauthorized' };
    return updated;
  }

  @Patch('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(@Param('commentId') commentId: string, @Request() req: any, @Body() body: { content: string }) {
    const updated = await this.postsService.updateComment(commentId, req.user.sub, body.content);
    if (!updated) return { error: 'Comment not found or unauthorized' };
    return { success: true, comment: updated };
  }

  @Delete('comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@Param('commentId') commentId: string, @Request() req: any) {
    const deleted = await this.postsService.deleteComment(commentId, req.user.sub);
    if (!deleted) return { error: 'Comment not found or unauthorized' };
    return { success: true };
  }
}
