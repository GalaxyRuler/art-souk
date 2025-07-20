import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../../server/db';
import * as schema from '@shared/schema';
import { setupTestDatabase, cleanupTestDatabase, createTestUser, createTestArtist } from '../helpers/testUtils';
import supertest from 'supertest';
import { createServer } from '../../server/routes';

describe('Artist Profile API', () => {
  let app: any;
  let request: supertest.SuperTest<supertest.Test>;
  let testUserId: string;
  let testArtistId: number;

  beforeAll(async () => {
    await setupTestDatabase();
    app = createServer();
    request = supertest(app);
  });

  beforeEach(async () => {
    // Clean slate for each test
    await db.delete(schema.followers);
    await db.delete(schema.auctionResults);
    await db.delete(schema.shows);
    await db.delete(schema.artistGalleries);
    await db.delete(schema.priceAlerts);
    
    // Create test data
    testUserId = await createTestUser();
    testArtistId = await createTestArtist();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /api/artists/:id/followers', () => {
    it('should return empty followers list for new artist', async () => {
      const response = await request
        .get(`/api/artists/${testArtistId}/followers`)
        .expect(200);

      expect(response.body).toEqual({
        followers: [],
        totalCount: 0
      });
    });

    it('should return followers list with user details', async () => {
      // Create a follower relationship
      await db.insert(schema.followers).values({
        artistId: testArtistId,
        userId: testUserId
      });

      const response = await request
        .get(`/api/artists/${testArtistId}/followers`)
        .expect(200);

      expect(response.body.totalCount).toBe(1);
      expect(response.body.followers).toHaveLength(1);
      expect(response.body.followers[0]).toMatchObject({
        userId: testUserId,
        artistId: testArtistId
      });
    });

    it('should handle invalid artist ID', async () => {
      const response = await request
        .get('/api/artists/999999/followers')
        .expect(200);

      expect(response.body.totalCount).toBe(0);
    });
  });

  describe('POST /api/artists/:id/follow', () => {
    it('should allow authenticated user to follow artist', async () => {
      // Mock authentication middleware for testing
      const response = await request
        .post(`/api/artists/${testArtistId}/follow`)
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(201);

      expect(response.body).toMatchObject({
        artistId: testArtistId,
        userId: testUserId
      });

      // Verify in database
      const followers = await db
        .select()
        .from(schema.followers)
        .where(schema.followers.artistId.eq(testArtistId));
      
      expect(followers).toHaveLength(1);
    });

    it('should prevent duplicate follows', async () => {
      // Create existing follow
      await db.insert(schema.followers).values({
        artistId: testArtistId,
        userId: testUserId
      });

      const response = await request
        .post(`/api/artists/${testArtistId}/follow`)
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(400);

      expect(response.body.error).toBe('Already following this artist');
    });

    it('should require authentication', async () => {
      await request
        .post(`/api/artists/${testArtistId}/follow`)
        .expect(401);
    });
  });

  describe('DELETE /api/artists/:id/follow', () => {
    it('should allow user to unfollow artist', async () => {
      // Create follow relationship first
      await db.insert(schema.followers).values({
        artistId: testArtistId,
        userId: testUserId
      });

      await request
        .delete(`/api/artists/${testArtistId}/follow`)
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(204);

      // Verify removed from database
      const followers = await db
        .select()
        .from(schema.followers)
        .where(schema.followers.artistId.eq(testArtistId));
      
      expect(followers).toHaveLength(0);
    });

    it('should return 404 if follow relationship does not exist', async () => {
      const response = await request
        .delete(`/api/artists/${testArtistId}/follow`)
        .set('Authorization', `Bearer mock-token-${testUserId}`)
        .expect(404);

      expect(response.body.error).toBe('Follow relationship not found');
    });
  });

  describe('GET /api/artists/:id/auction-results', () => {
    it('should return empty auction results for new artist', async () => {
      const response = await request
        .get(`/api/artists/${testArtistId}/auction-results`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return auction results with artwork details', async () => {
      // Create test artwork
      const artwork = await db.insert(schema.artworks).values({
        title: 'Test Artwork',
        artistId: testArtistId,
        medium: 'Oil on Canvas',
        price: '10000.00',
        currency: 'SAR',
        availability: 'available'
      }).returning();

      // Create auction result
      await db.insert(schema.auctionResults).values({
        artistId: testArtistId,
        artworkId: artwork[0].id,
        auctionDate: new Date('2024-01-15'),
        hammerPrice: '15000.00',
        estimateLow: '12000.00',
        estimateHigh: '18000.00',
        auctionHouse: 'Christie\'s Dubai',
        lotNumber: 'LOT123'
      });

      const response = await request
        .get(`/api/artists/${testArtistId}/auction-results`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        hammerPrice: '15000.00',
        auctionHouse: 'Christie\'s Dubai',
        artworkTitle: 'Test Artwork'
      });
    });
  });

  describe('GET /api/artists/:id/shows', () => {
    it('should return empty shows list for new artist', async () => {
      const response = await request
        .get(`/api/artists/${testArtistId}/shows`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return shows in chronological order', async () => {
      // Create multiple shows
      await db.insert(schema.shows).values([
        {
          artistId: testArtistId,
          title: 'Recent Exhibition',
          venue: 'Modern Gallery',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-03-30'),
          type: 'solo'
        },
        {
          artistId: testArtistId,
          title: 'Earlier Show',
          venue: 'Art Space',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-30'),
          type: 'group'
        }
      ]);

      const response = await request
        .get(`/api/artists/${testArtistId}/shows`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      // Should be ordered by start date descending (most recent first)
      expect(response.body[0].title).toBe('Recent Exhibition');
      expect(response.body[1].title).toBe('Earlier Show');
    });
  });

  describe('GET /api/artists/:id/galleries', () => {
    it('should return empty gallery relationships for new artist', async () => {
      const response = await request
        .get(`/api/artists/${testArtistId}/galleries`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return gallery relationships with gallery details', async () => {
      // Create test gallery
      const gallery = await db.insert(schema.galleries).values({
        name: 'Test Gallery',
        location: 'Riyadh, Saudi Arabia',
        website: 'https://testgallery.com'
      }).returning();

      // Create artist-gallery relationship
      await db.insert(schema.artistGalleries).values({
        artistId: testArtistId,
        galleryId: gallery[0].id,
        representationType: 'exclusive',
        startDate: new Date('2024-01-01'),
        contractDetails: 'Exclusive representation for contemporary works'
      });

      const response = await request
        .get(`/api/artists/${testArtistId}/galleries`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        representationType: 'exclusive',
        galleryName: 'Test Gallery',
        galleryLocation: 'Riyadh, Saudi Arabia'
      });
    });
  });
});