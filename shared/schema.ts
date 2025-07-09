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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
export const auctionResults = pgTable("auction_results", {
  id: serial("id").primaryKey(),
  auctionId: integer("auction_id").references(() => auctions.id).unique(),
  artworkId: integer("artwork_id").references(() => artworks.id),
  artistId: integer("artist_id").references(() => artists.id),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("SAR"),
  winnerUserId: varchar("winner_user_id").references(() => users.id),
  totalBids: integer("total_bids").default(0),
  startingPrice: decimal("starting_price", { precision: 10, scale: 2 }),
  priceIncrease: decimal("price_increase", { precision: 10, scale: 2 }), // percentage increase
  auctionDate: timestamp("auction_date"),
  status: varchar("status").default("completed"), // completed, cancelled, no_sale
  notes: text("notes"),
  notesAr: text("notes_ar"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  notes: text("notes"),
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

export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  artistId: integer("artist_id").references(() => artists.id),
  artworkId: integer("artwork_id").references(() => artworks.id),
  category: varchar("category"),
  priceThreshold: decimal("price_threshold", { precision: 10, scale: 2 }),
  alertType: varchar("alert_type"), // price_drop, new_artwork, auction_starting
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
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
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, { fields: [artists.userId], references: [users.id] }),
  artworks: many(artworks),
  auctionResults: many(auctionResults),
}));

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  user: one(users, { fields: [galleries.userId], references: [users.id] }),
  artworks: many(artworks),
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

// New table relations
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

export const collectorProfilesRelations = relations(collectorProfiles, ({ one }) => ({
  user: one(users, { fields: [collectorProfiles.userId], references: [users.id] }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  user: one(users, { fields: [priceAlerts.userId], references: [users.id] }),
  artist: one(artists, { fields: [priceAlerts.artistId], references: [artists.id] }),
  artwork: one(artworks, { fields: [priceAlerts.artworkId], references: [artworks.id] }),
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

// Auction Results relations
export const auctionResultsRelations = relations(auctionResults, ({ one }) => ({
  auction: one(auctions, { fields: [auctionResults.auctionId], references: [auctions.id] }),
  artwork: one(artworks, { fields: [auctionResults.artworkId], references: [artworks.id] }),
  artist: one(artists, { fields: [auctionResults.artistId], references: [artists.id] }),
  winner: one(users, { fields: [auctionResults.winnerUserId], references: [users.id] }),
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

// Discussion types
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = typeof discussions.$inferInsert;

// Discussion reply types
export type DiscussionReply = typeof discussionReplies.$inferSelect;
export type InsertDiscussionReply = typeof discussionReplies.$inferInsert;

// Workshop types
export type Workshop = typeof workshops.$inferSelect;
export type InsertWorkshop = typeof workshops.$inferInsert;
export type WorkshopRegistration = typeof workshopRegistrations.$inferSelect;
export type InsertWorkshopRegistration = typeof workshopRegistrations.$inferInsert;

// Event types
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;

// Community types
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = typeof discussions.$inferInsert;
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

// Zod schemas
export const insertArtistSchema = createInsertSchema(artists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGallerySchema = createInsertSchema(galleries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArtworkSchema = createInsertSchema(artworks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export const insertAuctionResultSchema = createInsertSchema(auctionResults).omit({ id: true, createdAt: true });
export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkshopSchema = createInsertSchema(workshops).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkshopRegistrationSchema = createInsertSchema(workshopRegistrations).omit({ id: true, registeredAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({ id: true, rsvpedAt: true });
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
