import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

// In-memory cache for development (replace with Redis in production)
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expires = Date.now() + ttl;
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Clean up expired cache entries every 5 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 5 * 60 * 1000);

// Cache middleware factory
export function cacheMiddleware(options: {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
  skipCache?: (req: Request) => boolean;
} = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    keyGenerator = (req: Request) => `${req.method}:${req.originalUrl}`,
    condition = () => true,
    skipCache = () => false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for authenticated users or specific conditions
    if (skipCache(req) || !condition(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      // Add cache hit header
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, data, ttl);
      }
      
      // Add cache miss header
      res.set('X-Cache', 'MISS');
      res.set('X-Cache-Key', cacheKey);
      
      return originalJson.call(this, data);
    };

    next();
  };
}

// Specific cache configurations for different endpoints
export const cacheConfigs = {
  // Long-term cache for static content
  static: cacheMiddleware({
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    keyGenerator: (req) => `static:${req.originalUrl}`,
  }),

  // Short-term cache for frequently accessed data
  shortTerm: cacheMiddleware({
    ttl: 5 * 60 * 1000, // 5 minutes
    keyGenerator: (req) => `short:${req.originalUrl}`,
  }),

  // Medium-term cache for less frequently changing data
  mediumTerm: cacheMiddleware({
    ttl: 30 * 60 * 1000, // 30 minutes
    keyGenerator: (req) => `medium:${req.originalUrl}`,
  }),

  // User-specific cache
  userSpecific: cacheMiddleware({
    ttl: 5 * 60 * 1000, // 5 minutes
    keyGenerator: (req) => {
      const userId = (req as any).user?.claims?.sub || 'anonymous';
      return `user:${userId}:${req.originalUrl}`;
    },
    condition: (req) => !!(req as any).user,
  }),

  // Public data cache (safe for all users)
  publicData: cacheMiddleware({
    ttl: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => `public:${req.originalUrl}`,
    skipCache: (req) => req.method !== 'GET',
  }),

  // Search results cache
  searchResults: cacheMiddleware({
    ttl: 10 * 60 * 1000, // 10 minutes
    keyGenerator: (req) => {
      const query = new URLSearchParams(req.query as any).toString();
      return `search:${createHash('md5').update(query).digest('hex')}`;
    },
    condition: (req) => Object.keys(req.query).length > 0,
  }),

  // Artwork data cache
  artworkData: cacheMiddleware({
    ttl: 20 * 60 * 1000, // 20 minutes
    keyGenerator: (req) => `artwork:${req.params.id}`,
    condition: (req) => !!req.params.id,
  }),

  // Artist/Gallery profile cache
  profileData: cacheMiddleware({
    ttl: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => `profile:${req.params.id}:${req.originalUrl}`,
    condition: (req) => !!req.params.id,
  }),
};

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate specific cache key
  invalidateKey: (key: string) => {
    memoryCache.delete(key);
  },

  // Invalidate all cache entries matching a pattern
  invalidatePattern: (pattern: string) => {
    const regex = new RegExp(pattern);
    for (const key of memoryCache['cache'].keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  },

  // Invalidate user-specific cache
  invalidateUser: (userId: string) => {
    cacheInvalidation.invalidatePattern(`user:${userId}:`);
  },

  // Invalidate artwork-related cache
  invalidateArtwork: (artworkId: string | number) => {
    cacheInvalidation.invalidatePattern(`artwork:${artworkId}`);
    cacheInvalidation.invalidatePattern(`public:.*artworks`);
  },

  // Invalidate artist-related cache
  invalidateArtist: (artistId: string | number) => {
    cacheInvalidation.invalidatePattern(`profile:${artistId}`);
    cacheInvalidation.invalidatePattern(`public:.*artists`);
  },

  // Invalidate gallery-related cache
  invalidateGallery: (galleryId: string | number) => {
    cacheInvalidation.invalidatePattern(`profile:${galleryId}`);
    cacheInvalidation.invalidatePattern(`public:.*galleries`);
  },

  // Clear all cache
  clearAll: () => {
    memoryCache.clear();
  },
};

// Cache warming helpers
export const cacheWarming = {
  // Warm up frequently accessed data
  warmUpFrequentData: async () => {
    // This would typically make requests to frequently accessed endpoints
    // to populate the cache proactively
    console.log('Cache warming not implemented - would pre-populate frequent data');
  },

  // Warm up user-specific data
  warmUpUserData: async (userId: string) => {
    // Pre-populate user-specific data
    console.log(`Cache warming for user ${userId} not implemented`);
  },
};

// Cache statistics
export const cacheStats = {
  getStats: () => {
    const cache = memoryCache['cache'];
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [, item] of cache.entries()) {
      if (now > item.expires) {
        expiredCount++;
      }
    }
    
    return {
      totalEntries: cache.size,
      expiredEntries: expiredCount,
      activeEntries: cache.size - expiredCount,
      memoryUsage: JSON.stringify(Object.fromEntries(cache.entries())).length,
    };
  },
};

// Response compression middleware
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set appropriate compression headers
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.set('Content-Encoding', 'gzip');
  }
  
  next();
};

// ETag middleware for conditional requests
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    const etag = createHash('md5').update(JSON.stringify(data)).digest('hex');
    res.set('ETag', `"${etag}"`);
    
    // Check if client has current version
    if (req.headers['if-none-match'] === `"${etag}"`) {
      return res.status(304).end();
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};