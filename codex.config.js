
// Codex Configuration for Art Souk
export default {
  name: 'art-souk',
  runtime: 'nodejs-20',
  buildCommand: 'npm run build',
  startCommand: 'npm run codex:start',
  port: 5000,
  host: '0.0.0.0',
  
  // Environment setup
  environment: {
    NODE_ENV: 'development',
    PORT: '5000',
    APP_URL: 'http://localhost:5000'
  },
  
  // Health check endpoint
  healthCheck: {
    path: '/health',
    interval: 30,
    timeout: 10
  },
  
  // File watching for development
  watch: {
    patterns: [
      'client/src/**/*',
      'server/**/*',
      'packages/**/*'
    ],
    ignored: [
      'node_modules',
      'dist',
      '.turbo',
      '*.log'
    ]
  },
  
  // Database configuration
  database: {
    type: 'postgresql',
    version: '16',
    name: 'artsouk'
  },
  
  // Static file serving
  static: {
    '/': 'client/dist',
    '/assets': 'client/dist/assets'
  }
}
