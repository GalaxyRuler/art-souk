import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced connection pool configuration for production
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for production scalability
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close connections after 30 seconds of inactivity
  connectionTimeoutMillis: 5000, // Wait 5 seconds for a connection
  maxUses: 7500, // Close a connection after 7500 uses
  // Add connection validation
  allowExitOnIdle: false,
});

// Enhanced database connection with better error handling
export const db = drizzle({ client: pool, schema, logger: process.env.NODE_ENV === 'development' });

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
    // Simple query to test connection
    await db.select().from(schema.users).limit(1);
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
    await pool.end();
    console.log('Database connection pool closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
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
