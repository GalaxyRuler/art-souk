import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';

// CSRF Token Management
class CSRFTokenManager {
  private tokens = new Map<string, { token: string; expires: number }>();
  private readonly tokenExpiry = 60 * 60 * 1000; // 1 hour

  generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + this.tokenExpiry;

    this.tokens.set(sessionId, { token, expires });
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const storedToken = this.tokens.get(sessionId);

    if (!storedToken) {
      return false;
    }

    if (Date.now() > storedToken.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return storedToken.token === token;
  }

  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

export const csrfTokenManager = new CSRFTokenManager();

// Cleanup expired tokens every 15 minutes
setInterval(() => {
  csrfTokenManager.cleanupExpiredTokens();
}, 15 * 60 * 1000);

// CSRF Protection Middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for health checks
  if (req.path.startsWith('/health')) {
    return next();
  }

  const sessionId = req.sessionID || req.ip;
  const token = req.headers['x-csrf-token'] || req.body._csrf;

  if (!token) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF token required for this request',
    });
  }

  if (!csrfTokenManager.validateToken(sessionId, token as string)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token is invalid or expired',
    });
  }

  next();
};

// Generate CSRF token endpoint
export const generateCSRFToken = (req: Request, res: Response) => {
  const sessionId = req.sessionID || req.ip;
  const token = csrfTokenManager.generateToken(sessionId);

  res.json({ csrfToken: token });
};

// SQL Injection Prevention
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip SQL injection protection for development routes and Vite assets
  const developmentPaths = [
    '/src/',
    '/@vite/',
    '/@react-refresh',
    '/@fs/',
    '/node_modules/'
  ];

  const developmentExtensions = [
    '.tsx',
    '.ts',
    '.js',
    '.css',
    '.mjs',
    '.jsx'
  ];

  // Check if this is a development/asset request
  const isDevelopmentPath = developmentPaths.some(path => req.path.startsWith(path));
  const isDevelopmentExtension = developmentExtensions.some(ext => req.path.endsWith(ext));
  const isViteRequest = req.query.v !== undefined; // Vite version parameter

  // Debug logging disabled for cleaner console

  // Skip SQL injection check for development requests
  if (isDevelopmentPath || isDevelopmentExtension || isViteRequest) {
    return next();
  }

  const checkForSQLInjection = (value: any): boolean => {
    if (typeof value !== 'string') return false;

    // More precise SQL injection patterns that won't trigger on Vite version hashes
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(;\s*(DROP|DELETE|UPDATE|INSERT))/gi, // More specific semicolon patterns
      /(--\s+.*$)/gm, // SQL comments with space after --
      /(\/\*.*?\*\/)/g, // SQL block comments
      /('[^']*';\s*(DROP|DELETE|UPDATE|INSERT))/gi, // Quote-based injection
      /(\bINFORMATION_SCHEMA\b)/gi,
      /(\bSYS\b)/gi,
    ];

    return sqlPatterns.some(pattern => pattern.test(value));
  };

  const scanObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForSQLInjection(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(item => scanObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => scanObject(value));
    }

    return false;
  };

  // Check request body, params, and query
  const hasInjection = scanObject(req.body) || scanObject(req.params) || scanObject(req.query);

  if (hasInjection) {
    console.warn('SQL injection attempt detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Request contains potentially harmful content',
    });
  }

  next();
};

// XSS Protection
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }

    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item));
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }

    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Set XSS protection headers
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');

  next();
};

// Input Validation Middleware
export const inputValidation = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Invalid input data',
          details: result.error.errors,
        });
      }

      req.body = result.data;
      next();
    } catch (error) {
      res.status(500).json({
        error: 'Validation error',
        message: 'Server error during validation',
      });
    }
  };
};

// File Upload Security
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const validateFile = (file: any): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      return false;
    }

    if (file.size > maxSize) {
      return false;
    }

    return true;
  };

  const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file];

  for (const file of files) {
    if (file && !validateFile(file)) {
      return res.status(400).json({
        error: 'Invalid file',
        message: 'File type not allowed or file too large',
      });
    }
  }

  next();
};

// Request Size Limiting
export const requestSizeLimit = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size ${contentLength} exceeds maximum ${maxSize}`,
      });
    }

    next();
  };
};

// IP Whitelist/Blacklist
export const ipFilter = (options: { whitelist?: string[]; blacklist?: string[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;

    if (options.blacklist && options.blacklist.includes(clientIP)) {
      return res.status(403).json({
        error: 'IP blocked',
        message: 'Your IP address is not allowed',
      });
    }

    if (options.whitelist && !options.whitelist.includes(clientIP)) {
      return res.status(403).json({
        error: 'IP not allowed',
        message: 'Your IP address is not whitelisted',
      });
    }

    next();
  };
};

// Request Timeout
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: `Request timed out after ${timeoutMs}ms`,
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};

// Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Content Security Policy
  res.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "connect-src 'self' https:; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "child-src 'none'; " +
    "worker-src 'none'; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'; " +
    "base-uri 'self';"
  );

  // HTTP Strict Transport Security
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // X-Content-Type-Options
  res.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  res.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  res.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove X-Powered-By
  res.removeHeader('X-Powered-By');

  next();
};

// API Key Validation
export const apiKeyValidation = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'API key must be provided in X-API-Key header',
    });
  }

  // Validate API key format
  if (typeof apiKey !== 'string' || apiKey.length < 32) {
    return res.status(401).json({
      error: 'Invalid API key format',
      message: 'API key must be a valid string',
    });
  }

  // Here you would validate against your API key store
  // For now, we'll just check if it's not empty

  next();
};

// Comprehensive Security Middleware Stack
export const securityMiddlewareStack = [
  securityHeaders,
  requestSizeLimit(),
  requestTimeout(),
  sqlInjectionProtection,
  xssProtection,
  // csrfProtection, // Enable when you have proper session management
];

// Skip security checks for development assets and specific paths
const skipSecurityPaths = [
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/api/health',
  '/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/profile',
  '/api/dev',
  '/manifest.json'
];

// Export individual middleware for selective use
export {
  CSRFTokenManager,
};