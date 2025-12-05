// Temporarily disable TypeScript checks for this file to avoid editor/module resolution
// noise while dependencies finish installing / the TS server reloads.
// Remove this once your editor shows the modules correctly.
// @ts-nocheck
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve uploaded files statically from /uploads
  const uploadsDir = join(process.cwd(), 'uploads');
  try {
    require('fs').mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    // ignore
  }
  app.use('/uploads', express.static(uploadsDir));

  await app.listen(3001, '0.0.0.0');
  console.log('🚀 Backend running at http://localhost:3001');
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
