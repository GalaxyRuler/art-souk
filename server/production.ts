import express, { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function configureProduction(app: Express) {
  // Trust proxy for HTTPS forwarding
  app.set('trust proxy', 1);
  
  // Security headers for production
  app.use((req, res, next) => {
    // HTTPS enforcement
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // HTTPS Strict Transport Security
    if (req.secure) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
  });
  
  // Serve static files with proper caching
  if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(__dirname, '..', 'dist', 'client');
    app.use(express.static(staticPath, {
      maxAge: '1d', // PHASE B: Reduce from 1y to 1d for memory optimization
      etag: false,  // PHASE B: Disable etag to save memory
      lastModified: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
  }
}