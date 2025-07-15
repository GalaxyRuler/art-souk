/**
 * Simple Development Tools that work without external dependencies
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class SimpleDevTools {
  constructor() {
    this.startTime = Date.now();
    this.requests = [];
    this.errors = [];
  }

  // Get current system status
  getSystemStatus() {
    const memUsage = process.memoryUsage();
    const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    return {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        heapPercent: heapPercent,
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        loadAverage: os.loadavg().map(avg => Math.round(avg * 100) / 100),
        freeMem: Math.round(os.freemem() / 1024 / 1024),
        totalMem: Math.round(os.totalmem() / 1024 / 1024)
      },
      alerts: heapPercent > 90 ? ['CRITICAL: Memory usage above 90%'] : 
              heapPercent > 80 ? ['WARNING: Memory usage above 80%'] : []
    };
  }

  // Track request performance
  trackRequest(method, url, duration, statusCode) {
    const request = {
      method,
      url,
      duration,
      statusCode,
      timestamp: new Date().toISOString()
    };
    
    this.requests.push(request);
    
    // Keep only last 100 requests
    if (this.requests.length > 100) {
      this.requests.shift();
    }
    
    // Track errors
    if (statusCode >= 400) {
      this.errors.push(request);
      if (this.errors.length > 50) {
        this.errors.shift();
      }
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const recentRequests = this.requests.slice(-50);
    const totalRequests = recentRequests.length;
    
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowRequests: 0,
        errors: []
      };
    }
    
    const totalDuration = recentRequests.reduce((sum, req) => sum + req.duration, 0);
    const avgResponseTime = Math.round(totalDuration / totalRequests);
    const errorCount = recentRequests.filter(req => req.statusCode >= 400).length;
    const slowRequests = recentRequests.filter(req => req.duration > 1000).length;
    
    return {
      totalRequests,
      averageResponseTime: avgResponseTime,
      errorRate: Math.round((errorCount / totalRequests) * 100),
      slowRequests,
      errors: this.errors.slice(-10)
    };
  }

  // Simple code analysis
  analyzeCode() {
    const projectRoot = path.join(__dirname, '..');
    let tsFiles = 0;
    let jsFiles = 0;
    let totalSize = 0;
    
    const scanDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          if (file.startsWith('.') || file === 'node_modules') continue;
          
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (stat.isFile()) {
            totalSize += stat.size;
            
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
              tsFiles++;
            } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
              jsFiles++;
            }
          }
        }
      } catch (err) {
        // Skip directories we can't read
      }
    };
    
    scanDir(projectRoot);
    
    return {
      typeScriptFiles: tsFiles,
      javaScriptFiles: jsFiles,
      totalSize: Math.round(totalSize / 1024), // KB
      totalFiles: tsFiles + jsFiles
    };
  }

  // Generate development report
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      system: this.getSystemStatus(),
      performance: this.getPerformanceSummary(),
      code: this.analyzeCode(),
      recommendations: this.generateRecommendations()
    };
  }

  // Generate recommendations based on current state
  generateRecommendations() {
    const recommendations = [];
    const system = this.getSystemStatus();
    const performance = this.getPerformanceSummary();
    
    if (system.memory.heapPercent > 90) {
      recommendations.push('CRITICAL: Memory usage is very high - consider restarting the application');
    } else if (system.memory.heapPercent > 80) {
      recommendations.push('WARNING: Memory usage is high - monitor for memory leaks');
    }
    
    if (performance.averageResponseTime > 500) {
      recommendations.push('Performance issue: Average response time is high');
    }
    
    if (performance.errorRate > 10) {
      recommendations.push('Quality issue: Error rate is above 10%');
    }
    
    if (performance.slowRequests > 5) {
      recommendations.push('Performance issue: Too many slow requests (>1000ms)');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System is running smoothly');
    }
    
    return recommendations;
  }

  // Express middleware
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.trackRequest(req.method, req.url, duration, res.statusCode);
      });
      
      next();
    };
  }
}

module.exports = new SimpleDevTools();