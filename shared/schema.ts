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

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  titleAr: varchar("title_ar"),
  slug: varchar("slug").notNull().unique(),
  content: text("content"),
  contentAr: text("content_ar"),
  excerpt: text("excerpt"),
  excerptAr: text("excerpt_ar"),
  coverImage: varchar("cover_image"),
  category: varchar("category"), // art, interview, guide, news
  categoryAr: varchar("category_ar"),
  authorId: varchar("author_id").references(() => users.id),
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  artists: many(artists),
  galleries: many(galleries),
  articles: many(articles),
  bids: many(bids),
  inquiries: many(inquiries),
  favorites: many(favorites),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, { fields: [artists.userId], references: [users.id] }),
  artworks: many(artworks),
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
}));

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  artwork: one(artworks, { fields: [auctions.artworkId], references: [artworks.id] }),
  bids: many(bids),
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

export const articlesRelations = relations(articles, ({ one }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  artwork: one(artworks, { fields: [inquiries.artworkId], references: [artworks.id] }),
  user: one(users, { fields: [inquiries.userId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  artwork: one(artworks, { fields: [favorites.artworkId], references: [artworks.id] }),
}));

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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

export type InsertCollection = typeof collections.$inferInsert;
export type Collection = typeof collections.$inferSelect;

export type InsertArticle = typeof articles.$inferInsert;
export type Article = typeof articles.$inferSelect;

export type InsertInquiry = typeof inquiries.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;

export type InsertFavorite = typeof favorites.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;

// Zod schemas
export const insertArtistSchema = createInsertSchema(artists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGallerySchema = createInsertSchema(galleries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArtworkSchema = createInsertSchema(artworks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuctionSchema = createInsertSchema(auctions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBidSchema = createInsertSchema(bids).omit({ id: true, createdAt: true });
export const insertCollectionSchema = createInsertSchema(collections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
