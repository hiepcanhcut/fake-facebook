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

  async updateUserProfile(userId: string, data: { displayName?: string; bio?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
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
