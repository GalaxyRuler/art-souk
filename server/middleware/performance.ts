import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  requestCount: number;
  totalResponseTime: number;
  averageResponseTime: number;
  errorCount: number;
  errorRate: number;
  activeRequests: number;
  memoryUsage: NodeJS.MemoryUsage;
  slowRequestCount: number;
  slowRequestThreshold: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    errorCount: 0,
    errorRate: 0,
    activeRequests: 0,
    memoryUsage: process.memoryUsage(),
    slowRequestCount: 0,
    slowRequestThreshold: 1000, // 1 second
  };
  
  private responseTimes: number[] = [];
  private readonly maxResponseTimes = 50; // Keep last 50 response times (reduced from 1000)

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordRequest(responseTime: number, isError: boolean = false) {
    this.metrics.requestCount++;
    this.metrics.totalResponseTime += responseTime;
    
    // Keep track of recent response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimes) {
      this.responseTimes.shift();
    }
    
    // Calculate average response time
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.requestCount;
    
    // Track errors
    if (isError) {
      this.metrics.errorCount++;
    }
    this.metrics.errorRate = this.metrics.errorCount / this.metrics.requestCount;
    
    // Track slow requests
    if (responseTime > this.metrics.slowRequestThreshold) {
      this.metrics.slowRequestCount++;
    }
    
    // Update memory usage less frequently to save resources
    if (this.metrics.requestCount % 10 === 0) {
      this.metrics.memoryUsage = process.memoryUsage();
    }
  }

  incrementActiveRequests() {
    this.metrics.activeRequests++;
  }

  decrementActiveRequests() {
    this.metrics.activeRequests = Math.max(0, this.metrics.activeRequests - 1);
  }

  getMetrics(): PerformanceMetrics & {
    percentiles: {
      p50: number;
      p95: number;
      p99: number;
    };
  } {
    const sortedResponseTimes = [...this.responseTimes].sort((a, b) => a - b);
    const length = sortedResponseTimes.length;
    
    const percentiles = {
      p50: length > 0 ? sortedResponseTimes[Math.floor(length * 0.5)] : 0,
      p95: length > 0 ? sortedResponseTimes[Math.floor(length * 0.95)] : 0,
      p99: length > 0 ? sortedResponseTimes[Math.floor(length * 0.99)] : 0,
    };
    
    return {
      ...this.metrics,
      percentiles,
    };
  }

  reset() {
    this.metrics = {
      requestCount: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      errorCount: 0,
      errorRate: 0,
      activeRequests: 0,
      memoryUsage: process.memoryUsage(),
      slowRequestCount: 0,
      slowRequestThreshold: 1000,
    };
    this.responseTimes = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Express middleware for performance monitoring
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  performanceMonitor.incrementActiveRequests();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    
    performanceMonitor.recordRequest(responseTime, isError);
    performanceMonitor.decrementActiveRequests();
    
    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    // Call original end method
    originalEnd.call(res, chunk, encoding);
  };
  
  next();
};

// Middleware to add performance headers
export const performanceHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    res.set('X-Response-Time', `${responseTime}ms`);
    res.set('X-Request-ID', req.headers['x-request-id'] as string || 'unknown');
  });
  
  next();
};

// Memory monitoring
export const memoryMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  
  // Log memory warnings
  if (heapUsedMB > 500) { // 500MB threshold
    console.warn(`High memory usage: ${heapUsedMB}MB`);
  }
  
  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.set('X-Memory-Usage', `${heapUsedMB}MB`);
  }
  
  next();
};

// Request timeout middleware
export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: `Request took longer than ${timeoutMs}ms`,
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => {
      clearTimeout(timeout);
    });
    
    next();
  };
};

// Circuit breaker pattern for external services
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

export const circuitBreaker = new CircuitBreaker();

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random()}`;
  
  // Add request ID to request object
  (req as any).requestId = requestId;
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: (req as any).user?.claims?.sub,
    };
    
    // Log to console or external service
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logData));
    } else {
      console.log(`${logData.method} ${logData.url} ${logData.statusCode} - ${logData.responseTime}ms`);
    }
  });
  
  next();
};