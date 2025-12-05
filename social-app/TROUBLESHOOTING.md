# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## Docker Issues

### "Docker daemon is not running"
```
❌ Error: Docker daemon is not running
✅ Solution: Start Docker Desktop or Docker service
   Windows: Open Docker Desktop app
   Linux: sudo systemctl start docker
```

### "Port 5432 already in use"
```
❌ Error: Cannot bind to port 5432 (PostgreSQL)
✅ Solution: Change port in docker-compose.yml
   Change "5432:5432" to "5433:5432"
   Then update DATABASE_URL in .env
```

### "Can't connect to database"
```
❌ Error: Cannot connect to localhost:5432
✅ Solutions:
   1. Wait 30 seconds for PostgreSQL to start
   2. Check: docker-compose ps
   3. View logs: docker-compose logs postgres
   4. Restart: docker-compose restart postgres
```

### "MinIO bucket already exists"
```
❌ Error: Bucket 'social-media-uploads' already exists
✅ Solution: 
   1. Open MinIO console: http://localhost:9001
   2. Login: minioadmin / minioadmin
   3. Delete the bucket
   4. Restart: docker-compose restart createbuckets
```

---

## Backend Issues

### "Cannot find module '@nestjs/core'"
```
❌ Error: npm install not complete
✅ Solution:
   cd backend
   npm install
   npm install --save @nestjs/core @nestjs/common
```

### "Prisma client not generated"
```
❌ Error: Cannot find prisma client
✅ Solution:
   cd backend
   npx prisma generate
   npm install @prisma/client
```

### "Port 3001 already in use"
```
❌ Error: Backend port conflict
✅ Solutions:
   1. Change port in src/main.ts
   2. Or: Kill process on port 3001
      Windows: netstat -ano | findstr :3001
      Linux: lsof -i :3001 && kill -9 <PID>
```

### "Database migration failed"
```
❌ Error: Prisma migrate failed
✅ Solutions:
   1. Check database exists: SELECT datname FROM pg_database;
   2. Reset database:
      npx prisma migrate reset
   3. Try migrate dev:
      npx prisma migrate dev --name init
```

### "TypeScript compilation error"
```
❌ Error: TS errors in src files
✅ Solutions:
   1. Check types installed: npm install -D @types/node
   2. Clear cache: rm -rf dist node_modules
   3. Reinstall: npm install
```

### "WebSocket connection refused"
```
❌ Error: Socket.IO connection fails
✅ Solutions:
   1. Check backend running: http://localhost:3001
   2. Verify CORS in app.gateway.ts
   3. Check Socket.IO port matches (default 3001)
```

---

## Frontend Issues

### "Cannot find module 'react'"
```
❌ Error: React not installed
✅ Solution:
   cd frontend
   npm install
```

### "Tailwind CSS not working"
```
❌ Error: Styles not applying
✅ Solutions:
   1. Clear Next.js cache: rm -rf .next
   2. Rebuild: npm run build
   3. Check tailwind.config.ts content paths
   4. Restart dev server: npm run dev
```

### ".next folder is huge / build fails"
```
❌ Error: Build process slow or fails
✅ Solutions:
   1. Delete .next: rm -rf .next
   2. Clear cache: npm run dev
   3. Restart: npm run dev again
```

### "Image optimization errors"
```
❌ Error: Next.js image errors
✅ Solutions:
   1. Check next.config.js has images config
   2. Use next/image component
   3. Set width and height
```

### "API requests 404"
```
❌ Error: API endpoints not found
✅ Solutions:
   1. Check NEXT_PUBLIC_API_URL in .env.local
   2. Verify backend running on correct port
   3. Check API routes exist
```

### "Socket.IO not connecting"
```
❌ Error: Real-time features not working
✅ Solutions:
   1. Verify backend Socket.IO server running
   2. Check NEXT_PUBLIC_SOCKET_URL
   3. Check browser console for errors
   4. Enable WebSocket in firewall
```

### "TypeScript strict mode errors"
```
❌ Error: Type errors in components
✅ Solutions:
   1. Add types: npm install -D @types/react
   2. Fix implicit any: Add parameter types
   3. Check tsconfig.json strict: true
```

---

## Database Issues

### "Prisma Studio won't open"
```
❌ Error: npx prisma studio fails
✅ Solutions:
   1. Check backend directory: cd backend
   2. Ensure .env has DATABASE_URL
   3. Check Prisma client generated: npx prisma generate
   4. Try: npx prisma studio --browser=chrome
```

### "Cannot migrate down"
```
❌ Error: npx prisma migrate resolve fails
✅ Solutions:
   1. Check migration files: ls prisma/migrations/
   2. Reset (dev only): npx prisma migrate reset
   3. Manual fix:
      npx prisma migrate resolve --rolled-back <migration_name>
```

### "Table already exists"
```
❌ Error: Table exists in migration
✅ Solutions:
   1. Reset database: npx prisma migrate reset
   2. Or rename table/migration
   3. Check schema.prisma for duplicates
```

### "Foreign key constraint fails"
```
❌ Error: Cannot delete record (foreign key)
✅ Solutions:
   1. Check schema for onDelete: Cascade
   2. Prisma should handle this automatically
   3. Delete related records first
```

---

## Permission Issues

### "Permission denied" on Linux/Mac
```
❌ Error: Cannot execute docker/npm commands
✅ Solutions:
   1. Add user to docker group:
      sudo usermod -aG docker $USER
   2. Reload shell or restart terminal
   3. Check permissions: ls -la
```

### ".env file not readable"
```
❌ Error: Cannot read .env
✅ Solutions:
   1. Check file exists: ls -la .env
   2. Make readable: chmod 644 .env
   3. Verify location (should be root)
```

---

## Node.js Issues

### "Node version mismatch"
```
❌ Error: Node version doesn't match
✅ Solutions:
   1. Check version: node --version
   2. Required: Node 18+
   3. Update: Download from nodejs.org
   4. Check npm: npm --version (8+)
```

### "npm ERR! code EACCES"
```
❌ Error: Permission denied on npm
✅ Solutions:
   1. Clear npm cache: npm cache clean --force
   2. Fix npm permissions: npm config set prefix ~/.npm-global
   3. Reinstall node packages
```

### "npm ERR! ERESOLVE unable to resolve dependency"
```
❌ Error: Dependency conflict
✅ Solutions:
   1. Force install: npm install --legacy-peer-deps
   2. Delete lock file: rm package-lock.json
   3. Clear cache: npm cache clean --force
   4. Reinstall: npm install
```

---

## Memory Issues

### "Out of memory during build"
```
❌ Error: JavaScript heap out of memory
✅ Solutions:
   1. Increase heap: NODE_OPTIONS=--max_old_space_size=4096 npm run build
   2. Build smaller chunks
   3. Close other applications
   4. Restart Node process
```

### "Docker container keeps crashing"
```
❌ Error: Container exits immediately
✅ Solutions:
   1. View logs: docker-compose logs [service]
   2. Check resource limits
   3. Increase Docker memory limit
   4. Simplify application
```

---

## Network Issues

### "Can't access http://localhost:3000"
```
❌ Error: Frontend not accessible
✅ Solutions:
   1. Check if running: npm run dev running?
   2. Try different port: npm run dev -- -p 3001
   3. Check firewall: Allow port 3000
   4. Try 127.0.0.1:3000 instead
```

### "CORS error when calling API"
```
❌ Error: Cross-origin request blocked
✅ Solutions:
   1. Check backend has CORS enabled
   2. Verify origin in docker-compose setup
   3. Check NEXT_PUBLIC_API_URL matches
   4. Ensure credentials: true if needed
```

### "Proxy timeout"
```
❌ Error: Request timeout
✅ Solutions:
   1. Increase timeout in api.ts (timeout: 60000)
   2. Check if backend is running
   3. Check network latency
   4. Restart both services
```

---

## Windows-Specific Issues

### "Docker Desktop not starting"
```
❌ Error: Docker Desktop won't launch
✅ Solutions:
   1. Restart computer
   2. Check: Settings > Apps > Docker > Repair
   3. Uninstall & reinstall Docker
   4. Check Windows updates
```

### "WSL2 not available"
```
❌ Error: WSL2 required for Docker
✅ Solutions:
   1. Install WSL2: wsl --install
   2. Enable Hyper-V: Control Panel > Programs > Windows Features
   3. Update Windows 10/11
   4. Use Docker Desktop with WSL 2 backend
```

### "Path issues with backslashes"
```
❌ Error: Command fails with C:\Users\...
✅ Solutions:
   1. Use forward slashes: C:/Users/...
   2. Or use PowerShell with proper escaping
   3. Use WSL terminal instead
```

---

## Quick Fixes

### "Everything broken, start fresh"
```bash
# Nuclear option - complete reset
docker-compose down -v
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/dist .next
npm cache clean --force

# Then start from beginning
docker-compose up -d
cd backend && npm install && npx prisma migrate dev
cd ../frontend && npm install
```

### "Just update everything"
```bash
npm update
npm audit fix
npx prisma migrate dev
docker-compose pull
docker-compose up -d --build
```

### "Check everything is working"
```bash
# Backend health check
curl http://localhost:3001

# Frontend health check
curl http://localhost:3000

# Database connection
npx prisma studio

# Docker status
docker-compose ps
```

---

## Error Message Reference

| Error | Cause | Fix |
|-------|-------|-----|
| ECONNREFUSED | Service not running | Start Docker/npm services |
| EADDRINUSE | Port in use | Change port or kill process |
| EACCES | Permission denied | sudo or npm config |
| MODULE_NOT_FOUND | Package missing | npm install |
| HEAP OUT OF MEMORY | Too much data | Increase Node heap size |
| CORS error | Origin mismatch | Check CORS config |
| 404 Not Found | Route doesn't exist | Check API routes |
| 500 Server Error | Backend error | Check logs |

---

## Getting Help

### Check Documentation
1. **README.md** - Quick start issues
2. **QUICK_REFERENCE.md** - Commands & setup
3. **DEPLOYMENT.md** - Production issues
4. **IMPLEMENTATION_GUIDE.md** - Architecture

### View Logs
```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Debug Tools
```bash
# Prisma Studio
npx prisma studio

# Network debugging
curl http://localhost:3001
curl http://localhost:3000

# Docker debugging
docker ps -a
docker logs <container_id>
```

---

## Prevention Tips

✅ **Keep running:**
- `docker-compose ps` regularly
- Check logs often: `docker-compose logs`
- Monitor disk space
- Keep Docker updated

✅ **Before changes:**
- Backup database: `docker exec social_postgres pg_dump -U admin social_db > backup.sql`
- Commit code to git
- Document changes

✅ **Stay organized:**
- Use .gitignore for node_modules
- Keep .env files private
- Document custom changes
- Version your databases

---

**Last Updated**: December 5, 2025
**Most Common Issues**: Port conflicts, missing node_modules, Docker not running
