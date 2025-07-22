import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create Neon HTTP client for better compatibility
const sql = neon(process.env.DATABASE_URL);

// Enhanced database connection with better error handling
export const db = drizzle(sql, { schema, logger: process.env.NODE_ENV === 'development' });

// Connection health monitoring
let connectionHealthy = true;
let lastHealthCheck = Date.now();
const healthCheckInterval = 30000; // 30 seconds

export async function checkDatabaseHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Skip if recently checked
  if (connectionHealthy && (now - lastHealthCheck) < healthCheckInterval) {
    return connectionHealthy;
  }
  
  try {
    // Simple query to test connection using raw SQL to avoid type issues
    await sql`SELECT 1 as health_check LIMIT 1`;
    connectionHealthy = true;
    lastHealthCheck = now;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    connectionHealthy = false;
    lastHealthCheck = now;
    return false;
  }
}

// Graceful shutdown handling
export async function closeDatabaseConnection(): Promise<void> {
  try {
    // For Neon serverless, we don't need to explicitly close connections
    // The serverless connection handles cleanup automatically
    console.log('Database connection cleanup completed.');
  } catch (error) {
    console.error('Error during database connection cleanup:', error);
  }
}

// Handle process termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connection...');
  await closeDatabaseConnection();
  process.exit(0);
});
