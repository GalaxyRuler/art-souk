import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../../server/db';
import * as schema from '@shared/schema';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestArtist, createTestArtwork } from '../helpers/testUtils';
import supertest from 'supertest';
import { createServer } from '../../server/routes';

describe('Price Alerts API', () => {
  let app: any;
  let request: supertest.SuperTest<supertest.Test>;
  let testUserId: string;
  let testArtistId: number;
  let testArtworkId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    app = createServer();
    request = supertest(app);
  });

  beforeEach(async () => {
    // Clean slate for each test
    await db.delete(schema.priceAlerts);
    
    // Create test data
    testUserId = await createTestUser();
    testArtistId = await createTestArtist();
    testArtworkId = await createTestArtwork(testArtistId);
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /api/price-alerts', () => {
    it('should return empty alerts for new user', async () => {
      const response = await request
        .get('/api/price-alerts')
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return user price alerts with artist and artwork details', async () => {
      // Create price alert
      await db.insert(schema.priceAlerts).values({
        userId: testUserId,
        artistId: testArtistId,
        artworkId: testArtworkId,
        category: 'Contemporary',
        priceThreshold: '15000.00',
        alertType: 'immediate',
        isActive: true
      });

      const response = await request
        .get('/api/price-alerts')
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        priceThreshold: '15000.00',
        category: 'Contemporary',
        alertType: 'immediate',
        isActive: true,
        artistName: 'Test Artist',
        artworkTitle: 'Test Artwork'
      });
    });

    it('should only return alerts for authenticated user', async () => {
      // Create alerts for different users
      const otherUserId = await createTestUser({ email: 'other@example.com' });
      
      await db.insert(schema.priceAlerts).values([
        {
          userId: testUserId,
          artistId: testArtistId,
          category: 'Contemporary',
          priceThreshold: '10000.00',
          alertType: 'weekly',
          isActive: true
        },
        {
          userId: otherUserId,
          artistId: testArtistId,
          category: 'Modern',
          priceThreshold: '20000.00',
          alertType: 'immediate',
          isActive: true
        }
      ]);

      const response = await request
        .get('/api/price-alerts')
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].priceThreshold).toBe('10000.00');
    });

    it('should require authentication', async () => {
      await request
        .get('/api/price-alerts')
        .expect(401);
    });
  });

  describe('POST /api/price-alerts', () => {
    it('should create new price alert', async () => {
      const alertData = {
        artistId: testArtistId,
        artworkId: testArtworkId,
        category: 'Contemporary',
        priceThreshold: '25000.00',
        alertType: 'daily'
      };

      const response = await request
        .post('/api/price-alerts')
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .send(alertData)
        .expect(201);

      expect(response.body).toMatchObject({
        userId: testUserId,
        artistId: testArtistId,
        artworkId: testArtworkId,
        category: 'Contemporary',
        priceThreshold: '25000.00',
        alertType: 'daily',
        isActive: true
      });

      // Verify in database
      const alerts = await db
        .select()
        .from(schema.priceAlerts)
        .where(schema.priceAlerts.userId.eq(testUserId));
      
      expect(alerts).toHaveLength(1);
    });

    it('should create alert without artwork (artist-only alert)', async () => {
      const alertData = {
        artistId: testArtistId,
        category: 'Sculpture',
        priceThreshold: '50000.00',
        alertType: 'immediate'
      };

      const response = await request
        .post('/api/price-alerts')
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .send(alertData)
        .expect(201);

      expect(response.body).toMatchObject({
        artistId: testArtistId,
        artworkId: null,
        category: 'Sculpture'
      });
    });

    it('should require authentication', async () => {
      await request
        .post('/api/price-alerts')
        .send({ artistId: testArtistId, priceThreshold: '10000.00' })
        .expect(401);
    });
  });

  describe('DELETE /api/price-alerts/:id', () => {
    it('should delete user owned price alert', async () => {
      // Create alert first
      const alert = await db.insert(schema.priceAlerts).values({
        userId: testUserId,
        artistId: testArtistId,
        category: 'Contemporary',
        priceThreshold: '15000.00',
        alertType: 'weekly',
        isActive: true
      }).returning();

      await request
        .delete(`/api/price-alerts/${alert[0].id}`)
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(204);

      // Verify removed from database
      const alerts = await db
        .select()
        .from(schema.priceAlerts)
        .where(schema.priceAlerts.id.eq(alert[0].id));
      
      expect(alerts).toHaveLength(0);
    });

    it('should not delete alert owned by different user', async () => {
      const otherUserId = await createTestUser({ email: 'other@example.com' });
      
      // Create alert for other user
      const alert = await db.insert(schema.priceAlerts).values({
        userId: otherUserId,
        artistId: testArtistId,
        category: 'Contemporary',
        priceThreshold: '15000.00',
        alertType: 'immediate',
        isActive: true
      }).returning();

      const response = await request
        .delete(`/api/price-alerts/${alert[0].id}`)
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(404);

      expect(response.body.error).toBe('Price alert not found');

      // Verify still exists in database
      const alerts = await db
        .select()
        .from(schema.priceAlerts)
        .where(schema.priceAlerts.id.eq(alert[0].id));
      
      expect(alerts).toHaveLength(1);
    });

    it('should return 404 for non-existent alert', async () => {
      const response = await request
        .delete('/api/price-alerts/999999')
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(404);

      expect(response.body.error).toBe('Price alert not found');
    });

    it('should require authentication', async () => {
      await request
        .delete('/api/price-alerts/1')
        .expect(401);
    });
  });
});