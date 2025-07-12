import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthStatus;
    redis?: HealthStatus;
    memory: HealthStatus;
    disk?: HealthStatus;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  details?: any;
  error?: string;
}

class HealthChecker {
  private static instance: HealthChecker;
  private healthStatus: HealthCheckResult | null = null;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 seconds

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  async checkHealth(force: boolean = false): Promise<HealthCheckResult> {
    const now = Date.now();
    
    // Return cached result if recent and not forced
    if (!force && this.healthStatus && (now - this.lastCheck) < this.checkInterval) {
      return this.healthStatus;
    }

    const startTime = Date.now();
    const checks: HealthCheckResult['checks'] = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
    };

    // Check Redis if available
    try {
      const redisStatus = await this.checkRedis();
      if (redisStatus) {
        checks.redis = redisStatus;
      }
    } catch (error) {
      console.warn('Redis health check failed:', error);
    }

    // Determine overall status
    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    
    if (statuses.every(status => status === 'healthy')) {
      overallStatus = 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    this.healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };

    this.lastCheck = now;
    return this.healthStatus;
  }

  private async checkDatabase(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Simple query to check database connectivity
      await db.select().from(users).limit(1);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        details: {
          connected: true,
          responseTime,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown database error',
        details: {
          connected: false,
        },
      };
    }
  }

  private async checkRedis(): Promise<HealthStatus | null> {
    try {
      // This would need to be implemented based on your Redis setup
      // For now, return null if Redis is not configured
      return null;
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown Redis error',
      };
    }
  }

  private checkMemory(): HealthStatus {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    
    if (memoryPercentage < 70) {
      status = 'healthy';
    } else if (memoryPercentage < 90) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      details: {
        heapUsed: Math.round(usedMemory / 1024 / 1024), // MB
        heapTotal: Math.round(totalMemory / 1024 / 1024), // MB
        memoryPercentage: Math.round(memoryPercentage),
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
    };
  }
}

export const healthChecker = HealthChecker.getInstance();

// Express middleware for health checks
export const healthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const force = req.query.force === 'true';
    const health = await healthChecker.checkHealth(force);
    
    const statusCode = health.status === 'healthy' ? 200 : 
                     health.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check middleware error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
};

// Specific health check endpoints
export const databaseHealthCheck = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    await db.select().from(users).limit(1);
    const responseTime = Date.now() - startTime;
    
    res.json({
      status: 'healthy',
      service: 'database',
      responseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'database',
      error: error instanceof Error ? error.message : 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Check if application is ready to serve requests
    const health = await healthChecker.checkHealth();
    
    if (health.status === 'unhealthy') {
      return res.status(503).json({
        ready: false,
        reason: 'Service unhealthy',
        health,
      });
    }
    
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
      health,
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: 'Readiness check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const livenessCheck = async (req: Request, res: Response) => {
  // Simple liveness check - just verify the process is running
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    pid: process.pid,
  });
};

// Memory monitoring endpoint
export const memoryHealthCheck = (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const heapPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  const status = heapPercentage >= 90 ? 'critical' : 
                 heapPercentage >= 80 ? 'warning' : 'healthy';
  
  res.json({
    status,
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapPercentage,
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
    }
  });
};