#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom route extraction function (instead of express-list-endpoints)
function extractRoutesFromApp() {
  const routes = [];
  
  // Read the main routes file
  const routesPath = join(__dirname, '../server/routes.ts');
  const routesContent = readFileSync(routesPath, 'utf8');
  
  // Extract routes using regex patterns
  const routeRegex = /app\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = routeRegex.exec(routesContent)) !== null) {
    const method = match[1].toUpperCase();
    const path = match[2];
    routes.push({ method, path });
  }
  
  // Check for additional route files
  const additionalRouteFiles = [
    '../server/routes/admin.ts',
    '../server/routes/seller.ts'
  ];
  
  additionalRouteFiles.forEach(filePath => {
    const fullPath = join(__dirname, filePath);
    try {
      const content = readFileSync(fullPath, 'utf8');
      const routeRegex = /app\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = routeRegex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        routes.push({ method, path });
      }
    } catch (err) {
      // File doesn't exist, skip
    }
  });
  
  // Add some common routes that might be defined elsewhere
  const commonRoutes = [
    { method: 'GET', path: '/health' },
    { method: 'GET', path: '/health/db' },
    { method: 'GET', path: '/health/memory' },
    { method: 'GET', path: '/health/ready' },
    { method: 'GET', path: '/health/live' },
    { method: 'GET', path: '/health/performance' },
    { method: 'GET', path: '/health/cache' },
    { method: 'GET', path: '/health/database' },
    { method: 'GET', path: '/health/memory-trend' }
  ];
  
  routes.push(...commonRoutes);
  
  return routes;
}

// Recursively scan directory for files
function scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function scan(currentDir) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scan(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// Extract API calls from client files
function extractApiCalls(clientDir) {
  const files = scanDirectory(clientDir);
  const apiCalls = [];
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');
      
      // Match fetch calls with API URLs
      const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = fetchRegex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('/api/') || url.startsWith('/health')) {
          apiCalls.push({ url, file: file.replace(process.cwd() + '/', '') });
        }
      }
      
      // Match axios calls
      const axiosRegex = /axios\s*\(\s*['"`]([^'"`]+)['"`]/g;
      while ((match = axiosRegex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('/api/') || url.startsWith('/health')) {
          apiCalls.push({ url, file: file.replace(process.cwd() + '/', '') });
        }
      }
      
      // Match axios.get, axios.post, etc.
      const axiosMethodRegex = /axios\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      while ((match = axiosMethodRegex.exec(content)) !== null) {
        const url = match[2];
        if (url.startsWith('/api/') || url.startsWith('/health')) {
          apiCalls.push({ url, file: file.replace(process.cwd() + '/', '') });
        }
      }
      
      // Match useQuery calls with API URLs
      const useQueryRegex = /useQuery\s*\(\s*{\s*queryKey:\s*\[\s*['"`]([^'"`]+)['"`]/g;
      while ((match = useQueryRegex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('/api/') || url.startsWith('/health')) {
          apiCalls.push({ url, file: file.replace(process.cwd() + '/', '') });
        }
      }
      
      // Match apiRequest calls
      const apiRequestRegex = /apiRequest\s*\(\s*['"`]([^'"`]+)['"`]/g;
      while ((match = apiRequestRegex.exec(content)) !== null) {
        const url = match[1];
        if (url.startsWith('/api/') || url.startsWith('/health')) {
          apiCalls.push({ url, file: file.replace(process.cwd() + '/', '') });
        }
      }
    } catch (err) {
      console.warn(`Warning: Could not read file ${file}`);
    }
  }
  
  return apiCalls;
}

// Normalize URL by removing query parameters and path parameters
function normalizeUrl(url) {
  // Remove query parameters
  const withoutQuery = url.split('?')[0];
  
  // Handle template literals and dynamic segments
  const withoutTemplates = withoutQuery
    .replace(/\$\{[^}]+\}/g, ':param')  // ${id} -> :param
    .replace(/\/\d+/g, '/:param')       // /123 -> /:param
    .replace(/\/:[^/]+/g, '/:param');   // /:id -> /:param
  
  return withoutTemplates;
}

// Check if client URL matches any server route
function findMatchingRoute(clientUrl, serverRoutes) {
  const normalizedClient = normalizeUrl(clientUrl);
  
  for (const route of serverRoutes) {
    const normalizedServer = normalizeUrl(route.path);
    
    if (normalizedClient === normalizedServer) {
      return route;
    }
    
    // Check if it's a parameterized route match
    const serverParts = normalizedServer.split('/');
    const clientParts = normalizedClient.split('/');
    
    if (serverParts.length === clientParts.length) {
      let matches = true;
      for (let i = 0; i < serverParts.length; i++) {
        if (serverParts[i] !== clientParts[i] && 
            serverParts[i] !== ':param' && 
            clientParts[i] !== ':param') {
          matches = false;
          break;
        }
      }
      if (matches) {
        return route;
      }
    }
  }
  
  return null;
}

// Main function
function main() {
  console.log('🔍 Checking frontend API calls against backend routes...\n');
  
  // Extract server routes
  const serverRoutes = extractRoutesFromApp();
  console.log(`📊 Found ${serverRoutes.length} server routes`);
  
  // Extract client API calls
  const clientDir = join(__dirname, '../client');
  const apiCalls = extractApiCalls(clientDir);
  console.log(`📱 Found ${apiCalls.length} API calls in client code`);
  
  // Get unique client URLs
  const uniqueClientUrls = [...new Set(apiCalls.map(call => call.url))];
  console.log(`🔗 Found ${uniqueClientUrls.length} unique API endpoints called from client\n`);
  
  // Check for mismatches
  const mismatches = [];
  
  for (const clientUrl of uniqueClientUrls) {
    const matchingRoute = findMatchingRoute(clientUrl, serverRoutes);
    if (!matchingRoute) {
      const callsToThisUrl = apiCalls.filter(call => call.url === clientUrl);
      mismatches.push({
        url: clientUrl,
        files: callsToThisUrl.map(call => call.file)
      });
    }
  }
  
  if (mismatches.length > 0) {
    console.log('❌ Found mismatched endpoints:\n');
    
    mismatches.forEach(mismatch => {
      console.log(`🚨 ${mismatch.url}`);
      console.log(`   Called from: ${mismatch.files.join(', ')}`);
      console.log('');
    });
    
    console.log(`\n💡 Summary: ${mismatches.length} endpoints called from frontend but not found in backend routes`);
    console.log('\n📋 Available server routes:');
    serverRoutes.forEach(route => {
      console.log(`   ${route.method} ${route.path}`);
    });
    
    process.exit(1);
  } else {
    console.log('✅ All frontend API calls match backend routes!');
    console.log('\n📋 Verified endpoints:');
    uniqueClientUrls.forEach(url => {
      const matchingRoute = findMatchingRoute(url, serverRoutes);
      console.log(`   ✓ ${url} -> ${matchingRoute.method} ${matchingRoute.path}`);
    });
  }
}

// Run the check
main();