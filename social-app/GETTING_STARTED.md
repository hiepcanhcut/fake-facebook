# 🎯 Getting Started - Developer Guide

## 5-Minute Quick Start

### 1. Start Infrastructure (1 minute)
```bash
docker-compose up -d
# Wait for services to initialize
docker-compose ps  # Check all services are running
```

### 2. Setup Backend (2 minutes)
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
# Backend runs at http://localhost:3001
```

### 3. Setup Frontend (2 minutes, new terminal)
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

### 4. Verify Everything Works
- Open http://localhost:3000
- Check backend API: http://localhost:3001
- View database: `npx prisma studio` (in backend folder)

**Done! You're ready to code.**

---

## First Week Development Roadmap

### Day 1: Project Familiarization
- [ ] Read README.md (10 min)
- [ ] Read QUICK_REFERENCE.md (15 min)
- [ ] Explore project structure (10 min)
- [ ] Run setup steps above (15 min)
- [ ] Open Prisma Studio and explore models (10 min)
- **Total: 1 hour**

### Day 2: Understand the Stack
- [ ] Review backend structure (NestJS, Prisma)
- [ ] Review frontend structure (Next.js, Tailwind)
- [ ] Check database schema in schema.prisma
- [ ] Review UI components in frontend/src/components
- [ ] Check state management in frontend/src/store
- **Total: 2 hours**

### Day 3-5: Implement Authentication

#### Backend (Days 3-4)
```
Create auth module:
1. auth/auth.controller.ts - Endpoints
2. auth/auth.service.ts - Logic
3. auth/jwt.strategy.ts - JWT validation
4. auth/jwt.guard.ts - Route protection
5. Endpoints: POST /auth/register, POST /auth/login
```

#### Frontend (Day 5)
```
Create auth pages:
1. (auth)/login/page.tsx
2. (auth)/register/page.tsx
3. Use authStore for state
4. Use api client for requests
```

---

## Essential Commands Reference

### Backend
```bash
cd backend

# Development
npm run start:dev           # Start with hot reload
npm run build              # Build for production
npm run start              # Run production build

# Database
npx prisma migrate dev     # Create migration
npx prisma migrate reset   # Reset DB (dev only!)
npx prisma studio         # View DB UI

# Testing
npm test                   # Run tests
npm run test:watch        # Watch mode

# Code Quality
npm run lint              # Check linting
npm run format            # Format code
```

### Frontend
```bash
cd frontend

# Development
npm run dev               # Start dev server
npm run build             # Build for production
npm start                 # Run production build

# Code Quality
npm run lint              # Check linting
npm run type-check        # Check TypeScript
npm test                  # Run tests
```

### Docker
```bash
# From root directory

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs
docker-compose logs -f backend    # Follow backend logs
docker-compose logs -f postgres   # Database logs

# Restart specific service
docker-compose restart backend

# Rebuild images
docker-compose up -d --build
```

---

## Folder Structure Navigation

### Backend File Locations
```
backend/src/
├── auth/              👈 LOGIN/REGISTER LOGIC
├── users/             👈 USER PROFILES
├── posts/             👈 FEED & CONTENT
├── gateway/           👈 WEBSOCKETS
├── app.module.ts      👈 ROOT CONFIGURATION
└── main.ts            👈 SERVER STARTUP
```

### Frontend File Locations
```
frontend/src/
├── app/
│   ├── (auth)/        👈 LOGIN/REGISTER PAGES
│   ├── (main)/        👈 MAIN PAGES (FEED, PROFILE)
│   └── globals.css    👈 GLOBAL STYLES
├── components/
│   ├── ui/            👈 BUTTON, INPUT, ICONS
│   └── feature/       👈 NAVBAR, FEEDCARD (TO BUILD)
├── lib/
│   ├── api.ts         👈 API CLIENT
│   └── socket.ts      👈 REALTIME CLIENT
└── store/
    ├── authStore.ts   👈 AUTH STATE
    └── postStore.ts   👈 POSTS STATE
```

---

## Development Workflow

### 1. Before You Start
```bash
# 1. Make sure services are running
docker-compose ps

# 2. Make sure you're on latest code
git pull

# 3. Start dev servers (3 terminals)
Terminal 1: cd backend && npm run start:dev
Terminal 2: cd frontend && npm run dev
Terminal 3: Optional - npx prisma studio
```

### 2. While Developing

#### Backend
```bash
# File: backend/src/auth/auth.controller.ts
# Make changes, save
# App reloads automatically (watch mode)

# Test with curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

#### Frontend
```bash
# File: frontend/src/app/(auth)/login/page.tsx
# Make changes, save
# Browser reloads automatically (HMR)

# Test in browser: http://localhost:3000/login
```

### 3. Commit Your Code
```bash
git add .
git commit -m "feat: add login endpoint"
git push
```

---

## Database Operations

### View Current Schema
```bash
cd backend
npx prisma studio
# Opens UI at http://localhost:5555
```

### Add New Field to User
```prisma
// In backend/prisma/schema.prisma
model User {
  id    String  @id @default(uuid())
  email String  @unique
  // Add new field:
  phone String? // Optional phone number
}
```

```bash
# Create migration
npx prisma migrate dev --name add_phone_to_user

# Automatically generates migration and updates database
```

### Create New Model
```prisma
// In backend/prisma/schema.prisma
model NewModel {
  id    String  @id @default(uuid())
  // fields...
}
```

```bash
npx prisma migrate dev --name create_new_model
```

---

## API Testing

### With cURL
```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "username": "testuser",
    "password": "password123",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'

# With token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/auth/me
```

### With Postman/Insomnia
1. Download Postman or Insomnia
2. Create new request
3. Set method: POST
4. Set URL: http://localhost:3001/api/auth/login
5. Set body (JSON):
```json
{
  "email": "user@test.com",
  "password": "password123"
}
```
6. Send and view response

---

## Component Development

### Creating a New UI Component

```typescript
// File: frontend/src/components/ui/Card.tsx
'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '' }, ref) => (
    <div
      ref={ref}
      className={`bg-surface border border-border rounded-lg p-4 ${className}`}
    >
      {children}
    </div>
  )
);

Card.displayName = 'Card';

export default Card;
```

### Using the Component
```typescript
// In any page or component
import Card from '@/components/ui/Card';

export default function MyPage() {
  return (
    <Card className="w-full max-w-md">
      <h1>Hello World</h1>
    </Card>
  );
}
```

---

## State Management Examples

### Using Auth Store
```typescript
'use client';

import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const { user, isLoading, error, login } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in
      console.log('Logged in as:', user);
    } catch (err) {
      console.log('Login error:', error);
    }
  };

  return (
    <div>
      {/* Login form */}
    </div>
  );
}
```

### Using Posts Store
```typescript
'use client';

import { usePostStore } from '@/store/postStore';
import { useEffect } from 'react';

export default function FeedPage() {
  const { posts, isLoading, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {posts.map(post => (
        <div key={post.id}>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Debugging Tips

### Backend Debugging
```bash
# 1. Check logs
docker-compose logs -f backend

# 2. Use console.log (will show in terminal)
console.log('Debug info:', data);

# 3. Use Prisma Studio to check DB
npx prisma studio

# 4. Test endpoint with curl
curl http://localhost:3001/api/endpoint
```

### Frontend Debugging
```bash
# 1. Browser DevTools (F12)
# Open browser console to see errors

# 2. Use console.log in code
console.log('Debug info:', data);

# 3. Check React DevTools
# Install React DevTools browser extension

# 4. Check network tab (F12 → Network)
# See API requests and responses
```

---

## Common Development Tasks

### Add New API Endpoint
1. **Backend**: Create route in controller
2. **Backend**: Add logic in service
3. **Frontend**: Add method in api.ts (if needed)
4. **Frontend**: Call from component via store or api client
5. **Test**: Use cURL or Postman

### Add New Page
1. **Frontend**: Create file in `src/app/(main)/yourpage/page.tsx`
2. **Frontend**: Add navigation to Navbar/Sidebar
3. **Frontend**: Implement page component
4. **Test**: Navigate in browser

### Add New Database Model
1. **Backend**: Add model to schema.prisma
2. **Backend**: Create migration: `npx prisma migrate dev`
3. **Backend**: Create service (UsersService, PostsService, etc.)
4. **Backend**: Create controller with endpoints
5. **Frontend**: Add API methods
6. **Frontend**: Create UI components
7. **Test**: Test full flow

---

## Performance Optimization

### Frontend Optimization
```typescript
// Lazy load components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Use memo for expensive components
const MyComponent = React.memo(({ data }) => {
  // Won't re-render unless data changes
  return <div>{data}</div>;
});
```

### Database Optimization
```prisma
// Add indexes for frequently queried fields
model Post {
  id        String   @id @default(uuid())
  content   String
  authorId  String   @db.Uuid
  createdAt DateTime @default(now())
  
  // Add index for faster queries
  @@index([authorId])
  @@index([createdAt])
}
```

---

## Security Reminders

✅ **Do**
- Store secrets in .env files
- Use HTTPS in production
- Validate all inputs
- Use parameterized queries (Prisma handles this)
- Hash passwords (already configured)
- Use JWT tokens (already setup)

❌ **Don't**
- Commit .env file
- Store passwords in plain text
- Trust user input
- Expose API keys in frontend
- Use console.log for sensitive data

---

## Common Git Workflow

```bash
# Before starting work
git pull

# Create feature branch
git checkout -b feature/auth-login

# Make changes...

# Stage changes
git add .

# Commit
git commit -m "feat: add login endpoint and page"

# Push
git push origin feature/auth-login

# Create Pull Request on GitHub
# Get code review
# Merge to main

# Return to main
git checkout main
git pull
```

---

## Testing Your Code

### Simple Manual Testing
```bash
# Backend endpoint
curl http://localhost:3001/api/endpoint

# Frontend page
Open http://localhost:3000/page-name

# Database
npx prisma studio
```

### Automated Testing
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

---

## When Things Break

### Step 1: Check Logs
```bash
docker-compose logs -f
```

### Step 2: Verify Services
```bash
docker-compose ps  # All running?
```

### Step 3: Check Documentation
- README.md
- TROUBLESHOOTING.md
- QUICK_REFERENCE.md

### Step 4: Restart Everything
```bash
docker-compose restart
cd backend && npm run start:dev
cd frontend && npm run dev
```

### Step 5: Ask for Help
Look in TROUBLESHOOTING.md for your specific error.

---

## Ready to Code!

You now have everything needed to start development:

✅ Infrastructure running
✅ Database set up
✅ Frontend & backend tools installed
✅ Documentation available
✅ Components ready to use
✅ State management configured

**Next step: Follow CHECKLIST.md and start implementing features!**

---

**Happy coding!** 🚀

For questions:
- 📖 Check README.md
- 🔍 Check QUICK_REFERENCE.md
- 🔧 Check TROUBLESHOOTING.md
- 📂 Check FILE_INVENTORY.md
