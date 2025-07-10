import { pgTable, serial, text, integer, decimal, timestamp, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for commission request status
export const commissionStatusEnum = pgEnum("commission_status", [
  "open",
  "in_progress",
  "completed",
  "cancelled",
  "expired"
]);

// Enum for bid status
export const bidStatusEnum = pgEnum("bid_status", [
  "pending",
  "accepted",
  "rejected",
  "withdrawn"
]);

// Commission requests table
export const commissionRequests = pgTable("commission_requests", {
  id: serial("id").primaryKey(),
  collectorId: text("collector_id").notNull(),
  
  // Request details
  title: text("title").notNull(),
  description: text("description").notNull(),
  
  // Artwork specifications
  dimensions: text("dimensions"), // e.g., "120 × 90"
  medium: text("medium"), // e.g., "oil on canvas", "digital", "watercolor"
  style: text("style"), // e.g., "abstract", "realistic", "impressionist"
  colorPalette: text("color_palette"), // e.g., "coastal", "warm", "monochrome"
  
  // Budget and timeline
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  currency: text("currency").default("SAR"),
  deadline: timestamp("deadline"),
  
  // Additional requirements
  referenceImages: jsonb("reference_images").$type<string[]>().default([]),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  
  // Status and metadata
  status: commissionStatusEnum("status").default("open"),
  viewCount: integer("view_count").default(0),
  bidCount: integer("bid_count").default(0),
  
  // Selected bid (when commission is awarded)
  selectedBidId: integer("selected_bid_id"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  expiresAt: timestamp("expires_at")
});

// Artist bids on commission requests
export const commissionBids = pgTable("commission_bids", {
  id: serial("id").primaryKey(),
  commissionRequestId: integer("commission_request_id").notNull().references(() => commissionRequests.id),
  artistId: integer("artist_id").notNull(),
  
  // Bid details
  proposedPrice: decimal("proposed_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("SAR"),
  estimatedDays: integer("estimated_days").notNull(),
  
  // Proposal
  proposalText: text("proposal_text").notNull(),
  portfolioSamples: jsonb("portfolio_samples").$type<number[]>().default([]), // artwork IDs
  sketchIncluded: boolean("sketch_included").default(false),
  revisionsIncluded: integer("revisions_included").default(1),
  
  // Additional terms
  paymentTerms: text("payment_terms"), // e.g., "50% upfront, 50% on completion"
  deliveryFormat: text("delivery_format"), // e.g., "original + high-res digital"
  
  // Status
  status: bidStatusEnum("status").default("pending"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Messages between collector and artist about commission
export const commissionMessages = pgTable("commission_messages", {
  id: serial("id").primaryKey(),
  commissionRequestId: integer("commission_request_id").notNull().references(() => commissionRequests.id),
  bidId: integer("bid_id").references(() => commissionBids.id),
  
  senderId: text("sender_id").notNull(),
  senderType: text("sender_type").notNull(), // "collector" or "artist"
  
  message: text("message").notNull(),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  
  isRead: boolean("is_read").default(false),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Commission contracts (when bid is accepted)
export const commissionContracts = pgTable("commission_contracts", {
  id: serial("id").primaryKey(),
  commissionRequestId: integer("commission_request_id").notNull().references(() => commissionRequests.id),
  bidId: integer("bid_id").notNull().references(() => commissionBids.id),
  
  // Contract details
  agreedPrice: decimal("agreed_price", { precision: 10, scale: 2 }).notNull(),
  agreedDeadline: timestamp("agreed_deadline").notNull(),
  contractTerms: text("contract_terms").notNull(),
  
  // Progress tracking
  status: text("status").default("active"), // active, completed, disputed, cancelled
  progressUpdates: jsonb("progress_updates").$type<Array<{
    date: string;
    description: string;
    images?: string[];
  }>>().default([]),
  
  // Payment tracking (external)
  paymentStatus: text("payment_status").default("pending"), // pending, partial, complete
  paymentNotes: text("payment_notes"),
  
  // Completion
  completedAt: timestamp("completed_at"),
  deliveryNotes: text("delivery_notes"),
  collectorRating: integer("collector_rating"),
  artistRating: integer("artist_rating"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Relations
export const commissionRequestsRelations = relations(commissionRequests, ({ one, many }) => ({
  bids: many(commissionBids),
  messages: many(commissionMessages),
  selectedBid: one(commissionBids, {
    fields: [commissionRequests.selectedBidId],
    references: [commissionBids.id]
  }),
  contract: one(commissionContracts)
}));

export const commissionBidsRelations = relations(commissionBids, ({ one, many }) => ({
  commissionRequest: one(commissionRequests, {
    fields: [commissionBids.commissionRequestId],
    references: [commissionRequests.id]
  }),
  messages: many(commissionMessages),
  contract: one(commissionContracts)
}));

export const commissionMessagesRelations = relations(commissionMessages, ({ one }) => ({
  commissionRequest: one(commissionRequests, {
    fields: [commissionMessages.commissionRequestId],
    references: [commissionRequests.id]
  }),
  bid: one(commissionBids, {
    fields: [commissionMessages.bidId],
    references: [commissionBids.id]
  })
}));

export const commissionContractsRelations = relations(commissionContracts, ({ one }) => ({
  commissionRequest: one(commissionRequests, {
    fields: [commissionContracts.commissionRequestId],
    references: [commissionRequests.id]
  }),
  bid: one(commissionBids, {
    fields: [commissionContracts.bidId],
    references: [commissionBids.id]
  })
}));

// Schemas
export const insertCommissionRequestSchema = createInsertSchema(commissionRequests).omit({
  id: true,
  viewCount: true,
  bidCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommissionBidSchema = createInsertSchema(commissionBids).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCommissionMessageSchema = createInsertSchema(commissionMessages).omit({
  id: true,
  createdAt: true
});

export const insertCommissionContractSchema = createInsertSchema(commissionContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type CommissionRequest = typeof commissionRequests.$inferSelect;
export type InsertCommissionRequest = z.infer<typeof insertCommissionRequestSchema>;

export type CommissionBid = typeof commissionBids.$inferSelect;
export type InsertCommissionBid = z.infer<typeof insertCommissionBidSchema>;

export type CommissionMessage = typeof commissionMessages.$inferSelect;
export type InsertCommissionMessage = z.infer<typeof insertCommissionMessageSchema>;

export type CommissionContract = typeof commissionContracts.$inferSelect;
export type InsertCommissionContract = z.infer<typeof insertCommissionContractSchema>;