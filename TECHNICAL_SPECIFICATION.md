# Art Souk - Complete Technical Specification

## Project Overview
Art Souk is a comprehensive bilingual (English/Arabic) art marketplace platform for Saudi Arabia and GCC markets. It serves as a digital ecosystem connecting artists, galleries, collectors, and art enthusiasts with features including artwork browsing, live auctions, workshops, events, virtual exhibitions, and social interactions.

## Core Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OAuth with Google, Apple, X, GitHub, Email)
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query
- **Internationalization**: react-i18next
- **Build Tools**: Vite

### Database Schema (42 Tables)

#### Core User System
```sql
-- Users table with multi-role support
users: {
  id: text (primary key),
  email: text,
  firstName: text,
  lastName: text,
  profileImage: text,
  roles: text[], -- ['collector', 'artist', 'gallery']
  roleSetupComplete: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}

-- Artists profiles
artists: {
  id: serial (primary key),
  userId: text (foreign key),
  name: text,
  nameAr: text,
  bio: text,
  bioAr: text,
  profileImage: text,
  nationality: text,
  birthYear: integer,
  website: text,
  instagram: text,
  twitter: text,
  facebook: text,
  isVerified: boolean,
  isFeatured: boolean,
  totalArtworks: integer,
  totalSales: integer,
  averagePrice: decimal,
  paymentMethods: jsonb -- Payment method configurations
}

-- Galleries profiles
galleries: {
  id: serial (primary key),
  userId: text (foreign key),
  name: text,
  nameAr: text,
  description: text,
  descriptionAr: text,
  address: text,
  addressAr: text,
  website: text,
  email: text,
  phone: text,
  instagram: text,
  twitter: text,
  facebook: text,
  isVerified: boolean,
  isFeatured: boolean,
  totalArtworks: integer,
  totalSales: integer,
  paymentMethods: jsonb -- Payment method configurations
}
```

#### Artwork & Collection System
```sql
-- Artworks
artworks: {
  id: serial (primary key),
  artistId: integer (foreign key),
  galleryId: integer (foreign key),
  title: text,
  titleAr: text,
  description: text,
  descriptionAr: text,
  medium: text,
  mediumAr: text,
  dimensions: text,
  year: integer,
  price: decimal,
  currency: text,
  isAvailable: boolean,
  isFeatured: boolean,
  images: text[], -- Array of image URLs
  category: text,
  style: text,
  tags: text[],
  viewCount: integer,
  likeCount: integer,
  createdAt: timestamp
}

-- Collections (user-curated)
collections: {
  id: serial (primary key),
  userId: text (foreign key),
  name: text,
  nameAr: text,
  description: text,
  descriptionAr: text,
  isPublic: boolean,
  isFeatured: boolean,
  coverImage: text,
  createdAt: timestamp
}

-- Collection-artwork relationships
collectionArtworks: {
  id: serial (primary key),
  collectionId: integer (foreign key),
  artworkId: integer (foreign key),
  addedAt: timestamp
}
```

#### Auction System
```sql
-- Auctions
auctions: {
  id: serial (primary key),
  artworkId: integer (foreign key),
  title: text,
  titleAr: text,
  description: text,
  descriptionAr: text,
  startingPrice: decimal,
  currentPrice: decimal,
  reservePrice: decimal,
  startDate: timestamp,
  endDate: timestamp,
  status: text, -- 'upcoming', 'live', 'ended'
  totalBids: integer,
  viewCount: integer,
  isVerified: boolean,
  terms: text,
  termsAr: text
}

-- Auction bids
bids: {
  id: serial (primary key),
  auctionId: integer (foreign key),
  userId: text (foreign key),
  amount: decimal,
  bidTime: timestamp,
  isWinning: boolean
}

-- Auction results (historical data)
auctionResults: {
  id: serial (primary key),
  artworkId: integer (foreign key),
  artistId: integer (foreign key),
  auctionHouse: text,
  saleDate: timestamp,
  hammerPrice: decimal,
  estimateLow: decimal,
  estimateHigh: decimal,
  lotNumber: text,
  provenance: text,
  condition: text,
  literature: text,
  exhibited: text
}
```

#### Events & Workshops System
```sql
-- Workshops
workshops: {
  id: serial (primary key),
  instructorId: integer (foreign key to artists),
  title: text,
  titleAr: text,
  description: text,
  descriptionAr: text,
  skillLevel: text, -- 'beginner', 'intermediate', 'advanced'
  duration: integer, -- in hours
  maxParticipants: integer,
  price: decimal,
  currency: text,
  startDate: timestamp,
  endDate: timestamp,
  location: text,
  locationAr: text,
  isOnline: boolean,
  meetingLink: text,
  materials: text[],
  images: text[],
  isRecurring: boolean,
  recurrencePattern: text,
  recurrenceInterval: integer,
  recurrenceEndDate: timestamp,
  timezone: text,
  averageRating: decimal,
  totalReviews: integer,
  status: text -- 'upcoming', 'ongoing', 'completed', 'cancelled'
}

-- Events
events: {
  id: serial (primary key),
  organizerId: integer (foreign key to galleries),
  title: text,
  titleAr: text,
  description: text,
  descriptionAr: text,
  category: text, -- 'exhibition', 'talk', 'networking', 'auction'
  startDate: timestamp,
  endDate: timestamp,
  location: text,
  locationAr: text,
  address: text,
  addressAr: text,
  price: decimal,
  currency: text,
  maxAttendees: integer,
  images: text[],
  isRecurring: boolean,
  recurrencePattern: text,
  recurrenceInterval: integer,
  recurrenceEndDate: timestamp,
  timezone: text,
  averageRating: decimal,
  totalReviews: integer,
  status: text -- 'upcoming', 'ongoing', 'completed', 'cancelled'
}

-- Workshop/Event registrations
registrations: {
  id: serial (primary key),
  entityType: text, -- 'workshop' or 'event'
  entityId: integer,
  userId: text (foreign key),
  registeredAt: timestamp,
  status: text, -- 'registered', 'attended', 'cancelled'
  paymentStatus: text, -- 'pending', 'completed', 'refunded'
  notes: text
}
```

#### Commission System
```sql
-- Commission requests
commissionRequests: {
  id: serial (primary key),
  userId: text (foreign key),
  title: text,
  titleAr: text,
  description: text,
  descriptionAr: text,
  budget: decimal,
  currency: text,
  deadline: timestamp,
  medium: text,
  mediumAr: text,
  dimensions: text,
  style: text,
  colorPalette: text,
  referenceImages: text[],
  status: text, -- 'open', 'in_progress', 'completed', 'cancelled'
  selectedBidId: integer,
  viewCount: integer,
  bidCount: integer,
  createdAt: timestamp
}

-- Commission bids
commissionBids: {
  id: serial (primary key),
  requestId: integer (foreign key),
  artistId: integer (foreign key),
  price: decimal,
  timeline: text,
  proposal: text,
  portfolioImages: text[],
  status: text, -- 'pending', 'accepted', 'rejected'
  createdAt: timestamp
}

-- Commission messages
commissionMessages: {
  id: serial (primary key),
  requestId: integer (foreign key),
  senderId: text (foreign key),
  message: text,
  attachments: text[],
  createdAt: timestamp
}
```

#### E-commerce & Orders
```sql
-- Purchase orders
purchaseOrders: {
  id: serial (primary key),
  buyerId: text (foreign key),
  artworkId: integer (foreign key),
  sellerId: text, -- artist or gallery user ID
  sellerType: text, -- 'artist' or 'gallery'
  amount: decimal,
  currency: text,
  status: text, -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  paymentStatus: text, -- 'pending', 'completed', 'failed'
  paymentMethod: text,
  shippingAddress: jsonb,
  trackingNumber: text,
  carrier: text,
  estimatedDelivery: timestamp,
  sellerNotes: text,
  buyerNotes: text,
  createdAt: timestamp,
  sellerUpdatedAt: timestamp,
  paymentConfirmedAt: timestamp
}

-- Shipping addresses
shippingAddresses: {
  id: serial (primary key),
  userId: text (foreign key),
  name: text,
  addressLine1: text,
  addressLine2: text,
  city: text,
  state: text,
  postalCode: text,
  country: text,
  phone: text,
  isDefault: boolean,
  createdAt: timestamp
}

-- Collector profiles
collectorProfiles: {
  id: serial (primary key),
  userId: text (foreign key),
  interests: text[],
  budgetRange: text,
  preferredStyles: text[],
  isVerified: boolean,
  totalPurchases: integer,
  totalSpent: decimal,
  joinedAt: timestamp
}

-- Price alerts
priceAlerts: {
  id: serial (primary key),
  userId: text (foreign key),
  artworkId: integer (foreign key),
  targetPrice: decimal,
  isActive: boolean,
  createdAt: timestamp
}
```

#### Social Features
```sql
-- Favorites
favorites: {
  id: serial (primary key),
  userId: text (foreign key),
  entityType: text, -- 'artwork', 'artist', 'gallery', 'auction'
  entityId: integer,
  createdAt: timestamp
}

-- Follows
follows: {
  id: serial (primary key),
  followerId: text (foreign key),
  followingType: text, -- 'artist', 'gallery'
  followingId: integer,
  createdAt: timestamp
}

-- Inquiries
inquiries: {
  id: serial (primary key),
  userId: text (foreign key),
  entityType: text, -- 'artwork', 'artist', 'gallery'
  entityId: integer,
  subject: text,
  message: text,
  contactInfo: text,
  status: text, -- 'new', 'responded', 'closed'
  createdAt: timestamp
}
```

#### Analytics & Personalization
```sql
-- User interactions (behavior tracking)
userInteractions: {
  id: serial (primary key),
  userId: text (foreign key),
  entityType: text, -- 'artwork', 'artist', 'gallery', 'auction'
  entityId: integer,
  interactionType: text, -- 'view', 'like', 'share', 'inquiry'
  metadata: jsonb,
  createdAt: timestamp
}

-- User preferences
userPreferences: {
  id: serial (primary key),
  userId: text (foreign key),
  artCategories: text[],
  artStyles: text[],
  priceRangeMin: decimal,
  priceRangeMax: decimal,
  preferredMediums: text[],
  emailNotifications: boolean,
  pushNotifications: boolean,
  privacySettings: jsonb,
  updatedAt: timestamp
}

-- AI recommendations
aiRecommendations: {
  id: serial (primary key),
  userId: text (foreign key),
  entityType: text, -- 'artwork', 'artist', 'gallery'
  entityId: integer,
  score: decimal,
  reasons: text[],
  createdAt: timestamp
}
```

#### Email & Notifications
```sql
-- Email templates
emailTemplates: {
  id: serial (primary key),
  code: text (unique),
  name: text,
  nameAr: text,
  subject: text,
  subjectAr: text,
  bodyText: text,
  bodyTextAr: text,
  bodyHtml: text,
  bodyHtmlAr: text,
  variables: text[],
  isActive: boolean,
  createdAt: timestamp
}

-- Email notification queue
emailNotificationQueue: {
  id: serial (primary key),
  toEmail: text,
  fromEmail: text,
  subject: text,
  bodyText: text,
  bodyHtml: text,
  priority: integer,
  status: text, -- 'pending', 'sent', 'failed'
  scheduledAt: timestamp,
  sentAt: timestamp,
  createdAt: timestamp
}

-- Newsletter subscribers
newsletterSubscribers: {
  id: serial (primary key),
  email: text (unique),
  firstName: text,
  lastName: text,
  preferences: jsonb,
  isActive: boolean,
  subscribedAt: timestamp,
  unsubscribedAt: timestamp
}
```

#### Advanced Features
```sql
-- Scheduling conflicts
schedulingConflicts: {
  id: serial (primary key),
  entityType: text, -- 'workshop', 'event'
  entityId: integer,
  conflictingEntityType: text,
  conflictingEntityId: integer,
  conflictType: text, -- 'time_overlap', 'resource_conflict'
  severity: text, -- 'low', 'medium', 'high'
  isResolved: boolean,
  createdAt: timestamp
}

-- Event reminders
eventReminders: {
  id: serial (primary key),
  userId: text (foreign key),
  entityType: text, -- 'workshop', 'event'
  entityId: integer,
  reminderType: text, -- 'email', 'sms', 'push'
  reminderTime: timestamp,
  customMessage: text,
  isSent: boolean,
  createdAt: timestamp
}

-- GDPR/PDPL compliance
dsarRequests: {
  id: serial (primary key),
  userId: text (foreign key),
  requestType: text, -- 'access', 'rectification', 'erasure', 'portability'
  status: text, -- 'pending', 'processing', 'completed', 'rejected'
  description: text,
  responseData: jsonb,
  createdAt: timestamp,
  completedAt: timestamp
}
```

## Authentication System

### Multi-Provider OAuth Setup
```typescript
// Replit Auth configuration
const authConfig = {
  providers: ['google', 'apple', 'twitter', 'github', 'email'],
  sessionStorage: 'postgresql',
  redirects: {
    success: '/auth/success',
    failure: '/api/login'
  }
}

// Role-based signup flow
authFlow: {
  1. User signs up via OAuth
  2. Auto-redirect to /auth/success
  3. Check if roleSetupComplete === false
  4. If false, redirect to /role-selection (MANDATORY)
  5. User selects roles (collector, artist, gallery)
  6. Auto-create artist/gallery profiles if selected
  7. Mark roleSetupComplete = true
  8. Redirect to home page
}
```

### Role Management
```typescript
// Multi-role system
userRoles: {
  collector: {
    access: ['purchase', 'wishlist', 'price-alerts', 'orders'],
    dashboard: 'CollectorDashboard'
  },
  artist: {
    access: ['artwork-upload', 'workshop-creation', 'commission-bidding'],
    dashboard: 'ArtistDashboard',
    profile: 'ArtistProfile'
  },
  gallery: {
    access: ['artist-management', 'event-creation', 'exhibition-hosting'],
    dashboard: 'GalleryDashboard',
    profile: 'GalleryProfile'
  }
}
```

## API Structure

### Core Endpoints
```typescript
// Authentication
POST /api/login - OAuth initiation
GET /api/callback - OAuth callback
GET /api/auth/user - Current user info
POST /api/logout - Logout
GET /auth/success - Role setup redirect handler

// Role Management
GET /api/user/roles - Get user roles & setup status
PUT /api/user/roles - Update user roles (creates profiles)

// Artworks
GET /api/artworks - List artworks (with filters)
GET /api/artworks/featured - Featured artworks
GET /api/artworks/curators-picks - Curated selections
GET /api/artworks/:id - Single artwork details
POST /api/artworks - Create artwork (artist/gallery only)
PUT /api/artworks/:id - Update artwork
DELETE /api/artworks/:id - Delete artwork

// Artists
GET /api/artists - List artists (with filters)
GET /api/artists/featured - Featured artists
GET /api/artists/:id - Artist profile
GET /api/artists/:id/artworks - Artist's artworks
GET /api/artists/:id/stats - Artist statistics
PUT /api/artists/:id - Update artist profile

// Galleries
GET /api/galleries - List galleries
GET /api/galleries/featured - Featured galleries
GET /api/galleries/:id - Gallery profile
GET /api/galleries/:id/artists - Gallery's artists
GET /api/galleries/:id/artworks - Gallery's artworks
PUT /api/galleries/:id - Update gallery profile

// Auctions
GET /api/auctions - List auctions
GET /api/auctions/live - Live auctions
GET /api/auctions/:id - Auction details
GET /api/auctions/:id/bids - Auction bids
POST /api/auctions/:id/bid - Place bid
POST /api/auctions - Create auction

// Collections
GET /api/collections - List collections
GET /api/collections/featured - Featured collections
GET /api/collections/:id - Collection details
POST /api/collections - Create collection
PUT /api/collections/:id - Update collection
POST /api/collections/:id/artworks - Add artwork to collection
DELETE /api/collections/:id/artworks/:artworkId - Remove artwork

// Favorites
GET /api/favorites - User's favorites
POST /api/favorites - Add to favorites
DELETE /api/favorites/:id - Remove from favorites

// Search
GET /api/search - Universal search across all entities
GET /api/search/artworks - Search artworks
GET /api/search/artists - Search artists
GET /api/search/galleries - Search galleries

// Workshops
GET /api/workshops - List workshops
GET /api/workshops/featured - Featured workshops
GET /api/workshops/:id - Workshop details
POST /api/workshops - Create workshop (artist only)
POST /api/workshops/:id/register - Register for workshop
GET /api/workshops/:id/participants - Workshop participants

// Events
GET /api/events - List events
GET /api/events/featured - Featured events
GET /api/events/:id - Event details
POST /api/events - Create event (gallery only)
POST /api/events/:id/rsvp - RSVP to event
GET /api/events/:id/attendees - Event attendees

// Commissions
GET /api/commissions - List commission requests
POST /api/commissions - Create commission request
GET /api/commissions/:id - Commission details
POST /api/commissions/:id/bids - Submit bid (artist only)
POST /api/commissions/:id/accept-bid - Accept bid (collector only)
GET /api/commissions/:id/messages - Commission messages
POST /api/commissions/:id/messages - Send message

// E-commerce
GET /api/collector/orders - Collector's orders
GET /api/collector/wishlist - Collector's wishlist
POST /api/collector/wishlist - Add to wishlist
GET /api/collector/price-alerts - Price alerts
POST /api/collector/price-alerts - Create price alert
GET /api/seller/orders - Seller's orders
PUT /api/seller/orders/:id/status - Update order status
GET /api/seller/payment-methods - Payment methods
POST /api/seller/payment-methods - Add payment method

// Analytics
GET /api/analytics/user-interactions - User behavior data
GET /api/analytics/artist-performance - Artist performance metrics
GET /api/analytics/popular-artworks - Trending artworks
GET /api/analytics/sales-data - Sales analytics

// Admin
GET /api/admin/stats - Platform statistics
GET /api/admin/users - User management
PATCH /api/admin/users/:id/role - Update user role
POST /api/admin/feature - Feature content
GET /api/admin/reports - Content reports

// Email System
POST /api/newsletter/subscribe - Subscribe to newsletter
POST /api/newsletter/unsubscribe - Unsubscribe
GET /api/email-templates - Email templates
POST /api/email-templates - Create template
GET /api/email-notifications/queue - Email queue
POST /api/email-notifications/test - Test email
```

## Frontend Implementation

### Component Structure
```
client/src/
├── components/
│   ├── ui/ (shadcn components)
│   ├── layout/ (Navbar, Footer, Sidebar)
│   ├── artwork/ (ArtworkCard, ArtworkGrid)
│   ├── auction/ (AuctionCard, BiddingInterface)
│   └── forms/ (SearchForm, ContactForm)
├── pages/
│   ├── Landing.tsx
│   ├── ArtworkDetail.tsx
│   ├── ArtistProfile.tsx
│   ├── GalleryProfile.tsx
│   ├── Search.tsx
│   ├── Dashboard.tsx
│   ├── CollectorDashboard.tsx
│   ├── ArtistDashboard.tsx
│   ├── GalleryDashboard.tsx
│   ├── Auctions.tsx
│   ├── AuctionDetail.tsx
│   ├── Workshops.tsx
│   ├── Events.tsx
│   ├── CommissionRequests.tsx
│   ├── CommissionDetail.tsx
│   ├── RoleSelection.tsx
│   └── Analytics.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useRoleSetup.ts
│   ├── useSearch.ts
│   ├── useFavorites.ts
│   └── useAnalytics.ts
├── lib/
│   ├── queryClient.ts
│   ├── i18n.ts
│   └── utils.ts
└── locales/
    ├── en.json
    └── ar.json
```

### Key Frontend Features

#### Bilingual Support
```typescript
// i18n configuration
const i18nConfig = {
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: require('./locales/en.json') },
    ar: { translation: require('./locales/ar.json') }
  },
  interpolation: {
    escapeValue: false
  }
}

// RTL support
const isRTL = i18n.language === 'ar'
document.dir = isRTL ? 'rtl' : 'ltr'
```

#### Role-Based UI
```typescript
// Role-based component rendering
const RoleBasedComponent = ({ userRoles, children }) => {
  const hasRole = (role) => userRoles.includes(role)
  
  return (
    <>
      {hasRole('collector') && <CollectorFeatures />}
      {hasRole('artist') && <ArtistFeatures />}
      {hasRole('gallery') && <GalleryFeatures />}
    </>
  )
}
```

#### Search Implementation
```typescript
// Advanced search with filters
const searchConfig = {
  entities: ['artworks', 'artists', 'galleries'],
  filters: {
    artworks: ['category', 'medium', 'priceRange', 'availability'],
    artists: ['nationality', 'style', 'verified'],
    galleries: ['location', 'verified']
  },
  sorting: ['relevance', 'price', 'date', 'popularity']
}
```

## Key Implementation Details

### Database Seeding
```typescript
// Comprehensive seed data
const seedData = {
  users: 5, // Saudi/GCC names and profiles
  artists: 8, // Including famous Saudi artists
  galleries: 4, // Major regional galleries
  artworks: 15, // Realistic pricing and descriptions
  auctions: 3, // Live bidding scenarios
  workshops: 5, // Various skill levels and topics
  events: 5, // Different event types
  commissions: 3, // Active commission requests
  collections: 3, // Curated collections
}
```

### Email System Integration
```typescript
// SendGrid email service
const emailService = {
  provider: 'SendGrid',
  templates: ['welcome', 'order-confirmation', 'newsletter'],
  queueProcessing: 'every-minute',
  multilingual: true
}
```

### Security & Compliance
```typescript
// GDPR/PDPL compliance features
const complianceFeatures = {
  dataSubjectRights: ['access', 'rectification', 'erasure', 'portability'],
  auditLogging: 'all-data-operations',
  consentManagement: 'granular-preferences',
  dataRetention: 'configurable-periods'
}
```

### Performance Optimizations
```typescript
// Query optimization
const optimizations = {
  caching: 'TanStack Query with stale-while-revalidate',
  lazyLoading: 'React.lazy for route-based code splitting',
  imageOptimization: 'WebP format with fallbacks',
  databaseIndexing: 'Strategic indexes on search fields'
}
```

## Deployment Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
PGHOST=localhost
PGPORT=5432
PGDATABASE=artsouk
PGUSER=postgres
PGPASSWORD=password

# Email
SENDGRID_API_KEY=sg.xxxxx
SENDGRID_FROM_EMAIL=no-reply@artsouk.app

# Authentication
REPL_ID=your-repl-id
SESSION_SECRET=your-session-secret
```

### Build Process
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx server/runSeed.ts"
  }
}
```

## Testing Strategy

### Feature Testing Coverage
1. **Authentication Flow** - OAuth, role selection, profile creation
2. **Artwork Management** - Upload, edit, delete, search, filter
3. **Auction System** - Bidding, real-time updates, winner selection
4. **Workshop/Event Management** - Creation, registration, attendance
5. **Commission System** - Request posting, bidding, acceptance
6. **E-commerce Flow** - Order placement, payment coordination, fulfillment
7. **Social Features** - Favorites, follows, inquiries
8. **Analytics Dashboard** - Data visualization, user insights
9. **Bilingual Support** - Translation coverage, RTL layout
10. **Admin Functions** - User management, content moderation

This specification provides a complete blueprint for recreating the Art Souk platform with all its comprehensive features, bilingual support, and advanced functionality.