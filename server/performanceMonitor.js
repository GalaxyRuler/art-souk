/**
 * Simple Performance Monitor for Art Souk
 * Monitors memory, response times, and system health without external dependencies
 */

const os = require('os');
const process = require('process');

class PerformanceMonitor {
  constructor() {
    this.requestMetrics = new Map();
    this.memoryAlerts = [];
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
  }

  // Track request performance
  trackRequest(method, path, duration, statusCode, error = null) {
    const key = `${method} ${path}`;
    
    if (!this.requestMetrics.has(key)) {
      this.requestMetrics.set(key, {
        count: 0,
        totalDuration: 0,
        errors: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity
      });
    }

    const metrics = this.requestMetrics.get(key);
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.avgDuration = metrics.totalDuration / metrics.count;
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.minDuration = Math.min(metrics.minDuration, duration);

    if (error || statusCode >= 400) {
      metrics.errors++;
      this.errorCount++;
    }

    this.requestCount++;

    // Alert for slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request detected: ${method} ${path} - ${duration}ms`);
    }
  }

  // Get memory usage
  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      heap: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      system: {
        used: Math.round(usedMem / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        percentage: Math.round((usedMem / totalMem) * 100)
      }
    };
  }

  // Check if memory usage is high
  checkMemoryHealth() {
    const memory = this.getMemoryUsage();

    // Skip alerts during startup when the heap is still sizing itself
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    if (uptimeSeconds < 30) {
      return memory;
    }
    
    if (memory.heap.percentage > 90) {
      const alert = `🚨 Critical memory usage: ${memory.heap.percentage}% heap used`;
      console.error(alert);
      this.memoryAlerts.push({ level: 'critical', message: alert, time: new Date() });
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🗑️ Garbage collection triggered');
      }
    } else if (memory.heap.percentage > 80) {
      const alert = `⚠️ High memory usage: ${memory.heap.percentage}% heap used`;
      console.warn(alert);
      this.memoryAlerts.push({ level: 'warning', message: alert, time: new Date() });
    }

    return memory;
  }

  // Get system health report
  getHealthReport() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const memory = this.getMemoryUsage();
    const loadAvg = os.loadavg();

    return {
      uptime: {
        seconds: uptime,
        formatted: this.formatUptime(uptime)
      },
      memory,
      cpu: {
        loadAverage: loadAvg.map(avg => Math.round(avg * 100) / 100),
        cores: os.cpus().length
      },
      requests: {
        total: this.requestCount,
        errors: this.errorCount,
        errorRate: this.requestCount > 0 ? Math.round((this.errorCount / this.requestCount) * 100) : 0
      },
      recentAlerts: this.memoryAlerts.slice(-10)
    };
  }

  // Format uptime in human readable format
  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  // Get top slow endpoints
  getSlowEndpoints(limit = 10) {
    return Array.from(this.requestMetrics.entries())
      .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
      .slice(0, limit)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgDuration: Math.round(metrics.avgDuration),
        maxDuration: metrics.maxDuration,
        count: metrics.count,
        errorRate: Math.round((metrics.errors / metrics.count) * 100)
      }));
  }

  // Performance middleware for Express
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Check memory health on each request
      this.checkMemoryHealth();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.trackRequest(req.method, req.path, duration, res.statusCode);
      });

      next();
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;