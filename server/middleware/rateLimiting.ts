import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Create different rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiter
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60, // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Authentication rate limiter (more restrictive)
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login attempts per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Auction bidding rate limiter
  bidding: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 bids per minute
    message: {
      error: 'Too many bids too quickly, please wait a moment.',
      retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise IP
      return (req as any).user?.claims?.sub || req.ip;
    },
  }),

  // Email/Newsletter rate limiter
  email: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 emails per hour
    message: {
      error: 'Too many email requests, please try again later.',
      retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // File upload rate limiter
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 uploads per hour
    message: {
      error: 'Too many file uploads, please try again later.',
      retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Search rate limiter
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 searches per minute
    message: {
      error: 'Too many search requests, please slow down.',
      retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Admin operations rate limiter
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 admin operations per 15 minutes
    message: {
      error: 'Too many admin operations, please try again later.',
      retryAfter: 15 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Registration/Profile updates rate limiter
  profile: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 profile updates per hour
    message: {
      error: 'Too many profile updates, please try again later.',
      retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Commission system rate limiter
  commission: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 commission requests per hour
    message: {
      error: 'Too many commission requests, please try again later.',
      retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Content creation rate limiter
  creation: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 uploads per hour
    message: {
      error: 'Too many content uploads, please try again later.',
      retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Contact/inquiry rate limiter
  contact: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 inquiries per hour
    message: {
      error: 'Too many contact attempts, please try again later.',
      retryAfter: 60 * 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
};

// Custom rate limiter for specific user actions
export const createUserRateLimit = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise IP
      return (req as any).user?.claims?.sub || req.ip;
    },
    message: {
      error: 'Rate limit exceeded for this user.',
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiter for expensive operations
export const expensiveOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 expensive operations per hour
  message: {
    error: 'Too many expensive operations, please try again later.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.claims?.sub || req.ip;
  },
});

// Sliding window rate limiter for real-time features
export const realtimeLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // limit each user to 20 real-time actions per 10 seconds
  message: {
    error: 'Too many real-time actions, please slow down.',
    retryAfter: 10,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.claims?.sub || req.ip;
  },
});