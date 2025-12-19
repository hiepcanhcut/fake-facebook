import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        followers: {
          where: { followerId: currentUserId },
        },
      },
    });

    if (!user) return null;

    const isFollowing = currentUserId ? user.followers.length > 0 : false;

    return {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
      introduction: user.introduction,
      postCount: user._count.posts,
      followers: user._count.followers,
      following: user._count.following,
      isFollowing,
    };
  }

  async followUser(userId: string, followerId: string) {
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: userId,
          },
        },
      });
      return { following: false };
    } else {
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId: userId,
        },
      });
      return { following: true };
    }
  }

  async updateUserProfile(userId: string, data: { displayName?: string; bio?: string; introduction?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async getUserPosts(userId: string, skip: number, take: number) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      skip,
      take: take + 1, // Get one extra to check if there are more
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    const hasMore = posts.length > take;
    const actualPosts = posts.slice(0, take);

    return {
      posts: actualPosts.map((post: any) => ({
        id: post.id,
        content: post.content,
        authorId: post.authorId,
        author: post.author,
        createdAt: post.createdAt,
        likes: post.likes.length,
        comments: post.comments.length,
        isLiked: false, // TODO: Check if current user liked this
        mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      })),
      hasMore,
    };
  }

  async searchUsers(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { displayName: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
      take: 10,
    });
  }
}
