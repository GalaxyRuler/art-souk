import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

// Cache instances with different TTL and cleanup policies
export const cacheInstances = {
  // Short-lived cache for frequently accessed data
  short: new NodeCache({ 
    stdTTL: 300, // 5 minutes
    checkperiod: 60, // Check for expired keys every minute
    useClones: false, // Don't clone objects for better performance
    maxKeys: 1000 // Limit cache size
  }),
  
  // Medium-lived cache for less frequently changing data
  medium: new NodeCache({ 
    stdTTL: 1800, // 30 minutes
    checkperiod: 300, // Check every 5 minutes
    useClones: false,
    maxKeys: 500
  }),
  
  // Long-lived cache for static data
  long: new NodeCache({ 
    stdTTL: 3600, // 1 hour
    checkperiod: 600, // Check every 10 minutes
    useClones: false,
    maxKeys: 200
  }),
  
  // User-specific cache
  user: new NodeCache({ 
    stdTTL: 900, // 15 minutes
    checkperiod: 120, // Check every 2 minutes
    useClones: false,
    maxKeys: 2000
  })
};

// Cache key generators
export const cacheKeys = {
  artwork: (id: number) => `artwork:${id}`,
  artworks: (filters: any) => `artworks:${JSON.stringify(filters)}`,
  artist: (id: number) => `artist:${id}`,
  gallery: (id: number) => `gallery:${id}`,
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user_profile:${id}`,
  search: (query: string, filters: any) => `search:${query}:${JSON.stringify(filters)}`,
  featured: (type: string) => `featured:${type}`,
  stats: (type: string) => `stats:${type}`,
  analytics: (userId: string, type: string) => `analytics:${userId}:${type}`
};

// Cache optimization middleware
export const optimizedCacheMiddleware = (cacheType: keyof typeof cacheInstances, keyGenerator: (req: Request) => string, ttl?: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cache = cacheInstances[cacheType];
    const key = keyGenerator(req);
    
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Cache invalidation utilities
export const cacheInvalidation = {
  // Invalidate all caches related to a specific artwork
  artwork: (artworkId: number) => {
    const patterns = [
      `artwork:${artworkId}`,
      'artworks:',
      'featured:artworks',
      'stats:artworks'
    ];
    
    Object.values(cacheInstances).forEach(cache => {
      cache.keys().forEach(key => {
        if (patterns.some(pattern => key.includes(pattern))) {
          cache.del(key);
        }
      });
    });
  },
  
  // Invalidate user-specific caches
  user: (userId: string) => {
    const patterns = [
      `user:${userId}`,
      `user_profile:${userId}`,
      `analytics:${userId}`
    ];
    
    patterns.forEach(pattern => {
      cacheInstances.user.del(pattern);
    });
  },
  
  // Invalidate search caches
  search: () => {
    cacheInstances.short.keys().forEach(key => {
      if (key.startsWith('search:')) {
        cacheInstances.short.del(key);
      }
    });
  },
  
  // Clear all caches
  all: () => {
    Object.values(cacheInstances).forEach(cache => {
      cache.flushAll();
    });
  }
};

// Cache statistics and monitoring
export const getCacheStats = () => {
  const stats = Object.entries(cacheInstances).map(([name, cache]) => ({
    name,
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) * 100
  }));
  
  return stats;
};

// Automatic cache cleanup
export const startCacheCleanup = () => {
  setInterval(() => {
    Object.entries(cacheInstances).forEach(([name, cache]) => {
      const stats = cache.getStats();
      const keys = cache.keys();
      
      // If cache is getting too full, clear least recently used items
      if (keys.length > cache.options.maxKeys * 0.8) {
        console.log(`🧹 Cleaning cache ${name}: ${keys.length} items`);
        
        // Clear 20% of items
        const itemsToRemove = Math.floor(keys.length * 0.2);
        keys.slice(0, itemsToRemove).forEach(key => {
          cache.del(key);
        });
      }
    });
  }, 10 * 60 * 1000); // Run every 10 minutes
};

// Memory-aware cache middleware
export const memoryAwareCacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  
  // If memory usage is high, clear some caches
  if (heapPercentage > 80) {
    console.log(`🧹 High memory usage detected (${heapPercentage}%), clearing short-lived caches`);
    cacheInstances.short.flushAll();
    
    if (heapPercentage > 90) {
      console.log(`🧹 Critical memory usage (${heapPercentage}%), clearing medium caches`);
      cacheInstances.medium.flushAll();
    }
  }
  
  next();
};