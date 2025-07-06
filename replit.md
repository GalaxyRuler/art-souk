# Artisan - Saudi & GCC Art Marketplace

## Overview

Artisan is a bilingual art marketplace web application focused on the Saudi Arabian and Gulf Cooperation Council (GCC) art market. The platform connects artists, galleries, collectors, and art enthusiasts in the region, providing a comprehensive platform for discovering, collecting, and engaging with contemporary Middle Eastern art.

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
- **Provider**: Replit Auth integration
- **Session Storage**: PostgreSQL-based session management
- **User Roles**: Support for different user types (user, artist, gallery, admin)
- **Security**: HTTP-only cookies with secure session handling

### Bilingual Support
- **Languages**: English (LTR) and Arabic (RTL)
- **Implementation**: react-i18next with JSON translation files
- **Layout**: Dynamic RTL/LTR layout switching
- **Typography**: Support for Arabic fonts (Noto Sans Arabic) and English fonts (Inter, Playfair Display)

### Content Management
- **Artists**: Profile management with portfolios and biographical information
- **Galleries**: Gallery listings with location and contact information
- **Artworks**: Detailed artwork pages with high-resolution images and metadata
- **Auctions**: Live and upcoming auction functionality with bidding system
- **Collections**: Curated collections and featured content
- **Editorial**: Blog/editorial section for art news and insights

### User Experience Features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Search & Filtering**: Advanced search capabilities across all content types
- **Favorites System**: User-specific favoriting and collection management
- **Inquiry System**: Contact forms for artwork inquiries
- **Social Features**: Sharing capabilities and social media integration

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

## Changelog

Changelog:
- July 06, 2025. Initial setup