import { db } from '../db';
import { sql } from 'drizzle-orm';

// Database optimization utilities
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryStats: Map<string, { count: number; totalTime: number; slowQueries: number }> = new Map();

  private constructor() {}

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  // Add essential indexes for performance
  public async addPerformanceIndexes() {
    try {
      console.log('📊 Adding performance indexes...');
      
      const indexes = [
        // Artworks indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_featured ON artworks(featured) WHERE featured = true',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_availability ON artworks(availability)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_gallery_id ON artworks(gallery_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_created_at ON artworks(created_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_price ON artworks(price)',
        
        // Artists indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_user_id ON artists(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_featured ON artists(featured) WHERE featured = true',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_nationality ON artists(nationality)',
        
        // Galleries indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_galleries_user_id ON galleries(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_galleries_featured ON galleries(featured) WHERE featured = true',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_galleries_location ON galleries(location)',
        
        // Auctions indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status ON auctions(status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_end_date ON auctions(end_date)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_artwork_id ON auctions(artwork_id)',
        
        // Bids indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_id ON bids(auction_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_user_id ON bids(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_created_at ON bids(created_at)',
        
        // Users indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_roles ON users USING gin(roles)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_lifecycle_stage ON users(lifecycle_stage)',
        
        // Favorites indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_artwork_id ON favorites(artwork_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_artwork ON favorites(user_id, artwork_id)',
        
        // Inquiries indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiries_artwork_id ON inquiries(artwork_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiries_user_id ON inquiries(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at)',
        
        // Follows indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_follower_id ON follows(follower_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_following_id ON follows(following_id)',
        
        // Collections indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collections_featured ON collections(featured) WHERE featured = true',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collections_created_at ON collections(created_at)',
        
        // Workshops indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workshops_instructor_id ON workshops(instructor_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workshops_start_date ON workshops(start_date)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workshops_featured ON workshops(featured) WHERE featured = true',
        
        // Events indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_organizer_id ON events(organizer_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_date ON events(start_date)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_featured ON events(featured) WHERE featured = true',
        
        // Commission requests indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commission_requests_collector_id ON commission_requests(collector_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commission_requests_status ON commission_requests(status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commission_requests_created_at ON commission_requests(created_at)',
        
        // Commission bids indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commission_bids_commission_request_id ON commission_bids(commission_request_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commission_bids_artist_id ON commission_bids(artist_id)',
        
        // Purchase orders indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_orders_buyer_id ON purchase_orders(buyer_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_orders_artwork_id ON purchase_orders(artwork_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status)',
        
        // User interactions indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at)',
        
        // Search optimization indexes
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_title_search ON artworks USING gin(to_tsvector(\'english\', title))',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artists_name_search ON artists USING gin(to_tsvector(\'english\', name))',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_galleries_name_search ON galleries USING gin(to_tsvector(\'english\', name))',
        
        // Composite indexes for common queries
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_artworks_availability_featured ON artworks(availability, featured)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auctions_status_end_date ON auctions(status, end_date)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bids_auction_amount ON bids(auction_id, amount)',
      ];

      for (const indexQuery of indexes) {
        try {
          await db.execute(sql.raw(indexQuery));
          console.log(`✅ Index created: ${indexQuery.split(' ')[5]}`);
        } catch (error) {
          // Index might already exist, continue
          console.log(`ℹ️  Index exists or error: ${indexQuery.split(' ')[5]}`);
        }
      }
      
      console.log('✅ Performance indexes setup complete');
    } catch (error) {
      console.error('❌ Error setting up performance indexes:', error);
    }
  }

  // Analyze database performance
  public async analyzePerformance() {
    try {
      const results = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public' 
        AND tablename IN ('artworks', 'artists', 'galleries', 'auctions', 'users')
        ORDER BY tablename, attname
      `);

      console.log('📊 Database performance analysis:', results);
      return results;
    } catch (error) {
      console.error('Error analyzing database performance:', error);
      return null;
    }
  }

  // Track query performance
  public trackQuery(query: string, duration: number) {
    const stats = this.queryStats.get(query) || { count: 0, totalTime: 0, slowQueries: 0 };
    stats.count++;
    stats.totalTime += duration;
    
    if (duration > 1000) { // Slow query threshold: 1 second
      stats.slowQueries++;
      console.warn(`🐌 Slow query (${duration}ms): ${query.substring(0, 100)}...`);
    }
    
    this.queryStats.set(query, stats);
  }

  // Get query statistics
  public getQueryStats() {
    const stats = Array.from(this.queryStats.entries()).map(([query, stats]) => ({
      query: query.substring(0, 100),
      count: stats.count,
      averageTime: stats.totalTime / stats.count,
      slowQueries: stats.slowQueries,
      totalTime: stats.totalTime
    }));

    return stats.sort((a, b) => b.totalTime - a.totalTime);
  }

  // Vacuum and analyze tables
  public async maintainDatabase() {
    try {
      console.log('🧹 Running database maintenance...');
      
      const tables = [
        'artworks', 'artists', 'galleries', 'auctions', 'bids', 'users', 
        'favorites', 'inquiries', 'follows', 'collections', 'workshops', 
        'events', 'commission_requests', 'commission_bids', 'purchase_orders'
      ];

      for (const table of tables) {
        try {
          await db.execute(sql.raw(`VACUUM ANALYZE ${table}`));
          console.log(`✅ Maintained table: ${table}`);
        } catch (error) {
          console.log(`❌ Error maintaining table ${table}:`, error);
        }
      }
      
      console.log('✅ Database maintenance complete');
    } catch (error) {
      console.error('❌ Error during database maintenance:', error);
    }
  }
}

export const databaseOptimizer = DatabaseOptimizer.getInstance();

// Query performance monitoring middleware
export const queryPerformanceMiddleware = (originalExecute: Function) => {
  return async function(this: any, ...args: any[]) {
    const startTime = Date.now();
    const query = args[0]?.sql || args[0]?.toString() || 'unknown';
    
    try {
      const result = await originalExecute.apply(this, args);
      const duration = Date.now() - startTime;
      
      databaseOptimizer.trackQuery(query, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      databaseOptimizer.trackQuery(query, duration);
      throw error;
    }
  };
};