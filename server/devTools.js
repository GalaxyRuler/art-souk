/**
 * Development Tools for Art Souk
 * Custom tools to improve development workflow without external dependencies
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class DevTools {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/dev-tools.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
      fs.appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Database utilities
  async testDatabaseConnection() {
    try {
      const { checkDatabaseHealth } = require('./db');
      const health = await checkDatabaseHealth();
      this.log(`Database health check: ${health ? 'HEALTHY' : 'UNHEALTHY'}`);
      return health;
    } catch (error) {
      this.log(`Database connection failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  // File system utilities
  findFiles(directory, extension) {
    const files = [];
    
    function scanDirectory(dir) {
      try {
        const entries = fs.readdirSync(dir);
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
            scanDirectory(fullPath);
          } else if (stat.isFile() && entry.endsWith(extension)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    scanDirectory(directory);
    return files;
  }

  // Code analysis utilities
  analyzeCodebase() {
    const projectRoot = path.join(__dirname, '..');
    const analysis = {
      typeScript: this.findFiles(projectRoot, '.ts').length,
      typeScriptReact: this.findFiles(projectRoot, '.tsx').length,
      javascript: this.findFiles(projectRoot, '.js').length,
      javascriptReact: this.findFiles(projectRoot, '.jsx').length,
      css: this.findFiles(projectRoot, '.css').length,
      total: 0
    };
    
    analysis.total = analysis.typeScript + analysis.typeScriptReact + 
                   analysis.javascript + analysis.javascriptReact + analysis.css;
    
    this.log(`Codebase analysis: ${analysis.total} files (TS: ${analysis.typeScript}, TSX: ${analysis.typeScriptReact}, JS: ${analysis.javascript}, JSX: ${analysis.javascriptReact}, CSS: ${analysis.css})`);
    
    return analysis;
  }

  // Performance testing utilities
  async benchmarkEndpoint(url, iterations = 5) {
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
        
        this.log(`Benchmark ${url} - Iteration ${i + 1}: ${duration}ms (${response.status})`);
      } catch (error) {
        results.push({
          iteration: i + 1,
          duration: Date.now() - start,
          status: 'ERROR',
          success: false,
          error: error.message
        });
        
        this.log(`Benchmark ${url} - Iteration ${i + 1}: ERROR - ${error.message}`, 'ERROR');
      }
    }
    
    const successful = results.filter(r => r.success);
    const avgDuration = successful.length > 0 ? 
      successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0;
    
    const benchmark = {
      url,
      iterations,
      successful: successful.length,
      failed: results.length - successful.length,
      averageDuration: Math.round(avgDuration),
      results
    };
    
    this.log(`Benchmark complete for ${url}: ${successful.length}/${iterations} successful, avg: ${benchmark.averageDuration}ms`);
    
    return benchmark;
  }

  // Quality checks
  async runQualityChecks() {
    const checks = {
      database: await this.testDatabaseConnection(),
      codebase: this.analyzeCodebase(),
      memory: this.checkMemoryUsage(),
      performance: await this.benchmarkEndpoint('http://localhost:3000/health/performance')
    };
    
    this.log('Quality checks completed');
    return checks;
  }

  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const usage = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024)
    };
    
    this.log(`Memory usage: Heap ${usage.heapUsed}/${usage.heapTotal}MB, RSS ${usage.rss}MB`);
    return usage;
  }

  // Generate development report
  async generateDevReport() {
    const report = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      checks: await this.runQualityChecks()
    };
    
    const reportPath = path.join(__dirname, '../logs/dev-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Development report generated: ${reportPath}`);
    return report;
  }

  // Watch for file changes (simple implementation)
  watchFiles(directory, callback) {
    const watched = new Set();
    
    const scanAndWatch = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            scanAndWatch(fullPath);
          } else if (stat.isFile() && !watched.has(fullPath)) {
            watched.add(fullPath);
            
            fs.watchFile(fullPath, (curr, prev) => {
              if (curr.mtime > prev.mtime) {
                callback(fullPath, 'modified');
              }
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };
    
    scanAndWatch(directory);
    this.log(`Watching ${watched.size} files for changes`);
    
    return () => {
      watched.forEach(file => fs.unwatchFile(file));
      watched.clear();
    };
  }
}

// Create singleton instance
const devTools = new DevTools();

module.exports = devTools;