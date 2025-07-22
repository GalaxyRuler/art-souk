import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { configureProduction } from "./production";
import { rateLimiters } from "./middleware/rateLimiting";
import { performanceMiddleware, memoryMonitoringMiddleware, requestLoggingMiddleware } from "./middleware/performance";
import { healthCheckMiddleware, databaseHealthCheck, readinessCheck, livenessCheck, memoryHealthCheck } from "./middleware/healthChecks";
import { cacheConfigs } from "./middleware/caching";
import { createRequire } from "node:module";

// Increased memory configuration for better performance
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --expose-gc --max-semi-space-size=256';

// Optimized memory tracking with less overhead
let memoryTrackingEnabled = false;
let lastCleanup = Date.now();

// Less aggressive cleanup function
const periodicCleanup = () => {
  const now = Date.now();
  // Only check memory every 30 seconds minimum
  if (now - lastCleanup < 30000) return;
  
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  // Only trigger cleanup if memory is very high
  if (heapPercent > 90) {
    if (global.gc) {
      global.gc();
      lastCleanup = now;
    }
    
    // Only log every 2 minutes when critical
    if (heapPercent > 95 && now - lastCleanup > 120000) {
      console.log(`🚨 Critical memory usage: ${Math.round(heapPercent)}%`);
      lastCleanup = now;
    }
  }
};

// Much less frequent cleanup interval
setInterval(periodicCleanup, 300000); // Every 5 minutes only

// Remove aggressive memory leak detection that was consuming memory

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Performance monitoring middleware
app.use(performanceMiddleware);
app.use(memoryMonitoringMiddleware);
app.use(requestLoggingMiddleware);

// Apply rate limiting only to specific sensitive endpoints, not globally

// Health check endpoints (before auth)
app.get('/health', healthCheckMiddleware);
app.get('/health/db', databaseHealthCheck);
app.get('/health/memory', memoryHealthCheck);
app.get('/health/ready', readinessCheck);
app.get('/health/live', livenessCheck);

// Development tools middleware
let devTools: any = null;
try {
  const require = createRequire(import.meta.url);
  // devToolsSimple is CommonJS so default export may reside directly on module.exports
  devTools = (require('./devToolsSimple') as any).default ?? require('./devToolsSimple');
  app.use(devTools.middleware());
  console.log('✅ Development tools middleware loaded');
} catch (error) {
  console.warn('⚠️ Development tools not loaded:', (error as Error).message);
}

// Additional monitoring endpoints will be added by routes.ts

// Simplified memory endpoint without tracking history
app.get('/health/memory-trend', (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    current: {
      heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapPercentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    }
  });
});

// Configure production security and static files
configureProduction(app);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  console.error('Promise:', promise);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

(async () => {
  const server = await registerRoutes(app);

  // SEO-friendly headers middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    // SEO-friendly headers
    res.setHeader('X-Robots-Tag', 'index, follow');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // For main page requests
    if (req.path === '/' || req.path === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }

    next();
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Express error handler:", err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();