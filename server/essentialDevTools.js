/**
 * Essential Development Tools for Art Souk
 * Real tools that work without external dependencies
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class EssentialDevTools {
  constructor() {
    this.startTime = Date.now();
    this.requestMetrics = new Map();
    this.errorLog = [];
    this.performanceAlerts = [];
  }

  // Database health monitoring
  async checkDatabaseHealth() {
    try {
      const { db } = require('./db');
      const start = Date.now();
      
      // Simple health check query
      const result = await db.execute('SELECT 1 as health_check');
      const duration = Date.now() - start;
      
      return {
        healthy: true,
        responseTime: duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Memory monitoring with alerts
  getMemoryStatus() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    const status = {
      heap: {
        used: heapUsedMB,
        total: heapTotalMB,
        percentage: heapPercentage
      },
      system: {
        used: Math.round((totalMem - freeMem) / 1024 / 1024),
        total: Math.round(totalMem / 1024 / 1024),
        free: Math.round(freeMem / 1024 / 1024)
      },
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    };

    // Generate alerts for high memory usage
    if (heapPercentage > 90) {
      this.addAlert('CRITICAL', `Memory usage critical: ${heapPercentage}%`);
    } else if (heapPercentage > 80) {
      this.addAlert('WARNING', `Memory usage high: ${heapPercentage}%`);
    }

    return status;
  }

  // Performance tracking
  trackRequest(method, path, duration, statusCode, error = null) {
    const key = `${method} ${path}`;
    
    if (!this.requestMetrics.has(key)) {
      this.requestMetrics.set(key, {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        errors: 0,
        lastRequest: null
      });
    }

    const metrics = this.requestMetrics.get(key);
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.avgDuration = Math.round(metrics.totalDuration / metrics.count);
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.minDuration = Math.min(metrics.minDuration, duration);
    metrics.lastRequest = new Date().toISOString();

    if (error || statusCode >= 400) {
      metrics.errors++;
      this.errorLog.push({
        method,
        path,
        statusCode,
        error: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    // Alert for slow requests
    if (duration > 1000) {
      this.addAlert('PERFORMANCE', `Slow request: ${method} ${path} - ${duration}ms`);
    }
  }

  // Error tracking
  addAlert(level, message) {
    const alert = {
      level,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.performanceAlerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.performanceAlerts.length > 100) {
      this.performanceAlerts.shift();
    }

    // Log to console based on level
    if (level === 'CRITICAL') {
      console.error(`🚨 ${message}`);
    } else if (level === 'WARNING') {
      console.warn(`⚠️ ${message}`);
    } else {
      console.log(`ℹ️ ${message}`);
    }
  }

  // Code analysis
  analyzeProject() {
    const projectRoot = path.join(__dirname, '..');
    const analysis = {
      files: {
        typescript: 0,
        javascript: 0,
        react: 0,
        css: 0,
        json: 0,
        other: 0
      },
      directories: {
        client: 0,
        server: 0,
        shared: 0,
        total: 0
      },
      size: {
        totalBytes: 0,
        averageFileSize: 0
      }
    };

    const scanDirectory = (dir, depth = 0) => {
      if (depth > 5) return; // Prevent infinite recursion
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules') continue;
          
          const fullPath = path.join(dir, item);
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            analysis.directories.total++;
            
            if (item === 'client') analysis.directories.client++;
            else if (item === 'server') analysis.directories.server++;
            else if (item === 'shared') analysis.directories.shared++;
            
            scanDirectory(fullPath, depth + 1);
          } else if (stats.isFile()) {
            analysis.size.totalBytes += stats.size;
            
            if (item.endsWith('.ts') || item.endsWith('.tsx')) {
              analysis.files.typescript++;
              if (item.endsWith('.tsx')) analysis.files.react++;
            } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
              analysis.files.javascript++;
              if (item.endsWith('.jsx')) analysis.files.react++;
            } else if (item.endsWith('.css')) {
              analysis.files.css++;
            } else if (item.endsWith('.json')) {
              analysis.files.json++;
            } else {
              analysis.files.other++;
            }
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    scanDirectory(projectRoot);
    
    const totalFiles = Object.values(analysis.files).reduce((a, b) => a + b, 0);
    analysis.size.averageFileSize = totalFiles > 0 ? Math.round(analysis.size.totalBytes / totalFiles) : 0;
    analysis.size.totalMB = Math.round(analysis.size.totalBytes / 1024 / 1024);

    return analysis;
  }

  // Get comprehensive development report
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(process.uptime()),
        formatted: this.formatUptime(process.uptime())
      },
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        loadAverage: os.loadavg().map(avg => Math.round(avg * 100) / 100)
      },
      memory: this.getMemoryStatus(),
      database: await this.checkDatabaseHealth(),
      performance: {
        totalRequests: Array.from(this.requestMetrics.values()).reduce((sum, m) => sum + m.count, 0),
        totalErrors: this.errorLog.length,
        slowestEndpoints: this.getSlowEndpoints(5),
        recentAlerts: this.performanceAlerts.slice(-10)
      },
      project: this.analyzeProject()
    };

    return report;
  }

  // Format uptime
  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  }

  // Get slowest endpoints
  getSlowEndpoints(limit = 10) {
    return Array.from(this.requestMetrics.entries())
      .sort((a, b) => b[1].avgDuration - a[1].avgDuration)
      .slice(0, limit)
      .map(([endpoint, metrics]) => ({
        endpoint,
        avgDuration: metrics.avgDuration,
        maxDuration: metrics.maxDuration,
        count: metrics.count,
        errorRate: metrics.count > 0 ? Math.round((metrics.errors / metrics.count) * 100) : 0
      }));
  }

  // Simple benchmark tool
  async benchmark(url, iterations = 5) {
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      try {
        const response = await fetch(url);
        const duration = Date.now() - start;
        
        results.push({
          iteration: i + 1,
          duration,
          status: response.status,
          success: response.ok
        });
      } catch (error) {
        results.push({
          iteration: i + 1,
          duration: Date.now() - start,
          status: 'ERROR',
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success);
    const avgDuration = successful.length > 0 ? 
      successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0;

    return {
      url,
      iterations,
      successful: successful.length,
      failed: results.length - successful.length,
      averageDuration: Math.round(avgDuration),
      results
    };
  }

  // Express middleware
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.trackRequest(req.method, req.path, duration, res.statusCode);
      });

      next();
    };
  }
}

// Create singleton instance
const devTools = new EssentialDevTools();

module.exports = devTools;