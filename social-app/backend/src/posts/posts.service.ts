import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(authorId: string, content: string, mediaUrls: string[] = []) {
    const post = await this.prisma.post.create({
      data: {
        content,
        authorId,
        mediaUrls: mediaUrls.length ? JSON.stringify(mediaUrls) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    return {
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      author: post.author,
      createdAt: post.createdAt,
      likes: post.likes.length,
      comments: post.comments.length,
      isLiked: false,
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
    };
  }

  async getPosts(skip: number = 0, take: number = 20) {
    const posts = await this.prisma.post.findMany({
      skip,
      take: take + 1, // Get one extra to check if there are more
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    const hasMore = posts.length > take;
    const actualPosts = posts.slice(0, take);

    return {
      posts: actualPosts.map((post) => ({
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

  async getPostById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        likes: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!post) return null;

    return {
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      authorName: post.author.displayName,
      createdAt: post.createdAt,
      likes: post.likes.length,
      comments: post.comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorName: c.author.displayName,
        createdAt: c.createdAt,
      })),
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
    };
  }

  async deletePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.authorId !== userId) {
      return null;
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async updatePost(id: string, userId: string, content: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.authorId !== userId) {
      return null;
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    return {
      id: updatedPost.id,
      content: updatedPost.content,
      authorId: updatedPost.authorId,
      author: updatedPost.author,
      createdAt: updatedPost.createdAt,
      likes: updatedPost.likes.length,
      comments: updatedPost.comments.length,
      isLiked: false,
      mediaUrls: updatedPost.mediaUrls ? JSON.parse(updatedPost.mediaUrls) : [],
    };
  }

  async likePost(postId: string, userId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return { liked: false };
    } else {
      // Like
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string, parentId?: string) {
    return this.prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
      },
    });
  }

  async getComments(postId: string) {
    // Fetch top-level comments and include their replies
    const comments = await this.prisma.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, displayName: true, username: true },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, displayName: true, username: true } },
          },
        },
      },
    });

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      author: c.author,
      createdAt: c.createdAt,
      replies: c.replies.map((r) => ({ id: r.id, content: r.content, author: r.author, createdAt: r.createdAt })),
    }));
  }

  async updateComment(commentId: string, userId: string, content: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== userId) return null;

    const updated = await this.prisma.comment.update({ where: { id: commentId }, data: { content } });
    return updated;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.authorId !== userId) return null;

    // Delete comment; replies (if any) will remain but can optionally be deleted or re-parented.
    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
