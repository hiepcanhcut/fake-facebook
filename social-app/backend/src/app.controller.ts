import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root(): { message: string; version: string; endpoints: Record<string, string> } {
    return {
      message: 'Social App MVP Backend',
      version: '0.0.1',
      endpoints: {
        health: 'GET /api/health',
        root: 'GET /',
      },
    };
  }
}
