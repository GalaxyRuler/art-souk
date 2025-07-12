import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { configureProduction } from "./production";
import { rateLimiters } from "./middleware/rateLimiting";
import { performanceMiddleware, memoryMonitoringMiddleware, requestLoggingMiddleware } from "./middleware/performance";
import { healthCheckMiddleware, databaseHealthCheck, readinessCheck, livenessCheck, memoryHealthCheck } from "./middleware/healthChecks";
import { cacheConfigs } from "./middleware/caching";

// Increased memory configuration for better performance
process.env.NODE_OPTIONS = '--max-old-space-size=1024 --expose-gc';

// Simplified memory tracking (reduced overhead)
let lastMemoryCheck = Date.now();
let memoryCheckCount = 0;

// Optimized cleanup function (less aggressive)
const periodicCleanup = () => {
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  // Only trigger cleanup if memory is critically high
  if (heapPercent > 85) {
    if (global.gc) {
      global.gc();
    }
    
    // Only log if memory is truly critical
    if (heapPercent > 95) {
      console.log(`🚨 High memory usage: ${Math.round(heapPercent)}%`);
    }
  }
};

// Reduced frequency cleanup - every 5 minutes instead of 20 seconds
setInterval(periodicCleanup, 300000);

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

// Additional monitoring endpoints will be added by routes.ts

// Memory trend endpoint
app.get('/health/memory-trend', (req, res) => {
  res.json({
    samples: memoryTracking.samples.map(s => ({
      timestamp: s.timestamp,
      heapUsedMB: Math.round(s.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(s.heapTotal / 1024 / 1024),
      heapPercentage: Math.round((s.heapUsed / s.heapTotal) * 100)
    })),
    trend: memoryTracking.samples.length >= 2 ? 
      (memoryTracking.samples[memoryTracking.samples.length - 1].heapUsed > 
       memoryTracking.samples[memoryTracking.samples.length - 2].heapUsed ? 'increasing' : 'decreasing') : 'unknown'
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
