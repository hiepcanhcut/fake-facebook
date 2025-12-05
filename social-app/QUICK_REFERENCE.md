# 🚀 Quick Reference Guide

## File Locations & Purposes

### Configuration Files
| File | Purpose | Location |
|------|---------|----------|
| `.env` | All environment variables | Root |
| `docker-compose.yml` | Dev infrastructure (Postgres, Redis, MinIO) | Root |
| `docker-compose.prod.yml` | Production infrastructure | Root |

### Backend
| File | Purpose |
|------|---------|
| `backend/package.json` | Dependencies, scripts |
| `backend/tsconfig.json` | TypeScript config |
| `backend/src/main.ts` | App bootstrap, port 3001 |
| `backend/src/app.module.ts` | Root module, imports, providers |
| `backend/prisma/schema.prisma` | Database schema, models |
| `backend/src/gateway/app.gateway.ts` | WebSocket/real-time events |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/package.json` | Dependencies, build scripts |
| `frontend/tsconfig.json` | TypeScript config |
| `frontend/tailwind.config.ts` | Tailwind theme (dark colors) |
| `frontend/src/app/layout.tsx` | Root layout, metadata |
| `frontend/src/app/globals.css` | Global styles, animations |
| `frontend/public/filters.svg` | Hand-drawn SVG effects |

### Frontend Components & Utils
| File | Purpose |
|------|---------|
| `src/components/ui/Button.tsx` | Reusable button (primary, secondary, ghost) |
| `src/components/ui/Input.tsx` | Form input with error states |
| `src/components/ui/HandmadeIcon.tsx` | 11 SVG icons with hand-drawn effect |
| `src/lib/api.ts` | Axios API client with JWT handling |
| `src/lib/socket.ts` | Socket.IO client utilities |
| `src/store/authStore.ts` | Auth state (Zustand) |
| `src/store/postStore.ts` | Posts state (Zustand) |

---

## Installation & Startup

### One-Time Setup
```bash
# 1. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Start infrastructure
docker-compose up -d

# 3. Setup database
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### Daily Development
```bash
# Terminal 1: Start backend
cd backend && npm run start:dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Open http://localhost:3000
```

---

## Key Credentials

### Docker Services

**PostgreSQL**
- Host: localhost:5432
- User: admin
- Password: adminpassword
- Database: social_db

**Redis**
- Host: localhost:6379
- No password

**MinIO**
- API: localhost:9000
- Console: http://localhost:9001
- User: minioadmin
- Password: minioadmin
- Bucket: social-media-uploads

---

## API Endpoints (To Be Implemented)

### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - Login user
POST   /auth/refresh           - Refresh access token
GET    /auth/me                - Get current user
POST   /auth/logout            - Logout (clear session)
```

### Posts
```
GET    /posts                  - Get feed (paginated)
POST   /posts                  - Create post
GET    /posts/:id              - Get single post
PUT    /posts/:id              - Update post
DELETE /posts/:id              - Delete post
POST   /posts/:id/like         - Like post
DELETE /posts/:id/like         - Unlike post
GET    /posts/:id/comments     - Get comments
POST   /posts/:id/comments     - Add comment
```

### Users
```
GET    /users/:id              - Get user profile
PUT    /users/profile          - Update own profile
GET    /users/:id/posts        - Get user's posts
POST   /users/:id/follow       - Follow user
DELETE /users/:id/follow       - Unfollow user
GET    /users/:id/followers    - List followers
GET    /users/:id/following    - List following
```

### Notifications
```
GET    /notifications          - Get notifications
PUT    /notifications/:id/read - Mark as read
```

---

## Frontend Routes (To Be Implemented)

```
/                              - Redirect to /feed
/login                         - Login page
/register                      - Register page
/feed                          - Main feed
/explore                       - Discover page
/profile/:id                   - User profile
/notifications                 - Notifications
/settings                      - Settings page
```

---

## Database Models Summary

### User
```
id, email*, username*, password*, displayName, avatar, bio, createdAt, updatedAt
Relations: posts, likes, comments, followers, following, notifications
```

### Post
```
id, content, mediaUrls[], authorId, createdAt, updatedAt
Relations: author, likes, comments
```

### Comment
```
id, text, postId, userId, createdAt, updatedAt
Relations: post, user
```

### Like
```
id, postId, userId, createdAt
Constraint: One per user per post
Relations: post, user
```

### Follow
```
followerId, followingId, createdAt
Relations: follower (User), following (User)
```

### Notification
```
id, userId, content, type (LIKE|COMMENT|FOLLOW), isRead, createdAt, updatedAt
Relations: user
```

---

## Tailwind Color Palette

```css
--background: #000000;      /* Pure black */
--surface: #111111;         /* Card background */
--border: #2A2A2A;          /* Borders */
--primary: #E6E6E6;         /* Main text */
--secondary: #888888;       /* Secondary text */
--accent: #1DB954;          /* Primary action (Spotify Green) */
```

---

## Common Commands

### Backend
```bash
cd backend

npm run start:dev           # Development mode with watch
npm run start               # Production mode
npm run build              # Build TypeScript
npm test                   # Run tests

npx prisma migrate dev     # Create new migration
npx prisma migrate reset   # Reset database (dev only!)
npx prisma studio         # Open database UI
npx prisma generate       # Generate Prisma client
```

### Frontend
```bash
cd frontend

npm run dev                # Development with HMR
npm run build             # Build for production
npm start                 # Start production server
npm run lint              # Run ESLint
npm run type-check        # Check TypeScript
```

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs [service_name]

# Rebuild images
docker-compose up -d --build

# Reset (WARNING: Deletes data!)
docker-compose down -v
docker-compose up -d
```

---

## Debugging Tips

### Backend Issues
- Check logs: `docker-compose logs postgres` or `docker-compose logs redis`
- Database connection: Verify DATABASE_URL in .env
- Port conflict: Backend on 3001, change in `main.ts`

### Frontend Issues
- Clear Next.js cache: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check API URL: Verify `NEXT_PUBLIC_API_URL` in .env.local

### Database Issues
- Reset migrations: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate`
- View schema: `npx prisma studio`

---

## Project Structure at a Glance

```
social-app/
├── .env                          # Secrets and config
├── docker-compose.yml            # Dev infrastructure
├── docker-compose.prod.yml       # Prod infrastructure
├── README.md                     # Main documentation
├── SETUP_COMPLETE.md             # Setup details
├── CHECKLIST.md                  # Development tasks
├── QUICK_REFERENCE.md            # This file
│
├── backend/
│   ├── src/
│   │   ├── main.ts               # Entry point
│   │   ├── app.module.ts         # Root module
│   │   ├── auth/                 # Auth module (TODO)
│   │   ├── users/                # Users module (TODO)
│   │   ├── posts/                # Posts module (TODO)
│   │   └── gateway/
│   │       └── app.gateway.ts    # WebSocket
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         # Root layout
    │   │   ├── globals.css        # Global styles
    │   │   ├── (auth)/            # Auth pages (TODO)
    │   │   └── (main)/            # Main pages (TODO)
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Button.tsx
    │   │   │   ├── Input.tsx
    │   │   │   └── HandmadeIcon.tsx
    │   │   └── feature/            # Feature components (TODO)
    │   ├── lib/
    │   │   ├── api.ts             # API client
    │   │   └── socket.ts          # Socket.IO
    │   └── store/
    │       ├── authStore.ts       # Auth state
    │       └── postStore.ts       # Posts state
    ├── public/
    │   └── filters.svg            # SVG effects
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── Dockerfile
```

---

## Performance Tips

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js App Router
3. **State Management**: Zustand already optimized
4. **API Caching**: Redis available (not yet implemented)
5. **Database**: Add indexes for frequently queried fields
6. **File Uploads**: Store in MinIO, reference in DB

---

## Security Reminders

- ✅ JWT secrets in `.env` (never commit!)
- ✅ CORS configured on backend
- ✅ Passwords hashed with bcrypt/argon2
- ✅ API validation via class-validator
- ⚠️ TODO: Add rate limiting
- ⚠️ TODO: Add CSRF protection
- ⚠️ TODO: Implement proper CORS for production

---

**Keep this open while developing!**
