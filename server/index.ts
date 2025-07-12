import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { configureProduction } from "./production";
import { rateLimiters } from "./middleware/rateLimiting";
import { performanceMiddleware, memoryMonitoringMiddleware, requestLoggingMiddleware } from "./middleware/performance";
import { healthCheckMiddleware, databaseHealthCheck, readinessCheck, livenessCheck } from "./middleware/healthChecks";
import { cacheConfigs } from "./middleware/caching";

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
app.get('/health/ready', readinessCheck);
app.get('/health/live', livenessCheck);

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
