# Art Souk Development Setup Guide

## Overview
Art Souk is a bilingual (Arabic/English) art marketplace platform for the GCC region built with React, TypeScript, Node.js, and PostgreSQL.

## Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

## Quick Start Setup Script

```bash
#!/bin/bash

# Clone the repository
git clone https://github.com/GalaxyRuler/art-souk.git
cd art-souk

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Database setup
echo "Please ensure PostgreSQL is running and update DATABASE_URL in .env.local"
echo "Default: postgresql://user:password@localhost:5432/art_souk"

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## Manual Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/GalaxyRuler/art-souk.git
cd art-souk
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` file with:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/art_souk

# Session Secret (generate a random string)
SESSION_SECRET=your-secret-key-here

# Replit Auth (if using Replit)
REPL_ID=your-repl-id
REPLIT_DB_URL=your-replit-db-url

# Optional: Email Service
SENDGRID_API_KEY=your-sendgrid-key

# Optional: External APIs
PERPLEXITY_API_KEY=your-perplexity-key
```

### 4. Database Setup
```bash
# Push schema to database
npm run db:push

# Optional: Seed sample data
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

The application will start on http://localhost:5000

## Project Structure
```
art-souk/
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── lib/         # Utilities and configs
│   │   └── hooks/       # Custom React hooks
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database queries
│   └── auth.ts          # Authentication
├── shared/              # Shared types/schemas
│   └── schema.ts        # Database schema
├── tests/               # Test files
└── docs/                # Documentation

```

## Key Features to Test
1. **Authentication**: Sign up/login at `/auth`
2. **Bilingual Support**: Toggle between English/Arabic
3. **Artist Dashboard**: Create artwork, manage profile
4. **Gallery Dashboard**: Manage gallery, exhibitions
5. **Marketplace**: Browse, search, filter artworks
6. **Auctions**: Live bidding system
7. **ZATCA Invoicing**: Saudi tax-compliant invoices
8. **Shipping Management**: Order tracking

## Development Commands
```bash
# Development server
npm run dev

# Type checking
npm run check

# Linting
npm run lint

# Testing
npm run test

# Build for production
npm run build

# Database migrations
npm run db:push
npm run db:generate
npm run db:migrate
```

## Common Issues & Solutions

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Create database: `createdb art_souk`

### Port Already in Use
- Kill existing process: `lsof -ti:5000 | xargs kill`
- Or change port in `server/index.ts`

### Missing Dependencies
```bash
npm clean-install
```

### TypeScript Errors
```bash
npm run check
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Current user

### Artworks
- `GET /api/artworks` - List artworks
- `POST /api/artworks` - Create artwork
- `GET /api/artworks/:id` - Get artwork
- `PUT /api/artworks/:id` - Update artwork

### Invoices (ZATCA Compliant)
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id/pdf` - Generate PDF

## Testing Accounts
After seeding, use these test accounts:
- Artist: `artist@test.com` / `password123`
- Gallery: `gallery@test.com` / `password123`
- Collector: `collector@test.com` / `password123`

## Support
- GitHub Issues: https://github.com/GalaxyRuler/art-souk/issues
- Documentation: See `/docs` folder
- Architecture: See `replit.md`

## License
This project is proprietary software for Art Souk marketplace.
