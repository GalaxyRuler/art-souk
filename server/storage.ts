import {
  users,
  artists,
  galleries,
  artworks,
  auctions,
  bids,
  collections,
  collectionArtworks,
  articles,
  inquiries,
  favorites,
  type User,
  type UpsertUser,
  type Artist,
  type InsertArtist,
  type Gallery,
  type InsertGallery,
  type Artwork,
  type InsertArtwork,
  type Auction,
  type InsertAuction,
  type Bid,
  type InsertBid,
  type Collection,
  type InsertCollection,
  type Article,
  type InsertArticle,
  type Inquiry,
  type InsertInquiry,
  type Favorite,
  type InsertFavorite,
  follows,
  type Follow,
  type InsertFollow,
  comments,
  type Comment,
  type InsertComment,
  likes,
  type Like,
  type InsertLike,
  activities,
  type Activity,
  type InsertActivity,
  userProfiles,
  type UserProfile,
  type InsertUserProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql, count, ne, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Artist operations
  getArtists(limit?: number, offset?: number): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getFeaturedArtists(limit?: number): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist>;
  
  // Gallery operations
  getGalleries(limit?: number, offset?: number): Promise<Gallery[]>;
  getGallery(id: number): Promise<Gallery | undefined>;
  getFeaturedGalleries(limit?: number): Promise<Gallery[]>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: number, gallery: Partial<InsertGallery>): Promise<Gallery>;
  
  // Artwork operations
  getArtworks(limit?: number, offset?: number): Promise<Artwork[]>;
  getArtwork(id: number): Promise<Artwork | undefined>;
  getFeaturedArtworks(limit?: number): Promise<Artwork[]>;
  getCuratorsPickArtworks(limit?: number): Promise<Artwork[]>;
  getArtworksByArtist(artistId: number, limit?: number): Promise<Artwork[]>;
  getArtworksByGallery(galleryId: number, limit?: number): Promise<Artwork[]>;
  searchArtworks(query: string, filters?: any): Promise<Artwork[]>;
  searchArtists(query: string, filters?: any): Promise<Artist[]>;
  searchGalleries(query: string, filters?: any): Promise<Gallery[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: number, artwork: Partial<InsertArtwork>): Promise<Artwork>;
  
  // Auction operations
  getAuctions(limit?: number, offset?: number): Promise<Auction[]>;
  getAuction(id: number): Promise<Auction | undefined>;
  getLiveAuctions(limit?: number): Promise<Auction[]>;
  getUpcomingAuctions(limit?: number): Promise<Auction[]>;
  createAuction(auction: InsertAuction): Promise<Auction>;
  updateAuction(id: number, auction: Partial<InsertAuction>): Promise<Auction>;
  
  // Bid operations
  getBidsForAuction(auctionId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  
  // Collection operations
  getCollections(limit?: number, offset?: number): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  getFeaturedCollections(limit?: number): Promise<Collection[]>;
  getCollectionArtworks(collectionId: number): Promise<Artwork[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  
  // Article operations
  getArticles(limit?: number, offset?: number): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  getFeaturedArticles(limit?: number): Promise<Article[]>;
  getArticlesByCategory(category: string, limit?: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article>;
  
  // Inquiry operations
  getInquiries(limit?: number, offset?: number): Promise<Inquiry[]>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  getInquiriesForArtwork(artworkId: number): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: number, inquiry: Partial<InsertInquiry>): Promise<Inquiry>;
  
  // Favorite operations
  getUserFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(userId: string, artworkId: number): Promise<void>;
  isFavorite(userId: string, artworkId: number): Promise<boolean>;
  
  // Admin count operations
  getUserCount(): Promise<number>;
  getArtistCount(): Promise<number>;
  getGalleryCount(): Promise<number>;
  getArtworkCount(): Promise<number>;
  getAuctionCount(): Promise<number>;
  getArticleCount(): Promise<number>;
  getInquiryCount(): Promise<number>;
  getFavoriteCount(): Promise<number>;
  
  // Delete operations  
  deleteArtist(id: number): Promise<void>;
  deleteGallery(id: number): Promise<void>;
  deleteArtwork(id: number): Promise<void>;
  
  // Social features - Follow operations
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(userId: string, entityType: string, entityId: number): Promise<void>;
  isFollowing(userId: string, entityType: string, entityId: number): Promise<boolean>;
  getFollowers(entityType: string, entityId: number): Promise<Follow[]>;
  getFollowing(userId: string, entityType?: string): Promise<Follow[]>;
  getFollowCounts(entityType: string, entityId: number): Promise<{ followers: number }>;
  
  // Social features - Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  getComments(entityType: string, entityId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  
  // Social features - Like operations
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: string, entityType: string, entityId: number): Promise<void>;
  isLiked(userId: string, entityType: string, entityId: number): Promise<boolean>;
  getLikeCounts(entityType: string, entityId: number): Promise<{ likes: number }>;
  
  // Social features - Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  getFollowingActivities(userId: string, limit?: number): Promise<Activity[]>;
  
  // Social features - User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Artist operations
  async getArtists(limit = 20, offset = 0): Promise<Artist[]> {
    return await db
      .select()
      .from(artists)
      .orderBy(desc(artists.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async getFeaturedArtists(limit = 10): Promise<Artist[]> {
    return await db
      .select()
      .from(artists)
      .where(eq(artists.featured, true))
      .orderBy(desc(artists.createdAt))
      .limit(limit);
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [newArtist] = await db.insert(artists).values(artist).returning();
    return newArtist;
  }

  async updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist> {
    const [updatedArtist] = await db
      .update(artists)
      .set({ ...artist, updatedAt: new Date() })
      .where(eq(artists.id, id))
      .returning();
    return updatedArtist;
  }

  // Gallery operations
  async getGalleries(limit = 20, offset = 0): Promise<Gallery[]> {
    return await db
      .select()
      .from(galleries)
      .orderBy(desc(galleries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getGallery(id: number): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
    return gallery;
  }

  async getFeaturedGalleries(limit = 10): Promise<Gallery[]> {
    return await db
      .select()
      .from(galleries)
      .where(eq(galleries.featured, true))
      .orderBy(desc(galleries.createdAt))
      .limit(limit);
  }

  async createGallery(gallery: InsertGallery): Promise<Gallery> {
    const [newGallery] = await db.insert(galleries).values(gallery).returning();
    return newGallery;
  }

  async updateGallery(id: number, gallery: Partial<InsertGallery>): Promise<Gallery> {
    const [updatedGallery] = await db
      .update(galleries)
      .set({ ...gallery, updatedAt: new Date() })
      .where(eq(galleries.id, id))
      .returning();
    return updatedGallery;
  }

  // Artwork operations
  async getArtworks(limit = 20, offset = 0): Promise<Artwork[]> {
    return await db
      .select()
      .from(artworks)
      .orderBy(desc(artworks.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork;
  }

  async getFeaturedArtworks(limit = 10): Promise<Artwork[]> {
    return await db
      .select()
      .from(artworks)
      .where(eq(artworks.featured, true))
      .orderBy(desc(artworks.createdAt))
      .limit(limit);
  }

  async getCuratorsPickArtworks(limit = 20): Promise<Artwork[]> {
    return await db
      .select()
      .from(artworks)
      .where(eq(artworks.availability, "available"))
      .orderBy(desc(artworks.createdAt))
      .limit(limit);
  }

  async getArtworksByArtist(artistId: number, limit = 20): Promise<Artwork[]> {
    return await db
      .select()
      .from(artworks)
      .where(eq(artworks.artistId, artistId))
      .orderBy(desc(artworks.createdAt))
      .limit(limit);
  }

  async getArtworksByGallery(galleryId: number, limit = 20): Promise<Artwork[]> {
    return await db
      .select()
      .from(artworks)
      .where(eq(artworks.galleryId, galleryId))
      .orderBy(desc(artworks.createdAt))
      .limit(limit);
  }

  async searchArtworks(query: string, filters?: any): Promise<Artwork[]> {
    let queryBuilder = db.select().from(artworks);
    
    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          ilike(artworks.title, `%${query}%`),
          ilike(artworks.titleAr, `%${query}%`),
          ilike(artworks.description, `%${query}%`),
          ilike(artworks.medium, `%${query}%`),
          ilike(artworks.category, `%${query}%`)
        )
      );
    }

    if (filters?.category) {
      queryBuilder = queryBuilder.where(eq(artworks.category, filters.category));
    }

    if (filters?.medium) {
      queryBuilder = queryBuilder.where(eq(artworks.medium, filters.medium));
    }

    if (filters?.artistId) {
      queryBuilder = queryBuilder.where(eq(artworks.artistId, filters.artistId));
    }

    if (filters?.excludeId) {
      queryBuilder = queryBuilder.where(ne(artworks.id, filters.excludeId));
    }

    const results = await queryBuilder
      .orderBy(desc(artworks.createdAt))
      .limit(filters?.limit || 50);
    
    return results;
  }

  async searchArtists(query: string, filters?: any): Promise<Artist[]> {
    let queryBuilder = db.select().from(artists);
    
    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          ilike(artists.name, `%${query}%`),
          ilike(artists.nameAr, `%${query}%`),
          ilike(artists.biography, `%${query}%`),
          ilike(artists.biographyAr, `%${query}%`)
        )
      );
    }

    if (filters?.nationality) {
      queryBuilder = queryBuilder.where(eq(artists.nationality, filters.nationality));
    }

    const results = await queryBuilder
      .orderBy(desc(artists.createdAt))
      .limit(filters?.limit || 20);
    
    return results;
  }

  async searchGalleries(query: string, filters?: any): Promise<Gallery[]> {
    let queryBuilder = db.select().from(galleries);
    
    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          ilike(galleries.name, `%${query}%`),
          ilike(galleries.nameAr, `%${query}%`),
          ilike(galleries.description, `%${query}%`),
          ilike(galleries.descriptionAr, `%${query}%`)
        )
      );
    }

    if (filters?.location) {
      queryBuilder = queryBuilder.where(eq(galleries.location, filters.location));
    }

    const results = await queryBuilder
      .orderBy(desc(galleries.createdAt))
      .limit(filters?.limit || 20);
    
    return results;
  }

  async createArtwork(artwork: InsertArtwork): Promise<Artwork> {
    const [newArtwork] = await db.insert(artworks).values(artwork).returning();
    return newArtwork;
  }

  async updateArtwork(id: number, artwork: Partial<InsertArtwork>): Promise<Artwork> {
    const [updatedArtwork] = await db
      .update(artworks)
      .set({ ...artwork, updatedAt: new Date() })
      .where(eq(artworks.id, id))
      .returning();
    return updatedArtwork;
  }

  // Auction operations
  async getAuctions(limit = 20, offset = 0): Promise<Auction[]> {
    return await db
      .select()
      .from(auctions)
      .orderBy(desc(auctions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getAuction(id: number): Promise<Auction | undefined> {
    const [auction] = await db.select().from(auctions).where(eq(auctions.id, id));
    return auction;
  }

  async getLiveAuctions(limit = 10): Promise<Auction[]> {
    return await db
      .select()
      .from(auctions)
      .where(eq(auctions.status, "live"))
      .orderBy(asc(auctions.endDate))
      .limit(limit);
  }

  async getUpcomingAuctions(limit = 10): Promise<Auction[]> {
    return await db
      .select()
      .from(auctions)
      .where(eq(auctions.status, "upcoming"))
      .orderBy(asc(auctions.startDate))
      .limit(limit);
  }

  async createAuction(auction: InsertAuction): Promise<Auction> {
    const [newAuction] = await db.insert(auctions).values(auction).returning();
    return newAuction;
  }

  async updateAuction(id: number, auction: Partial<InsertAuction>): Promise<Auction> {
    const [updatedAuction] = await db
      .update(auctions)
      .set({ ...auction, updatedAt: new Date() })
      .where(eq(auctions.id, id))
      .returning();
    return updatedAuction;
  }

  // Bid operations
  async getBidsForAuction(auctionId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(desc(bids.createdAt));
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    
    // Update auction bid count and current bid
    await db
      .update(auctions)
      .set({
        currentBid: bid.amount,
        bidCount: sql`bid_count + 1`,
        updatedAt: new Date(),
      })
      .where(eq(auctions.id, bid.auctionId!));
    
    return newBid;
  }

  // Collection operations
  async getCollections(limit = 20, offset = 0): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .orderBy(desc(collections.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCollection(id: number): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async getFeaturedCollections(limit = 10): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .where(eq(collections.featured, true))
      .orderBy(desc(collections.createdAt))
      .limit(limit);
  }

  async getCollectionArtworks(collectionId: number): Promise<Artwork[]> {
    const results = await db
      .select({
        id: artworks.id,
        artistId: artworks.artistId,
        galleryId: artworks.galleryId,
        title: artworks.title,
        titleAr: artworks.titleAr,
        description: artworks.description,
        descriptionAr: artworks.descriptionAr,
        year: artworks.year,
        medium: artworks.medium,
        mediumAr: artworks.mediumAr,
        dimensions: artworks.dimensions,
        images: artworks.images,
        price: artworks.price,
        currency: artworks.currency,
        category: artworks.category,
        categoryAr: artworks.categoryAr,
        style: artworks.style,
        styleAr: artworks.styleAr,
        featured: artworks.featured,
        availability: artworks.availability,
        createdAt: artworks.createdAt,
        updatedAt: artworks.updatedAt
      })
      .from(artworks)
      .innerJoin(collectionArtworks, eq(artworks.id, collectionArtworks.artworkId))
      .where(eq(collectionArtworks.collectionId, collectionId))
      .orderBy(asc(collectionArtworks.order));
    return results;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const [newCollection] = await db.insert(collections).values(collection).returning();
    return newCollection;
  }

  // Article operations
  async getArticles(limit = 20, offset = 0): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.id, id), eq(articles.published, true)));
    return article;
  }

  async getFeaturedArticles(limit = 10): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(and(eq(articles.featured, true), eq(articles.published, true)))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
  }

  async getArticlesByCategory(category: string, limit = 10): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(and(eq(articles.category, category), eq(articles.published, true)))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article> {
    const [updatedArticle] = await db
      .update(articles)
      .set({ ...article, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return updatedArticle;
  }

  // Inquiry operations
  async getInquiries(limit = 20, offset = 0): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async getInquiriesForArtwork(artworkId: number): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.artworkId, artworkId))
      .orderBy(desc(inquiries.createdAt));
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }

  async updateInquiry(id: number, inquiry: Partial<InsertInquiry>): Promise<Inquiry> {
    const [updatedInquiry] = await db
      .update(inquiries)
      .set({ ...inquiry, updatedAt: new Date() })
      .where(eq(inquiries.id, id))
      .returning();
    return updatedInquiry;
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async deleteFavorite(userId: string, artworkId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.artworkId, artworkId)));
  }

  async isFavorite(userId: string, artworkId: number): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.artworkId, artworkId)));
    return result.count > 0;
  }

  // Admin count methods
  async getUserCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return result.count;
  }

  async getArtistCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(artists);
    return result.count;
  }

  async getGalleryCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(galleries);
    return result.count;
  }

  async getArtworkCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(artworks);
    return result.count;
  }

  async getAuctionCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(auctions);
    return result.count;
  }

  async getArticleCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(articles);
    return result.count;
  }

  async getInquiryCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(inquiries);
    return result.count;
  }

  async getFavoriteCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(favorites);
    return result.count;
  }

  // Delete methods
  async deleteArtist(id: number): Promise<void> {
    await db.delete(artists).where(eq(artists.id, id));
  }

  async deleteGallery(id: number): Promise<void> {
    await db.delete(galleries).where(eq(galleries.id, id));
  }

  async deleteArtwork(id: number): Promise<void> {
    await db.delete(artworks).where(eq(artworks.id, id));
  }

  // Social features - Follow operations
  async createFollow(follow: InsertFollow): Promise<Follow> {
    const [newFollow] = await db.insert(follows).values(follow).returning();
    
    // Create activity for follow
    await this.createActivity({
      userId: follow.userId,
      type: "follow",
      entityType: follow.entityType,
      entityId: follow.entityId,
      metadata: {}
    });
    
    return newFollow;
  }

  async deleteFollow(userId: string, entityType: string, entityId: number): Promise<void> {
    await db.delete(follows).where(
      and(
        eq(follows.userId, userId),
        eq(follows.entityType, entityType),
        eq(follows.entityId, entityId)
      )
    );
  }

  async isFollowing(userId: string, entityType: string, entityId: number): Promise<boolean> {
    const [result] = await db.select().from(follows).where(
      and(
        eq(follows.userId, userId),
        eq(follows.entityType, entityType),
        eq(follows.entityId, entityId)
      )
    );
    return !!result;
  }

  async getFollowers(entityType: string, entityId: number): Promise<Follow[]> {
    return await db.select().from(follows).where(
      and(
        eq(follows.entityType, entityType),
        eq(follows.entityId, entityId)
      )
    ).orderBy(desc(follows.createdAt));
  }

  async getFollowing(userId: string, entityType?: string): Promise<Follow[]> {
    let query = db.select().from(follows).where(eq(follows.userId, userId));
    
    if (entityType) {
      query = query.where(eq(follows.entityType, entityType));
    }
    
    return await query.orderBy(desc(follows.createdAt));
  }

  async getFollowCounts(entityType: string, entityId: number): Promise<{ followers: number }> {
    const [result] = await db.select({ count: count() }).from(follows).where(
      and(
        eq(follows.entityType, entityType),
        eq(follows.entityId, entityId)
      )
    );
    return { followers: result.count };
  }

  // Social features - Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    
    // Create activity for comment
    await this.createActivity({
      userId: comment.userId,
      type: "comment",
      entityType: comment.entityType,
      entityId: comment.entityId,
      metadata: { commentId: newComment.id }
    });
    
    return newComment;
  }

  async updateComment(id: number, comment: Partial<InsertComment>): Promise<Comment> {
    const [updated] = await db
      .update(comments)
      .set({ ...comment, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updated;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getComments(entityType: string, entityId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(
      and(
        eq(comments.entityType, entityType),
        eq(comments.entityId, entityId)
      )
    ).orderBy(desc(comments.createdAt));
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  // Social features - Like operations
  async createLike(like: InsertLike): Promise<Like> {
    const [newLike] = await db.insert(likes).values(like).returning();
    
    // Create activity for like
    await this.createActivity({
      userId: like.userId,
      type: "like",
      entityType: like.entityType,
      entityId: like.entityId,
      metadata: {}
    });
    
    return newLike;
  }

  async deleteLike(userId: string, entityType: string, entityId: number): Promise<void> {
    await db.delete(likes).where(
      and(
        eq(likes.userId, userId),
        eq(likes.entityType, entityType),
        eq(likes.entityId, entityId)
      )
    );
  }

  async isLiked(userId: string, entityType: string, entityId: number): Promise<boolean> {
    const [result] = await db.select().from(likes).where(
      and(
        eq(likes.userId, userId),
        eq(likes.entityType, entityType),
        eq(likes.entityId, entityId)
      )
    );
    return !!result;
  }

  async getLikeCounts(entityType: string, entityId: number): Promise<{ likes: number }> {
    const [result] = await db.select({ count: count() }).from(likes).where(
      and(
        eq(likes.entityType, entityType),
        eq(likes.entityId, entityId)
      )
    );
    return { likes: result.count };
  }

  // Social features - Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getActivities(userId: string, limit = 50): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getFollowingActivities(userId: string, limit = 50): Promise<Activity[]> {
    // Get activities from users that the current user follows
    const followingUsers = await db.select({ entityId: follows.entityId })
      .from(follows)
      .where(
        and(
          eq(follows.userId, userId),
          eq(follows.entityType, "user")
        )
      );
    
    if (followingUsers.length === 0) {
      return [];
    }
    
    const followingUserIds = followingUsers.map(f => f.entityId.toString());
    
    return await db.select().from(activities)
      .where(
        or(
          ...followingUserIds.map(id => eq(activities.userId, id))
        )
      )
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Social features - User profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(userId: string, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
