import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateRequest(schema: {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schema.body) {
        const bodyResult = schema.body.safeParse(req.body);
        if (!bodyResult.success) {
          return res.status(400).json({
            message: 'Invalid request body',
            errors: bodyResult.error.errors,
          });
        }
        req.body = bodyResult.data;
      }

      // Validate request params
      if (schema.params) {
        const paramsResult = schema.params.safeParse(req.params);
        if (!paramsResult.success) {
          return res.status(400).json({
            message: 'Invalid request parameters',
            errors: paramsResult.error.errors,
          });
        }
        req.params = paramsResult.data;
      }

      // Validate query parameters
      if (schema.query) {
        const queryResult = schema.query.safeParse(req.query);
        if (!queryResult.success) {
          return res.status(400).json({
            message: 'Invalid query parameters',
            errors: queryResult.error.errors,
          });
        }
        req.query = queryResult.data;
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({ message: 'Internal server error during validation' });
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // ID parameter validation
  idParam: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  }),

  // Pagination query validation
  paginationQuery: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  }),

  // Search query validation
  searchQuery: z.object({
    q: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  }),

  // Artwork creation validation
  artworkBody: z.object({
    title: z.string().min(1).max(200),
    titleAr: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    descriptionAr: z.string().max(2000).optional(),
    price: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    medium: z.string().max(100).optional(),
    mediumAr: z.string().max(100).optional(),
    dimensions: z.string().max(100).optional(),
    year: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
    category: z.string().max(50).optional(),
    availability: z.enum(['available', 'sold', 'reserved']).optional(),
    images: z.array(z.string().url()).min(1).max(10),
  }),

  // Bid validation
  bidBody: z.object({
    amount: z.number().positive(),
    currency: z.string().length(3).default('SAR'),
  }),

  // User profile validation
  userProfileBody: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    bio: z.string().max(1000).optional(),
    bioAr: z.string().max(1000).optional(),
    location: z.string().max(100).optional(),
    website: z.string().url().optional(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
    roles: z.array(z.enum(['collector', 'artist', 'gallery'])).optional(),
  }),

  // Workshop/Event validation
  workshopBody: z.object({
    title: z.string().min(1).max(200),
    titleAr: z.string().max(200).optional(),
    description: z.string().min(10).max(2000),
    descriptionAr: z.string().max(2000).optional(),
    category: z.string().max(50),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    duration: z.number().int().positive(),
    maxParticipants: z.number().int().positive(),
    price: z.number().positive().optional(),
    location: z.string().max(200).optional(),
    isOnline: z.boolean().default(false),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    materials: z.array(z.string().max(100)).optional(),
  }),

  // Email validation
  emailBody: z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    content: z.string().min(1).max(10000),
  }),

  // Commission validation
  commissionBody: z.object({
    title: z.string().min(1).max(200),
    titleAr: z.string().max(200).optional(),
    description: z.string().min(10).max(2000),
    descriptionAr: z.string().max(2000).optional(),
    budget: z.number().positive(),
    timeline: z.string().max(100),
    category: z.string().max(50),
    requirements: z.string().max(1000).optional(),
  }),
};

// Security validation helpers
export const securityValidation = {
  // Sanitize HTML input
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate file uploads
  validateFileUpload: (file: any): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    return true;
  },

  // Validate SQL injection patterns
  validateSqlInjection: (input: string): boolean => {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(;|--|\/\*|\*\/)/g,
      /(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)/gi,
    ];
    
    return !sqlInjectionPatterns.some(pattern => pattern.test(input));
  },
};