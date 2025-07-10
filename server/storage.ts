import {
  users,
  artists,
  galleries,
  artworks,
  auctions,
  bids,
  collections,
  collectionArtworks,
  workshops,
  workshopRegistrations,
  events,
  eventRsvps,
  workshopEventReviews,
  discussions,
  discussionReplies,
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
  auctionResults,
  type AuctionResult,
  type InsertAuctionResult,
  type Collection,
  type InsertCollection,
  type Workshop,
  type InsertWorkshop,
  type WorkshopRegistration,
  type InsertWorkshopRegistration,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type InsertEventRsvp,
  type WorkshopEventReview,
  type InsertWorkshopEventReview,
  type Discussion,
  type InsertDiscussion,
  type DiscussionReply,
  type InsertDiscussionReply,
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
  artworkViews,
  type ArtworkView,
  type InsertArtworkView,
  artistAnalytics,
  type ArtistAnalytics,
  type InsertArtistAnalytics,
  searchHistory,
  type SearchHistory,
  type InsertSearchHistory,
  userPreferences,
  type UserPreferences,
  type InsertUserPreferences,
  portfolioSections,
  type PortfolioSection,
  type InsertPortfolioSection,
  purchaseOrders,
  shippingTracking,
  collectorProfiles,
  priceAlerts,
  artworkCertificates,
  collectorWishlist,
  installmentPlans,
  collectorReviews,
  newsletterSubscribers,
  type NewsletterSubscriber,
  type InsertNewsletterSubscriber,
  emailTemplates,
  type EmailTemplate,
  type InsertEmailTemplate,
  emailNotificationQueue,
  type EmailNotificationQueue,
  type InsertEmailNotificationQueue,
  emailNotificationLog,
  type EmailNotificationLog,
  type InsertEmailNotificationLog,
  achievementBadges,
  type AchievementBadge,
  type InsertAchievementBadge,
  artistAchievements,
  type ArtistAchievement,
  type InsertArtistAchievement,
  artistStats,
  type ArtistStats,
  type InsertArtistStats,
  badgeProgress,
  type BadgeProgress,
  type InsertBadgeProgress,
  schedulingConflicts,
  type SchedulingConflict,
  type InsertSchedulingConflict,
  eventReminders,
  type EventReminder,
  type InsertEventReminder,
  calendarIntegrations,
  type CalendarIntegration,
  type InsertCalendarIntegration,
  participantLists,
  type ParticipantList,
  type InsertParticipantList,
  waitlistEntries,
  type WaitlistEntry,
  type InsertWaitlistEntry,
  dsarRequests,
  type DsarRequest,
  type InsertDsarRequest,
  auditLogs,
  type AuditLog,
  type InsertAuditLog,
  reports,
  type Report,
  type InsertReport,
  auctionUpdateRequests,
  type AuctionUpdateRequest,
  type InsertAuctionUpdateRequest,
  sellerKycDocs,
  type SellerKycDoc,
  type InsertSellerKycDoc,
  shippingAddresses,
  type ShippingAddress,
  type InsertShippingAddress,
  commissionRequests,
  type CommissionRequest,
  type InsertCommissionRequest,
  commissionBids,
  type CommissionBid,
  type InsertCommissionBid,
  commissionMessages,
  type CommissionMessage,
  type InsertCommissionMessage,
  commissionContracts,
  type CommissionContract,
  type InsertCommissionContract,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, sql, count, ne, gte, lte } from "drizzle-orm";
import { emailService } from "./emailService";

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
  
  // Auction Results operations
  getAuctionResultsByArtist(artistId: number, limit?: number): Promise<AuctionResult[]>;
  getAuctionResultsByArtwork(artworkId: number): Promise<AuctionResult[]>;
  getAuctionResult(auctionId: number): Promise<AuctionResult | undefined>;
  createAuctionResult(result: InsertAuctionResult): Promise<AuctionResult>;
  updateAuctionResult(id: number, result: Partial<InsertAuctionResult>): Promise<AuctionResult>;
  getArtistAuctionStats(artistId: number): Promise<{
    totalAuctions: number;
    totalSales: number;
    totalRevenue: string;
    averagePrice: string;
    highestPrice: string;
    lowestPrice: string;
  }>;
  
  // Collection operations
  getCollections(limit?: number, offset?: number): Promise<Collection[]>;
  getCollection(id: number): Promise<Collection | undefined>;
  getFeaturedCollections(limit?: number): Promise<Collection[]>;
  getCollectionArtworks(collectionId: number): Promise<Artwork[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  
  // Workshop operations
  getWorkshops(limit?: number, offset?: number): Promise<Workshop[]>;
  getWorkshop(id: number): Promise<Workshop | undefined>;
  getFeaturedWorkshops(limit?: number): Promise<Workshop[]>;
  getWorkshopsByInstructor(instructorId: string, instructorType: string, limit?: number): Promise<Workshop[]>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: number, workshop: Partial<InsertWorkshop>): Promise<Workshop>;
  deleteWorkshop(id: number): Promise<boolean>;
  
  // Workshop registration operations
  getWorkshopRegistrations(workshopId: number): Promise<WorkshopRegistration[]>;
  createWorkshopRegistration(registration: InsertWorkshopRegistration): Promise<WorkshopRegistration>;
  updateWorkshopRegistration(id: number, registration: Partial<InsertWorkshopRegistration>): Promise<WorkshopRegistration>;
  deleteWorkshopRegistration(id: number): Promise<boolean>;
  getUserWorkshopRegistrations(userId: string): Promise<WorkshopRegistration[]>;
  
  // Event operations
  getEvents(limit?: number, offset?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getFeaturedEvents(limit?: number): Promise<Event[]>;
  getEventsByOrganizer(organizerId: string, organizerType: string, limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event RSVP operations
  getEventRsvps(eventId: number): Promise<EventRsvp[]>;
  createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  updateEventRsvp(id: number, rsvp: Partial<InsertEventRsvp>): Promise<EventRsvp>;
  deleteEventRsvp(id: number): Promise<boolean>;
  getUserEventRsvps(userId: string): Promise<EventRsvp[]>;
  
  // Discussion operations
  getDiscussions(limit?: number, offset?: number): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  getDiscussionsByCategory(category: string, limit?: number): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  updateDiscussion(id: number, discussion: Partial<InsertDiscussion>): Promise<Discussion>;
  deleteDiscussion(id: number): Promise<boolean>;
  
  // Discussion reply operations
  getDiscussionReplies(discussionId: number): Promise<DiscussionReply[]>;
  createDiscussionReply(reply: InsertDiscussionReply): Promise<DiscussionReply>;
  updateDiscussionReply(id: number, reply: Partial<InsertDiscussionReply>): Promise<DiscussionReply>;
  deleteDiscussionReply(id: number): Promise<boolean>;
  
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
  getWorkshopCount(): Promise<number>;
  getEventCount(): Promise<number>;
  getDiscussionCount(): Promise<number>;
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
  
  // Analytics operations
  recordArtworkView(view: InsertArtworkView): Promise<ArtworkView>;
  getArtworkViews(artworkId: number, days?: number): Promise<ArtworkView[]>;
  updateArtistAnalytics(artistId: number, date: string): Promise<ArtistAnalytics>;
  getArtistAnalytics(artistId: number, startDate?: string, endDate?: string): Promise<ArtistAnalytics[]>;
  recordSearchHistory(search: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(userId: string, limit?: number): Promise<SearchHistory[]>;
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  getPortfolioSections(artistId: number): Promise<PortfolioSection[]>;
  createPortfolioSection(section: InsertPortfolioSection): Promise<PortfolioSection>;
  updatePortfolioSection(id: number, section: Partial<InsertPortfolioSection>): Promise<PortfolioSection>;
  deletePortfolioSection(id: number): Promise<void>;
  
  // Seller operations
  getArtistByUserId(userId: string): Promise<Artist | undefined>;
  getGalleryByUserId(userId: string): Promise<Gallery | undefined>;
  getSellerPaymentMethods(userId: string): Promise<any[]>;
  addSellerPaymentMethod(userId: string, method: any): Promise<any>;
  updateSellerPaymentMethod(userId: string, methodId: string, method: any): Promise<any>;
  deleteSellerPaymentMethod(userId: string, methodId: string): Promise<void>;
  getSellerOrders(userId: string): Promise<any[]>;
  updateSellerOrder(userId: string, orderId: number, update: any): Promise<any>;
  
  // Email notification operations
  getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined>;
  getNewsletterSubscriberByUserId(userId: string): Promise<NewsletterSubscriber | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplate(templateCode: string): Promise<EmailTemplate | undefined>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<void>;
  getEmailNotificationQueue(status?: string, limit?: number): Promise<EmailNotificationQueue[]>;
  getEmailNotificationLog(recipientEmail?: string, limit?: number): Promise<EmailNotificationLog[]>;
  
  // Scheduling Features
  checkSchedulingConflicts(entityType: string, entityId: number, startDate: Date, endDate: Date): Promise<SchedulingConflict[]>;
  createSchedulingConflict(conflict: InsertSchedulingConflict): Promise<SchedulingConflict>;
  resolveSchedulingConflict(id: number, resolvedBy: string): Promise<void>;
  getUnresolvedConflicts(entityType?: string): Promise<SchedulingConflict[]>;
  
  // Event Reminders
  createEventReminder(reminder: InsertEventReminder): Promise<EventReminder>;
  updateEventReminder(id: number, reminder: Partial<InsertEventReminder>): Promise<EventReminder>;
  deleteEventReminder(id: number): Promise<void>;
  getEventReminders(entityType: string, entityId: number): Promise<EventReminder[]>;
  getUpcomingReminders(limit?: number): Promise<EventReminder[]>;
  markReminderSent(id: number): Promise<void>;
  
  // Calendar Integration
  getCalendarIntegration(userId: string, provider: string): Promise<CalendarIntegration | undefined>;
  createCalendarIntegration(integration: InsertCalendarIntegration): Promise<CalendarIntegration>;
  updateCalendarIntegration(id: number, integration: Partial<InsertCalendarIntegration>): Promise<CalendarIntegration>;
  deleteCalendarIntegration(userId: string, provider: string): Promise<void>;
  getUserCalendarIntegrations(userId: string): Promise<CalendarIntegration[]>;
  
  // Participant Management
  getParticipantList(entityType: string, entityId: number): Promise<ParticipantList[]>;
  addParticipant(participant: InsertParticipantList): Promise<ParticipantList>;
  updateParticipant(id: number, participant: Partial<InsertParticipantList>): Promise<ParticipantList>;
  checkInParticipant(id: number, method: string, seatNumber?: string): Promise<ParticipantList>;
  getParticipantDetails(entityType: string, entityId: number, userId: string): Promise<ParticipantList | undefined>;
  exportParticipantList(entityType: string, entityId: number): Promise<ParticipantList[]>;
  
  // Waitlist Management
  addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: number, entry: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry>;
  getWaitlist(entityType: string, entityId: number): Promise<WaitlistEntry[]>;
  promoteFromWaitlist(id: number): Promise<void>;
  getWaitlistPosition(entityType: string, entityId: number, userId: string): Promise<number | null>;
  removeFromWaitlist(entityType: string, entityId: number, userId: string): Promise<void>;
  
  // Privacy and Trust/Safety operations
  // DSAR (Data Subject Access Requests)
  getDsarRequests(status?: string): Promise<DsarRequest[]>;
  getDsarRequest(id: number): Promise<DsarRequest | undefined>;
  getUserDsarRequests(userId: string): Promise<DsarRequest[]>;
  createDsarRequest(request: InsertDsarRequest): Promise<DsarRequest>;
  updateDsarRequest(id: number, update: Partial<InsertDsarRequest>): Promise<DsarRequest>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId?: string, entityType?: string, limit?: number): Promise<AuditLog[]>;
  getAuditLogsForEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  
  // Content Reporting
  createReport(report: InsertReport): Promise<Report>;
  getReports(status?: string, reportType?: string): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  updateReport(id: number, update: Partial<InsertReport>): Promise<Report>;
  getReportsForEntity(entityType: string, entityId: number): Promise<Report[]>;
  getUserReports(userId: string): Promise<Report[]>;
  
  // Auction Update Requests
  createAuctionUpdateRequest(request: InsertAuctionUpdateRequest): Promise<AuctionUpdateRequest>;
  getAuctionUpdateRequests(auctionId?: number, status?: string): Promise<AuctionUpdateRequest[]>;
  updateAuctionUpdateRequest(id: number, update: Partial<InsertAuctionUpdateRequest>): Promise<AuctionUpdateRequest>;
  
  // Seller KYC
  createSellerKycDoc(doc: InsertSellerKycDoc): Promise<SellerKycDoc>;
  getSellerKycDocs(sellerType: string, sellerId: number): Promise<SellerKycDoc[]>;
  updateSellerKycDoc(id: number, update: Partial<InsertSellerKycDoc>): Promise<SellerKycDoc>;
  
  // Shipping Addresses
  getUserShippingAddresses(userId: string): Promise<ShippingAddress[]>;
  getShippingAddress(id: number): Promise<ShippingAddress | undefined>;
  createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress>;
  updateShippingAddress(id: number, address: Partial<InsertShippingAddress>): Promise<ShippingAddress>;
  deleteShippingAddress(id: number): Promise<void>;
  setDefaultShippingAddress(userId: string, addressId: number): Promise<void>;
  
  // Commission Request operations
  getCommissionRequests(status?: string, limit?: number, offset?: number): Promise<CommissionRequest[]>;
  getCommissionRequest(id: number): Promise<CommissionRequest | undefined>;
  getCommissionRequestsByUser(userId: string): Promise<CommissionRequest[]>;
  createCommissionRequest(request: InsertCommissionRequest): Promise<CommissionRequest>;
  updateCommissionRequest(id: number, request: Partial<InsertCommissionRequest>): Promise<CommissionRequest>;
  deleteCommissionRequest(id: number): Promise<void>;
  
  // Commission Bid operations
  getCommissionBids(requestId: number): Promise<CommissionBid[]>;
  getCommissionBid(id: number): Promise<CommissionBid | undefined>;
  getCommissionBidsByArtist(artistId: number): Promise<CommissionBid[]>;
  createCommissionBid(bid: InsertCommissionBid): Promise<CommissionBid>;
  updateCommissionBid(id: number, bid: Partial<InsertCommissionBid>): Promise<CommissionBid>;
  acceptCommissionBid(bidId: number, userId: string): Promise<CommissionBid>;
  rejectCommissionBid(bidId: number): Promise<CommissionBid>;
  
  // Commission Message operations
  getCommissionMessages(requestId: number): Promise<CommissionMessage[]>;
  createCommissionMessage(message: InsertCommissionMessage): Promise<CommissionMessage>;
  
  // Commission Contract operations
  getCommissionContract(requestId: number): Promise<CommissionContract | undefined>;
  createCommissionContract(contract: InsertCommissionContract): Promise<CommissionContract>;
  updateCommissionContract(id: number, contract: Partial<InsertCommissionContract>): Promise<CommissionContract>;
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

  // Auction Results operations
  async getAuctionResultsByArtist(artistId: number, limit = 20): Promise<AuctionResult[]> {
    return await db
      .select()
      .from(auctionResults)
      .where(eq(auctionResults.artistId, artistId))
      .orderBy(desc(auctionResults.auctionDate))
      .limit(limit);
  }

  async getAuctionResultsByArtwork(artworkId: number): Promise<AuctionResult[]> {
    return await db
      .select()
      .from(auctionResults)
      .where(eq(auctionResults.artworkId, artworkId))
      .orderBy(desc(auctionResults.auctionDate));
  }

  async getAuctionResult(auctionId: number): Promise<AuctionResult | undefined> {
    const [result] = await db
      .select()
      .from(auctionResults)
      .where(eq(auctionResults.auctionId, auctionId));
    return result;
  }

  async createAuctionResult(result: InsertAuctionResult): Promise<AuctionResult> {
    const [newResult] = await db.insert(auctionResults).values(result).returning();
    return newResult;
  }

  async updateAuctionResult(id: number, result: Partial<InsertAuctionResult>): Promise<AuctionResult> {
    const [updatedResult] = await db
      .update(auctionResults)
      .set(result)
      .where(eq(auctionResults.id, id))
      .returning();
    return updatedResult;
  }

  async getArtistAuctionStats(artistId: number): Promise<{
    totalAuctions: number;
    totalSales: number;
    totalRevenue: string;
    averagePrice: string;
    highestPrice: string;
    lowestPrice: string;
  }> {
    const results = await db
      .select()
      .from(auctionResults)
      .where(and(
        eq(auctionResults.artistId, artistId),
        eq(auctionResults.status, 'completed')
      ));

    if (results.length === 0) {
      return {
        totalAuctions: 0,
        totalSales: 0,
        totalRevenue: '0',
        averagePrice: '0',
        highestPrice: '0',
        lowestPrice: '0'
      };
    }

    const prices = results.map(r => parseFloat(r.finalPrice || '0'));
    const totalRevenue = prices.reduce((sum, price) => sum + price, 0);
    const averagePrice = totalRevenue / prices.length;
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);

    return {
      totalAuctions: results.length,
      totalSales: results.length,
      totalRevenue: totalRevenue.toFixed(2),
      averagePrice: averagePrice.toFixed(2),
      highestPrice: highestPrice.toFixed(2),
      lowestPrice: lowestPrice.toFixed(2)
    };
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

  // Workshop operations
  async getWorkshops(limit = 20, offset = 0): Promise<Workshop[]> {
    return await db.select().from(workshops)
      .orderBy(desc(workshops.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getWorkshop(id: number): Promise<Workshop | undefined> {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.id, id));
    return workshop;
  }

  async getFeaturedWorkshops(limit = 10): Promise<Workshop[]> {
    return await db.select().from(workshops)
      .where(eq(workshops.featured, true))
      .orderBy(desc(workshops.createdAt))
      .limit(limit);
  }

  async getWorkshopsByInstructor(instructorId: string, instructorType: string, limit = 20): Promise<Workshop[]> {
    return await db.select().from(workshops)
      .where(and(
        eq(workshops.instructorId, instructorId),
        eq(workshops.instructorType, instructorType)
      ))
      .orderBy(desc(workshops.createdAt))
      .limit(limit);
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const [newWorkshop] = await db.insert(workshops).values(workshop).returning();
    return newWorkshop;
  }

  async updateWorkshop(id: number, workshop: Partial<InsertWorkshop>): Promise<Workshop> {
    const [updated] = await db
      .update(workshops)
      .set({ ...workshop, updatedAt: new Date() })
      .where(eq(workshops.id, id))
      .returning();
    return updated;
  }

  async deleteWorkshop(id: number): Promise<boolean> {
    const result = await db.delete(workshops).where(eq(workshops.id, id));
    return result.rowCount > 0;
  }

  // Workshop registration operations
  async getWorkshopRegistrations(workshopId: number): Promise<WorkshopRegistration[]> {
    return await db.select().from(workshopRegistrations)
      .where(eq(workshopRegistrations.workshopId, workshopId))
      .orderBy(desc(workshopRegistrations.registeredAt));
  }

  async createWorkshopRegistration(registration: InsertWorkshopRegistration): Promise<WorkshopRegistration> {
    const [newRegistration] = await db.insert(workshopRegistrations).values(registration).returning();
    return newRegistration;
  }

  async updateWorkshopRegistration(id: number, registration: Partial<InsertWorkshopRegistration>): Promise<WorkshopRegistration> {
    const [updated] = await db
      .update(workshopRegistrations)
      .set(registration)
      .where(eq(workshopRegistrations.id, id))
      .returning();
    return updated;
  }

  async deleteWorkshopRegistration(id: number): Promise<boolean> {
    const result = await db.delete(workshopRegistrations).where(eq(workshopRegistrations.id, id));
    return result.rowCount > 0;
  }

  async getUserWorkshopRegistrations(userId: string): Promise<WorkshopRegistration[]> {
    return await db.select().from(workshopRegistrations)
      .where(eq(workshopRegistrations.userId, userId))
      .orderBy(desc(workshopRegistrations.registeredAt));
  }

  // Event operations
  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    return await db.select().from(events)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getFeaturedEvents(limit = 10): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.featured, true))
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }

  async getEventsByOrganizer(organizerId: string, organizerType: string, limit = 20): Promise<Event[]> {
    return await db.select().from(events)
      .where(and(
        eq(events.organizerId, organizerId),
        eq(events.organizerType, organizerType)
      ))
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }

  // Event RSVP operations
  async getEventRsvps(eventId: number): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId))
      .orderBy(desc(eventRsvps.rsvpedAt));
  }

  async createEventRsvp(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const [newRsvp] = await db.insert(eventRsvps).values(rsvp).returning();
    return newRsvp;
  }

  async updateEventRsvp(id: number, rsvp: Partial<InsertEventRsvp>): Promise<EventRsvp> {
    const [updated] = await db
      .update(eventRsvps)
      .set(rsvp)
      .where(eq(eventRsvps.id, id))
      .returning();
    return updated;
  }

  async deleteEventRsvp(id: number): Promise<boolean> {
    const result = await db.delete(eventRsvps).where(eq(eventRsvps.id, id));
    return result.rowCount > 0;
  }

  async getUserEventRsvps(userId: string): Promise<EventRsvp[]> {
    return await db.select().from(eventRsvps)
      .where(eq(eventRsvps.userId, userId))
      .orderBy(desc(eventRsvps.rsvpedAt));
  }

  // Workshop/Event Review operations
  async getWorkshopEventReviews(entityType: string, entityId: number): Promise<WorkshopEventReview[]> {
    return await db.select().from(workshopEventReviews)
      .where(and(
        eq(workshopEventReviews.entityType, entityType),
        eq(workshopEventReviews.entityId, entityId)
      ))
      .orderBy(desc(workshopEventReviews.createdAt));
  }

  async getUserWorkshopEventReviews(userId: string): Promise<WorkshopEventReview[]> {
    return await db.select().from(workshopEventReviews)
      .where(eq(workshopEventReviews.userId, userId))
      .orderBy(desc(workshopEventReviews.createdAt));
  }

  async createWorkshopEventReview(review: InsertWorkshopEventReview): Promise<WorkshopEventReview> {
    const [newReview] = await db.insert(workshopEventReviews).values(review).returning();
    
    // Create activity for review
    await this.createActivity({
      userId: review.userId,
      type: "review",
      entityType: review.entityType,
      entityId: review.entityId,
      metadata: { rating: review.rating }
    });
    
    return newReview;
  }

  async updateWorkshopEventReview(id: number, review: Partial<InsertWorkshopEventReview>): Promise<WorkshopEventReview> {
    const [updated] = await db
      .update(workshopEventReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(workshopEventReviews.id, id))
      .returning();
    return updated;
  }

  async deleteWorkshopEventReview(id: number): Promise<boolean> {
    const result = await db.delete(workshopEventReviews).where(eq(workshopEventReviews.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getAverageRating(entityType: string, entityId: number): Promise<{ avgRating: number; reviewCount: number }> {
    const [result] = await db
      .select({
        avgRating: sql<number>`AVG(${workshopEventReviews.rating})`,
        reviewCount: count()
      })
      .from(workshopEventReviews)
      .where(and(
        eq(workshopEventReviews.entityType, entityType),
        eq(workshopEventReviews.entityId, entityId)
      ));
    
    return {
      avgRating: result.avgRating || 0,
      reviewCount: result.reviewCount
    };
  }

  // Discussion operations
  async getDiscussions(limit = 20, offset = 0): Promise<Discussion[]> {
    return await db.select().from(discussions)
      .orderBy(desc(discussions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  async getDiscussionsByCategory(category: string, limit = 20): Promise<Discussion[]> {
    return await db.select().from(discussions)
      .where(eq(discussions.category, category))
      .orderBy(desc(discussions.createdAt))
      .limit(limit);
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    const [newDiscussion] = await db.insert(discussions).values(discussion).returning();
    return newDiscussion;
  }

  async updateDiscussion(id: number, discussion: Partial<InsertDiscussion>): Promise<Discussion> {
    const [updated] = await db
      .update(discussions)
      .set({ ...discussion, updatedAt: new Date() })
      .where(eq(discussions.id, id))
      .returning();
    return updated;
  }

  async deleteDiscussion(id: number): Promise<boolean> {
    const result = await db.delete(discussions).where(eq(discussions.id, id));
    return result.rowCount > 0;
  }

  // Discussion reply operations
  async getDiscussionReplies(discussionId: number): Promise<DiscussionReply[]> {
    return await db.select().from(discussionReplies)
      .where(eq(discussionReplies.discussionId, discussionId))
      .orderBy(asc(discussionReplies.createdAt));
  }

  async createDiscussionReply(reply: InsertDiscussionReply): Promise<DiscussionReply> {
    const [newReply] = await db.insert(discussionReplies).values(reply).returning();
    return newReply;
  }

  async updateDiscussionReply(id: number, reply: Partial<InsertDiscussionReply>): Promise<DiscussionReply> {
    const [updated] = await db
      .update(discussionReplies)
      .set({ ...reply, updatedAt: new Date() })
      .where(eq(discussionReplies.id, id))
      .returning();
    return updated;
  }

  async deleteDiscussionReply(id: number): Promise<boolean> {
    const result = await db.delete(discussionReplies).where(eq(discussionReplies.id, id));
    return result.rowCount > 0;
  }

  // Count operations updates
  async getWorkshopCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(workshops);
    return result.count;
  }

  async getEventCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(events);
    return result.count;
  }

  async getDiscussionCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(discussions);
    return result.count;
  }
  
  // Analytics operations
  async recordArtworkView(view: InsertArtworkView): Promise<ArtworkView> {
    const [newView] = await db.insert(artworkViews).values(view).returning();
    return newView;
  }
  
  async getArtworkViews(artworkId: number, days = 30): Promise<ArtworkView[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db.select().from(artworkViews)
      .where(and(
        eq(artworkViews.artworkId, artworkId),
        gte(artworkViews.viewedAt, startDate)
      ))
      .orderBy(desc(artworkViews.viewedAt));
  }
  
  async updateArtistAnalytics(artistId: number, date: string): Promise<ArtistAnalytics> {
    // Get current stats for the artist
    const [profileViews] = await db.select({ count: count() }).from(artworkViews)
      .innerJoin(artworks, eq(artworkViews.artworkId, artworks.id))
      .where(and(
        eq(artworks.artistId, artistId),
        eq(sql`DATE(${artworkViews.viewedAt})`, date)
      ));
    
    const [artworkViewsCount] = await db.select({ count: count() }).from(artworkViews)
      .innerJoin(artworks, eq(artworkViews.artworkId, artworks.id))
      .where(eq(artworks.artistId, artistId));
    
    const [inquiriesCount] = await db.select({ count: count() }).from(inquiries)
      .innerJoin(artworks, eq(inquiries.artworkId, artworks.id))
      .where(eq(artworks.artistId, artistId));
    
    const [followersCount] = await db.select({ count: count() }).from(follows)
      .where(and(
        eq(follows.entityType, 'artist'),
        eq(follows.entityId, artistId)
      ));
    
    const analytics = {
      artistId,
      date,
      profileViews: profileViews.count,
      artworkViews: artworkViewsCount.count,
      inquiries: inquiriesCount.count,
      followers: followersCount.count,
      totalSales: "0", // This would need to be calculated from actual sales data
    };
    
    const [updated] = await db.insert(artistAnalytics)
      .values(analytics)
      .onConflictDoUpdate({
        target: [artistAnalytics.artistId, artistAnalytics.date],
        set: {
          ...analytics,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return updated;
  }
  
  async getArtistAnalytics(artistId: number, startDate?: string, endDate?: string): Promise<ArtistAnalytics[]> {
    let query = db.select().from(artistAnalytics).where(eq(artistAnalytics.artistId, artistId));
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(artistAnalytics.date, startDate),
        lte(artistAnalytics.date, endDate)
      ));
    }
    
    return await query.orderBy(desc(artistAnalytics.date));
  }
  
  async recordSearchHistory(search: InsertSearchHistory): Promise<SearchHistory> {
    const [newSearch] = await db.insert(searchHistory).values(search).returning();
    return newSearch;
  }
  
  async getSearchHistory(userId: string, limit = 20): Promise<SearchHistory[]> {
    return await db.select().from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.searchedAt))
      .limit(limit);
  }
  
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db.select().from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences;
  }
  
  async upsertUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [updated] = await db.insert(userPreferences)
      .values(preferences)
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updated;
  }
  
  async getPortfolioSections(artistId: number): Promise<PortfolioSection[]> {
    return await db.select().from(portfolioSections)
      .where(and(
        eq(portfolioSections.artistId, artistId),
        eq(portfolioSections.isVisible, true)
      ))
      .orderBy(asc(portfolioSections.orderIndex));
  }
  
  async createPortfolioSection(section: InsertPortfolioSection): Promise<PortfolioSection> {
    const [newSection] = await db.insert(portfolioSections).values(section).returning();
    return newSection;
  }
  
  async updatePortfolioSection(id: number, section: Partial<InsertPortfolioSection>): Promise<PortfolioSection> {
    const [updated] = await db
      .update(portfolioSections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(portfolioSections.id, id))
      .returning();
    return updated;
  }
  
  async deletePortfolioSection(id: number): Promise<void> {
    await db.delete(portfolioSections).where(eq(portfolioSections.id, id));
  }
  
  // Seller operations
  async getArtistByUserId(userId: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    return artist;
  }
  
  async getGalleryByUserId(userId: string): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    return gallery;
  }
  
  async getSellerPaymentMethods(userId: string): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    if (user.role === 'artist') {
      const artist = await this.getArtistByUserId(userId);
      if (artist?.paymentMethods) {
        return (artist.paymentMethods as any[]).map((method: any, index: number) => ({
          ...method,
          id: `artist-${artist.id}-${index}`
        }));
      }
    } else if (user.role === 'gallery') {
      const gallery = await this.getGalleryByUserId(userId);
      if (gallery?.paymentMethods) {
        return (gallery.paymentMethods as any[]).map((method: any, index: number) => ({
          ...method,
          id: `gallery-${gallery.id}-${index}`
        }));
      }
    }
    
    return [];
  }
  
  async addSellerPaymentMethod(userId: string, method: any): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    if (user.role === 'artist') {
      const artist = await this.getArtistByUserId(userId);
      if (!artist) throw new Error("Artist not found");
      
      const methods = (artist.paymentMethods as any[]) || [];
      methods.push(method);
      
      await db.update(artists)
        .set({ paymentMethods: methods, updatedAt: new Date() })
        .where(eq(artists.userId, userId));
      
      return { ...method, id: `artist-${artist.id}-${methods.length - 1}` };
    } else if (user.role === 'gallery') {
      const gallery = await this.getGalleryByUserId(userId);
      if (!gallery) throw new Error("Gallery not found");
      
      const methods = (gallery.paymentMethods as any[]) || [];
      methods.push(method);
      
      await db.update(galleries)
        .set({ paymentMethods: methods, updatedAt: new Date() })
        .where(eq(galleries.userId, userId));
      
      return { ...method, id: `gallery-${gallery.id}-${methods.length - 1}` };
    }
    
    throw new Error("User is not a seller");
  }
  
  async updateSellerPaymentMethod(userId: string, methodId: string, method: any): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const [type, id, index] = methodId.split('-');
    const methodIndex = parseInt(index);
    
    if (type === 'artist' && user.role === 'artist') {
      const artist = await this.getArtistByUserId(userId);
      if (!artist) throw new Error("Artist not found");
      
      const methods = (artist.paymentMethods as any[]) || [];
      if (methodIndex >= 0 && methodIndex < methods.length) {
        methods[methodIndex] = { ...methods[methodIndex], ...method };
        
        await db.update(artists)
          .set({ paymentMethods: methods, updatedAt: new Date() })
          .where(eq(artists.userId, userId));
        
        return { ...methods[methodIndex], id: methodId };
      }
    } else if (type === 'gallery' && user.role === 'gallery') {
      const gallery = await this.getGalleryByUserId(userId);
      if (!gallery) throw new Error("Gallery not found");
      
      const methods = (gallery.paymentMethods as any[]) || [];
      if (methodIndex >= 0 && methodIndex < methods.length) {
        methods[methodIndex] = { ...methods[methodIndex], ...method };
        
        await db.update(galleries)
          .set({ paymentMethods: methods, updatedAt: new Date() })
          .where(eq(galleries.userId, userId));
        
        return { ...methods[methodIndex], id: methodId };
      }
    }
    
    throw new Error("Payment method not found");
  }
  
  async deleteSellerPaymentMethod(userId: string, methodId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const [type, id, index] = methodId.split('-');
    const methodIndex = parseInt(index);
    
    if (type === 'artist' && user.role === 'artist') {
      const artist = await this.getArtistByUserId(userId);
      if (!artist) throw new Error("Artist not found");
      
      const methods = (artist.paymentMethods as any[]) || [];
      if (methodIndex >= 0 && methodIndex < methods.length) {
        methods.splice(methodIndex, 1);
        
        await db.update(artists)
          .set({ paymentMethods: methods, updatedAt: new Date() })
          .where(eq(artists.userId, userId));
      }
    } else if (type === 'gallery' && user.role === 'gallery') {
      const gallery = await this.getGalleryByUserId(userId);
      if (!gallery) throw new Error("Gallery not found");
      
      const methods = (gallery.paymentMethods as any[]) || [];
      if (methodIndex >= 0 && methodIndex < methods.length) {
        methods.splice(methodIndex, 1);
        
        await db.update(galleries)
          .set({ paymentMethods: methods, updatedAt: new Date() })
          .where(eq(galleries.userId, userId));
      }
    }
  }
  
  async getSellerOrders(userId: string): Promise<any[]> {
    const user = await this.getUser(userId);
    if (!user) return [];
    
    if (user.role === 'artist') {
      const artist = await this.getArtistByUserId(userId);
      if (!artist) return [];
      
      const orders = await db.select({
        order: purchaseOrders,
        artwork: artworks,
        buyer: users,
        tracking: shippingTracking
      })
      .from(purchaseOrders)
      .innerJoin(artworks, eq(purchaseOrders.artworkId, artworks.id))
      .innerJoin(users, eq(purchaseOrders.userId, users.id))
      .leftJoin(shippingTracking, eq(shippingTracking.orderId, purchaseOrders.id))
      .where(eq(artworks.artistId, artist.id))
      .orderBy(desc(purchaseOrders.createdAt));
      
      return orders.map(row => ({
        ...row.order,
        artwork: row.artwork,
        buyer: row.buyer,
        tracking: row.tracking
      }));
    } else if (user.role === 'gallery') {
      const gallery = await this.getGalleryByUserId(userId);
      if (!gallery) return [];
      
      const orders = await db.select({
        order: purchaseOrders,
        artwork: artworks,
        buyer: users,
        tracking: shippingTracking
      })
      .from(purchaseOrders)
      .innerJoin(artworks, eq(purchaseOrders.artworkId, artworks.id))
      .innerJoin(users, eq(purchaseOrders.userId, users.id))
      .leftJoin(shippingTracking, eq(shippingTracking.orderId, purchaseOrders.id))
      .where(eq(artworks.galleryId, gallery.id))
      .orderBy(desc(purchaseOrders.createdAt));
      
      return orders.map(row => ({
        ...row.order,
        artwork: row.artwork,
        buyer: row.buyer,
        tracking: row.tracking
      }));
    }
    
    return [];
  }
  
  async updateSellerOrder(userId: string, orderId: number, update: any): Promise<any> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    // Verify the order belongs to the seller
    const orders = await this.getSellerOrders(userId);
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found or not authorized");
    
    // Update order status
    const [updatedOrder] = await db.update(purchaseOrders)
      .set({
        status: update.status,
        sellerNotes: update.sellerNotes,
        sellerUpdatedAt: new Date(),
        paymentStatus: update.status === 'confirmed' ? 'paid' : purchaseOrders.paymentStatus,
        paymentConfirmedAt: update.status === 'confirmed' ? new Date() : undefined,
        updatedAt: new Date()
      })
      .where(eq(purchaseOrders.id, orderId))
      .returning();
    
    // Update or create tracking info
    if (update.trackingInfo && (update.trackingInfo.trackingNumber || update.trackingInfo.carrier)) {
      const existingTracking = await db.select().from(shippingTracking)
        .where(eq(shippingTracking.orderId, orderId))
        .limit(1);
      
      if (existingTracking.length > 0) {
        await db.update(shippingTracking)
          .set({
            trackingNumber: update.trackingInfo.trackingNumber || existingTracking[0].trackingNumber,
            carrier: update.trackingInfo.carrier || existingTracking[0].carrier,
            status: update.status === 'shipped' ? 'in_transit' : 
                    update.status === 'delivered' ? 'delivered' : existingTracking[0].status,
            updatedAt: new Date()
          })
          .where(eq(shippingTracking.orderId, orderId));
      } else {
        await db.insert(shippingTracking)
          .values({
            orderId: orderId,
            trackingNumber: update.trackingInfo.trackingNumber,
            carrier: update.trackingInfo.carrier,
            status: update.status === 'shipped' ? 'in_transit' : 'pending'
          });
      }
    }
    
    return updatedOrder;
  }
  
  // Email notification operations
  async getNewsletterSubscriber(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));
    return subscriber;
  }
  
  async getNewsletterSubscriberByUserId(userId: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.userId, userId));
    return subscriber;
  }

  async getNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
    let query = db.select().from(newsletterSubscribers);
    
    if (status) {
      query = query.where(eq(newsletterSubscribers.subscriptionStatus, status));
    }
    
    return await query.orderBy(desc(newsletterSubscribers.subscribedAt));
  }
  
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db.insert(emailTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }
  
  async getEmailTemplate(templateCode: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.templateCode, templateCode));
    return template;
  }
  
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await db.select()
      .from(emailTemplates)
      .orderBy(desc(emailTemplates.createdAt));
  }
  
  async updateEmailTemplate(id: number, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const [updated] = await db.update(emailTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updated;
  }
  
  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates)
      .where(eq(emailTemplates.id, id));
  }
  
  async getEmailNotificationQueue(status?: string, limit = 50): Promise<EmailNotificationQueue[]> {
    let query = db.select().from(emailNotificationQueue);
    
    if (status) {
      query = query.where(eq(emailNotificationQueue.status, status));
    }
    
    return await query
      .orderBy(desc(emailNotificationQueue.createdAt))
      .limit(limit);
  }
  
  async getEmailNotificationLog(recipientEmail?: string, limit = 100): Promise<EmailNotificationLog[]> {
    let query = db.select().from(emailNotificationLog);
    
    if (recipientEmail) {
      query = query.where(eq(emailNotificationLog.recipientEmail, recipientEmail));
    }
    
    return await query
      .orderBy(desc(emailNotificationLog.sentAt))
      .limit(limit);
  }

  // Achievement Badge operations
  async getAchievementBadges(category?: string): Promise<AchievementBadge[]> {
    let query = db.select().from(achievementBadges).where(eq(achievementBadges.isActive, true));
    
    if (category) {
      query = query.where(and(
        eq(achievementBadges.isActive, true),
        eq(achievementBadges.category, category)
      ));
    }
    
    return await query.orderBy(asc(achievementBadges.pointsValue));
  }

  async getAchievementBadge(id: number): Promise<AchievementBadge | undefined> {
    const [badge] = await db.select()
      .from(achievementBadges)
      .where(eq(achievementBadges.id, id));
    return badge;
  }

  async createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge> {
    const [newBadge] = await db.insert(achievementBadges)
      .values(badge)
      .returning();
    return newBadge;
  }

  // Artist Achievement operations
  async getArtistAchievements(artistId: number): Promise<ArtistAchievement[]> {
    return await db.select({
      id: artistAchievements.id,
      artistId: artistAchievements.artistId,
      badgeId: artistAchievements.badgeId,
      earnedAt: artistAchievements.earnedAt,
      progress: artistAchievements.progress,
      level: artistAchievements.level,
      isDisplayed: artistAchievements.isDisplayed,
      notificationSent: artistAchievements.notificationSent,
      badge: {
        id: achievementBadges.id,
        name: achievementBadges.name,
        nameAr: achievementBadges.nameAr,
        description: achievementBadges.description,
        descriptionAr: achievementBadges.descriptionAr,
        category: achievementBadges.category,
        icon: achievementBadges.icon,
        color: achievementBadges.color,
        rarity: achievementBadges.rarity,
        pointsValue: achievementBadges.pointsValue,
      }
    })
    .from(artistAchievements)
    .leftJoin(achievementBadges, eq(artistAchievements.badgeId, achievementBadges.id))
    .where(and(
      eq(artistAchievements.artistId, artistId),
      eq(artistAchievements.isDisplayed, true)
    ))
    .orderBy(desc(artistAchievements.earnedAt));
  }

  async createArtistAchievement(achievement: InsertArtistAchievement): Promise<ArtistAchievement> {
    const [newAchievement] = await db.insert(artistAchievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }

  async updateArtistAchievement(id: number, achievement: Partial<InsertArtistAchievement>): Promise<ArtistAchievement> {
    const [updated] = await db.update(artistAchievements)
      .set(achievement)
      .where(eq(artistAchievements.id, id))
      .returning();
    return updated;
  }

  // Artist Stats operations
  async getArtistStats(artistId: number): Promise<ArtistStats | undefined> {
    const [stats] = await db.select()
      .from(artistStats)
      .where(eq(artistStats.artistId, artistId));
    return stats;
  }

  async createArtistStats(stats: InsertArtistStats): Promise<ArtistStats> {
    const [newStats] = await db.insert(artistStats)
      .values(stats)
      .returning();
    return newStats;
  }

  async updateArtistStats(artistId: number, stats: Partial<InsertArtistStats>): Promise<ArtistStats> {
    const [updated] = await db.update(artistStats)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(artistStats.artistId, artistId))
      .returning();
    return updated;
  }

  // Badge Progress operations
  async getBadgeProgress(artistId: number): Promise<BadgeProgress[]> {
    return await db.select({
      id: badgeProgress.id,
      artistId: badgeProgress.artistId,
      badgeId: badgeProgress.badgeId,
      currentValue: badgeProgress.currentValue,
      targetValue: badgeProgress.targetValue,
      progressPercentage: badgeProgress.progressPercentage,
      isCompleted: badgeProgress.isCompleted,
      updatedAt: badgeProgress.updatedAt,
      badge: {
        id: achievementBadges.id,
        name: achievementBadges.name,
        nameAr: achievementBadges.nameAr,
        description: achievementBadges.description,
        descriptionAr: achievementBadges.descriptionAr,
        category: achievementBadges.category,
        icon: achievementBadges.icon,
        color: achievementBadges.color,
        rarity: achievementBadges.rarity,
        pointsValue: achievementBadges.pointsValue,
      }
    })
    .from(badgeProgress)
    .leftJoin(achievementBadges, eq(badgeProgress.badgeId, achievementBadges.id))
    .where(eq(badgeProgress.artistId, artistId))
    .orderBy(desc(badgeProgress.progressPercentage));
  }

  async createBadgeProgress(progress: InsertBadgeProgress): Promise<BadgeProgress> {
    const [newProgress] = await db.insert(badgeProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async updateBadgeProgress(artistId: number, badgeId: number, progress: Partial<InsertBadgeProgress>): Promise<BadgeProgress> {
    const [updated] = await db.update(badgeProgress)
      .set({ ...progress, updatedAt: new Date() })
      .where(and(
        eq(badgeProgress.artistId, artistId),
        eq(badgeProgress.badgeId, badgeId)
      ))
      .returning();
    return updated;
  }

  // Achievement calculation method
  async calculateAchievements(artistId: number): Promise<void> {
    // Get artist stats
    const stats = await this.getArtistStats(artistId);
    if (!stats) return;

    // Get all active badges
    const badges = await this.getAchievementBadges();
    
    // Check each badge against current stats
    for (const badge of badges) {
      if (!badge.requiredMetric || !badge.requiredValue) continue;
      
      let currentValue = 0;
      switch (badge.requiredMetric) {
        case 'total_sales':
          currentValue = stats.totalSales;
          break;
        case 'total_revenue':
          currentValue = parseFloat(stats.totalRevenue || '0');
          break;
        case 'total_followers':
          currentValue = stats.totalFollowers;
          break;
        case 'total_views':
          currentValue = stats.totalViews;
          break;
        case 'total_artworks':
          currentValue = stats.totalArtworks;
          break;
        case 'total_workshops':
          currentValue = stats.totalWorkshops;
          break;
        case 'total_exhibitions':
          currentValue = stats.totalExhibitions;
          break;
        case 'average_rating':
          currentValue = Math.round(parseFloat(stats.averageRating || '0') * 10); // Convert to 0-50 scale
          break;
        case 'profile_completeness':
          currentValue = stats.profileCompleteness;
          break;
        default:
          continue;
      }

      // Check if badge should be awarded
      if (currentValue >= badge.requiredValue) {
        // Check if artist already has this badge
        const existingAchievement = await db.select()
          .from(artistAchievements)
          .where(and(
            eq(artistAchievements.artistId, artistId),
            eq(artistAchievements.badgeId, badge.id)
          ));

        if (existingAchievement.length === 0) {
          // Award the badge
          await this.createArtistAchievement({
            artistId,
            badgeId: badge.id,
            level: 1,
            progress: 0,
            isDisplayed: true,
            notificationSent: false
          });

          // Update artist's achievement points
          await this.updateArtistStats(artistId, {
            achievementPoints: stats.achievementPoints + badge.pointsValue
          });
        }
      }

      // Update or create badge progress
      const progressPercentage = Math.min((currentValue / badge.requiredValue) * 100, 100);
      
      try {
        await this.updateBadgeProgress(artistId, badge.id, {
          currentValue,
          progressPercentage: progressPercentage.toFixed(2),
          isCompleted: currentValue >= badge.requiredValue
        });
      } catch {
        // If update fails, create new progress record
        await this.createBadgeProgress({
          artistId,
          badgeId: badge.id,
          currentValue,
          targetValue: badge.requiredValue,
          progressPercentage: progressPercentage.toFixed(2),
          isCompleted: currentValue >= badge.requiredValue
        });
      }
    }
  }

  // Scheduling Features
  async checkSchedulingConflicts(entityType: string, entityId: number, startDate: Date, endDate: Date): Promise<SchedulingConflict[]> {
    return await db.select()
      .from(schedulingConflicts)
      .where(and(
        eq(schedulingConflicts.entityType, entityType),
        eq(schedulingConflicts.entityId, entityId),
        eq(schedulingConflicts.resolved, false)
      ));
  }

  async createSchedulingConflict(conflict: InsertSchedulingConflict): Promise<SchedulingConflict> {
    const [newConflict] = await db.insert(schedulingConflicts)
      .values(conflict)
      .returning();
    return newConflict;
  }

  async resolveSchedulingConflict(id: number, resolvedBy: string): Promise<void> {
    await db.update(schedulingConflicts)
      .set({ 
        resolved: true, 
        resolvedAt: new Date(),
        resolvedBy 
      })
      .where(eq(schedulingConflicts.id, id));
  }

  async getUnresolvedConflicts(entityType?: string): Promise<SchedulingConflict[]> {
    if (entityType) {
      return await db.select()
        .from(schedulingConflicts)
        .where(and(
          eq(schedulingConflicts.resolved, false),
          eq(schedulingConflicts.entityType, entityType)
        ))
        .orderBy(desc(schedulingConflicts.createdAt));
    }
    
    return await db.select()
      .from(schedulingConflicts)
      .where(eq(schedulingConflicts.resolved, false))
      .orderBy(desc(schedulingConflicts.createdAt));
  }

  // Event Reminders
  async createEventReminder(reminder: InsertEventReminder): Promise<EventReminder> {
    const [newReminder] = await db.insert(eventReminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updateEventReminder(id: number, reminder: Partial<InsertEventReminder>): Promise<EventReminder> {
    const [updated] = await db.update(eventReminders)
      .set({ ...reminder, updatedAt: new Date() })
      .where(eq(eventReminders.id, id))
      .returning();
    return updated;
  }

  async deleteEventReminder(id: number): Promise<void> {
    await db.delete(eventReminders).where(eq(eventReminders.id, id));
  }

  async getEventReminders(entityType: string, entityId: number): Promise<EventReminder[]> {
    return await db.select()
      .from(eventReminders)
      .where(and(
        eq(eventReminders.entityType, entityType),
        eq(eventReminders.entityId, entityId)
      ))
      .orderBy(asc(eventReminders.scheduledFor));
  }

  async getUpcomingReminders(limit = 50): Promise<EventReminder[]> {
    return await db.select()
      .from(eventReminders)
      .where(and(
        eq(eventReminders.status, 'scheduled'),
        lte(eventReminders.scheduledFor, new Date())
      ))
      .orderBy(asc(eventReminders.scheduledFor))
      .limit(limit);
  }

  async markReminderSent(id: number): Promise<void> {
    await db.update(eventReminders)
      .set({ 
        status: 'sent',
        sentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(eventReminders.id, id));
  }

  // Calendar Integration
  async getCalendarIntegration(userId: string, provider: string): Promise<CalendarIntegration | undefined> {
    const [integration] = await db.select()
      .from(calendarIntegrations)
      .where(and(
        eq(calendarIntegrations.userId, userId),
        eq(calendarIntegrations.provider, provider)
      ));
    return integration;
  }

  async createCalendarIntegration(integration: InsertCalendarIntegration): Promise<CalendarIntegration> {
    const [newIntegration] = await db.insert(calendarIntegrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async updateCalendarIntegration(id: number, integration: Partial<InsertCalendarIntegration>): Promise<CalendarIntegration> {
    const [updated] = await db.update(calendarIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(calendarIntegrations.id, id))
      .returning();
    return updated;
  }

  async deleteCalendarIntegration(userId: string, provider: string): Promise<void> {
    await db.delete(calendarIntegrations)
      .where(and(
        eq(calendarIntegrations.userId, userId),
        eq(calendarIntegrations.provider, provider)
      ));
  }

  async getUserCalendarIntegrations(userId: string): Promise<CalendarIntegration[]> {
    return await db.select()
      .from(calendarIntegrations)
      .where(eq(calendarIntegrations.userId, userId));
  }

  // Participant Management
  async getParticipantList(entityType: string, entityId: number, status?: string): Promise<ParticipantList[]> {
    const conditions = [
      eq(participantLists.entityType, entityType),
      eq(participantLists.entityId, entityId)
    ];

    if (status) {
      conditions.push(eq(participantLists.status, status));
    }

    return await db.select()
      .from(participantLists)
      .where(and(...conditions))
      .orderBy(asc(participantLists.createdAt));
  }

  async addParticipant(participant: InsertParticipantList): Promise<ParticipantList> {
    const [newParticipant] = await db.insert(participantLists)
      .values(participant)
      .returning();
    return newParticipant;
  }

  async updateParticipant(id: number, participant: Partial<InsertParticipantList>): Promise<ParticipantList> {
    const [updated] = await db.update(participantLists)
      .set({ ...participant, updatedAt: new Date() })
      .where(eq(participantLists.id, id))
      .returning();
    return updated;
  }



  async getParticipantDetails(entityType: string, entityId: number, userId: string): Promise<ParticipantList | undefined> {
    const [participant] = await db.select()
      .from(participantLists)
      .where(and(
        eq(participantLists.entityType, entityType),
        eq(participantLists.entityId, entityId),
        eq(participantLists.userId, userId)
      ));
    return participant;
  }

  async exportParticipantList(entityType: string, entityId: number): Promise<ParticipantList[]> {
    return await db.select()
      .from(participantLists)
      .where(and(
        eq(participantLists.entityType, entityType),
        eq(participantLists.entityId, entityId)
      ))
      .orderBy(asc(participantLists.createdAt));
  }

  // Waitlist Management
  async addToWaitlist(entry: InsertWaitlistEntry): Promise<WaitlistEntry> {
    // Get the next position in the waitlist
    const [maxPosition] = await db.select({ max: sql`COALESCE(MAX(${waitlistEntries.position}), 0)` })
      .from(waitlistEntries)
      .where(and(
        eq(waitlistEntries.entityType, entry.entityType),
        eq(waitlistEntries.entityId, entry.entityId)
      ));
    
    const nextPosition = (maxPosition?.max as number || 0) + 1;
    
    const [newEntry] = await db.insert(waitlistEntries)
      .values({ ...entry, position: nextPosition })
      .returning();
    return newEntry;
  }

  async updateWaitlistEntry(id: number, entry: Partial<InsertWaitlistEntry>): Promise<WaitlistEntry> {
    const [updated] = await db.update(waitlistEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(waitlistEntries.id, id))
      .returning();
    return updated;
  }

  async getWaitlist(entityType: string, entityId: number): Promise<WaitlistEntry[]> {
    return await db.select()
      .from(waitlistEntries)
      .where(and(
        eq(waitlistEntries.entityType, entityType),
        eq(waitlistEntries.entityId, entityId),
        eq(waitlistEntries.status, 'waiting')
      ))
      .orderBy(asc(waitlistEntries.position));
  }

  async promoteFromWaitlist(id: number): Promise<void> {
    await db.update(waitlistEntries)
      .set({ 
        status: 'registered',
        notifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(waitlistEntries.id, id));
  }

  async getWaitlistPosition(entityType: string, entityId: number, userId: string): Promise<number | null> {
    const [entry] = await db.select()
      .from(waitlistEntries)
      .where(and(
        eq(waitlistEntries.entityType, entityType),
        eq(waitlistEntries.entityId, entityId),
        eq(waitlistEntries.userId, userId),
        eq(waitlistEntries.status, 'waiting')
      ));
    
    return entry?.position || null;
  }

  async removeFromWaitlist(entityType: string, entityId: number, userId: string): Promise<void> {
    await db.update(waitlistEntries)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(and(
        eq(waitlistEntries.entityType, entityType),
        eq(waitlistEntries.entityId, entityId),
        eq(waitlistEntries.userId, userId)
      ));
  }

  // Helper method to check if user is host of entity
  async isEntityHost(userId: string, entityType: 'workshops' | 'events', entityId: number): Promise<boolean> {
    if (entityType === 'workshops') {
      const [workshop] = await db.select()
        .from(workshops)
        .where(eq(workshops.id, entityId));
      
      if (!workshop) return false;
      
      // Check if user is the host (either as artist or gallery)
      const artist = await this.getArtistByUserId(userId);
      if (artist && workshop.instructorType === 'artist' && workshop.instructorId === artist.id.toString()) return true;
      
      const gallery = await this.getGalleryByUserId(userId);
      if (gallery && workshop.instructorType === 'gallery' && workshop.instructorId === gallery.id.toString()) return true;
      
      return false;
    } else {
      const [event] = await db.select()
        .from(events)
        .where(eq(events.id, entityId));
      
      if (!event) return false;
      
      // Check if user is the host (either as artist or gallery)
      const artist = await this.getArtistByUserId(userId);
      if (artist && event.organizerType === 'artist' && event.organizerId === artist.id.toString()) return true;
      
      const gallery = await this.getGalleryByUserId(userId);
      if (gallery && event.organizerType === 'gallery' && event.organizerId === gallery.id.toString()) return true;
      
      return false;
    }
  }

  // Export participants as CSV
  async exportParticipantsCSV(participants: ParticipantList[]): Promise<string> {
    const headers = [
      'Name',
      'Email',
      'Status',
      'Check-in Time',
      'Seat Number',
      'Special Requirements',
      'Emergency Contact',
      'Dietary Restrictions',
      'Accessibility Needs'
    ];

    const rows = await Promise.all(participants.map(async (p) => {
      const user = await this.getUser(p.userId);
      return [
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A',
        user?.email || 'N/A',
        p.status,
        p.checkInTime ? new Date(p.checkInTime).toLocaleString() : 'Not checked in',
        p.seatNumber || 'N/A',
        p.specialRequirements || 'None',
        p.emergencyContact ? JSON.stringify(p.emergencyContact) : 'N/A',
        p.dietaryRestrictions?.join(', ') || 'None',
        p.accessibilityNeeds || 'None'
      ];
    }));

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Send bulk notification
  async sendBulkNotification(entityType: 'workshops' | 'events', entityId: number, notification: {
    subject: string;
    message: string;
    recipientFilter?: string;
  }): Promise<{ sent: number; failed: number }> {
    // Get participants based on filter
    let participants = await this.getParticipantList(entityType, entityId);
    
    if (notification.recipientFilter) {
      participants = participants.filter(p => p.status === notification.recipientFilter);
    }

    let sent = 0;
    let failed = 0;

    // Queue emails for each participant
    for (const participant of participants) {
      try {
        const user = await this.getUser(participant.userId);
        if (user?.email) {
          await emailService.queueEmail({
            recipientEmail: user.email,
            recipientUserId: user.id,
            subject: notification.subject,
            bodyHtml: `<p>${notification.message}</p>`,
            bodyText: notification.message,
            priority: 5
          });
          sent++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { sent, failed };
  }

  // Schedule a reminder
  async scheduleReminder(reminder: {
    entityType: 'workshops' | 'events';
    entityId: number;
    userId: string;
    reminderType: string;
    scheduledFor: Date;
    deliveryMethod: string;
    customMessage?: string;
  }): Promise<EventReminder> {
    // Calculate sendBefore in minutes
    const now = new Date();
    const sendBefore = Math.floor((reminder.scheduledFor.getTime() - now.getTime()) / (1000 * 60));

    return await this.createEventReminder({
      entityType: reminder.entityType,
      entityId: reminder.entityId,
      reminderType: reminder.reminderType,
      sendBefore,
      recipientType: 'custom',
      customRecipients: [reminder.userId],
      subject: `Reminder: ${reminder.reminderType}`,
      message: reminder.customMessage || `This is a reminder for your upcoming ${reminder.entityType} event.`,
      scheduledFor: reminder.scheduledFor
    });
  }

  // Get user reminders
  async getUserReminders(userId: string): Promise<EventReminder[]> {
    return await db.select()
      .from(eventReminders)
      .where(and(
        eq(eventReminders.status, 'scheduled'),
        sql`${eventReminders.customRecipients}::jsonb @> ${JSON.stringify([userId])}::jsonb`
      ))
      .orderBy(asc(eventReminders.scheduledFor));
  }

  // Check in participant with seat number
  async checkInParticipant(id: number, method: string, seatNumber?: string): Promise<ParticipantList> {
    const updateData: any = {
      status: 'attended',
      checkInTime: new Date(),
      checkInMethod: method,
      updatedAt: new Date()
    };

    if (seatNumber) {
      updateData.seatNumber = seatNumber;
    }

    const [updated] = await db.update(participantLists)
      .set(updateData)
      .where(eq(participantLists.id, id))
      .returning();
    
    return updated;
  }

  // Get scheduling conflicts for an entity
  async getSchedulingConflicts(entityType: 'workshops' | 'events', entityId: number): Promise<SchedulingConflict[]> {
    return await db.select()
      .from(schedulingConflicts)
      .where(and(
        eq(schedulingConflicts.entityType, entityType),
        eq(schedulingConflicts.entityId, entityId)
      ))
      .orderBy(desc(schedulingConflicts.createdAt));
  }

  // Privacy and Trust/Safety operations
  
  // DSAR (Data Subject Access Requests)
  async getDsarRequests(status?: string): Promise<DsarRequest[]> {
    let query = db.select().from(dsarRequests);
    
    if (status) {
      query = query.where(eq(dsarRequests.status, status as any));
    }
    
    return await query.orderBy(desc(dsarRequests.createdAt));
  }

  async getDsarRequest(id: number): Promise<DsarRequest | undefined> {
    const [request] = await db.select()
      .from(dsarRequests)
      .where(eq(dsarRequests.id, id));
    return request;
  }

  async getUserDsarRequests(userId: string): Promise<DsarRequest[]> {
    return await db.select()
      .from(dsarRequests)
      .where(eq(dsarRequests.userId, userId))
      .orderBy(desc(dsarRequests.createdAt));
  }

  async createDsarRequest(request: InsertDsarRequest): Promise<DsarRequest> {
    const [newRequest] = await db.insert(dsarRequests)
      .values(request)
      .returning();
    
    // Create audit log for DSAR request
    await this.createAuditLog({
      userId: request.userId,
      action: 'dsar_request_created',
      entityType: 'dsar_request',
      entityId: newRequest.id.toString(),
      details: { requestType: request.requestType }
    });
    
    return newRequest;
  }

  async updateDsarRequest(id: number, update: Partial<InsertDsarRequest>): Promise<DsarRequest> {
    const [updated] = await db.update(dsarRequests)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(dsarRequests.id, id))
      .returning();
    
    // Create audit log for DSAR update
    await this.createAuditLog({
      userId: update.processedBy || 'system',
      action: 'dsar_request_updated',
      entityType: 'dsar_request',
      entityId: id.toString(),
      details: { status: update.status }
    });
    
    return updated;
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAuditLogs(userId?: string, entityType?: string, limit: number = 100): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    const conditions = [];
    if (userId) conditions.push(eq(auditLogs.userId, userId));
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getAuditLogsForEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return await db.select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.entityType, entityType),
        eq(auditLogs.entityId, entityId)
      ))
      .orderBy(desc(auditLogs.createdAt));
  }

  // Content Reporting
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports)
      .values(report)
      .returning();
    
    // Create audit log for report creation
    await this.createAuditLog({
      userId: report.reportedBy,
      action: 'content_reported',
      entityType: report.entityType,
      entityId: report.entityId.toString(),
      details: { reportType: report.reportType, reason: report.reason }
    });
    
    return newReport;
  }

  async getReports(status?: string, reportType?: string): Promise<Report[]> {
    let query = db.select().from(reports);
    
    const conditions = [];
    if (status) conditions.push(eq(reports.status, status as any));
    if (reportType) conditions.push(eq(reports.reportType, reportType as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select()
      .from(reports)
      .where(eq(reports.id, id));
    return report;
  }

  async updateReport(id: number, update: Partial<InsertReport>): Promise<Report> {
    const [updated] = await db.update(reports)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    
    // Create audit log for report update
    await this.createAuditLog({
      userId: update.reviewedBy || 'system',
      action: 'report_reviewed',
      entityType: 'report',
      entityId: id.toString(),
      details: { status: update.status, resolution: update.resolution }
    });
    
    return updated;
  }

  async getReportsForEntity(entityType: string, entityId: number): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .where(and(
        eq(reports.entityType, entityType),
        eq(reports.entityId, entityId)
      ))
      .orderBy(desc(reports.createdAt));
  }

  async getUserReports(userId: string): Promise<Report[]> {
    return await db.select()
      .from(reports)
      .where(eq(reports.reportedBy, userId))
      .orderBy(desc(reports.createdAt));
  }

  // Auction Update Requests
  async createAuctionUpdateRequest(request: InsertAuctionUpdateRequest): Promise<AuctionUpdateRequest> {
    const [newRequest] = await db.insert(auctionUpdateRequests)
      .values(request)
      .returning();
    
    await this.createAuditLog({
      userId: request.requestedBy,
      action: 'auction_update_requested',
      entityType: 'auction',
      entityId: request.auctionId.toString(),
      details: { updateType: request.updateType }
    });
    
    return newRequest;
  }

  async getAuctionUpdateRequests(auctionId?: number, status?: string): Promise<AuctionUpdateRequest[]> {
    let query = db.select().from(auctionUpdateRequests);
    
    const conditions = [];
    if (auctionId) conditions.push(eq(auctionUpdateRequests.auctionId, auctionId));
    if (status) conditions.push(eq(auctionUpdateRequests.status, status as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(auctionUpdateRequests.createdAt));
  }

  async updateAuctionUpdateRequest(id: number, update: Partial<InsertAuctionUpdateRequest>): Promise<AuctionUpdateRequest> {
    const [updated] = await db.update(auctionUpdateRequests)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(auctionUpdateRequests.id, id))
      .returning();
    
    await this.createAuditLog({
      userId: update.reviewedBy || 'system',
      action: 'auction_update_reviewed',
      entityType: 'auction_update_request',
      entityId: id.toString(),
      details: { status: update.status }
    });
    
    return updated;
  }

  // Seller KYC
  async createSellerKycDoc(doc: InsertSellerKycDoc): Promise<SellerKycDoc> {
    const [newDoc] = await db.insert(sellerKycDocs)
      .values(doc)
      .returning();
    
    await this.createAuditLog({
      userId: doc.uploadedBy,
      action: 'kyc_document_uploaded',
      entityType: doc.sellerType,
      entityId: doc.sellerId.toString(),
      details: { documentType: doc.documentType }
    });
    
    return newDoc;
  }

  async getSellerKycDocs(sellerType: string, sellerId: number): Promise<SellerKycDoc[]> {
    return await db.select()
      .from(sellerKycDocs)
      .where(and(
        eq(sellerKycDocs.sellerType, sellerType),
        eq(sellerKycDocs.sellerId, sellerId)
      ))
      .orderBy(desc(sellerKycDocs.uploadedAt));
  }

  async updateSellerKycDoc(id: number, update: Partial<InsertSellerKycDoc>): Promise<SellerKycDoc> {
    const [updated] = await db.update(sellerKycDocs)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(sellerKycDocs.id, id))
      .returning();
    
    await this.createAuditLog({
      userId: update.reviewedBy || 'system',
      action: 'kyc_document_reviewed',
      entityType: 'kyc_document',
      entityId: id.toString(),
      details: { status: update.status }
    });
    
    return updated;
  }

  // Shipping Addresses
  async getUserShippingAddresses(userId: string): Promise<ShippingAddress[]> {
    return await db.select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.userId, userId))
      .orderBy(desc(shippingAddresses.isDefault), desc(shippingAddresses.createdAt));
  }

  async getShippingAddress(id: number): Promise<ShippingAddress | undefined> {
    const [address] = await db.select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.id, id));
    return address;
  }

  async createShippingAddress(address: InsertShippingAddress): Promise<ShippingAddress> {
    // If this is set as default, unset other default addresses
    if (address.isDefault) {
      await db.update(shippingAddresses)
        .set({ isDefault: false })
        .where(eq(shippingAddresses.userId, address.userId));
    }
    
    const [newAddress] = await db.insert(shippingAddresses)
      .values(address)
      .returning();
    
    await this.createAuditLog({
      userId: address.userId,
      action: 'shipping_address_added',
      entityType: 'shipping_address',
      entityId: newAddress.id.toString(),
      details: { isDefault: address.isDefault }
    });
    
    return newAddress;
  }

  async updateShippingAddress(id: number, address: Partial<InsertShippingAddress>): Promise<ShippingAddress> {
    // If setting as default, unset other defaults
    if (address.isDefault) {
      const [existingAddress] = await db.select()
        .from(shippingAddresses)
        .where(eq(shippingAddresses.id, id));
      
      if (existingAddress) {
        await db.update(shippingAddresses)
          .set({ isDefault: false })
          .where(and(
            eq(shippingAddresses.userId, existingAddress.userId),
            ne(shippingAddresses.id, id)
          ));
      }
    }
    
    const [updated] = await db.update(shippingAddresses)
      .set({ ...address, updatedAt: new Date() })
      .where(eq(shippingAddresses.id, id))
      .returning();
    
    await this.createAuditLog({
      userId: updated.userId,
      action: 'shipping_address_updated',
      entityType: 'shipping_address',
      entityId: id.toString(),
      details: { isDefault: address.isDefault }
    });
    
    return updated;
  }

  async deleteShippingAddress(id: number): Promise<void> {
    const [address] = await db.select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.id, id));
    
    if (address) {
      await db.delete(shippingAddresses)
        .where(eq(shippingAddresses.id, id));
      
      await this.createAuditLog({
        userId: address.userId,
        action: 'shipping_address_deleted',
        entityType: 'shipping_address',
        entityId: id.toString(),
        details: { addressLine1: address.addressLine1 }
      });
    }
  }

  async setDefaultShippingAddress(userId: string, addressId: number): Promise<void> {
    // Unset all defaults for user
    await db.update(shippingAddresses)
      .set({ isDefault: false })
      .where(eq(shippingAddresses.userId, userId));
    
    // Set new default
    await db.update(shippingAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(
        eq(shippingAddresses.id, addressId),
        eq(shippingAddresses.userId, userId)
      ));
    
    await this.createAuditLog({
      userId,
      action: 'default_shipping_address_changed',
      entityType: 'shipping_address',
      entityId: addressId.toString(),
      details: {}
    });
  }

  // Commission Request operations
  async getCommissionRequests(status?: string, limit = 20, offset = 0): Promise<CommissionRequest[]> {
    let query = db.select().from(commissionRequests);
    
    if (status) {
      query = query.where(eq(commissionRequests.status, status as any));
    }
    
    return await query
      .orderBy(desc(commissionRequests.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommissionRequest(id: number): Promise<CommissionRequest | undefined> {
    const [request] = await db.select()
      .from(commissionRequests)
      .where(eq(commissionRequests.id, id));
    return request;
  }

  async getCommissionRequestsByUser(userId: string): Promise<CommissionRequest[]> {
    return await db.select()
      .from(commissionRequests)
      .where(eq(commissionRequests.userId, userId))
      .orderBy(desc(commissionRequests.createdAt));
  }

  async createCommissionRequest(request: InsertCommissionRequest): Promise<CommissionRequest> {
    const [newRequest] = await db.insert(commissionRequests)
      .values(request)
      .returning();
    
    await this.createAuditLog({
      userId: request.userId,
      action: 'commission_request_created',
      entityType: 'commission_request',
      entityId: newRequest.id.toString(),
      newData: newRequest
    });
    
    return newRequest;
  }

  async updateCommissionRequest(id: number, request: Partial<InsertCommissionRequest>): Promise<CommissionRequest> {
    const [updated] = await db.update(commissionRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(commissionRequests.id, id))
      .returning();
    
    await this.createAuditLog({
      userId: updated.userId,
      action: 'commission_request_updated',
      entityType: 'commission_request',
      entityId: id.toString(),
      newData: request
    });
    
    return updated;
  }

  async deleteCommissionRequest(id: number): Promise<void> {
    const [request] = await db.select()
      .from(commissionRequests)
      .where(eq(commissionRequests.id, id));
    
    if (request) {
      await db.delete(commissionRequests)
        .where(eq(commissionRequests.id, id));
      
      await this.createAuditLog({
        userId: request.userId,
        action: 'commission_request_deleted',
        entityType: 'commission_request',
        entityId: id.toString(),
        oldData: request
      });
    }
  }

  // Commission Bid operations
  async getCommissionBids(requestId: number): Promise<CommissionBid[]> {
    return await db.select()
      .from(commissionBids)
      .where(eq(commissionBids.requestId, requestId))
      .orderBy(desc(commissionBids.createdAt));
  }

  async getCommissionBid(id: number): Promise<CommissionBid | undefined> {
    const [bid] = await db.select()
      .from(commissionBids)
      .where(eq(commissionBids.id, id));
    return bid;
  }

  async getCommissionBidsByArtist(artistId: number): Promise<CommissionBid[]> {
    return await db.select()
      .from(commissionBids)
      .where(eq(commissionBids.artistId, artistId))
      .orderBy(desc(commissionBids.createdAt));
  }

  async createCommissionBid(bid: InsertCommissionBid): Promise<CommissionBid> {
    const [newBid] = await db.insert(commissionBids)
      .values(bid)
      .returning();
    
    await this.createAuditLog({
      userId: null,
      action: 'commission_bid_created',
      entityType: 'commission_bid',
      entityId: newBid.id.toString(),
      newData: newBid
    });
    
    return newBid;
  }

  async updateCommissionBid(id: number, bid: Partial<InsertCommissionBid>): Promise<CommissionBid> {
    const [updated] = await db.update(commissionBids)
      .set({ ...bid, updatedAt: new Date() })
      .where(eq(commissionBids.id, id))
      .returning();
    
    await this.createAuditLog({
      userId: null,
      action: 'commission_bid_updated',
      entityType: 'commission_bid',
      entityId: id.toString(),
      newData: bid
    });
    
    return updated;
  }

  async acceptCommissionBid(bidId: number, userId: string): Promise<CommissionBid> {
    const [bid] = await db.select()
      .from(commissionBids)
      .where(eq(commissionBids.id, bidId));
    
    if (!bid) {
      throw new Error('Bid not found');
    }
    
    // Update bid status to accepted
    const [accepted] = await db.update(commissionBids)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(commissionBids.id, bidId))
      .returning();
    
    // Update request status to in_progress
    await db.update(commissionRequests)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(commissionRequests.id, bid.requestId));
    
    // Reject all other bids for this request
    await db.update(commissionBids)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(and(
        eq(commissionBids.requestId, bid.requestId),
        ne(commissionBids.id, bidId)
      ));
    
    await this.createAuditLog({
      userId,
      action: 'commission_bid_accepted',
      entityType: 'commission_bid',
      entityId: bidId.toString(),
      newData: { status: 'accepted' }
    });
    
    return accepted;
  }

  async rejectCommissionBid(bidId: number): Promise<CommissionBid> {
    const [rejected] = await db.update(commissionBids)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(commissionBids.id, bidId))
      .returning();
    
    await this.createAuditLog({
      userId: null,
      action: 'commission_bid_rejected',
      entityType: 'commission_bid',
      entityId: bidId.toString(),
      newData: { status: 'rejected' }
    });
    
    return rejected;
  }

  // Commission Message operations
  async getCommissionMessages(requestId: number): Promise<CommissionMessage[]> {
    return await db.select()
      .from(commissionMessages)
      .where(eq(commissionMessages.requestId, requestId))
      .orderBy(asc(commissionMessages.createdAt));
  }

  async createCommissionMessage(message: InsertCommissionMessage): Promise<CommissionMessage> {
    const [newMessage] = await db.insert(commissionMessages)
      .values(message)
      .returning();
    
    await this.createAuditLog({
      userId: message.senderId,
      action: 'commission_message_created',
      entityType: 'commission_message',
      entityId: newMessage.id.toString(),
      newData: { requestId: message.requestId }
    });
    
    return newMessage;
  }

  // Commission Contract operations
  async getCommissionContract(requestId: number): Promise<CommissionContract | undefined> {
    const [contract] = await db.select()
      .from(commissionContracts)
      .where(eq(commissionContracts.requestId, requestId));
    return contract;
  }

  async createCommissionContract(contract: InsertCommissionContract): Promise<CommissionContract> {
    const [newContract] = await db.insert(commissionContracts)
      .values(contract)
      .returning();
    
    await this.createAuditLog({
      userId: null,
      action: 'commission_contract_created',
      entityType: 'commission_contract',
      entityId: newContract.id.toString(),
      newData: newContract
    });
    
    return newContract;
  }

  async updateCommissionContract(id: number, contract: Partial<InsertCommissionContract>): Promise<CommissionContract> {
    const [updated] = await db.update(commissionContracts)
      .set({ ...contract, updatedAt: new Date() })
      .where(eq(commissionContracts.id, id))
      .returning();
    
    await this.createAuditLog({
      userId: null,
      action: 'commission_contract_updated',
      entityType: 'commission_contract',
      entityId: id.toString(),
      newData: contract
    });
    
    return updated;
  }


}

export const storage = new DatabaseStorage();
