# Codex Setup Instructions for Art Souk

## Quick Setup Script

Run this command to set up the Art Souk development environment:

```bash
# One-line setup command
npm install && cp .env.example .env.local 2>/dev/null || echo "DATABASE_URL=postgresql://localhost:5432/art_souk" > .env.local && npm run dev
```

## Step-by-Step Setup

If the quick setup doesn't work, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` file:
```bash
echo "DATABASE_URL=postgresql://localhost:5432/art_souk" > .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at http://localhost:5000

## Project Overview

**Art Souk** is a bilingual art marketplace for Saudi Arabia & GCC region.

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
- **Features**: Bilingual (Arabic/English), ZATCA-compliant invoicing, real-time auctions

### Key Directories
- `client/src/pages/` - Page components
- `client/src/components/` - Reusable components
- `server/routes.ts` - API endpoints
- `shared/schema.ts` - Database schema

### Important Commands
```bash
npm run dev          # Start development server
npm run db:push      # Update database schema
npm run check        # TypeScript type checking
npm run lint         # Run linter
npm run build        # Production build
```

### Testing the App
1. Visit http://localhost:5000
2. Click "Join" to sign up
3. Toggle language (English/Arabic) in top right
4. Explore marketplace features

### Common Tasks for Codex

#### Adding a New Page
1. Create component in `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add translations in `client/src/lib/i18n.ts`

#### Adding API Endpoint
1. Add route in `server/routes.ts`
2. Add storage method in `server/storage.ts`
3. Update types in `shared/schema.ts`

#### Modifying Database
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes

### Need Help?
- Architecture details: See `replit.md`
- Setup guide: See `SETUP_GUIDE.md`
- Recent changes: Check git history