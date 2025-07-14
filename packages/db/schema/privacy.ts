import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  integer,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// DSAR (Data Subject Access Request) types
export const dsarTypeEnum = pgEnum('dsar_type', ['access', 'delete', 'correct', 'portability']);
export const dsarStatusEnum = pgEnum('dsar_status', [
  'pending',
  'in_progress',
  'completed',
  'rejected',
]);

// DSAR requests table
export const dsarRequests = pgTable('dsar_requests', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: dsarTypeEnum('type').notNull(),
  status: dsarStatusEnum('status').notNull().default('pending'),
  requestDetails: jsonb('request_details'),
  responseData: jsonb('response_data'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  resolvedBy: text('resolved_by'),
  notes: text('notes'),
});

// Audit logs table for immutable logging
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reports table for content moderation
export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'reviewing',
  'resolved',
  'dismissed',
]);
export const reportTypeEnum = pgEnum('report_type', [
  'spam',
  'inappropriate',
  'fake',
  'copyright',
  'other',
]);

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  reporterId: text('reporter_id').notNull(),
  entityType: text('entity_type').notNull(), // 'artwork', 'comment', 'user', 'gallery'
  entityId: integer('entity_id').notNull(),
  type: reportTypeEnum('type').notNull(),
  status: reportStatusEnum('status').notNull().default('pending'),
  description: text('description'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Auction update requests for maker-checker pattern
export const auctionUpdateRequests = pgTable('auction_update_requests', {
  id: serial('id').primaryKey(),
  auctionId: integer('auction_id').notNull(),
  oldData: jsonb('old_data').notNull(),
  newData: jsonb('new_data').notNull(),
  requestedBy: text('requested_by').notNull(),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectedBy: text('rejected_by'),
  rejectedAt: timestamp('rejected_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow(),
});

// KYC document types based on Salla and Saudi regulations
export const kycDocumentTypeEnum = pgEnum('kyc_document_type', [
  'national_id',
  'commercial_registration',
  'business_license',
  'articles_of_association',
  'address_proof',
  'bank_statement',
  'authorized_personnel_list',
  'beneficial_owners_list',
  'tax_certificate',
  'other',
]);

export const kycStatusEnum = pgEnum('kyc_status', [
  'pending',
  'under_review',
  'approved',
  'rejected',
  'expired',
  'requires_update',
]);

// Enhanced Seller KYC documents with retention policy
export const sellerKycDocs = pgTable('seller_kyc_docs', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  sellerType: text('seller_type').notNull(), // 'artist' or 'gallery'
  sellerId: integer('seller_id').notNull(),
  documentType: kycDocumentTypeEnum('document_type').notNull(),
  documentUrl: text('document_url').notNull(),
  documentName: text('document_name'),
  documentSize: integer('document_size'),
  mimeType: text('mime_type'),
  sumsubApplicantId: text('sumsub_applicant_id'),
  verificationStatus: kycStatusEnum('verification_status').notNull().default('pending'),
  verificationNotes: text('verification_notes'),
  ocrData: jsonb('ocr_data'), // Extracted data from documents
  biometricData: jsonb('biometric_data'), // Face match results
  governmentVerified: boolean('government_verified').default(false),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // 10-year retention policy
});

// Shipping addresses with retention policy
export const shippingAddresses = pgTable('shipping_addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  orderId: integer('order_id'),
  addressLine1: text('address_line_1').notNull(),
  addressLine2: text('address_line_2'),
  city: text('city').notNull(),
  state: text('state'),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  phoneNumber: text('phone_number'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // For retention policy
});

// Insert schemas
export const insertDsarRequestSchema = createInsertSchema(dsarRequests).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  resolvedBy: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
  reviewedBy: true,
  resolution: true,
});

export const insertAuctionUpdateRequestSchema = createInsertSchema(auctionUpdateRequests).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  approvedBy: true,
  rejectedAt: true,
  rejectedBy: true,
  rejectionReason: true,
});

// KYC verification requirements based on Saudi regulations
export const kycVerificationRequirements = pgTable('kyc_verification_requirements', {
  id: serial('id').primaryKey(),
  sellerType: text('seller_type').notNull(), // 'artist' or 'gallery'
  documentType: kycDocumentTypeEnum('document_type').notNull(),
  required: boolean('required').notNull().default(true),
  description: text('description'),
  descriptionAr: text('description_ar'),
  validityPeriod: integer('validity_period'), // months
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Enhanced KYC verification tracking
export const kycVerificationSessions = pgTable('kyc_verification_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  sellerType: text('seller_type').notNull(),
  sellerId: integer('seller_id').notNull(),
  sessionId: text('session_id').notNull(),
  provider: text('provider').notNull().default('sumsub'), // 'sumsub', 'uqudo', 'idmerit'
  status: kycStatusEnum('status').notNull().default('pending'),
  completedDocuments: jsonb('completed_documents'),
  missingDocuments: jsonb('missing_documents'),
  riskScore: integer('risk_score'),
  complianceLevel: text('compliance_level'), // 'basic', 'enhanced', 'aml_required'
  processingTime: integer('processing_time'), // seconds
  rejectionReasons: jsonb('rejection_reasons'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'),
});

export const insertSellerKycDocSchema = createInsertSchema(sellerKycDocs).omit({
  id: true,
  uploadedAt: true,
  updatedAt: true,
  reviewedAt: true,
});

export const insertKycVerificationRequirementSchema = createInsertSchema(
  kycVerificationRequirements
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKycVerificationSessionSchema = createInsertSchema(kycVerificationSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
});

// Types
export type DsarRequest = typeof dsarRequests.$inferSelect;
export type InsertDsarRequest = z.infer<typeof insertDsarRequestSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type AuctionUpdateRequest = typeof auctionUpdateRequests.$inferSelect;
export type InsertAuctionUpdateRequest = z.infer<typeof insertAuctionUpdateRequestSchema>;

export type SellerKycDoc = typeof sellerKycDocs.$inferSelect;
export type InsertSellerKycDoc = z.infer<typeof insertSellerKycDocSchema>;

export type KycVerificationRequirement = typeof kycVerificationRequirements.$inferSelect;
export type InsertKycVerificationRequirement = z.infer<
  typeof insertKycVerificationRequirementSchema
>;

export type KycVerificationSession = typeof kycVerificationSessions.$inferSelect;
export type InsertKycVerificationSession = z.infer<typeof insertKycVerificationSessionSchema>;

export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;
