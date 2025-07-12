import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { configureProduction } from "./production";
import { rateLimiters } from "./middleware/rateLimiting";
import { performanceMiddleware, memoryMonitoringMiddleware, requestLoggingMiddleware } from "./middleware/performance";
import { healthCheckMiddleware, databaseHealthCheck, readinessCheck, livenessCheck, memoryHealthCheck } from "./middleware/healthChecks";
import { cacheConfigs } from "./middleware/caching";

// URGENT: Emergency memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=512 --expose-gc';

// Memory tracking for leak detection
const memoryTracking = {
  samples: [] as Array<{
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  }>,
  lastGC: Date.now()
};

// Emergency cleanup function
const emergencyCleanup = () => {
  const memUsage = process.memoryUsage();
  const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  if (heapPercent > 90) {
    console.log('🚨 EMERGENCY: Memory > 90%, triggering aggressive cleanup');
    
    // Force garbage collection
    if (global.gc) {
      const memBefore = process.memoryUsage().heapUsed;
      global.gc();
      const memAfter = process.memoryUsage().heapUsed;
      const freed = Math.round((memBefore - memAfter) / 1024 / 1024);
      console.log(`🧹 Emergency GC freed ${freed}MB memory`);
    }
    
    // Log emergency action
    console.log(`Emergency cleanup completed. Memory: ${Math.round(heapPercent)}%`);
  }
};

// PHASE B: Force garbage collection every 90 seconds (more aggressive)
setInterval(() => {
  if (global.gc) {
    const memBefore = process.memoryUsage().heapUsed;
    global.gc();
    const memAfter = process.memoryUsage().heapUsed;
    const freed = Math.round((memBefore - memAfter) / 1024 / 1024);
    if (freed > 0) {
      console.log(`🧹 GC freed ${freed}MB memory`);
    }
  }
}, 90000); // Every 90 seconds

// PHASE B: Run emergency cleanup every 20 seconds (more aggressive)
setInterval(emergencyCleanup, 20000);

// Memory leak detection - every minute
setInterval(() => {
  const mem = process.memoryUsage();
  const sample = {
    timestamp: Date.now(),
    heapUsed: mem.heapUsed,
    heapTotal: mem.heapTotal,
    external: mem.external,
    rss: mem.rss
  };
  
  memoryTracking.samples.push(sample);
  
  // PHASE B: Keep only last 15 samples (15 minutes) instead of 30
  if (memoryTracking.samples.length > 15) {
    memoryTracking.samples.shift();
  }
  
  // Check for memory leak pattern
  if (memoryTracking.samples.length >= 5) {
    const recent = memoryTracking.samples.slice(-5);
    const increasing = recent.every((sample, i) => 
      i === 0 || sample.heapUsed > recent[i-1].heapUsed
    );
    
    if (increasing) {
      console.log('⚠️ POTENTIAL MEMORY LEAK DETECTED - 5 consecutive increases');
      console.log('Recent samples:', recent.map(s => ({
        time: new Date(s.timestamp).toISOString(),
        heapMB: Math.round(s.heapUsed / 1024 / 1024)
      })));
      
      // PHASE B: Trigger immediate cleanup on memory leak detection
      if (global.gc) {
        console.log('🚨 MEMORY LEAK: Triggering immediate GC');
        global.gc();
      }
    }
  }
}, 60000); // Every minute

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
