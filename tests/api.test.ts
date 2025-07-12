import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

describe('API Endpoints Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe('Health Check Endpoints', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return database health', async () => {
      const response = await request(app)
        .get('/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'database');
    });

    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('ready');
    });

    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('alive', true);
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Public API Endpoints', () => {
    it('should return featured artworks', async () => {
      const response = await request(app)
        .get('/api/artworks/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return featured artists', async () => {
      const response = await request(app)
        .get('/api/artists/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return featured collections', async () => {
      const response = await request(app)
        .get('/api/collections/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return live auctions', async () => {
      const response = await request(app)
        .get('/api/auctions/live')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return curators picks', async () => {
      const response = await request(app)
        .get('/api/artworks/curators-picks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Artist API Endpoints', () => {
    it('should return artist profile', async () => {
      const response = await request(app)
        .get('/api/artists/97')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
    });

    it('should return artist artworks', async () => {
      const response = await request(app)
        .get('/api/artists/97/artworks')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return artist exhibitions', async () => {
      const response = await request(app)
        .get('/api/artists/97/exhibitions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle non-existent artist', async () => {
      const response = await request(app)
        .get('/api/artists/999999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Search API Endpoints', () => {
    it('should handle search queries', async () => {
      const response = await request(app)
        .get('/api/search?q=art')
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should handle empty search queries', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(200);

      expect(response.body).toHaveProperty('results');
    });

    it('should handle advanced search filters', async () => {
      const response = await request(app)
        .get('/api/search?category=painting&minPrice=100&maxPrice=1000')
        .expect(200);

      expect(response.body).toHaveProperty('results');
    });
  });

  describe('Workshop API Endpoints', () => {
    it('should return workshops', async () => {
      const response = await request(app)
        .get('/api/workshops')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return featured workshops', async () => {
      const response = await request(app)
        .get('/api/workshops/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Event API Endpoints', () => {
    it('should return events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return featured events', async () => {
      const response = await request(app)
        .get('/api/events/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/user/roles')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle method not allowed', async () => {
      const response = await request(app)
        .delete('/api/artworks/featured')
        .expect(405);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Response Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/artworks/featured')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should include performance headers', async () => {
      const response = await request(app)
        .get('/api/artworks/featured')
        .expect(200);

      expect(response.headers).toHaveProperty('x-response-time');
    });

    it('should include caching headers for appropriate endpoints', async () => {
      const response = await request(app)
        .get('/api/artworks/featured')
        .expect(200);

      // Check for cache-related headers
      expect(response.headers).toHaveProperty('etag');
    });
  });
});

describe('Database Integration Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should handle database connectivity', async () => {
    const response = await request(app)
      .get('/health/db')
      .expect(200);

    expect(response.body.status).toBe('healthy');
  });

  it('should return real data from database', async () => {
    const response = await request(app)
      .get('/api/artworks/featured')
      .expect(200);

    // Verify we're getting real data, not mock data
    expect(Array.isArray(response.body)).toBe(true);
    
    if (response.body.length > 0) {
      const artwork = response.body[0];
      expect(artwork).toHaveProperty('id');
      expect(artwork).toHaveProperty('title');
      expect(typeof artwork.id).toBe('number');
    }
  });
});

describe('Performance and Load Tests', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 100;
    const promises = Array.from({ length: concurrentRequests }, () =>
      request(app).get('/api/artworks/featured')
    );

    const start = Date.now();
    const responses = await Promise.all(promises);
    const duration = Date.now() - start;

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Should complete within reasonable time
    expect(duration).toBeLessThan(10000); // 10 seconds
  });

  it('should maintain consistent response times', async () => {
    const requests = 20;
    const responseTimes: number[] = [];

    for (let i = 0; i < requests; i++) {
      const start = Date.now();
      await request(app).get('/api/artworks/featured').expect(200);
      const duration = Date.now() - start;
      responseTimes.push(duration);
    }

    // Calculate average response time
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    // Should maintain reasonable average response time
    expect(avgResponseTime).toBeLessThan(500); // 500ms average
  });
});