# ✅ Social App MVP - Complete Setup Guide

## Summary of Created Files & Configuration

This document outlines everything that has been set up for the Social App MVP.

---

## 📁 ROOT LEVEL FILES

### `.env` (Environment Configuration)
Contains all sensitive and environment-specific variables:
- **Database**: PostgreSQL connection string
- **JWT Secrets**: Access and refresh token secrets
- **MinIO**: Storage configuration (endpoint, credentials, bucket name)
- **Frontend Config**: API and Socket URLs

### `docker-compose.yml` (Infrastructure)
Defines all services:
- **PostgreSQL 15**: Main database on port 5432
- **Redis 7**: In-memory cache on port 6379
- **MinIO**: Object storage on ports 9000 (API) & 9001 (Console)
- Auto-setup bucket `social-media-uploads` with public access

### `README.md` (Documentation)
Complete guide including:
- Quick start instructions
- Database operations
- API documentation
- Troubleshooting guide
- Deployment instructions

### `.gitignore`
Excludes common files from git tracking

---

## 🔧 BACKEND (NestJS + Prisma)

### Package Configuration
**`backend/package.json`**
- NestJS framework
- Prisma ORM
- JWT authentication
- Socket.IO for realtime
- Validation: class-validator, class-transformer
- Hashing: bcrypt, argon2

**`backend/tsconfig.json`**
- TypeScript 5 configuration
- Path aliases: `src/*` mapping
- Strict mode enabled

**`backend/Dockerfile`**
- Multi-stage build
- Node 18 Alpine
- Production-ready

### Database Schema
**`backend/prisma/schema.prisma`**

Models defined:
1. **User** - User accounts, profiles, relationships
   - Fields: id, email, username, password, displayName, avatar, bio
   - Relations: posts, likes, comments, followers, following, notifications

2. **Post** - User posts/content
   - Fields: id, content, mediaUrls array, authorId, timestamps
   - Relations: likes, comments, author

3. **Comment** - Comments on posts
   - Fields: id, text, postId, userId, timestamp
   - Relations: post, user

4. **Like** - Post likes
   - Fields: id, postId, userId
   - Constraint: One like per user per post (unique constraint)
   - Relations: post, user

5. **Follow** - User follow relationships
   - Fields: followerId, followingId, timestamp
   - Composite primary key: [followerId, followingId]

6. **Notification** - Real-time notifications
   - Fields: id, userId, content, type (LIKE|COMMENT|FOLLOW), isRead, timestamp
   - Relations: user

### Application Entry Points
**`backend/src/main.ts`**
- NestJS app initialization
- CORS enabled
- Global validation pipe
- Server runs on port 3001

**`backend/src/app.module.ts`**
- Root module configuration
- Environment configuration loading
- Gateway provider

### Real-time Communication
**`backend/src/gateway/app.gateway.ts`**
- WebSocket gateway using Socket.IO
- Connection/disconnection handlers
- User-specific notification broadcasting
- Message event handling

---

## 🎨 FRONTEND (Next.js 14 + Tailwind CSS)

### Configuration Files
**`frontend/next.config.js`**
- React strict mode enabled
- SWC minification
- Image optimization config
- Environment variables

**`frontend/tsconfig.json`**
- ES2020 target
- Strict type checking
- Path aliases: `@/*` → `src/*`
- JSX preservation for emotion/styled-components

**`frontend/tailwind.config.ts`**
- Custom dark theme colors:
  - Background: #000000 (pure black)
  - Surface: #111111 (cards)
  - Border: #2A2A2A
  - Primary: #E6E6E6 (main text)
  - Secondary: #888888 (secondary text)
  - Accent: #1DB954 (Spotify Green)
- Custom components (btn-primary, btn-secondary, card, input, glass)

**`frontend/postcss.config.js`**
- Tailwind CSS processing
- Autoprefixer

### Pages & Layouts
**`frontend/src/app/layout.tsx`**
- Root layout component
- Global metadata
- CSS imports
- Dark theme support

**`frontend/src/app/globals.css`**
- Tailwind directives (@tailwind)
- Custom CSS components using @apply
- Global animations (fadeIn, pulse-glow)
- Custom scrollbar styling
- Base styling for entire app

### UI Components
**`frontend/src/components/ui/Button.tsx`**
- Variants: primary, secondary, ghost
- Sizes: sm, md, lg
- Loading state with spinner
- Disabled state
- Forwarded ref support

**`frontend/src/components/ui/Input.tsx`**
- Label support
- Error state with red border
- Helper text
- Forwarded ref support
- Accessible form control

**`frontend/src/components/ui/HandmadeIcon.tsx`**
- 11 hand-drawn style icons using SVG:
  - HomeIcon, SearchIcon, HeartIcon, HeartFilledIcon
  - CommentIcon, ShareIcon, UserIcon, MenuIcon
  - CloseIcon, ImageIcon, BellIcon, SettingsIcon, MoreIcon, CheckIcon
- Each uses `filters.svg#hand-drawn-filter` for hand-drawn effect
- Customizable className and props

### Utilities
**`frontend/src/lib/api.ts`**
- Axios-based API client with singleton pattern
- Request interceptor: Attaches JWT token
- Response interceptor: Handles 401 errors and token refresh
- Methods: get, post, put, patch, delete, uploadFile
- Token management: localStorage-based
- Auto-logout on invalid token

**`frontend/src/lib/socket.ts`**
- Socket.IO client initialization
- Connection/disconnection handling
- Notification listener utilities
- Message sending
- Graceful disconnect

### State Management (Zustand)
**`frontend/src/store/authStore.ts`**
- User authentication state
- Methods:
  - login(email, password) - User login
  - register(email, username, password, displayName) - User registration
  - logout() - Clear auth state
  - fetchCurrentUser() - Get current user
  - updateProfile(data) - Update user profile
  - clearError() - Error handling
- Error tracking with error state

**`frontend/src/store/postStore.ts`**
- Feed management state
- Post type definition with author, likes, comments
- Methods:
  - fetchPosts(page) - Get feed with pagination
  - fetchPostsForUser(userId, page) - Get user's posts
  - createPost(content, mediaUrls) - Create new post
  - deletePost(postId) - Remove post
  - likePost(postId) - Like a post
  - unlikePost(postId) - Unlike a post
  - reset() - Clear store

### Asset Files
**`frontend/public/filters.svg`**
- SVG filter definitions for "hand-drawn" effect
- 3 variations: hand-drawn-filter, hand-drawn-subtle, hand-drawn-strong
- Uses feTurbulence + feDisplacementMap

---

## 🚀 QUICK START COMMANDS

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Install and setup backend
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev

# 3. In new terminal, setup frontend
cd frontend
npm install
npm run dev

# 4. Open browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# MinIO: http://localhost:9001
```

---

## 📊 Database Schema Visualization

```
User (id, email, username, password, displayName, avatar, bio)
  ├─→ posts (1:N)
  ├─→ likes (1:N)
  ├─→ comments (1:N)
  ├─→ followedBy (M:N) ← Follow.followingId
  └─→ following (M:N) ← Follow.followerId
  └─→ notifications (1:N)

Post (id, content, mediaUrls[], authorId)
  ├─→ author (N:1) → User
  ├─→ likes (1:N) → Like
  └─→ comments (1:N) → Comment

Comment (id, text, postId, userId)
  ├─→ post (N:1) → Post
  └─→ user (N:1) → User

Like (id, postId, userId) [Unique: postId + userId]
  ├─→ post (N:1) → Post
  └─→ user (N:1) → User

Follow (followerId, followingId) [Primary Key: both]
  ├─→ follower (N:1) → User
  └─→ following (N:1) → User

Notification (id, userId, content, type, isRead)
  └─→ user (N:1) → User
```

---

## 🎯 What's Ready to Build

1. **Authentication Pages** (Login/Register)
   - Form validation
   - API integration via authStore
   - Token storage

2. **Feed Page**
   - Post list with pagination
   - Like/Comment functionality
   - Real-time updates via Socket.IO

3. **User Profile**
   - Profile card with avatar
   - Follow/Unfollow buttons
   - User's posts feed

4. **Notifications**
   - Real-time notifications via Socket.IO
   - Notification badge
   - Notification history

---

## 📝 Next Steps

1. Create Login/Register pages in `frontend/src/app/(auth)`
2. Create Feed page in `frontend/src/app/(main)`
3. Implement API endpoints in backend (auth, posts, users)
4. Add more components (FeedCard, NavBar, etc.) in `feature` folder
5. Setup error boundaries and loading states
6. Add image upload UI with MinIO integration

---

**Status**: ✅ All files created and configured. Ready for development!
