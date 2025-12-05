# Social App MVP - Complete Guide

This is a comprehensive **All-in-One** guide to build a **Social App MVP** from scratch to deployment.

## Architecture

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Infrastructure**: Docker Compose (PostgreSQL, Redis, MinIO)
- **Realtime**: Socket.IO for notifications and chat

## Quick Start

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Setup Backend
```bash
cd backend
npx prisma migrate dev --name init
npm install
npm run start:dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## Directory Structure
```
social-app/
├── .env
├── docker-compose.yml
├── README.md
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── gateway/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
└── frontend/
    ├── public/
    │   ├── icons/
    │   └── filters.svg
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── lib/
    │   └── store/
    ├── tailwind.config.ts
    ├── package.json
    └── Dockerfile
```

## Features

### Backend
- User authentication (JWT)
- Post CRUD operations
- Comments and Likes
- Follow system
- Real-time notifications via Socket.IO
- File upload to MinIO

### Frontend
- Dark theme (#000000)
- Handmade SVG icons with displacement filter
- Responsive design
- Real-time updates
- Token-based API client

## Services

- **PostgreSQL 15**: Main database
- **Redis 7**: Cache and sessions
- **MinIO**: Object storage for media

## Ports

- Backend: 3001
- Frontend: 3000
- PostgreSQL: 5432
- Redis: 6379
- MinIO API: 9000
- MinIO Console: 9001

## Installation & Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 3: Start Infrastructure (Database, Redis, MinIO)

```bash
docker-compose up -d
```

Wait 1-2 minutes for services to be ready.

### Step 4: Initialize Database

```bash
cd backend
npx prisma migrate dev --name init
cd ..
```

This will create the database schema and seed tables.

### Step 5: Start Backend Server

```bash
cd backend
npm run start:dev
```

The backend will run at `http://localhost:3001`

### Step 6: Start Frontend Server (New Terminal)

```bash
cd frontend
npm run dev
```

The frontend will run at `http://localhost:3000`

### Step 7: Verify Everything Works

- Open browser: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- MinIO Console: `http://localhost:9001` (Username: minioadmin, Password: minioadmin)

## Database Operations

### Run Migrations

```bash
cd backend
npx prisma migrate dev
```

### Reset Database (WARNING: Deletes all data)

```bash
cd backend
npx prisma migrate reset
```

### View Database UI

```bash
cd backend
npx prisma studio
```

## API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Posts Endpoints
- `GET /posts` - Get feed posts
- `POST /posts` - Create new post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like a post
- `DELETE /posts/:id/like` - Unlike a post

### Users Endpoints
- `GET /users/:id` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/:id/follow` - Follow user
- `DELETE /users/:id/follow` - Unfollow user

## Project Structure

### Backend (`/backend`)
- **src/auth**: Authentication logic (Login, Register, JWT)
- **src/users**: User profiles and follow system
- **src/posts**: Post CRUD, comments, likes
- **src/gateway**: WebSocket for realtime notifications
- **prisma**: Database schema and migrations

### Frontend (`/frontend`)
- **src/app**: Next.js App Router pages
- **src/components/ui**: Reusable UI components (Button, Input, etc.)
- **src/components/feature**: Feature components (FeedCard, Navbar, etc.)
- **src/lib**: Utilities (API client, Socket.IO client)
- **src/store**: Zustand stores (Auth, Posts)

## Styling

### Dark Theme Colors
- **Background**: #000000 (pure black)
- **Surface**: #111111 (card background)
- **Border**: #2A2A2A (borders)
- **Primary**: #E6E6E6 (main text)
- **Secondary**: #888888 (secondary text)
- **Accent**: #1DB954 (Spotify Green)

### Icons
All icons use a "hand-drawn" SVG filter for a unique aesthetic. See `public/filters.svg` for filter definitions.

## Troubleshooting

### Port Already in Use
If you get a port conflict:
- Backend (3001): Change port in `backend/src/main.ts`
- Frontend (3000): `npm run dev -- -p 3001` (or similar)

### Database Connection Failed
- Ensure Docker containers are running: `docker-compose ps`
- Check PostgreSQL: `docker logs social_postgres`

### Prisma Issues
```bash
# Clear Prisma cache
cd backend
rm -rf node_modules/@prisma
npm install
npx prisma generate
```

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## License

MIT
