import { Request, Response, NextFunction } from 'express';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  memoryUsage: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests
  private slowQueryThreshold = 1000; // 1 second
  private alertCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public recordMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Check for slow queries
    if (metrics.duration > this.slowQueryThreshold) {
      this.triggerSlowQueryAlert(metrics);
    }
  }

  private triggerSlowQueryAlert(metrics: PerformanceMetrics) {
    console.warn(`🐌 SLOW QUERY: ${metrics.method} ${metrics.endpoint} - ${metrics.duration}ms`);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in performance alert callback:', error);
      }
    });
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public getStatistics() {
    if (this.metrics.length === 0) return null;

    const durations = this.metrics.map(m => m.duration);
    const memoryUsages = this.metrics.map(m => m.memoryUsage);
    
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      medianResponseTime: this.calculateMedian(durations),
      p95ResponseTime: this.calculatePercentile(durations, 95),
      p99ResponseTime: this.calculatePercentile(durations, 99),
      slowQueries: this.metrics.filter(m => m.duration > this.slowQueryThreshold).length,
      averageMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
      errorRate: this.metrics.filter(m => m.statusCode >= 400).length / this.metrics.length * 100,
      endpointStats: this.getEndpointStatistics()
    };
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[middle - 1] + sorted[middle]) / 2 
      : sorted[middle];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile / 100) - 1;
    return sorted[index];
  }

  private getEndpointStatistics() {
    const endpointMetrics = new Map<string, PerformanceMetrics[]>();
    
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      if (!endpointMetrics.has(key)) {
        endpointMetrics.set(key, []);
      }
      endpointMetrics.get(key)!.push(metric);
    });

    return Array.from(endpointMetrics.entries()).map(([endpoint, metrics]) => ({
      endpoint,
      requestCount: metrics.length,
      averageResponseTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
      errorRate: metrics.filter(m => m.statusCode >= 400).length / metrics.length * 100,
      slowQueries: metrics.filter(m => m.duration > this.slowQueryThreshold).length
    }));
  }

  public addAlertCallback(callback: (metrics: PerformanceMetrics) => void) {
    this.alertCallbacks.push(callback);
  }

  public setSlowQueryThreshold(threshold: number) {
    this.slowQueryThreshold = threshold;
  }
}

// Performance monitoring middleware
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  res.on('finish', () => {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    const duration = endTime - startTime;
    const memoryUsage = endMemory - startMemory;

    const metrics: PerformanceMetrics = {
      endpoint: req.path,
      method: req.method,
      duration,
      memoryUsage: Math.round(memoryUsage / 1024 / 1024 * 100) / 100, // MB with 2 decimal places
      statusCode: res.statusCode,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };

    PerformanceMonitor.getInstance().recordMetrics(metrics);
  });

  next();
};

export const performanceMonitor = PerformanceMonitor.getInstance();