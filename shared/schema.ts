import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
  date,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lifecycle Stage Enum - User Journey Funnel
export const lifecycleStage = pgEnum('lifecycle_stage', [
  'aware',     // Just discovered the platform
  'join',      // Signed up but haven't fully explored
  'explore',   // Browsing artworks, artists, galleries
  'transact',  // Made their first purchase/bid/commission
  'retain',    // Regular user with multiple interactions
  'advocate'   // Active promoter, referring others
]);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, artist, gallery, admin
  roles: jsonb("roles").default([]), // Array of roles: ["collector", "artist", "gallery"]
  roleSetupComplete: boolean("role_setup_complete").default(false),
  lifecycleStage: lifecycleStage("lifecycle_stage").default("aware"),
  stageTransitionAt: timestamp("stage_transition_at").defaultNow(),
  profileCompleteness: integer("profile_completeness").default(20), // Percentage 0-100
  riskLevel: varchar("risk_level").default("low"), // low, medium, high for PDPL compliance
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artists table
export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  biography: text("biography"),
  biographyAr: text("biography_ar"),
  nationality: varchar("nationality"),
  birthYear: integer("birth_year"),
  profileImage: varchar("profile_image"),
  coverImage: varchar("cover_image"),
  website: varchar("website"),
  instagram: varchar("instagram"),
  featured: boolean("featured").default(false),
  paymentMethods: jsonb("payment_methods").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Galleries table
export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  location: varchar("location"),
  locationAr: varchar("location_ar"),
  website: varchar("website"),
  phone: varchar("phone"),
  email: varchar("email"),
  profileImage: varchar("profile_image"),
  coverImage: varchar("cover_image"),
  featured: boolean("featured").default(false),
  paymentMethods: jsonb("payment_methods").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artworks table
export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  galleryId: integer("gallery_id").references(() => galleries.id),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  year: integer("year"),
  medium: varchar("medium"),
  mediumAr: varchar("medium_ar"),
  dimensions: varchar("dimensions"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("SAR"),
  images: jsonb("images").default([]),
  category: varchar("category"), // contemporary, traditional, calligraphy, etc.
  categoryAr: varchar("category_ar"),
  style: varchar("style"),
  styleAr: varchar("style_ar"),
  availability: varchar("availability").default("available"), // available, sold, on_auction
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auctions table
export const auctions = pgTable("auctions", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").references(() => artworks.id),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  startingPrice: decimal("starting_price", { precision: 10, scale: 2 }),
  currentBid: decimal("current_bid", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("SAR"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("upcoming"), // upcoming, live, ended
  bidCount: integer("bid_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bids table
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").references(() => auctions.id),
  userId: varchar("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("SAR"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Auction Results table - tracks final auction outcomes


// Achievement Badges table - defines all available badges
export const achievementBadges = pgTable("achievement_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  category: varchar("category").notNull(), // sales, engagement, participation, expertise, time_based
  icon: varchar("icon").notNull(), // lucide icon name
  color: varchar("color").default("#3b82f6"), // hex color code
  rarity: varchar("rarity").default("common"), // common, uncommon, rare, epic, legendary
  requiredValue: integer("required_value"), // threshold value for achievement
  requiredMetric: varchar("required_metric"), // artworks_sold, total_sales, followers, etc.
  pointsValue: integer("points_value").default(0), // points awarded for earning this badge
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Artist Achievements table - tracks badges earned by artists
export const artistAchievements = pgTable("artist_achievements", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  badgeId: integer("badge_id").references(() => achievementBadges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0), // current progress towards next level
  level: integer("level").default(1), // badge level (for recurring achievements)
  isDisplayed: boolean("is_displayed").default(true), // whether artist wants to display this badge
  notificationSent: boolean("notification_sent").default(false),
}, (table) => [
  unique("artist_badge_unique").on(table.artistId, table.badgeId),
]);

// Artist Statistics table - tracks metrics for badge calculations
export const artistStats = pgTable("artist_stats", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id).unique(),
  totalArtworks: integer("total_artworks").default(0),
  totalSales: integer("total_sales").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  totalViews: integer("total_views").default(0),
  totalLikes: integer("total_likes").default(0),
  totalFollowers: integer("total_followers").default(0),
  totalWorkshops: integer("total_workshops").default(0),
  totalExhibitions: integer("total_exhibitions").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  achievementPoints: integer("achievement_points").default(0),
  profileCompleteness: integer("profile_completeness").default(0), // percentage
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Badge Progress table - tracks progress towards achievements
export const badgeProgress = pgTable("badge_progress", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id),
  badgeId: integer("badge_id").references(() => achievementBadges.id),
  currentValue: integer("current_value").default(0),
  targetValue: integer("target_value").notNull(),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default("0"),
  isCompleted: boolean("is_completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("artist_badge_progress_unique").on(table.artistId, table.badgeId),
]);

// Collections table
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  coverImage: varchar("cover_image"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collection artworks junction table
export const collectionArtworks = pgTable("collection_artworks", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => collections.id),
  artworkId: integer("artwork_id").references(() => artworks.id),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workshops system
export const workshops = pgTable("workshops", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  instructorId: varchar("instructor_id").notNull(),
  instructorType: varchar("instructor_type").notNull(), // 'artist' or 'gallery'
  category: varchar("category").notNull(),
  categoryAr: varchar("category_ar"),
  skillLevel: varchar("skill_level").notNull(), // 'beginner', 'intermediate', 'advanced'
  duration: integer("duration").notNull(), // in hours
  maxParticipants: integer("max_participants").notNull(),
  currentParticipants: integer("current_participants").default(0),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("SAR"),
  location: varchar("location"),
  locationAr: varchar("location_ar"),
  isOnline: boolean("is_online").default(false),
  meetingLink: varchar("meeting_link"),
  materials: text("materials").array(),
  materialsAr: text("materials_ar").array(),
  images: text("images").array(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationDeadline: timestamp("registration_deadline"),
  status: varchar("status").default("draft"), // 'draft', 'published', 'cancelled', 'completed'
  featured: boolean("featured").default(false),
  // Scheduling features
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: varchar("recurrence_pattern"), // 'daily', 'weekly', 'monthly'
  recurrenceInterval: integer("recurrence_interval"), // e.g., every 2 weeks
  recurrenceEndDate: timestamp("recurrence_end_date"),
  timezone: varchar("timezone").default("Asia/Riyadh"),
  // Review metrics
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workshop registrations
export const workshopRegistrations = pgTable("workshop_registrations", {
  id: serial("id").primaryKey(),
  workshopId: integer("workshop_id").references(() => workshops.id),
  userId: varchar("user_id").references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  status: varchar("status").default("confirmed"), // 'confirmed', 'waitlist', 'cancelled'
  paymentStatus: varchar("payment_status").default("pending"), // 'pending', 'paid', 'refunded'
  attended: boolean("attended").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  organizerId: varchar("organizer_id").notNull(),
  organizerType: varchar("organizer_type").notNull(), // 'gallery', 'artist', 'platform'
  category: varchar("category").notNull(), // 'exhibition', 'workshop', 'talk', 'networking'
  categoryAr: varchar("category_ar"),
  venue: varchar("venue"),
  venueAr: varchar("venue_ar"),
  address: text("address"),
  addressAr: text("address_ar"),
  isOnline: boolean("is_online").default(false),
  meetingLink: varchar("meeting_link"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  ticketPrice: decimal("ticket_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("SAR"),
  images: text("images").array(),
  tags: text("tags").array(),
  tagsAr: text("tags_ar").array(),
  status: varchar("status").default("draft"), // 'draft', 'published', 'cancelled', 'completed'
  featured: boolean("featured").default(false),
  // Scheduling features
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: varchar("recurrence_pattern"), // 'daily', 'weekly', 'monthly'
  recurrenceInterval: integer("recurrence_interval"), // e.g., every 2 weeks
  recurrenceEndDate: timestamp("recurrence_end_date"),
  timezone: varchar("timezone").default("Asia/Riyadh"),
  // Review metrics
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").default("attending"), // 'attending', 'maybe', 'not_attending'
  rsvpedAt: timestamp("rsvped_at").defaultNow(),
  notes: text("notes"),
  attended: boolean("attended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workshop and Event Reviews
export const workshopEventReviews = pgTable("workshop_event_reviews", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // 'workshop' or 'event'
  entityId: integer("entity_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title"),
  titleAr: varchar("title_ar"),
  content: text("content").notNull(),
  contentAr: text("content_ar"),
  instructorResponse: text("instructor_response"),
  instructorResponseAr: text("instructor_response_ar"),
  isVerified: boolean("is_verified").default(false), // Verified attendee
  isFeatured: boolean("is_featured").default(false), // Featured testimonial
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community discussions
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  content: text("content").notNull(),
  contentAr: text("content_ar"),
  authorId: varchar("author_id").references(() => users.id),
  category: varchar("category").notNull(),
  categoryAr: varchar("category_ar"),
  tags: text("tags").array(),
  tagsAr: text("tags_ar").array(),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyBy: varchar("last_reply_by"),
  status: varchar("status").default("active"), // 'active', 'closed', 'archived'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discussion replies
export const discussionReplies = pgTable("discussion_replies", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").references(() => discussions.id),
  authorId: varchar("author_id").references(() => users.id),
  content: text("content").notNull(),
  contentAr: text("content_ar"),
  parentReplyId: integer("parent_reply_id"),
  isAccepted: boolean("is_accepted").default(false),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inquiries table
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").references(() => artworks.id),
  userId: varchar("user_id").references(() => users.id),
  message: text("message"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  status: varchar("status").default("pending"), // pending, responded, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  artworkId: integer("artwork_id").references(() => artworks.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Follows table - for following artists and galleries
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  entityType: varchar("entity_type").notNull(), // "artist" or "gallery"
  entityId: integer("entity_id").notNull(), // ID of the artist or gallery
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table - for commenting on artworks, workshops, and events
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  entityType: varchar("entity_type").notNull(), // "artwork", "workshop", "event"
  entityId: integer("entity_id").notNull(), // ID of the artwork, workshop, or event
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For nested comments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Likes table - for liking artworks, workshops, events, and comments
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  entityType: varchar("entity_type").notNull(), // "artwork", "workshop", "event", or "comment"
  entityId: integer("entity_id").notNull(), // ID of the entity being liked
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity feed table - for tracking user activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // "follow", "like", "comment", "favorite", "bid", "inquiry", "workshop_register", "event_rsvp"
  entityType: varchar("entity_type").notNull(), // "artist", "gallery", "artwork", "workshop", "event", "comment", "discussion"
  entityId: integer("entity_id").notNull(),
  metadata: jsonb("metadata"), // Additional activity data
  createdAt: timestamp("created_at").defaultNow(),
});

// User profiles table - extended profile information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).unique(),
  bio: text("bio"),
  bioAr: text("bio_ar"),
  location: varchar("location"),
  locationAr: varchar("location_ar"),
  website: varchar("website"),
  instagram: varchar("instagram"),
  twitter: varchar("twitter"),
  facebook: varchar("facebook"),
  interests: jsonb("interests").default([]), // Array of art interests/categories
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Followers table for artist following functionality
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueFollower: unique().on(table.followerId, table.artistId)
}));

// Auction results table for tracking artist auction history
export const auctionResults = pgTable("auction_results", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").references(() => artworks.id).notNull(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  auctionDate: timestamp("auction_date").notNull(),
  hammerPrice: decimal("hammer_price", { precision: 12, scale: 2 }).notNull(),
  estimateLow: decimal("estimate_low", { precision: 12, scale: 2 }),
  estimateHigh: decimal("estimate_high", { precision: 12, scale: 2 }),
  auctionHouse: varchar("auction_house").notNull(),
  lotNumber: varchar("lot_number"),
  provenance: text("provenance"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shows/Exhibitions table for artist exhibition history
export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  venue: varchar("venue").notNull(),
  venueAr: varchar("venue_ar"),
  location: varchar("location").notNull(),
  locationAr: varchar("location_ar"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  type: varchar("type").notNull(), // 'solo', 'group', 'institutional', 'gallery', 'museum'
  status: varchar("status").default("upcoming"), // 'upcoming', 'current', 'past'
  description: text("description"),
  descriptionAr: text("description_ar"),
  curator: varchar("curator"),
  curatorAr: varchar("curator_ar"),
  website: varchar("website"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artist-Gallery representation relationships
export const artistGalleries = pgTable("artist_galleries", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  galleryId: integer("gallery_id").references(() => galleries.id).notNull(),
  featured: boolean("featured").default(false), // Primary representation
  startDate: date("start_date"),
  endDate: date("end_date"), // null for ongoing representation
  exclusivity: varchar("exclusivity"), // 'exclusive', 'non-exclusive', 'regional'
  contractDetails: text("contract_details"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueArtistGallery: unique().on(table.artistId, table.galleryId)
}));

// Price alerts table for collectors to track artist works
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  artworkId: integer("artwork_id").references(() => artworks.id),
  category: varchar("category"),
  priceThreshold: decimal("price_threshold", { precision: 10, scale: 2 }).notNull(),
  alertType: varchar("alert_type").default("immediate"),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics tables
export const artworkViews = pgTable("artwork_views", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").references(() => artworks.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  duration: integer("duration"), // in seconds
  source: varchar("source", { length: 50 }), // 'search', 'direct', 'collection', etc.
});

export const artistAnalytics = pgTable("artist_analytics", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  date: date("date").notNull(),
  profileViews: integer("profile_views").default(0),
  artworkViews: integer("artwork_views").default(0),
  inquiries: integer("inquiries").default(0),
  followers: integer("followers").default(0),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueArtistDate: unique().on(table.artistId, table.date)
}));

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  query: varchar("query", { length: 255 }).notNull(),
  filters: jsonb("filters"),
  resultCount: integer("result_count"),
  clickedResults: jsonb("clicked_results"),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  preferredCategories: text("preferred_categories").array(),
  preferredStyles: text("preferred_styles").array(),
  preferredArtists: integer("preferred_artists").array(),
  priceRange: jsonb("price_range"), // {min: number, max: number}
  notificationSettings: jsonb("notification_settings"),
  privacySettings: jsonb("privacy_settings"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const portfolioSections = pgTable("portfolio_sections", {
  id: serial("id").primaryKey(),
  artistId: integer("artist_id").references(() => artists.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  content: text("content"),
  contentAr: text("content_ar"),
  sectionType: varchar("section_type", { length: 50 }).notNull(), // 'statement', 'cv', 'exhibitions', 'awards', 'press'
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collector-specific tables
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number").unique().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artworkId: integer("artwork_id").references(() => artworks.id).notNull(),
  status: varchar("status").default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("SAR"),
  shippingMethod: varchar("shipping_method"),
  shippingAddress: jsonb("shipping_address"), // {street, city, state, country, postalCode}
  billingAddress: jsonb("billing_address"),
  paymentMethod: varchar("payment_method"), // card, bank_transfer, cash_on_delivery
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, failed, refunded
  notes: text("notes"),
  sellerNotes: text("seller_notes"),
  sellerUpdatedAt: timestamp("seller_updated_at"),
  paymentConfirmedAt: timestamp("payment_confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingTracking = pgTable("shipping_tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => purchaseOrders.id).notNull(),
  trackingNumber: varchar("tracking_number"),
  carrier: varchar("carrier"),
  status: varchar("status"), // in_transit, out_for_delivery, delivered, returned
  estimatedDelivery: date("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  trackingHistory: jsonb("tracking_history").default([]), // [{date, status, location, notes}]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ZATCA-compliant invoices table for Saudi Arabia
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number").unique().notNull(), // ZATCA-compliant format
  orderId: integer("order_id").references(() => purchaseOrders.id), // Optional - can create standalone invoices
  sellerId: varchar("seller_id").references(() => users.id).notNull(), // Artist or Gallery
  sellerType: varchar("seller_type").notNull(), // 'artist' or 'gallery'
  buyerId: varchar("buyer_id").references(() => users.id), // Optional for standalone invoices
  
  // ZATCA Required Fields
  vatNumber: varchar("vat_number"), // Seller's VAT registration number
  buyerVatNumber: varchar("buyer_vat_number"), // Buyer's VAT number (required for B2B)
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).default("15.00"), // 15% VAT in Saudi Arabia
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("SAR"),
  
  // Bilingual invoice details
  itemDescription: text("item_description").notNull(),
  itemDescriptionAr: text("item_description_ar").notNull(),
  
  // ZATCA compliance fields
  qrCode: text("qr_code"), // ZATCA QR code
  digitalSignature: text("digital_signature"), // Digital signature hash
  zatcaUuid: varchar("zatca_uuid"), // ZATCA Universal Unique Identifier
  invoiceHash: varchar("invoice_hash"), // Cryptographic hash
  previousInvoiceHash: varchar("previous_invoice_hash"), // Hash of previous invoice
  
  // Invoice type and transaction details
  invoiceType: varchar("invoice_type").default("standard"), // standard (B2B) or simplified (B2C)
  transactionType: varchar("transaction_type").default("sale"), // sale, refund, debit_note, credit_note
  paymentMethod: varchar("payment_method"), // cash, credit, bank_transfer, etc.
  
  // Commercial Registration and Tax details
  sellerCrNumber: varchar("seller_cr_number"), // Commercial Registration Number
  sellerBuildingNumber: varchar("seller_building_number"), // Saudi National Address
  sellerStreetName: varchar("seller_street_name"),
  sellerDistrict: varchar("seller_district"),
  sellerCity: varchar("seller_city"),
  sellerPostalCode: varchar("seller_postal_code"),
  sellerAdditionalNumber: varchar("seller_additional_number"),
  
  // Invoice status
  status: varchar("status").default("draft"), // draft, sent, paid, cancelled, refunded
  issueDate: timestamp("issue_date").defaultNow(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  supplyDate: timestamp("supply_date"), // Date of supply (ZATCA requirement)
  
  // Additional business info
  sellerBusinessName: varchar("seller_business_name").notNull(),
  sellerBusinessNameAr: varchar("seller_business_name_ar").notNull(),
  sellerAddress: jsonb("seller_address").notNull(), // Full address with postal code
  buyerAddress: jsonb("buyer_address").notNull(),
  buyerName: varchar("buyer_name"), // Buyer's full name
  
  // ZATCA submission details
  zatcaSubmissionDate: timestamp("zatca_submission_date"),
  zatcaResponseCode: varchar("zatca_response_code"),
  zatcaClearanceStatus: varchar("zatca_clearance_status"), // cleared, rejected, pending
  zatcaWarnings: jsonb("zatca_warnings"), // Array of warnings from ZATCA
  
  // Line items for detailed invoicing
  lineItems: jsonb("line_items"), // Array of {description, quantity, unitPrice, vatRate, vatAmount, totalAmount}
  
  // Additional charges and discounts
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Notes and references
  notes: text("notes"),
  notesAr: text("notes_ar"),
  referenceNumber: varchar("reference_number"), // Purchase order or contract reference
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipping management for Artists and Galleries
export const shippingProfiles = pgTable("shipping_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userType: varchar("user_type").notNull(), // 'artist' or 'gallery'
  
  // Business shipping info
  businessName: varchar("business_name").notNull(),
  businessNameAr: varchar("business_name_ar"),
  contactPerson: varchar("contact_person").notNull(),
  contactPhone: varchar("contact_phone").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  
  // Address details
  address: jsonb("address").notNull(), // {street, city, state, country, postalCode}
  defaultCarrier: varchar("default_carrier"), // Aramex, DHL, FedEx, etc.
  
  // Shipping preferences
  packagingInstructions: text("packaging_instructions"),
  packagingInstructionsAr: text("packaging_instructions_ar"),
  handlingTime: integer("handling_time").default(3), // Days to prepare shipment
  
  // Shipping rates
  domesticShippingRate: decimal("domestic_shipping_rate", { precision: 10, scale: 2 }),
  internationalShippingRate: decimal("international_shipping_rate", { precision: 10, scale: 2 }),
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collectorProfiles = pgTable("collector_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).unique().notNull(),
  collectorType: varchar("collector_type"), // individual, corporate, institutional
  collectionFocus: text("collection_focus").array(), // contemporary, traditional, emerging, etc.
  budgetRange: jsonb("budget_range"), // {min, max, currency}
  preferredMediums: text("preferred_mediums").array(),
  shippingAddresses: jsonb("shipping_addresses").default([]), // array of addresses
  paymentMethods: jsonb("payment_methods").default([]), // saved payment methods
  artAdvisorContact: jsonb("art_advisor_contact"), // {name, email, phone}
  publicProfile: boolean("public_profile").default(false),
  verifiedCollector: boolean("verified_collector").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



export const artworkCertificates = pgTable("artwork_certificates", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").references(() => artworks.id).unique().notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  issueDate: date("issue_date").notNull(),
  authenticatedBy: varchar("authenticated_by"),
  certificateUrl: varchar("certificate_url"),
  provenanceDetails: jsonb("provenance_details"), // ownership history
  conditionReport: text("condition_report"),
  additionalDocuments: jsonb("additional_documents").default([]), // [{title, url, type}]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collectorWishlist = pgTable("collector_wishlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artworkId: integer("artwork_id").references(() => artworks.id).notNull(),
  priority: integer("priority").default(0), // 0-5, higher is more important
  notes: text("notes"),
  priceAtTimeOfAdding: decimal("price_at_time_of_adding", { precision: 10, scale: 2 }),
  notifyOnPriceChange: boolean("notify_on_price_change").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_artwork_wishlist").on(table.userId, table.artworkId),
]);

export const installmentPlans = pgTable("installment_plans", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => purchaseOrders.id).unique().notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 10, scale: 2 }).notNull(),
  numberOfInstallments: integer("number_of_installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0"),
  status: varchar("status").default("active"), // active, completed, defaulted
  nextPaymentDate: date("next_payment_date"),
  completedInstallments: integer("completed_installments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collectorReviews = pgTable("collector_reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artworkId: integer("artwork_id").references(() => artworks.id),
  galleryId: integer("gallery_id").references(() => galleries.id),
  orderId: integer("order_id").references(() => purchaseOrders.id),
  rating: integer("rating").notNull(), // 1-5
  review: text("review"),
  reviewAr: text("review_ar"),
  verifiedPurchase: boolean("verified_purchase").default(false),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Newsletter Subscribers
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  language: varchar("language").default("en"),
  subscriptionStatus: varchar("subscription_status").default("active"), // active, unsubscribed, bounced
  categories: jsonb("categories").default([]), // art categories of interest
  frequency: varchar("frequency").default("weekly"), // daily, weekly, monthly
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  lastEmailSentAt: timestamp("last_email_sent_at"),
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  templateCode: varchar("template_code").notNull().unique(), // order_confirmation, newsletter, price_alert, etc.
  name: varchar("name").notNull(),
  nameAr: varchar("name_ar"),
  subject: varchar("subject").notNull(),
  subjectAr: varchar("subject_ar"),
  bodyHtml: text("body_html").notNull(),
  bodyHtmlAr: text("body_html_ar"),
  bodyText: text("body_text"),
  bodyTextAr: text("body_text_ar"),
  variables: jsonb("variables").default([]), // list of variable names used in template
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email Notification Queue
export const emailNotificationQueue = pgTable("email_notification_queue", {
  id: serial("id").primaryKey(),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  templateCode: varchar("template_code").references(() => emailTemplates.templateCode),
  subject: varchar("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text"),
  variables: jsonb("variables").default({}), // template variables
  priority: integer("priority").default(5), // 1-10, 1 is highest
  status: varchar("status").default("pending"), // pending, sending, sent, failed, bounced
  attempts: integer("attempts").default(0),
  sentAt: timestamp("sent_at"),
  failedAt: timestamp("failed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Notification Log
export const emailNotificationLog = pgTable("email_notification_log", {
  id: serial("id").primaryKey(),
  queueId: integer("queue_id").references(() => emailNotificationQueue.id),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  templateCode: varchar("template_code"),
  subject: varchar("subject").notNull(),
  status: varchar("status").notNull(), // sent, failed, bounced, opened, clicked
  sendgridMessageId: varchar("sendgrid_message_id"),
  sendgridResponse: jsonb("sendgrid_response"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Workshop/Event Scheduling Conflicts
export const schedulingConflicts = pgTable("scheduling_conflicts", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // 'workshop' or 'event'
  entityId: integer("entity_id").notNull(),
  conflictType: varchar("conflict_type").notNull(), // 'venue', 'instructor', 'time_overlap'
  conflictingEntityType: varchar("conflicting_entity_type").notNull(),
  conflictingEntityId: integer("conflicting_entity_id").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  severity: varchar("severity").default("warning"), // 'warning', 'error'
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workshop/Event Reminders
export const eventReminders = pgTable("event_reminders", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // 'workshop' or 'event'
  entityId: integer("entity_id").notNull(),
  reminderType: varchar("reminder_type").notNull(), // 'registration_deadline', 'event_start', 'custom'
  sendBefore: integer("send_before").notNull(), // minutes before event
  recipientType: varchar("recipient_type").notNull(), // 'all_registered', 'waitlist', 'custom'
  customRecipients: jsonb("custom_recipients").default([]), // array of user ids
  subject: varchar("subject").notNull(),
  subjectAr: varchar("subject_ar"),
  message: text("message").notNull(),
  messageAr: text("message_ar"),
  status: varchar("status").default("scheduled"), // 'scheduled', 'sent', 'failed', 'cancelled'
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Calendar Integrations
export const calendarIntegrations = pgTable("calendar_integrations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  provider: varchar("provider").notNull(), // 'google', 'outlook', 'apple'
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  calendarId: varchar("calendar_id"),
  syncEnabled: boolean("sync_enabled").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  settings: jsonb("settings").default({}), // provider-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_user_provider").on(table.userId, table.provider),
]);

// Participant Lists
export const participantLists = pgTable("participant_lists", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // 'workshop' or 'event'
  entityId: integer("entity_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  registrationId: integer("registration_id"), // reference to workshop_registrations or event_rsvps
  status: varchar("status").notNull(), // 'confirmed', 'waitlist', 'cancelled', 'attended', 'no_show'
  checkInTime: timestamp("check_in_time"),
  checkInMethod: varchar("check_in_method"), // 'manual', 'qr_code', 'self'
  seatNumber: varchar("seat_number"),
  specialRequirements: text("special_requirements"),
  emergencyContact: jsonb("emergency_contact"), // {name, phone, relationship}
  dietaryRestrictions: text("dietary_restrictions").array(),
  accessibilityNeeds: text("accessibility_needs"),
  certificateIssued: boolean("certificate_issued").default(false),
  certificateIssuedAt: timestamp("certificate_issued_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_entity_user").on(table.entityType, table.entityId, table.userId),
]);

// Waitlist Management
export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // 'workshop' or 'event'
  entityId: integer("entity_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  position: integer("position").notNull(),
  priority: integer("priority").default(0), // higher number = higher priority
  addedAt: timestamp("added_at").defaultNow(),
  notifiedAt: timestamp("notified_at"),
  notificationExpiresAt: timestamp("notification_expires_at"),
  status: varchar("status").default("waiting"), // 'waiting', 'notified', 'registered', 'expired', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_waitlist_entry").on(table.entityType, table.entityId, table.userId),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  collectorProfile: one(collectorProfiles, { fields: [users.id], references: [collectorProfiles.userId] }),
  artists: many(artists),
  galleries: many(galleries),
  workshops: many(workshops),
  events: many(events),
  discussions: many(discussions),
  discussionReplies: many(discussionReplies),
  bids: many(bids),
  inquiries: many(inquiries),
  favorites: many(favorites),
  follows: many(follows),
  comments: many(comments),
  likes: many(likes),
  activities: many(activities),
  purchaseOrders: many(purchaseOrders),
  priceAlerts: many(priceAlerts),
  wishlistItems: many(collectorWishlist),
  reviews: many(collectorReviews),
  newsletterSubscription: one(newsletterSubscribers, { fields: [users.id], references: [newsletterSubscribers.userId] }),
  emailNotifications: many(emailNotificationQueue),
  emailLogs: many(emailNotificationLog),
  auctionWins: many(auctionResults),
  followedArtists: many(followers),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, { fields: [artists.userId], references: [users.id] }),
  artworks: many(artworks),
  auctionResults: many(auctionResults),
  followers: many(followers),
  shows: many(shows),
  galleries: many(artistGalleries),
  priceAlerts: many(priceAlerts),
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  user: one(users, { fields: [galleries.userId], references: [users.id] }),
  artworks: many(artworks),
  artists: many(artistGalleries),
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  artist: one(artists, { fields: [artworks.artistId], references: [artists.id] }),
  gallery: one(galleries, { fields: [artworks.galleryId], references: [galleries.id] }),
  auctions: many(auctions),
  collectionArtworks: many(collectionArtworks),
  inquiries: many(inquiries),
  favorites: many(favorites),
  comments: many(comments),
  likes: many(likes),
  purchaseOrders: many(purchaseOrders),
  certificate: one(artworkCertificates, { fields: [artworks.id], references: [artworkCertificates.artworkId] }),
  wishlistItems: many(collectorWishlist),
  reviews: many(collectorReviews),
  auctionResults: many(auctionResults),
}));

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  artwork: one(artworks, { fields: [auctions.artworkId], references: [artworks.id] }),
  bids: many(bids),
  result: one(auctionResults, { fields: [auctions.id], references: [auctionResults.auctionId] }),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  auction: one(auctions, { fields: [bids.auctionId], references: [auctions.id] }),
  user: one(users, { fields: [bids.userId], references: [users.id] }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionArtworks: many(collectionArtworks),
}));

export const collectionArtworksRelations = relations(collectionArtworks, ({ one }) => ({
  collection: one(collections, { fields: [collectionArtworks.collectionId], references: [collections.id] }),
  artwork: one(artworks, { fields: [collectionArtworks.artworkId], references: [artworks.id] }),
}));

export const workshopsRelations = relations(workshops, ({ one, many }) => ({
  registrations: many(workshopRegistrations),
}));

export const workshopRegistrationsRelations = relations(workshopRegistrations, ({ one }) => ({
  workshop: one(workshops, { fields: [workshopRegistrations.workshopId], references: [workshops.id] }),
  user: one(users, { fields: [workshopRegistrations.userId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  rsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}));

export const workshopEventReviewsRelations = relations(workshopEventReviews, ({ one }) => ({
  user: one(users, { fields: [workshopEventReviews.userId], references: [users.id] }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, { fields: [discussions.authorId], references: [users.id] }),
  replies: many(discussionReplies),
}));

export const discussionRepliesRelations = relations(discussionReplies, ({ one, many }) => ({
  discussion: one(discussions, { fields: [discussionReplies.discussionId], references: [discussions.id] }),
  author: one(users, { fields: [discussionReplies.authorId], references: [users.id] }),
  parent: one(discussionReplies, { fields: [discussionReplies.parentReplyId], references: [discussionReplies.id] }),
  replies: many(discussionReplies),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  artwork: one(artworks, { fields: [inquiries.artworkId], references: [artworks.id] }),
  user: one(users, { fields: [inquiries.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  artwork: one(artworks, { fields: [favorites.artworkId], references: [artworks.id] }),
}));

// New table relations for artist profile enhancements
export const followersRelations = relations(followers, ({ one }) => ({
  user: one(users, { fields: [followers.followerId], references: [users.id] }),
  artist: one(artists, { fields: [followers.artistId], references: [artists.id] }),
}));



export const showsRelations = relations(shows, ({ one }) => ({
  artist: one(artists, { fields: [shows.artistId], references: [artists.id] }),
}));

export const artistGalleriesRelations = relations(artistGalleries, ({ one }) => ({
  artist: one(artists, { fields: [artistGalleries.artistId], references: [artists.id] }),
  gallery: one(galleries, { fields: [artistGalleries.galleryId], references: [galleries.id] }),
}));



export const followsRelations = relations(follows, ({ one }) => ({
  user: one(users, { fields: [follows.userId], references: [users.id] }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
  likes: many(likes),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

// Analytics relations
export const artworkViewsRelations = relations(artworkViews, ({ one }) => ({
  artwork: one(artworks, { fields: [artworkViews.artworkId], references: [artworks.id] }),
  user: one(users, { fields: [artworkViews.userId], references: [users.id] }),
}));

export const artistAnalyticsRelations = relations(artistAnalytics, ({ one }) => ({
  artist: one(artists, { fields: [artistAnalytics.artistId], references: [artists.id] }),
}));

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, { fields: [searchHistory.userId], references: [users.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const portfolioSectionsRelations = relations(portfolioSections, ({ one }) => ({
  artist: one(artists, { fields: [portfolioSections.artistId], references: [artists.id] }),
}));

// Collector table relations
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  user: one(users, { fields: [purchaseOrders.userId], references: [users.id] }),
  artwork: one(artworks, { fields: [purchaseOrders.artworkId], references: [artworks.id] }),
  shippingTracking: one(shippingTracking, { fields: [purchaseOrders.id], references: [shippingTracking.orderId] }),
  installmentPlan: one(installmentPlans, { fields: [purchaseOrders.id], references: [installmentPlans.orderId] }),
  review: one(collectorReviews, { fields: [purchaseOrders.id], references: [collectorReviews.orderId] }),
}));

export const shippingTrackingRelations = relations(shippingTracking, ({ one }) => ({
  order: one(purchaseOrders, { fields: [shippingTracking.orderId], references: [purchaseOrders.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(purchaseOrders, { fields: [invoices.orderId], references: [purchaseOrders.id] }),
  seller: one(users, { fields: [invoices.sellerId], references: [users.id] }),
  buyer: one(users, { fields: [invoices.buyerId], references: [users.id] }),
}));

export const shippingProfilesRelations = relations(shippingProfiles, ({ one }) => ({
  user: one(users, { fields: [shippingProfiles.userId], references: [users.id] }),
}));

export const collectorProfilesRelations = relations(collectorProfiles, ({ one }) => ({
  user: one(users, { fields: [collectorProfiles.userId], references: [users.id] }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, { fields: [priceAlerts.userId], references: [users.id] }),
  artist: one(artists, { fields: [priceAlerts.artistId], references: [artists.id] }),
}));

export const artworkCertificatesRelations = relations(artworkCertificates, ({ one }) => ({
  artwork: one(artworks, { fields: [artworkCertificates.artworkId], references: [artworks.id] }),
}));

export const collectorWishlistRelations = relations(collectorWishlist, ({ one }) => ({
  user: one(users, { fields: [collectorWishlist.userId], references: [users.id] }),
  artwork: one(artworks, { fields: [collectorWishlist.artworkId], references: [artworks.id] }),
}));

export const installmentPlansRelations = relations(installmentPlans, ({ one }) => ({
  order: one(purchaseOrders, { fields: [installmentPlans.orderId], references: [purchaseOrders.id] }),
}));

export const collectorReviewsRelations = relations(collectorReviews, ({ one }) => ({
  user: one(users, { fields: [collectorReviews.userId], references: [users.id] }),
  artwork: one(artworks, { fields: [collectorReviews.artworkId], references: [artworks.id] }),
  gallery: one(galleries, { fields: [collectorReviews.galleryId], references: [galleries.id] }),
  order: one(purchaseOrders, { fields: [collectorReviews.orderId], references: [purchaseOrders.id] }),
}));

// Email table relations
export const newsletterSubscribersRelations = relations(newsletterSubscribers, ({ one }) => ({
  user: one(users, { fields: [newsletterSubscribers.userId], references: [users.id] }),
}));

export const emailNotificationQueueRelations = relations(emailNotificationQueue, ({ one, many }) => ({
  user: one(users, { fields: [emailNotificationQueue.recipientUserId], references: [users.id] }),
  template: one(emailTemplates, { fields: [emailNotificationQueue.templateCode], references: [emailTemplates.templateCode] }),
  logs: many(emailNotificationLog),
}));

export const emailNotificationLogRelations = relations(emailNotificationLog, ({ one }) => ({
  user: one(users, { fields: [emailNotificationLog.recipientUserId], references: [users.id] }),
  queue: one(emailNotificationQueue, { fields: [emailNotificationLog.queueId], references: [emailNotificationQueue.id] }),
}));

// Auction Results relations (for artist profile enhancement)
export const auctionResultsRelations = relations(auctionResults, ({ one }) => ({
  artwork: one(artworks, { fields: [auctionResults.artworkId], references: [artworks.id] }),
  artist: one(artists, { fields: [auctionResults.artistId], references: [artists.id] }),
}));

// Achievement Badges relations
export const achievementBadgesRelations = relations(achievementBadges, ({ many }) => ({
  achievements: many(artistAchievements),
  progress: many(badgeProgress),
}));

export const artistAchievementsRelations = relations(artistAchievements, ({ one }) => ({
  artist: one(artists, { fields: [artistAchievements.artistId], references: [artists.id] }),
  badge: one(achievementBadges, { fields: [artistAchievements.badgeId], references: [achievementBadges.id] }),
}));

export const artistStatsRelations = relations(artistStats, ({ one }) => ({
  artist: one(artists, { fields: [artistStats.artistId], references: [artists.id] }),
}));

export const badgeProgressRelations = relations(badgeProgress, ({ one }) => ({
  artist: one(artists, { fields: [badgeProgress.artistId], references: [artists.id] }),
  badge: one(achievementBadges, { fields: [badgeProgress.badgeId], references: [achievementBadges.id] }),
}));

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Workshop types
export type Workshop = typeof workshops.$inferSelect;
export type InsertWorkshop = typeof workshops.$inferInsert;

// Workshop registration types
export type WorkshopRegistration = typeof workshopRegistrations.$inferSelect;
export type InsertWorkshopRegistration = typeof workshopRegistrations.$inferInsert;

// Event types
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Event RSVP types
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;

// Review types
export type WorkshopEventReview = typeof workshopEventReviews.$inferSelect;
export type InsertWorkshopEventReview = typeof workshopEventReviews.$inferInsert;

// Discussion types
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = typeof discussions.$inferInsert;

// Discussion reply types
export type DiscussionReply = typeof discussionReplies.$inferSelect;
export type InsertDiscussionReply = typeof discussionReplies.$inferInsert;

export type InsertArtist = typeof artists.$inferInsert;
export type Artist = typeof artists.$inferSelect;

export type InsertGallery = typeof galleries.$inferInsert;
export type Gallery = typeof galleries.$inferSelect;

export type InsertArtwork = typeof artworks.$inferInsert;
export type Artwork = typeof artworks.$inferSelect;

export type InsertAuction = typeof auctions.$inferInsert;
export type Auction = typeof auctions.$inferSelect;

export type InsertBid = typeof bids.$inferInsert;
export type Bid = typeof bids.$inferSelect;

export type InsertAuctionResult = typeof auctionResults.$inferInsert;
export type AuctionResult = typeof auctionResults.$inferSelect;

export type InsertCollection = typeof collections.$inferInsert;
export type Collection = typeof collections.$inferSelect;

export type InsertArticle = typeof articles.$inferInsert;
export type Article = typeof articles.$inferSelect;

export type InsertInquiry = typeof inquiries.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertFavorite = typeof favorites.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;

export type InsertFollow = typeof follows.$inferInsert;
export type Follow = typeof follows.$inferSelect;

export type InsertComment = typeof comments.$inferInsert;
export type Comment = typeof comments.$inferSelect;

export type InsertLike = typeof likes.$inferInsert;
export type Like = typeof likes.$inferSelect;

export type InsertActivity = typeof activities.$inferInsert;
export type Activity = typeof activities.$inferSelect;

export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;

// Email types
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type EmailNotificationQueue = typeof emailNotificationQueue.$inferSelect;
export type InsertEmailNotificationQueue = typeof emailNotificationQueue.$inferInsert;
export type EmailNotificationLog = typeof emailNotificationLog.$inferSelect;
export type InsertEmailNotificationLog = typeof emailNotificationLog.$inferInsert;

// Achievement types
export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = typeof achievementBadges.$inferInsert;
export type ArtistAchievement = typeof artistAchievements.$inferSelect;
export type InsertArtistAchievement = typeof artistAchievements.$inferInsert;
export type ArtistStats = typeof artistStats.$inferSelect;
export type InsertArtistStats = typeof artistStats.$inferInsert;
export type BadgeProgress = typeof badgeProgress.$inferSelect;
export type InsertBadgeProgress = typeof badgeProgress.$inferInsert;

// Zod schemas
export const insertArtistSchema = createInsertSchema(artists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGallerySchema = createInsertSchema(galleries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArtworkSchema = createInsertSchema(artworks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkshopRegistrationSchema = createInsertSchema(workshopRegistrations).omit({ id: true, registeredAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true, rsvpedAt: true, createdAt: true, updatedAt: true });
export const insertWorkshopEventReviewSchema = createInsertSchema(workshopEventReviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDiscussionSchema = createInsertSchema(discussions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDiscussionReplySchema = createInsertSchema(discussionReplies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

// Analytics types
export type ArtworkView = typeof artworkViews.$inferSelect;
export type InsertArtworkView = typeof artworkViews.$inferInsert;
export type ArtistAnalytics = typeof artistAnalytics.$inferSelect;
export type InsertArtistAnalytics = typeof artistAnalytics.$inferInsert;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type PortfolioSection = typeof portfolioSections.$inferSelect;
export type InsertPortfolioSection = typeof portfolioSections.$inferInsert;
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailNotificationQueueSchema = createInsertSchema(emailNotificationQueue).omit({ id: true, createdAt: true });
export const insertEmailNotificationLogSchema = createInsertSchema(emailNotificationLog).omit({ id: true, sentAt: true });

// Achievement schemas
export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({ id: true, createdAt: true });
export const insertArtistAchievementSchema = createInsertSchema(artistAchievements).omit({ id: true, earnedAt: true });
export const insertArtistStatsSchema = createInsertSchema(artistStats).omit({ id: true, updatedAt: true });
export const insertBadgeProgressSchema = createInsertSchema(badgeProgress).omit({ id: true, updatedAt: true });

// Invoice and Shipping types
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type ShippingProfile = typeof shippingProfiles.$inferSelect;
export type InsertShippingProfile = typeof shippingProfiles.$inferInsert;

// Invoice and Shipping schemas
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShippingProfileSchema = createInsertSchema(shippingProfiles).omit({ id: true, createdAt: true, updatedAt: true });

// Scheduling and Participant Management types
export type SchedulingConflict = typeof schedulingConflicts.$inferSelect;
export type InsertSchedulingConflict = typeof schedulingConflicts.$inferInsert;
export type EventReminder = typeof eventReminders.$inferSelect;
export type InsertEventReminder = typeof eventReminders.$inferInsert;
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;
export type InsertCalendarIntegration = typeof calendarIntegrations.$inferInsert;
export type ParticipantList = typeof participantLists.$inferSelect;
export type InsertParticipantList = typeof participantLists.$inferInsert;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;
export type InsertWaitlistEntry = typeof waitlistEntries.$inferInsert;

// Scheduling and Participant Management schemas
export const insertSchedulingConflictSchema = createInsertSchema(schedulingConflicts).omit({ id: true, createdAt: true });
export const insertEventReminderSchema = createInsertSchema(eventReminders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCalendarIntegrationSchema = createInsertSchema(calendarIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertParticipantListSchema = createInsertSchema(participantLists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).omit({ id: true, createdAt: true, updatedAt: true });

// Lifecycle Funnel Infrastructure Tables

// Metrics table for KPIs and analytics
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  metric: varchar("metric").notNull(), // e.g., "daily_signups", "conversion_rate", "retention_rate"
  value: decimal("value", { precision: 12, scale: 4 }).notNull(),
  stage: varchar("stage"), // lifecycle stage this metric applies to
  category: varchar("category"), // e.g., "funnel", "engagement", "revenue"
  metadata: jsonb("metadata").default({}), // additional context
  collectedAt: timestamp("collected_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User interactions for lifecycle tracking
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // e.g., "view_artwork", "place_bid", "add_favorite"
  entityType: varchar("entity_type"), // e.g., "artwork", "artist", "gallery"
  entityId: varchar("entity_id"), // ID of the entity being interacted with
  previousStage: varchar("previous_stage"),
  newStage: varchar("new_stage"),
  metadata: jsonb("metadata").default({}), // Additional context like search terms, filters used
  sessionId: varchar("session_id"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Universal conversations system
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // e.g., "artwork_inquiry", "commission_negotiation", "auction_question"
  entityType: varchar("entity_type"), // e.g., "artwork", "commission", "auction"
  entityId: integer("entity_id"), // ID of the related entity
  participants: jsonb("participants").notNull(), // Array of user IDs
  title: varchar("title"),
  status: varchar("status").default("active"), // active, archived, closed
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages within conversations
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, file, system
  attachments: jsonb("attachments").default([]),
  readBy: jsonb("read_by").default([]), // Array of user IDs who have read the message
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Search index for universal search (materialized view support)
export const searchIndex = pgTable("search_index", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type").notNull(), // artwork, artist, gallery, event, workshop
  entityId: integer("entity_id").notNull(),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  searchVector: text("search_vector"), // tsvector for full-text search
  weight: decimal("weight", { precision: 3, scale: 2 }).default("1.0"), // relevance weight
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata").default({}),
  lastIndexed: timestamp("last_indexed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("search_index_entity_idx").on(table.entityType, table.entityId),
  index("search_index_title_idx").on(table.title),
  index("search_index_vector_idx").on(table.searchVector),
]);

// Lifecycle transitions tracking
export const lifecycleTransitions = pgTable("lifecycle_transitions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fromStage: varchar("from_stage").notNull(),
  toStage: varchar("to_stage").notNull(),
  trigger: varchar("trigger").notNull(), // e.g., "first_purchase", "profile_completed", "shared_artwork"
  metadata: jsonb("metadata").default({}),
  transitionAt: timestamp("transition_at").defaultNow(),
});

// Lifecycle Funnel Types
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = typeof userInteractions.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type SearchIndex = typeof searchIndex.$inferSelect;
export type InsertSearchIndex = typeof searchIndex.$inferInsert;
export type LifecycleTransition = typeof lifecycleTransitions.$inferSelect;
export type InsertLifecycleTransition = typeof lifecycleTransitions.$inferInsert;

// Lifecycle Funnel Schemas
export const insertMetricSchema = createInsertSchema(metrics).omit({ id: true, createdAt: true, collectedAt: true });
export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSearchIndexSchema = createInsertSchema(searchIndex).omit({ id: true, createdAt: true, updatedAt: true, lastIndexed: true });
export const insertLifecycleTransitionSchema = createInsertSchema(lifecycleTransitions).omit({ id: true, transitionAt: true });

// Artist Profile Enhancement Types
export type Follower = typeof followers.$inferSelect;
export type InsertFollower = typeof followers.$inferInsert;
export type AuctionResult = typeof auctionResults.$inferSelect;
export type InsertAuctionResult = typeof auctionResults.$inferInsert;
export type Show = typeof shows.$inferSelect;
export type InsertShow = typeof shows.$inferInsert;
export type ArtistGallery = typeof artistGalleries.$inferSelect;
export type InsertArtistGallery = typeof artistGalleries.$inferInsert;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

// Artist Profile Enhancement Schemas
export const insertFollowerSchema = createInsertSchema(followers).omit({ id: true, createdAt: true });
export const insertAuctionResultSchema = createInsertSchema(auctionResults).omit({ id: true, createdAt: true });
export const insertShowSchema = createInsertSchema(shows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArtistGallerySchema = createInsertSchema(artistGalleries).omit({ id: true, createdAt: true });
export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true, updatedAt: true });

// Privacy and Trust/Safety exports
export * from './schema/privacy';

// Commission system exports
export * from './schema/commissions';
