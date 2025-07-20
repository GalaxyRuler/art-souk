import { db } from '../../server/db';
import * as schema from '@shared/schema';

export async function setupTestDatabase() {
  // Ensure test database is clean
  console.log('Setting up test database...');
}

export async function cleanupTestDatabase() {
  // Clean up test data
  await db.delete(schema.followers);
  await db.delete(schema.auctionResults);
  await db.delete(schema.shows);
  await db.delete(schema.artistGalleries);
  await db.delete(schema.priceAlerts);
  await db.delete(schema.artworks);
  await db.delete(schema.artists);
  await db.delete(schema.galleries);
  await db.delete(schema.users);
  console.log('Test database cleaned up');
}

export async function createTestUser(overrides: Partial<any> = {}): Promise<string> {
  const testUser = {
    id: 'test-user-' + Math.random().toString(36).substr(2, 9),
    email: 'test@example.com',
    name: 'Test User',
    roles: ['collector'],
    ...overrides
  };

  const inserted = await db.insert(schema.users).values(testUser).returning();
  return inserted[0].id;
}

export async function createTestArtist(overrides: Partial<any> = {}): Promise<number> {
  const testArtist = {
    name: 'Test Artist',
    bio: 'A test artist for testing purposes',
    nationality: 'Saudi Arabia',
    birthYear: 1980,
    style: 'Contemporary',
    ...overrides
  };

  const inserted = await db.insert(schema.artists).values(testArtist).returning();
  return inserted[0].id;
}

export async function createTestGallery(overrides: Partial<any> = {}): Promise<number> {
  const testGallery = {
    name: 'Test Gallery',
    location: 'Riyadh, Saudi Arabia',
    description: 'A test gallery',
    ...overrides
  };

  const inserted = await db.insert(schema.galleries).values(testGallery).returning();
  return inserted[0].id;
}

export async function createTestArtwork(artistId: number, overrides: Partial<any> = {}): Promise<number> {
  const testArtwork = {
    title: 'Test Artwork',
    artistId,
    medium: 'Oil on Canvas',
    price: '10000.00',
    currency: 'SAR',
    availability: 'available',
    dimensions: '100x100cm',
    year: 2024,
    ...overrides
  };

  const inserted = await db.insert(schema.artworks).values(testArtwork).returning();
  return inserted[0].id;
}

// Mock authentication middleware for testing
export function mockAuthMiddleware(userId: string) {
  return (req: any, res: any, next: any) => {
    req.user = {
      claims: {
        sub: userId,
        email: 'test@example.com'
      }
    };
    next();
  };
}