# Art Souk - Saudi & GCC Art Marketplace

## Overview

Art Souk is a bilingual art marketplace web application focused on the Saudi Arabian and Gulf Cooperation Council (GCC) art market. The platform connects artists, galleries, collectors, and art enthusiasts in the region, providing a comprehensive platform for discovering, collecting, and engaging with contemporary Middle Eastern art.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom configuration for Arabic/RTL support
- **UI Components**: Radix UI components with shadcn/ui styling system
- **State Management**: TanStack Query for server state management
- **Internationalization**: react-i18next for bilingual support (Arabic/English)
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with type-safe endpoints

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Comprehensive schema covering users, artists, galleries, artworks, auctions, collections, and editorial content
- **Relationships**: Well-defined relationships between entities with proper foreign key constraints
- **Internationalization**: Dual-language fields for Arabic and English content

## Key Components

### Authentication System
- **Provider**: Replit Auth with multiple OAuth providers
- **OAuth Providers**: Google, Apple, X (Twitter), GitHub, Email/Password
- **Session Storage**: PostgreSQL-based session management
- **User Roles**: Support for different user types (user, artist, gallery, admin)
- **Admin System**: One-time admin setup endpoint and role management
- **Security**: HTTP-only cookies with secure session handling

### Bilingual Support
- **Languages**: English (LTR) and Arabic (RTL)
- **Implementation**: react-i18next with JSON translation files
- **Layout**: Dynamic RTL/LTR layout switching
- **Typography**: Support for Arabic fonts (Noto Sans Arabic) and English fonts (Inter, Playfair Display)
- **Currency Display**: Conditional ر.س (Arabic) / SAR (English) based on language

### Marketplace Features
- **Individual Artwork Pages**: Detailed artwork views with image galleries, artist information, pricing, and purchase/inquiry options
- **Advanced Search**: Comprehensive search with filters for category, medium, style, price range, availability, nationality, and year
- **Favorites System**: User collections with add/remove functionality and personal dashboard management
- **Inquiry System**: Direct contact forms for artwork purchases and information requests
- **Artist Profiles**: Complete portfolios with biography, exhibitions, statistics, and social features
- **Gallery Profiles**: Gallery information, represented artists, current/upcoming exhibitions, and contact details
- **User Dashboard**: Personal space for managing favorites, inquiries, profile settings, and activity tracking
- **External Payment Processing**: All payments are handled directly between buyers and sellers outside the platform

### Auction Platform
- **Live Bidding**: Real-time auction participation with auto-refresh and bid validation
- **Auction Management**: Comprehensive auction details with artwork information, bidding history, and status tracking
- **Bidding Interface**: User-friendly bidding with minimum increment validation and authentication requirements
- **Auction Analytics**: View counts, bid counts, and time remaining displays

### Editorial System
- **Article Management**: Full blog/editorial system with rich content support
- **Content Organization**: Categories, tags, and featured article support
- **Author Profiles**: Author information and biographical content
- **Related Content**: Intelligent content recommendations and cross-linking
- **Social Engagement**: Like/unlike functionality and article sharing

### Virtual Exhibitions
- **Immersive Experiences**: 360° virtual exhibition support with interactive features
- **Exhibition Types**: Solo, group, thematic, and retrospective exhibitions
- **Multimedia Support**: Audio, video, and interactive content integration
- **Curation Tools**: Professional curator information and exhibition descriptions
- **Accessibility**: Multiple viewing modes and duration tracking

### Social Features
- **Follow System**: Follow artists and galleries for updates and notifications
- **Content Sharing**: Social media integration and link sharing capabilities
- **User Interactions**: Like, favorite, and comment functionality across content types
- **Community Building**: User profiles, activity feeds, and engagement tracking

### User Experience Features
- **Responsive Design**: Mobile-first approach with adaptive layouts optimized for all devices
- **Advanced Search**: Multi-entity search across artworks, artists, galleries with intelligent filtering
- **Professional UI/UX**: Premium design with brand colors, glassmorphism effects, and smooth animations
- **Performance Optimization**: Lazy loading, image optimization, and efficient data fetching
- **Accessibility**: RTL support, keyboard navigation, and screen reader compatibility

## Data Flow

1. **User Authentication**: Users authenticate through Replit Auth, creating sessions stored in PostgreSQL
2. **Content Delivery**: API endpoints serve content with proper language localization
3. **Real-time Updates**: TanStack Query manages cache invalidation for dynamic content
4. **Bilingual Content**: All content is stored in dual-language format with fallback mechanisms
5. **User Interactions**: Favorites, inquiries, and other interactions are tracked and stored

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **react-i18next**: Internationalization
- **@radix-ui/***: UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and development experience
- **@replit/vite-plugin-***: Replit-specific development tools

### Authentication Dependencies
- **openid-client**: OpenID Connect client
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Local Development**: Vite development server with hot module replacement
- **Database**: PostgreSQL connection via environment variables
- **Authentication**: Replit Auth integration for seamless development

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: ESBuild compilation for Node.js deployment
- **Database**: PostgreSQL with Drizzle migrations
- **Static Assets**: Served through Express static middleware

### Environment Configuration
- **Database**: `DATABASE_URL` environment variable required
- **Authentication**: Replit Auth configuration with `REPL_ID` and session secrets
- **Deployment**: Single-command deployment with `npm run build` and `npm start`

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- July 06, 2025: Comprehensive marketplace implementation completed
  ✓ Individual artwork pages with image galleries, pricing, and inquiry system
  ✓ Advanced search & filtering functionality across all content types
  ✓ Working favorites system with user collections
  ✓ Artist profile pages with portfolios, exhibitions, and statistics
  ✓ Gallery profile pages with represented artists and current exhibitions
  ✓ User dashboard for managing favorites, inquiries, and profile settings
  ✓ Live auction bidding with real-time updates and auto-refresh
  ✓ Editorial system with full article management and related content
  ✓ Virtual exhibitions platform with immersive 360° experiences
  ✓ Social features including follow/unfollow for artists and galleries

- July 06, 2025: Enhanced API routes and storage layer
  ✓ Complete CRUD operations for all entities
  ✓ Advanced search capabilities for artworks, artists, and galleries
  ✓ Favorites, inquiries, and social interaction endpoints
  ✓ Auction bidding and real-time updates functionality

- July 06, 2025: Admin system implementation
  ✓ User role management with admin, artist, gallery, user roles
  ✓ One-time admin setup endpoint (/api/admin/setup)
  ✓ Admin role management endpoint for user promotion
  ✓ Admin setup page (/admin/setup) with authentication flow

- July 06, 2025: Multi-provider OAuth authentication migration
  ✓ Migrated to Replit Auth with multiple OAuth providers
  ✓ Support for Google, Apple, X (Twitter), GitHub, and Email login
  ✓ Enhanced authentication flow with provider selection
  ✓ Test page created (/auth/test) for verification
  ✓ Backward compatibility maintained for existing users

- July 06, 2025: Added comma separators to all price displays (85,000 SAR format)
- July 06, 2025: Fixed Artists and Galleries 404 errors by making pages public
- July 06, 2025: Fixed auction bidding API endpoint mismatch
- July 06, 2025: Fixed auction detail page crash with safe navigation for nested properties
- July 06, 2025: Conditional currency display (ر.س in Arabic, SAR in English)
- July 06, 2025: Complete UI/UX redesign with purple & gold brand colors
- July 06, 2025: Enhanced typography with Playfair Display for headings
- July 06, 2025: Site name updated to "Art Souk" (Arabic: سوق آرت)
- July 06, 2025: Database schema successfully deployed and initialized

- July 09, 2025: Workshops and Events System Implementation
  ✓ Removed editorial features (articles table and routes) based on user feedback
  ✓ Added comprehensive workshop system with instructor management, registrations, and skill levels
  ✓ Implemented social events platform with RSVP functionality and event categories
  ✓ Updated database schema with workshops, events, and related tables
  ✓ Added workshops and events pages to navigation
  ✓ Implemented complete API endpoints for workshops and events features
  ✓ Added bilingual support for all new features (Arabic/English)
  ✓ Enhanced dashboard to include workshop management for artists and galleries
  ✓ Removed community discussions system as not needed for current scope
  ✓ Fixed all database schema issues by adding missing columns (meeting_link, materials, address, status, etc.)
  ✓ Successfully resolved all API endpoint errors - workshops and events now fully functional

- July 09, 2025: Comprehensive UI/UX Redesign
  ✓ Enhanced global design system with mesh gradients and glassmorphism effects
  ✓ Implemented modern card designs with glass-like appearance and hover animations
  ✓ Updated color scheme with gradient text effects and shadow glows
  ✓ Redesigned Workshops page with beautiful card layouts and icon-based information display
  ✓ Redesigned Events page with similar modern aesthetics and improved visual hierarchy
  ✓ Added floating animations and smooth transitions throughout the application
  ✓ Improved form elements with rounded corners and better focus states
  ✓ Enhanced loading states with larger, more visible spinners
  ✓ Added consistent spacing and padding across all components
  ✓ Implemented hover lift effects for interactive elements

- July 09, 2025: Color Scheme Masculinization (Final Round)
  ✓ Replaced all purple/feminine colors with masculine navy blues and charcoals
  ✓ Updated CSS variables from purple to navy throughout the design system
  ✓ Changed primary brand color from purple (hsl(283, 86%, 60%)) to navy (hsl(217, 91%, 35%))
  ✓ Updated Tailwind configuration to use new masculine color names (brand-navy, brand-steel)
  ✓ Replaced all UI components using purple accents with blue/gray alternatives
  ✓ Updated gradient backgrounds to use navy blues instead of purples
  ✓ Changed shadow and glow effects to use navy instead of purple tones
  ✓ Maintained gold accents for contrast but in more muted tones
  ✓ Fixed HeroSection and Home page components to use navy instead of purple
  ✓ Updated Workshops page buttons from purple to blue

- July 09, 2025: Navigation and Structure Fixes
  ✓ Fixed missing translations for "workshops" and "events" navigation tabs
  ✓ Added missing Navbar and Footer components to Workshops and Events pages
  ✓ Ensured consistent page structure across all pages

- January 17, 2025: Advanced Analytics and User Personalization System
  ✓ Implemented comprehensive analytics infrastructure with 5 new database tables:
    • artist_analytics: Tracks artist performance metrics (views, engagement, sales)
    • user_interactions: Records all user actions for behavior analysis
    • user_collections: Manages saved collections of artworks
    • ai_recommendations: Stores personalized AI-generated recommendations
    • user_preferences: Captures user interests and notification settings
  ✓ Created Analytics Dashboard page with data visualization using Recharts
    • Performance metrics charts for views, engagement, and sales
    • Time-based analytics with date range selection
    • Artist and gallery specific insights
  ✓ Built User Preferences page for personalized recommendations
    • Art category and style selection
    • Price range preferences with slider controls
    • Notification settings management
    • Privacy settings configuration
  ✓ Integrated analytics features into main Dashboard
    • Added "View Analytics" button for artists/galleries in Quick Stats section
    • Linked preferences configuration from Dashboard settings tab
  ✓ Successfully deployed all database schema changes and API routes
  ✓ Fixed import errors for Navbar and Footer components
  ✓ Added UserPreferences page to application router
  ✓ Updated navigation links in Dashboard for seamless user flow

- January 17, 2025: Comprehensive Collector/Buyer Features Implementation
  ✓ Created 8 new collector-specific database tables:
    • purchase_orders: Complete order management system with status tracking
    • shipping_tracking: Real-time shipment tracking with carrier integration
    • collector_profiles: Detailed buyer profiles with preferences and verification
    • price_alerts: Automated price monitoring and notification system
    • artwork_certificates: Authenticity certificates and provenance tracking
    • collector_wishlist: Prioritized wishlist with price change notifications
    • installment_plans: Flexible payment plans with installment tracking
    • collector_reviews: Verified purchase reviews and ratings
  ✓ Built comprehensive CollectorDashboard page with 4 main sections:
    • Orders Tab: Complete purchase history with status tracking
    • Tracking Tab: Real-time shipment tracking with estimated delivery
    • Wishlist Tab: Prioritized saved items with price alerts
    • Purchase History Tab: Completed purchases with external payment notation
  ✓ Implemented collector API endpoints:
    • GET/POST/DELETE endpoints for wishlist management
    • Order retrieval with artwork and shipping details
    • Price alert creation and management
    • Collector profile CRUD operations
  ✓ Added Collector Dashboard link to main Dashboard
  ✓ Successfully created all database tables using SQL execution
  ✓ Platform now serves as a marketplace facilitator with payments handled externally
  ✓ Updated UI to reflect that all payments are arranged directly between buyers and sellers

- January 17, 2025: Seller Dashboard and Payment Method Management
  ✓ Added payment methods support for artists and galleries:
    • Added payment_methods jsonb column to artists and galleries tables
    • Sellers can add multiple payment methods (bank transfer, PayPal, STC Pay, etc.)
    • Each payment method includes type, name, details, and optional instructions
  ✓ Created comprehensive SellerDashboard page with 2 main sections:
    • Orders Tab: View and manage incoming orders from collectors
    • Payment Methods Tab: Add, edit, and delete payment methods
  ✓ Order management features for sellers:
    • Update order status (pending, confirmed, processing, shipped, delivered, cancelled)
    • Add seller notes for buyers
    • Add tracking information (tracking number and carrier)
    • Automatic payment status update when order is confirmed
  ✓ Implemented seller API endpoints:
    • GET /api/seller/info - Get seller type and information
    • GET/POST/PATCH/DELETE /api/seller/payment-methods - Manage payment methods
    • GET /api/seller/orders - View orders for seller's artworks
    • PATCH /api/seller/orders/:id/status - Update order status and tracking
  ✓ Added seller_notes, seller_updated_at, and payment_confirmed_at to purchase_orders table
  ✓ Added Seller Dashboard link to main Dashboard for artists and galleries
  ✓ Added /seller route to App.tsx router for Seller Dashboard access
  ✓ Platform maintains external payment model - all payments handled directly between parties

- January 17, 2025: Email Notification System Implementation
  ✓ Created comprehensive email infrastructure with 4 new database tables:
    • newsletter_subscribers: Manages newsletter subscriptions with preferences
    • email_templates: Stores reusable email templates in multiple languages
    • email_notification_queue: Queues emails for processing with priority
    • email_notification_log: Tracks sent emails and delivery status
  ✓ Implemented EmailService singleton for email management:
    • Queue-based email processing system
    • SendGrid integration for email delivery (pending API key)
    • Template-based email system with variable replacement
    • Newsletter subscription and management functionality
  ✓ Created email notification API endpoints:
    • POST /api/newsletter/subscribe - Subscribe to newsletter
    • POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
    • GET /api/newsletter/subscription - Get user's subscription
    • Admin-only endpoints for template management and monitoring
  ✓ Added email notification methods to storage layer:
    • Newsletter subscriber CRUD operations
    • Email template management
    • Queue and log retrieval methods
  ✓ Email system ready for use - awaiting SendGrid API key from user