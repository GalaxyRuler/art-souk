# Art Souk Platform - Complete Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Key Components](#key-components)
7. [Dependencies](#dependencies)
8. [Security Architecture](#security-architecture)
9. [Performance & Scalability](#performance--scalability)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Platform Description
Art Souk is a comprehensive bilingual art marketplace platform designed specifically for the Saudi Arabian and Gulf Cooperation Council (GCC) art market. The platform serves as a central hub connecting artists, galleries, collectors, and art enthusiasts.

### Core Features
- **Marketplace**: Artwork browsing, purchasing, and sales management
- **Live Auctions**: Real-time bidding system with Socket.io
- **Educational Platform**: Workshops and events management
- **Commission System**: Custom artwork commissioning
- **Social Features**: Following, commenting, and community engagement
- **Analytics**: User lifecycle tracking and performance metrics
- **Compliance**: PDPL compliance and trust/safety features

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Internationalization**: react-i18next (Arabic/English)
- **Real-time**: Socket.io with Redis adapter
- **Background Jobs**: BullMQ with Redis
- **Email**: SendGrid integration

---

## Frontend Architecture

### Application Structure

#### Main App Component (`client/src/App.tsx`)
```typescript
// Core application setup with providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
```

#### Routing System
- **Router**: Wouter for client-side routing
- **Authentication-aware**: Different routes for authenticated/unauthenticated users
- **Role-based**: Admin, artist, gallery, collector specific routes

#### Page Structure (25+ pages)
```
Pages:
├── Landing.tsx              # Unauthenticated homepage
├── Home.tsx                 # Authenticated dashboard
├── Artists.tsx              # Artist directory
├── ArtistProfile.tsx        # Individual artist pages
├── Galleries.tsx            # Gallery directory
├── GalleryProfile.tsx       # Individual gallery pages
├── Auctions.tsx             # Auction listings
├── AuctionDetail.tsx        # Live auction interface
├── Workshops.tsx            # Workshop directory
├── Events.tsx               # Event listings
├── ArtworkDetail.tsx        # Individual artwork pages
├── Search.tsx               # Global search interface
├── Dashboard.tsx            # User dashboard
├── Analytics.tsx            # Analytics dashboard
├── UserPreferences.tsx      # User settings
├── CollectorDashboard.tsx   # Collector-specific dashboard
├── SellerDashboard.tsx      # Seller management
├── CommissionRequests.tsx   # Commission marketplace
├── CommissionDetail.tsx     # Commission details
├── ArtworkManagement.tsx    # Artist artwork management
├── ManageWorkshops.tsx      # Workshop management
├── ManageEvents.tsx         # Event management
├── AdminDashboard.tsx       # Admin panel
├── AdminSetup.tsx           # Admin initialization
├── Auth.tsx                 # Authentication page
├── RoleSelection.tsx        # Role selection for new users
└── NotFound.tsx             # 404 page
```

### State Management
- **TanStack Query**: Server state management with caching
- **React Hooks**: Component-level state management
- **Context API**: Authentication and language state

### UI Components
- **Design System**: Radix UI primitives with shadcn/ui styling
- **Responsive**: Mobile-first design approach
- **Bilingual**: RTL support for Arabic
- **Accessibility**: WCAG compliance with proper ARIA attributes

---

## Backend Architecture

### Server Structure (`server/index.ts`)

#### Core Express Setup
```typescript
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  // Comprehensive logging implementation
});

// Production security configuration
configureProduction(app);

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});
```

#### Request/Response Logging
- Automatic API request logging
- Response capture and logging
- Performance timing measurement
- Error tracking and monitoring

### Route Architecture (`server/routes.ts`)

#### Authentication Routes
- `/api/auth/user` - Get current user
- `/api/user/roles` - Role management
- `/auth/success` - Auth callback handler
- `/api/logout` - Logout endpoint

#### Admin Routes
- `/api/admin/setup` - One-time admin setup
- `/api/admin/stats` - Platform statistics
- `/api/admin/users` - User management
- `/api/admin/artists` - Artist management
- `/api/admin/galleries` - Gallery management

#### Marketplace Routes
- `/api/artworks/*` - Artwork CRUD operations
- `/api/artists/*` - Artist profiles and management
- `/api/galleries/*` - Gallery profiles and management
- `/api/collections/*` - Collection management

#### Auction Routes
- `/api/auctions/*` - Auction management
- `/api/auctions/:id/bids` - Bidding system
- `/api/auctions/:id/watch` - Auction watching

#### Workshop & Event Routes
- `/api/workshops/*` - Workshop management
- `/api/events/*` - Event management
- `/api/workshop-registrations/*` - Registration handling

#### User Features
- `/api/favorites/*` - User favorites
- `/api/inquiries/*` - Artwork inquiries
- `/api/follows/*` - Social following
- `/api/comments/*` - Commenting system

#### Commerce Routes
- `/api/collector/*` - Collector dashboard
- `/api/seller/*` - Seller management
- `/api/commissions/*` - Commission system

#### Analytics Routes
- `/api/analytics/*` - User analytics
- `/api/lifecycle/*` - Lifecycle tracking
- `/api/user-interactions/*` - Interaction tracking

### Storage Layer (`server/storage.ts`)

#### Database Interface
```typescript
// 175+ imports for comprehensive data management
import {
  users, artists, galleries, artworks, auctions, bids,
  collections, workshops, events, inquiries, favorites,
  // ... extensive import list
} from "@shared/schema";
```

#### Storage Methods
- **User Management**: 15+ methods for user operations
- **Marketplace**: 25+ methods for artwork/artist/gallery operations
- **Auctions**: 10+ methods for auction management
- **Social**: 12+ methods for social features
- **Analytics**: 8+ methods for tracking and metrics
- **Commerce**: 20+ methods for orders and payments

---

## Database Schema

### Core Tables (42+ tables)

#### User Management
```sql
-- Users table with role support
users (
  id: varchar (primary key),
  email: varchar (unique),
  firstName: varchar,
  lastName: varchar,
  profileImageUrl: varchar,
  roles: jsonb (array of roles),
  roleSetupComplete: boolean,
  lifecycleStage: enum,
  createdAt: timestamp
)

-- Extended user profiles
userProfiles (
  id: serial (primary key),
  userId: varchar (foreign key),
  bio: text,
  bioAr: text,
  location: varchar,
  website: varchar,
  interests: jsonb
)
```

#### Marketplace Tables
```sql
-- Artists
artists (
  id: serial (primary key),
  userId: varchar (foreign key),
  name: varchar,
  nameAr: varchar,
  biography: text,
  biographyAr: text,
  nationality: varchar,
  birthYear: integer,
  profileImage: varchar,
  website: varchar,
  paymentMethods: jsonb,
  featured: boolean
)

-- Galleries
galleries (
  id: serial (primary key),
  userId: varchar (foreign key),
  name: varchar,
  nameAr: varchar,
  description: text,
  descriptionAr: text,
  location: varchar,
  website: varchar,
  paymentMethods: jsonb,
  featured: boolean
)

-- Artworks
artworks (
  id: serial (primary key),
  artistId: integer (foreign key),
  galleryId: integer (foreign key),
  title: varchar,
  titleAr: varchar,
  description: text,
  descriptionAr: text,
  year: integer,
  medium: varchar,
  dimensions: varchar,
  price: decimal,
  currency: varchar,
  images: jsonb,
  category: varchar,
  availability: varchar,
  featured: boolean
)
```

#### Auction System
```sql
-- Auctions
auctions (
  id: serial (primary key),
  artworkId: integer (foreign key),
  title: varchar,
  titleAr: varchar,
  startingPrice: decimal,
  currentBid: decimal,
  startDate: timestamp,
  endDate: timestamp,
  status: varchar,
  bidCount: integer
)

-- Bids
bids (
  id: serial (primary key),
  auctionId: integer (foreign key),
  userId: varchar (foreign key),
  amount: decimal,
  currency: varchar,
  createdAt: timestamp
)

-- Auction Results
auctionResults (
  id: serial (primary key),
  auctionId: integer (foreign key),
  artworkId: integer (foreign key),
  finalPrice: decimal,
  winnerUserId: varchar (foreign key),
  totalBids: integer,
  auctionDate: timestamp
)
```

#### Workshop & Event System
```sql
-- Workshops
workshops (
  id: serial (primary key),
  title: varchar,
  titleAr: varchar,
  description: text,
  instructorId: varchar,
  instructorType: varchar,
  category: varchar,
  skillLevel: varchar,
  duration: integer,
  maxParticipants: integer,
  price: decimal,
  location: varchar,
  isOnline: boolean,
  startDate: timestamp,
  endDate: timestamp,
  status: varchar,
  featured: boolean
)

-- Events
events (
  id: serial (primary key),
  title: varchar,
  titleAr: varchar,
  description: text,
  organizerId: varchar,
  organizerType: varchar,
  category: varchar,
  venue: varchar,
  address: text,
  startDate: timestamp,
  endDate: timestamp,
  maxAttendees: integer,
  ticketPrice: decimal,
  status: varchar
)
```

#### Social Features
```sql
-- Follows
follows (
  id: serial (primary key),
  userId: varchar (foreign key),
  entityType: varchar,
  entityId: integer,
  createdAt: timestamp
)

-- Favorites
favorites (
  id: serial (primary key),
  userId: varchar (foreign key),
  artworkId: integer (foreign key),
  createdAt: timestamp
)

-- Comments
comments (
  id: serial (primary key),
  userId: varchar (foreign key),
  entityType: varchar,
  entityId: integer,
  content: text,
  parentId: integer,
  createdAt: timestamp
)

-- Likes
likes (
  id: serial (primary key),
  userId: varchar (foreign key),
  entityType: varchar,
  entityId: integer,
  createdAt: timestamp
)
```

#### Analytics & Tracking
```sql
-- User Interactions
userInteractions (
  id: serial (primary key),
  userId: varchar (foreign key),
  action: varchar,
  entityType: varchar,
  entityId: integer,
  metadata: jsonb,
  createdAt: timestamp
)

-- Lifecycle Transitions
lifecycleTransitions (
  id: serial (primary key),
  userId: varchar (foreign key),
  fromStage: varchar,
  toStage: varchar,
  trigger: varchar,
  metadata: jsonb,
  createdAt: timestamp
)

-- Artist Analytics
artistAnalytics (
  id: serial (primary key),
  artistId: integer (foreign key),
  date: date,
  profileViews: integer,
  artworkViews: integer,
  followers: integer,
  engagement: decimal
)
```

#### Commerce System
```sql
-- Purchase Orders
purchaseOrders (
  id: serial (primary key),
  artworkId: integer (foreign key),
  buyerId: varchar (foreign key),
  sellerId: varchar (foreign key),
  amount: decimal,
  currency: varchar,
  status: varchar,
  paymentMethod: varchar,
  shippingAddress: jsonb,
  createdAt: timestamp
)

-- Collector Wishlist
collectorWishlist (
  id: serial (primary key),
  userId: varchar (foreign key),
  artworkId: integer (foreign key),
  priority: varchar,
  priceAlert: boolean,
  targetPrice: decimal,
  createdAt: timestamp
)

-- Price Alerts
priceAlerts (
  id: serial (primary key),
  userId: varchar (foreign key),
  artworkId: integer (foreign key),
  targetPrice: decimal,
  isActive: boolean,
  createdAt: timestamp
)
```

#### Commission System
```sql
-- Commission Requests
commissionRequests (
  id: serial (primary key),
  userId: varchar (foreign key),
  title: varchar,
  titleAr: varchar,
  description: text,
  budget: decimal,
  timeline: varchar,
  category: varchar,
  status: varchar,
  createdAt: timestamp
)

-- Commission Bids
commissionBids (
  id: serial (primary key),
  requestId: integer (foreign key),
  artistId: integer (foreign key),
  amount: decimal,
  timeline: varchar,
  proposal: text,
  status: varchar,
  createdAt: timestamp
)
```

#### Privacy & Compliance
```sql
-- DSAR Requests
dsarRequests (
  id: serial (primary key),
  userId: varchar (foreign key),
  requestType: varchar,
  status: varchar,
  createdAt: timestamp,
  completedAt: timestamp
)

-- Audit Logs
auditLogs (
  id: serial (primary key),
  userId: varchar (foreign key),
  action: varchar,
  entityType: varchar,
  entityId: integer,
  metadata: jsonb,
  createdAt: timestamp
)

-- Reports
reports (
  id: serial (primary key),
  reporterId: varchar (foreign key),
  entityType: varchar,
  entityId: integer,
  reason: varchar,
  description: text,
  status: varchar,
  createdAt: timestamp
)
```

#### Email & Notifications
```sql
-- Newsletter Subscribers
newsletterSubscribers (
  id: serial (primary key),
  email: varchar (unique),
  preferences: jsonb,
  status: varchar,
  createdAt: timestamp
)

-- Email Templates
emailTemplates (
  id: serial (primary key),
  code: varchar (unique),
  name: varchar,
  nameAr: varchar,
  subject: varchar,
  subjectAr: varchar,
  content: text,
  contentAr: text,
  isActive: boolean
)

-- Email Notification Queue
emailNotificationQueue (
  id: serial (primary key),
  to: varchar,
  subject: varchar,
  content: text,
  templateId: integer,
  variables: jsonb,
  priority: integer,
  status: varchar,
  createdAt: timestamp
)
```

### Database Relations

#### Key Relationships
- **Users** → **Artists/Galleries** (1:many)
- **Artists** → **Artworks** (1:many)
- **Artworks** → **Auctions** (1:1)
- **Auctions** → **Bids** (1:many)
- **Users** → **Favorites** (1:many)
- **Users** → **Follows** (1:many)
- **Workshops** → **Registrations** (1:many)
- **Events** → **RSVPs** (1:many)

#### Indexes
- Primary keys on all tables
- Foreign key indexes for performance
- Composite indexes on frequently queried combinations
- Text search indexes for multilingual content

---

## Key Components

### Frontend Components

#### Navigation (`client/src/components/Navbar.tsx`)
```typescript
// Responsive navigation with authentication awareness
export function Navbar() {
  const navItems = [
    { key: "artists", href: "/artists" },
    { key: "galleries", href: "/galleries" },
    { key: "auctions", href: "/auctions" },
    { key: "workshops", href: "/workshops" },
    { key: "events", href: "/events" },
    { key: "commissions", href: "/commissions" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50">
      {/* Navigation implementation */}
    </nav>
  );
}
```

#### Dashboard (`client/src/pages/Dashboard.tsx`)
```typescript
// Multi-tab user dashboard
export default function Dashboard() {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs defaultValue="profile">
        {/* Tab implementation */}
      </Tabs>
    </div>
  );
}
```

#### Artwork Card (`client/src/components/ArtworkCard.tsx`)
```typescript
// Reusable artwork display component
export function ArtworkCard({ artwork }) {
  return (
    <div className="card-glass rounded-2xl overflow-hidden hover-lift">
      <div className="aspect-square overflow-hidden">
        <img 
          src={artwork.images[0]} 
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{artwork.title}</h3>
        <p className="text-gray-600 mb-2">{artwork.artist?.name}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-primary">
            {formatPrice(artwork.price, artwork.currency)}
          </span>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Backend Components

#### Authentication (`server/replitAuth.ts`)
```typescript
// Replit Auth integration
export async function setupAuth(app: Express) {
  const passport = new Passport();
  
  // OpenID Connect strategy
  passport.use('oidc', new Strategy({
    issuer: 'https://replit.com',
    clientID: process.env.REPL_ID,
    clientSecret: process.env.REPL_ID,
    callbackURL: '/auth/callback',
  }, verify));

  app.use(passport.initialize());
  app.use(passport.session());
}
```

#### Email Service (`server/emailService.ts`)
```typescript
// Email service with queue processing
export class EmailService {
  private static instance: EmailService;
  
  async queueEmail(emailData: EmailData) {
    await db.insert(emailNotificationQueue).values(emailData);
  }
  
  private async processQueue() {
    const emails = await db.select()
      .from(emailNotificationQueue)
      .where(eq(emailNotificationQueue.status, 'pending'))
      .limit(10);
    
    for (const email of emails) {
      await this.sendEmail(email);
    }
  }
}
```

#### Lifecycle Tracking (`server/middleware/trackStage.ts`)
```typescript
// User lifecycle stage tracking
export const trackStageMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.path.startsWith('/api/')) {
    await trackUserInteraction({
      userId: req.user.id,
      action: req.method,
      entityType: extractEntityType(req.path),
      metadata: {
        path: req.path,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      }
    });
  }
  next();
};
```

---

## Dependencies

### Production Dependencies (86 packages)

#### Core Framework
- **react** (18.3.1) - Frontend framework
- **express** (4.21.2) - Backend framework
- **typescript** (5.6.3) - Type system

#### Database & ORM
- **@neondatabase/serverless** (0.10.4) - PostgreSQL driver
- **drizzle-orm** (0.39.1) - TypeScript ORM
- **drizzle-zod** (0.7.0) - Schema validation

#### UI Components
- **@radix-ui/react-*** (various) - UI primitives
- **tailwindcss** (3.4.17) - Utility-first CSS
- **lucide-react** (0.453.0) - Icons

#### State Management
- **@tanstack/react-query** (5.60.5) - Server state
- **wouter** (3.3.5) - Client-side routing

#### Internationalization
- **react-i18next** (15.6.0) - React i18n
- **i18next** (25.3.1) - Internationalization framework

#### Real-time Features
- **socket.io** (4.8.1) - WebSocket server
- **socket.io-client** (4.8.1) - WebSocket client

#### Background Processing
- **bullmq** (5.56.4) - Job queue
- **ioredis** (5.6.1) - Redis client

#### Email
- **@sendgrid/mail** (8.1.5) - Email service

#### Authentication
- **passport** (0.7.0) - Authentication middleware
- **openid-client** (6.6.2) - OpenID Connect client
- **express-session** (1.18.1) - Session management

#### Security
- **helmet** (8.1.0) - Security headers
- **express-rate-limit** (7.5.1) - Rate limiting
- **csurf** (1.11.0) - CSRF protection

#### Form Handling
- **react-hook-form** (7.55.0) - Form library
- **@hookform/resolvers** (3.10.0) - Form validation
- **zod** (3.24.2) - Schema validation

#### Analytics & Charts
- **recharts** (2.15.2) - Chart library
- **date-fns** (3.6.0) - Date utilities

### Development Dependencies (48 packages)

#### Build Tools
- **vite** (5.4.19) - Build tool
- **@vitejs/plugin-react** (4.3.2) - React plugin
- **esbuild** (0.25.0) - JavaScript bundler
- **tsx** (4.19.1) - TypeScript execution

#### Testing
- **vitest** (3.2.4) - Testing framework
- **@testing-library/react** (16.3.0) - React testing
- **@playwright/test** (1.54.1) - E2E testing
- **playwright** (1.54.1) - Browser automation
- **supertest** (7.1.3) - HTTP testing
- **k6** (0.0.0) - Load testing

#### TypeScript
- **@types/*** (various) - Type definitions
- **@types/node** (20.16.11) - Node.js types
- **@types/react** (18.3.11) - React types
- **@types/express** (4.17.21) - Express types

#### CSS Processing
- **postcss** (8.4.47) - CSS processor
- **autoprefixer** (10.4.20) - CSS prefixer
- **@tailwindcss/typography** (0.5.15) - Typography plugin

#### Development Tools
- **drizzle-kit** (0.30.4) - Database migrations
- **@replit/vite-plugin-cartographer** (0.2.7) - Replit integration
- **@replit/vite-plugin-runtime-error-modal** (0.0.3) - Error handling

---

## Security Architecture

### Authentication & Authorization

#### Multi-Provider Authentication
```typescript
// Support for multiple OAuth providers
const providers = [
  'google',
  'apple', 
  'twitter',
  'github',
  'email'
];
```

#### Role-Based Access Control
```typescript
// User roles with hierarchical permissions
type UserRole = 'admin' | 'artist' | 'gallery' | 'collector';

// Route protection middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};
```

### Data Protection

#### Input Validation
```typescript
// Zod schema validation for all inputs
const createArtworkSchema = z.object({
  title: z.string().min(1).max(200),
  price: z.number().positive(),
  description: z.string().max(2000),
  images: z.array(z.string().url()).min(1).max(10),
});
```

#### SQL Injection Prevention
```typescript
// Parameterized queries with Drizzle ORM
const artwork = await db.select()
  .from(artworks)
  .where(eq(artworks.id, artworkId))
  .limit(1);
```

### Security Headers
```typescript
// Helmet.js security configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### Rate Limiting
```typescript
// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});
```

### CSRF Protection
```typescript
// CSRF token validation
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
}));
```

---

## Performance & Scalability

### Frontend Performance

#### Code Splitting
```typescript
// Lazy loading for route components
const LazyArtistProfile = lazy(() => import('./pages/ArtistProfile'));
const LazyAuctionDetail = lazy(() => import('./pages/AuctionDetail'));
```

#### Caching Strategy
```typescript
// TanStack Query caching configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

#### Image Optimization
```typescript
// Responsive image loading
<img 
  src={artwork.images[0]} 
  alt={artwork.title}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Backend Performance

#### Database Optimization
```sql
-- Strategic indexes for performance
CREATE INDEX idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX idx_artworks_category ON artworks(category);
CREATE INDEX idx_artworks_price ON artworks(price);
CREATE INDEX idx_auctions_status_end_date ON auctions(status, end_date);
```

#### Connection Pooling
```typescript
// PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Background Job Processing
```typescript
// BullMQ job queue for heavy operations
const emailQueue = new Queue('email processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Process jobs in background
emailQueue.process(async (job) => {
  const { to, subject, content } = job.data;
  await sendEmail({ to, subject, content });
});
```

### Real-time Performance

#### Socket.io Configuration
```typescript
// Optimized Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
  adapter: createAdapter(redisClient, redisClient.duplicate()),
  transports: ['websocket', 'polling'],
});
```

#### Redis Scaling
```typescript
// Redis configuration for scaling
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
};
```

---

## Testing Strategy

### Unit Testing (Vitest)

#### Test Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

#### Component Testing
```typescript
// Example component test
describe('ArtworkCard', () => {
  it('renders artwork information correctly', () => {
    const artwork = {
      id: 1,
      title: 'Test Artwork',
      artist: { name: 'Test Artist' },
      price: '1000',
      currency: 'SAR',
      images: ['test.jpg'],
    };

    render(<ArtworkCard artwork={artwork} />);
    
    expect(screen.getByText('Test Artwork')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('1,000 SAR')).toBeInTheDocument();
  });
});
```

### Integration Testing (Supertest)

#### API Testing
```typescript
// Example API test
describe('POST /api/artworks', () => {
  it('creates artwork when authenticated', async () => {
    const artworkData = {
      title: 'New Artwork',
      price: 1500,
      description: 'Test description',
      images: ['image1.jpg'],
    };

    const response = await request(app)
      .post('/api/artworks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(artworkData)
      .expect(201);

    expect(response.body.title).toBe('New Artwork');
    expect(response.body.id).toBeDefined();
  });
});
```

### End-to-End Testing (Playwright)

#### E2E Test Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

#### User Journey Testing
```typescript
// Example E2E test
test('user can browse and favorite artwork', async ({ page }) => {
  await page.goto('/');
  
  // Login
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="submit"]');
  
  // Browse artworks
  await page.goto('/artists');
  await page.click('[data-testid="artwork-card"]:first-child');
  
  // Add to favorites
  await page.click('[data-testid="favorite-button"]');
  await expect(page.locator('[data-testid="favorite-button"]')).toHaveClass(/active/);
  
  // Check favorites in dashboard
  await page.goto('/dashboard');
  await page.click('[data-testid="favorites-tab"]');
  await expect(page.locator('[data-testid="favorite-artwork"]')).toBeVisible();
});
```

### Load Testing (k6)

#### Load Test Configuration
```javascript
// load-test.js
export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

export default function() {
  // Test critical user journeys
  let response = http.get('http://localhost:5000/api/artworks/featured');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

---

## Deployment Architecture

### Production Configuration

#### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
REPL_ID=your-replit-id
SESSION_SECRET=your-session-secret

# Redis
REDIS_URL=redis://host:port

# Email
SENDGRID_API_KEY=your-sendgrid-api-key

# Security
CSRF_SECRET=your-csrf-secret
JWT_SECRET=your-jwt-secret
```

#### Docker Configuration
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

CMD ["npm", "start"]
```

#### Nginx Configuration
```nginx
# Reverse proxy configuration
server {
    listen 80;
    server_name artsouk.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Scaling Strategy

#### Horizontal Scaling
```typescript
// PM2 cluster configuration
module.exports = {
  apps: [{
    name: 'art-souk-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
  }],
};
```

#### Load Balancing
```yaml
# Docker Compose with load balancer
version: '3.8'

services:
  app:
    build: .
    scale: 3
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=artsouk
      - POSTGRES_USER=artsouk
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Monitoring & Observability

#### Health Checks
```typescript
// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

app.get('/health/db', async (req, res) => {
  try {
    await db.select().from(users).limit(1);
    res.json({ database: 'healthy' });
  } catch (error) {
    res.status(500).json({ database: 'unhealthy', error: error.message });
  }
});
```

#### Performance Monitoring
```typescript
// Performance metrics collection
const performanceMetrics = {
  requestCount: 0,
  responseTime: [],
  errors: 0,
  activeConnections: 0,
};

app.use((req, res, next) => {
  const start = Date.now();
  
  performanceMetrics.requestCount++;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    performanceMetrics.responseTime.push(duration);
    
    if (res.statusCode >= 400) {
      performanceMetrics.errors++;
    }
  });
  
  next();
});
```

---

## Conclusion

This comprehensive architecture documentation covers all aspects of the Art Souk platform, from frontend components to backend services, database design, security measures, and deployment strategies. The platform is designed to be scalable, maintainable, and secure while providing a rich user experience for the Saudi Arabian and GCC art community.

The modular architecture allows for easy maintenance and feature expansion, while the comprehensive testing strategy ensures reliability and performance. The bilingual support and cultural considerations make it specifically tailored for the target market.

This documentation serves as a complete reference for developers, stakeholders, and anyone involved in the platform's development and maintenance.