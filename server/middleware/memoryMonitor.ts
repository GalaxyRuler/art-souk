import { Request, Response, NextFunction } from 'express';

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  heapPercentage: number;
  timestamp: Date;
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private metrics: MemoryMetrics[] = [];
  private maxMetrics = 20; // Keep last 20 readings (reduced from 100)
  private alertThreshold = 98; // Alert at 98% memory usage (increased from 85%)
  private cleanupInterval: NodeJS.Timeout | null = null;
  private alertCallbacks: ((metrics: MemoryMetrics) => void)[] = [];

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  private startMonitoring() {
    // Monitor memory every 5 minutes (reduced frequency)
    this.cleanupInterval = setInterval(() => {
      this.collectMetrics();
      this.performCleanup();
    }, 300000);

    // Initial collection
    this.collectMetrics();
  }

  private collectMetrics() {
    const memUsage = process.memoryUsage();
    const heapPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    const metrics: MemoryMetrics = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapPercentage,
      timestamp: new Date()
    };

    this.metrics.push(metrics);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Check for alert condition
    if (heapPercentage >= this.alertThreshold) {
      this.triggerAlert(metrics);
    }
  }

  private performCleanup() {
    try {
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Clear module cache for unused modules (be careful with this)
      this.clearUnusedModules();
      
    } catch (error) {
      console.error('Error during memory cleanup:', error);
    }
  }

  private clearUnusedModules() {
    // Skip module cache clearing in ES modules environment
    // Instead, focus on forcing garbage collection if available
    try {
      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      // Ignore errors when forcing garbage collection
    }
  }

  private triggerAlert(metrics: MemoryMetrics) {
    // Only log truly critical memory situations
    if (metrics.heapPercentage >= 99) {
      console.warn(`🚨 CRITICAL MEMORY: ${metrics.heapPercentage}% memory usage (${metrics.heapUsed}MB/${metrics.heapTotal}MB)`);
    }
    
    // Execute alert callbacks (but only for critical situations)
    if (metrics.heapPercentage >= 99) {
      this.alertCallbacks.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Error in memory alert callback:', error);
        }
      });
    }
  }

  public getMetrics(): MemoryMetrics[] {
    return [...this.metrics];
  }

  public getCurrentMetrics(): MemoryMetrics {
    return this.metrics[this.metrics.length - 1] || this.collectAndGetCurrent();
  }

  private collectAndGetCurrent(): MemoryMetrics {
    this.collectMetrics();
    return this.metrics[this.metrics.length - 1];
  }

  public addAlertCallback(callback: (metrics: MemoryMetrics) => void) {
    this.alertCallbacks.push(callback);
  }

  public setAlertThreshold(threshold: number) {
    this.alertThreshold = threshold;
  }

  public getHealthStatus(): { status: string; details: MemoryMetrics } {
    const current = this.getCurrentMetrics();
    const status = current.heapPercentage >= 90 ? 'critical' : 
                   current.heapPercentage >= 80 ? 'warning' : 'healthy';
    
    return { status, details: current };
  }

  public stopMonitoring() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Middleware to track memory usage per request
export const memoryTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startMemory = process.memoryUsage();
  const startTime = Date.now();

  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const duration = Date.now() - startTime;
    
    // Log high memory usage requests
    const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
    if (memoryDiff > 10 * 1024 * 1024) { // 10MB+
      console.warn(`🔍 High memory request: ${req.method} ${req.path} - ${Math.round(memoryDiff / 1024 / 1024)}MB in ${duration}ms`);
    }
  });

  next();
};

export const memoryMonitor = MemoryMonitor.getInstance();