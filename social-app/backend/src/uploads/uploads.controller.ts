import { Controller, Post, UseInterceptors, UploadedFiles, UseGuards, Request } from '@nestjs/common';
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function filename(req: any, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const name = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_.]/g, '');
  const fileExt = extname(file.originalname);
  cb(null, `${uniqueSuffix}-${name}${fileExt}`);
}

@Controller('api/uploads')
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename,
      }),
      fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (/^image\//.test(file.mimetype) || /^video\//.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    }),
  )
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Request() req: any) {
    // Diagnostic logging to help debug 404 / routing issues
    try {
      console.log('UploadsController.uploadFiles called:', req.method, req.url);
      console.log('Auth header present:', !!req.headers.authorization);
      console.log('Files count:', (files || []).length);

      // Return accessible URLs for uploaded files
      const host = req.headers.host || `localhost:3001`;
      const protocol = req.protocol || 'http';
      const base = `${protocol}://${host}`;

      const urls = (files || []).map((f) => ({ url: `${base}/uploads/${f.filename}`, filename: f.filename }));
      return { files: urls };
    } catch (error) {
      console.error('Upload handler error:', error);
      throw error;
    }
  }
}
