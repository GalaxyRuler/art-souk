import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Image optimization configuration
const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  thumbnailSize: 300,
  formats: ['jpeg', 'png', 'webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_CONFIG.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Image optimization functions
export const imageOptimizer = {
  // Optimize single image
  async optimizeImage(buffer: Buffer, options: Partial<typeof IMAGE_CONFIG> = {}): Promise<Buffer> {
    const config = { ...IMAGE_CONFIG, ...options };
    
    try {
      const optimized = await sharp(buffer)
        .resize(config.maxWidth, config.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: config.quality,
          progressive: true,
        })
        .toBuffer();

      return optimized;
    } catch (error) {
      console.error('Image optimization error:', error);
      throw new Error('Failed to optimize image');
    }
  },

  // Create thumbnail
  async createThumbnail(buffer: Buffer, size: number = IMAGE_CONFIG.thumbnailSize): Promise<Buffer> {
    try {
      const thumbnail = await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({
          quality: 80,
        })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      console.error('Thumbnail creation error:', error);
      throw new Error('Failed to create thumbnail');
    }
  },

  // Convert to WebP for better compression
  async convertToWebP(buffer: Buffer): Promise<Buffer> {
    try {
      const webp = await sharp(buffer)
        .webp({
          quality: IMAGE_CONFIG.quality,
        })
        .toBuffer();

      return webp;
    } catch (error) {
      console.error('WebP conversion error:', error);
      throw new Error('Failed to convert to WebP');
    }
  },

  // Get image metadata
  async getImageMetadata(buffer: Buffer) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels,
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw new Error('Failed to extract image metadata');
    }
  },

  // Batch optimize multiple images
  async optimizeImages(images: Buffer[]): Promise<Buffer[]> {
    const optimizedImages = await Promise.all(
      images.map(image => this.optimizeImage(image))
    );
    return optimizedImages;
  },
};

// Image upload middleware with optimization
export const optimizedImageUpload = (fieldName: string, maxCount: number = 10) => {
  return [
    upload.array(fieldName, maxCount),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return next();
        }

        const optimizedFiles = await Promise.all(
          files.map(async (file) => {
            const startTime = Date.now();
            const originalSize = file.buffer.length;

            // Optimize the image
            const optimizedBuffer = await imageOptimizer.optimizeImage(file.buffer);
            const thumbnail = await imageOptimizer.createThumbnail(file.buffer);

            // Get metadata
            const metadata = await imageOptimizer.getImageMetadata(optimizedBuffer);

            const processingTime = Date.now() - startTime;
            const compressionRatio = ((originalSize - optimizedBuffer.length) / originalSize) * 100;

            console.log(`📸 Image optimized: ${file.originalname} - ${Math.round(compressionRatio)}% compression in ${processingTime}ms`);

            return {
              ...file,
              buffer: optimizedBuffer,
              thumbnail,
              metadata,
              originalSize,
              compressionRatio,
              processingTime,
            };
          })
        );

        // Replace the files array with optimized versions
        (req as any).optimizedFiles = optimizedFiles;
        next();
      } catch (error) {
        console.error('Image optimization middleware error:', error);
        res.status(400).json({ message: 'Image optimization failed' });
      }
    },
  ];
};

// Memory-efficient image processing
export const memoryEfficientImageProcessing = (req: Request, res: Response, next: NextFunction) => {
  const originalEnd = res.end;
  
  res.end = function(this: Response, ...args: any[]) {
    // Clear any image buffers from memory after response
    if ((req as any).optimizedFiles) {
      (req as any).optimizedFiles.forEach((file: any) => {
        if (file.buffer) {
          file.buffer = null;
        }
        if (file.thumbnail) {
          file.thumbnail = null;
        }
      });
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Image cleanup utility
export const imageCleanup = {
  // Clean up temporary files
  cleanupTempFiles: (tempDir: string) => {
    try {
      const files = fs.readdirSync(tempDir);
      const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour old
      
      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.mtime.getTime() < cutoff) {
          fs.unlinkSync(filePath);
          console.log(`🧹 Cleaned up temp file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  },

  // Start automatic cleanup
  startAutomaticCleanup: (tempDir: string) => {
    setInterval(() => {
      imageCleanup.cleanupTempFiles(tempDir);
    }, 30 * 60 * 1000); // Every 30 minutes
  },
};

// Image compression statistics
export const getImageStats = () => {
  // This would be populated by the middleware
  return {
    totalImagesProcessed: 0,
    totalBytesProcessed: 0,
    totalBytesSaved: 0,
    averageCompressionRatio: 0,
    averageProcessingTime: 0,
  };
};