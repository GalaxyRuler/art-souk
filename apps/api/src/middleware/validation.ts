import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "./errorHandler";

export interface ValidationSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate request parameters
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      // Validate query parameters
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Validate headers
      if (schemas.headers) {
        req.headers = schemas.headers.parse(req.headers);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
          received: err.received,
        }));

        next(new ValidationError("Request validation failed", details));
      } else {
        next(error);
      }
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  // ID parameter validation
  idParam: {
    params: {
      id: z.string().regex(/^\d+$/, "Invalid ID format").transform(Number),
    },
  },

  // Pagination query validation
  pagination: {
    query: {
      page: z.string().optional().default("1").transform(Number),
      limit: z.string().optional().default("10").transform(Number),
      sort: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    },
  },

  // Search query validation
  search: {
    query: {
      q: z.string().min(1, "Search query is required"),
      category: z.string().optional(),
      priceMin: z.string().optional().transform(Number),
      priceMax: z.string().optional().transform(Number),
    },
  },

  // File upload validation
  fileUpload: {
    body: {
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      category: z.string().min(1, "Category is required"),
    },
  },
};

// Sanitization middleware
export function sanitize(req: Request, res: Response, next: NextFunction) {
  // Remove null bytes and potentially dangerous characters
  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === "string") {
      return obj.replace(/\0/g, "").trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
}

// Rate limiting schemas
export const rateLimitSchemas = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: "Too many authentication attempts, please try again later",
  },

  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests, please try again later",
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: "Too many uploads, please try again later",
  },

  // Auction bidding endpoints
  bidding: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 bids per minute
    message: "Too many bids, please slow down",
  },

  // Contact/inquiry endpoints
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 inquiries per hour
    message: "Too many inquiries, please try again later",
  },
};

import { z } from "zod";