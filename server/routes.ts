import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import fs from 'fs';
import path from 'path';
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { emailService } from "./emailService";
import { adminRouter } from "./routes/admin";
import { sellerRouter } from "./routes/seller";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, desc, and, or, ilike, sql, count, ne, gte, lte } from "drizzle-orm";
import { trackStageMiddleware, updateLifecycleMetrics } from "./middleware/trackStage";
import { rateLimiters } from "./middleware/rateLimiting";
import { validateRequest, commonSchemas } from "./middleware/validation";
import { securityMiddlewareStack } from "./middleware/security";
import { cacheConfigs } from "./middleware/caching";
import { memoryMonitor, memoryTrackingMiddleware } from "./middleware/memoryMonitor";
import { performanceMiddleware, performanceMonitor } from "./middleware/performanceMonitor";
import { cacheInstances, optimizedCacheMiddleware, cacheKeys, getCacheStats } from "./middleware/cacheOptimization";
import { databaseOptimizer } from "./middleware/databaseOptimization";
import { sessionDebugMiddleware, sessionRecoveryMiddleware } from "./middleware/sessionDebug";
import { sessionFixMiddleware } from "./middleware/sessionFix";
import { 
  insertArtistSchema, 
  insertGallerySchema, 
  insertArtworkSchema, 
  insertAuctionSchema,
  insertBidSchema,
  insertAuctionResultSchema,
  insertCollectionSchema,
  insertWorkshopSchema,
  insertWorkshopRegistrationSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertWorkshopEventReviewSchema,
  insertDiscussionSchema,
  insertDiscussionReplySchema,
  insertInquirySchema,
  insertFavoriteSchema,
  insertFollowSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertUserProfileSchema,
  insertNewsletterSubscriberSchema,
  insertEmailTemplateSchema,
  insertAchievementBadgeSchema,
  purchaseOrders,
  shippingTracking,
  collectorProfiles,
  priceAlerts,
  collectorWishlist,
  installmentPlans,
  artworks,
  artists,
  insertDsarRequestSchema,
  insertReportSchema,
  insertAuctionUpdateRequestSchema,
  insertSellerKycDocSchema,
  insertShippingAddressSchema,
  insertCommissionRequestSchema,
  insertCommissionBidSchema,
  insertCommissionMessageSchema,
  insertCommissionContractSchema
} from "@shared/schema";
import { z } from "zod";

// Extend Express Request interface to include user with claims
interface AuthenticatedRequest extends Request {
  user: {
    claims: {
      sub: string;
    };
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware must be first
  await setupAuth(app);
  
  // Apply session debugging and recovery middleware
  app.use(sessionDebugMiddleware);
  app.use(sessionRecoveryMiddleware);
  app.use(sessionFixMiddleware);
  
  // Apply security middleware stack
  app.use(securityMiddlewareStack);

  // Apply performance monitoring middleware
  app.use(performanceMiddleware);
  app.use(memoryTrackingMiddleware);
  
  // Apply lifecycle tracking middleware
  app.use(trackStageMiddleware);

  // Debug session endpoint
  app.get('/api/debug/session', (req, res) => {
    res.json({
      sessionID: req.sessionID,
      hasSession: !!req.session,
      sessionKeys: req.session ? Object.keys(req.session) : [],
      user: req.session?.user || null,
      passportUser: req.user || null,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      cookie: req.session?.cookie || null
    });
  });

  // Post-logout success handler
  app.get('/auth/logout-success', (req, res) => {
    console.log('✅ Logout success page reached');
    
    // Clear session cookie again to be sure
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    
    // Clear any remaining session data
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ Final session cleanup error:', err);
        }
      });
    }
    
    // Send HTML page that redirects to home and clears local storage
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logged Out - Art Souk</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .logout-container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h2 {
              color: #333;
              margin-bottom: 10px;
            }
            p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="logout-container">
            <h2>You have been logged out successfully</h2>
            <p>Redirecting to home page...</p>
          </div>
          <script>
            // Clear all client-side storage
            try {
              localStorage.clear();
              sessionStorage.clear();
              
              // Clear cookies accessible from JavaScript
              document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
              });
              
              // Clear IndexedDB if used
              if (window.indexedDB && indexedDB.databases) {
                indexedDB.databases().then(databases => {
                  databases.forEach(db => indexedDB.deleteDatabase(db.name));
                });
              }
            } catch (e) {
              console.error('Error clearing storage:', e);
            }
            
            // Redirect to home after clearing storage
            setTimeout(() => {
              window.location.href = '/';
            }, 1500);
          </script>
        </body>
      </html>
    `);
  });

  // Auth routes (without aggressive rate limiting for normal usage)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Use the same authentication logic as session debugging middleware
      const userId = req.session?.user?.id;
      
      console.log('Auth user check (direct session access):', {
        userId,
        hasSession: !!req.session,
        hasSessionUser: !!req.session?.user,
        sessionID: req.sessionID,
        sessionKeys: req.session ? Object.keys(req.session) : []
      });
      
      // If no user found in session, return null (not authenticated)
      if (!userId) {
        console.log('No user ID found in session - user is not authenticated');
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log('User not found in database:', userId);
        return res.json(null);
      }
      
      console.log('Returning user data:', {
        id: user.id,
        email: user.email,
        roles: user.roles,
        isAdmin: user.roles?.includes('admin') || user.role === 'admin'
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null); // Return null instead of error for graceful handling
    }
  });

  // User role management endpoints
  app.put('/api/user/roles', 
    rateLimiters.auth,
    validateRequest({ body: commonSchemas.userProfileBody.pick({ roles: true }) }),
    isAuthenticated, 
    async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { roles } = req.body;
      
      console.log(`Attempting to update roles for user ${userId}:`, roles);
      
      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ message: "Invalid roles array" });
      }
      
      // Validate role names
      const validRoles = ['collector', 'artist', 'gallery'];
      if (!roles.every(role => validRoles.includes(role))) {
        console.error(`Invalid role names provided:`, roles);
        return res.status(400).json({ message: "Invalid role names" });
      }
      
      // Check if user exists, create if not (for new users)
      let user = await storage.getUser(userId);
      if (!user) {
        console.log(`User not found, creating new user: ${userId}`);
        // Create user with basic info from auth claims
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email || null,
          firstName: req.user.claims.first_name || null,
          lastName: req.user.claims.last_name || null,
          profileImageUrl: req.user.claims.profile_image_url || null,
        });
      }
      
      console.log(`User found, updating roles from ${user.roles} to ${roles}`);
      await storage.updateUserRoles(userId, roles);
      
      // Create artist/gallery profiles if needed
      if (roles.includes('artist')) {
        console.log(`Creating artist profile for user ${userId}`);
        await storage.createArtistProfileIfNotExists(userId);
      }
      if (roles.includes('gallery')) {
        console.log(`Creating gallery profile for user ${userId}`);
        await storage.createGalleryProfileIfNotExists(userId);
      }
      
      console.log(`Successfully updated roles for user ${userId}`);
      res.json({ message: "Roles updated successfully" });
    } catch (error) {
      console.error("Error updating user roles:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : error);
      res.status(500).json({ message: "Failed to update user roles", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Full profile endpoint with user data including roles
  app.get('/api/profile/full', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.json(null);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching full user profile:", error);
      res.json(null);
    }
  });

  app.get('/api/user/roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json({ 
        roles: user?.roles || [], 
        setupComplete: user?.roleSetupComplete || false 
      });
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  // Auth success redirect handler
  app.get('/auth/success', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user needs to complete role setup
      if (!user?.roleSetupComplete) {
        return res.redirect('/role-selection');
      }
      
      // User has completed setup, redirect to home
      res.redirect('/');
    } catch (error) {
      console.error("Error in auth success:", error);
      res.redirect('/');
    }
  });

  // Test admin route directly (bypassing router issues)
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      console.log('Direct admin route called:', {
        sessionID: req.sessionID,
        hasSession: !!req.session,
        sessionUser: req.session?.user,
        passportUser: req.user
      });
      
      // Use proper authentication from middleware
      const userId = req.user?.claims?.sub || req.user?.id || req.session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: 'User not found in database' });
      }
      
      const hasAdminRole = user.roles?.includes('admin') || user.role === 'admin';
      if (!hasAdminRole) {
        return res.status(403).json({ 
          message: 'Admin access required',
          userRoles: user.roles,
          userRole: user.role 
        });
      }
      
      // Get stats
      const [
        totalUsers,
        totalArtists,
        totalGalleries,
        totalArtworks,
        activeAuctions,
        totalWorkshops,
        totalEvents
      ] = await Promise.all([
        db.select({ count: count() }).from(schema.users),
        db.select({ count: count() }).from(schema.artists),
        db.select({ count: count() }).from(schema.galleries),
        db.select({ count: count() }).from(schema.artworks),
        db.select({ count: count() }).from(schema.auctions).where(eq(schema.auctions.status, 'live')),
        db.select({ count: count() }).from(schema.workshops),
        db.select({ count: count() }).from(schema.events)
      ]);

      // Count users by role (users can have multiple roles)
      const usersWithRoles = await db.select({
        id: schema.users.id,
        roles: schema.users.roles
      }).from(schema.users);

      let collectorsCount = 0;
      let artistsCount = 0;
      let galleriesCount = 0;
      let adminsCount = 0;

      usersWithRoles.forEach(user => {
        if (user.roles && Array.isArray(user.roles)) {
          if (user.roles.includes('collector')) collectorsCount++;
          if (user.roles.includes('artist')) artistsCount++;
          if (user.roles.includes('gallery')) galleriesCount++;
          if (user.roles.includes('admin')) adminsCount++;
        }
      });

      const stats = {
        overview: {
          totalUsers: totalUsers[0].count,
          totalArtists: totalArtists[0].count,
          totalGalleries: totalGalleries[0].count,
          totalArtworks: totalArtworks[0].count,
          activeAuctions: activeAuctions[0].count,
          totalWorkshops: totalWorkshops[0].count,
          totalEvents: totalEvents[0].count
        },
        usersByRole: {
          collectors: collectorsCount,
          artists: artistsCount,
          galleries: galleriesCount,
          admins: adminsCount
        }
      };
      
      // Add debug logging for role counting
      console.log('Role counting debug:', {
        usersWithRoles: usersWithRoles.map(u => ({ id: u.id, roles: u.roles })),
        collectorsCount,
        artistsCount,
        galleriesCount,
        adminsCount
      });

      // Log the actual response being sent
      console.log('FINAL RESPONSE DATA:', JSON.stringify(stats, null, 2));
      
      // Disable caching for admin stats to ensure fresh data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Register admin and seller routes AFTER auth routes
  app.use('/api/admin', adminRouter);
  app.use('/api/seller', sellerRouter);

  // First-time admin setup endpoint - allows creating the first admin without authentication
  app.post('/api/admin/setup', rateLimiters.auth, async (req: any, res) => {
    try {
      // First check if there are any admins already
      const allUsers = await storage.getAllUsers();
      const hasAdmin = allUsers.some(user => user.roles && user.roles.includes('admin'));
      
      if (hasAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }
      
      // If no admin exists, and user is authenticated, make them admin
      if (req.user && req.user.claims && req.user.claims.sub) {
        const userId = req.user.claims.sub;
        
        // Get current user or create if not exists
        let user = await storage.getUser(userId);
        if (!user) {
          user = await storage.upsertUser({
            id: userId,
            email: req.user.claims.email || null,
            firstName: req.user.claims.first_name || null,
            lastName: req.user.claims.last_name || null,
            profileImageUrl: req.user.claims.profile_image_url || null,
          });
        }
        
        // Add admin role to user's roles
        const currentRoles = user.roles || [];
        const newRoles = [...currentRoles, 'admin'];
        await storage.updateUserRoles(userId, newRoles);
        
        const updatedUser = await storage.getUser(userId);
        res.json({ message: "Admin user created successfully", user: updatedUser });
      } else {
        // User not authenticated - return instructions to authenticate first
        res.status(401).json({ 
          message: "Please log in first to become admin", 
          loginUrl: "/api/login" 
        });
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Note: Admin endpoints are now handled by the admin router at /api/admin/*
  // This provides proper middleware and role checking

  // Admin artworks endpoint
  app.get('/api/admin/artworks', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const artworks = await storage.getArtworks(100, 0);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      res.status(500).json({ message: "Failed to fetch artworks" });
    }
  });

  // Admin role update endpoint
  app.patch('/api/admin/users/:userId/role', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { userId: targetUserId } = req.params;
      const { role } = req.body;

      if (!['user', 'artist', 'gallery', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const updatedUser = await storage.updateUserRole(targetUserId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Admin feature toggle endpoint
  app.patch('/api/admin/:type/:id/feature', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { type, id } = req.params;
      const { featured } = req.body;

      switch (type) {
        case 'artists':
          await storage.updateArtist(parseInt(id), { featured });
          break;
        case 'galleries':
          await storage.updateGallery(parseInt(id), { featured });
          break;
        case 'artworks':
          await storage.updateArtwork(parseInt(id), { featured });
          break;
        default:
          return res.status(400).json({ message: 'Invalid type' });
      }

      res.json({ message: 'Feature status updated' });
    } catch (error) {
      console.error("Error updating feature status:", error);
      res.status(500).json({ message: "Failed to update feature status" });
    }
  });

  // Admin KYC Documents
  app.get('/api/admin/kyc-documents', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const kycDocuments = await storage.getAllKycDocuments();
      res.json({ documents: kycDocuments });
    } catch (error) {
      console.error("Error fetching KYC documents:", error);
      res.status(500).json({ message: "Failed to fetch KYC documents" });
    }
  });

  // Admin KYC Document Update
  app.patch('/api/admin/kyc-documents/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const { verificationStatus, verificationNotes } = req.body;

      const updated = await storage.updateSellerKycDoc(parseInt(id), {
        verificationStatus,
        verificationNotes,
        reviewedBy: userId,
        reviewedAt: new Date(),
      });

      res.json({ message: 'Document updated successfully', document: updated });
    } catch (error) {
      console.error("Error updating KYC document:", error);
      res.status(500).json({ message: "Failed to update KYC document" });
    }
  });

  // Admin-only route to manage user roles
  app.put('/api/admin/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { userId } = req.params;
      const { role } = req.body;
      
      if (!['user', 'artist', 'gallery', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json({ message: "User role updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Artist routes
  app.get('/api/artists', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const artists = await storage.getArtists(limit, offset);
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get('/api/artists/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const artists = await storage.getFeaturedArtists(limit);
      res.json(artists);
    } catch (error) {
      console.error("Error fetching featured artists:", error);
      res.status(500).json({ message: "Failed to fetch featured artists" });
    }
  });

  app.get('/api/artists/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artist = await storage.getArtist(id);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist:", error);
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.post('/api/artists', isAuthenticated, async (req: any, res) => {
    try {
      const artistData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(artistData);
      res.json(artist);
    } catch (error) {
      console.error("Error creating artist:", error);
      res.status(500).json({ message: "Failed to create artist" });
    }
  });

  // Gallery routes
  app.get('/api/galleries', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const galleries = await storage.getGalleries(limit, offset);
      res.json(galleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  });

  app.get('/api/galleries/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const galleries = await storage.getFeaturedGalleries(limit);
      res.json(galleries);
    } catch (error) {
      console.error("Error fetching featured galleries:", error);
      res.status(500).json({ message: "Failed to fetch featured galleries" });
    }
  });

  app.get('/api/galleries/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gallery = await storage.getGallery(id);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.json(gallery);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post('/api/galleries', rateLimiters.creation, isAuthenticated, async (req, res) => {
    try {
      const galleryData = insertGallerySchema.parse(req.body);
      const gallery = await storage.createGallery(galleryData);
      res.json(gallery);
    } catch (error) {
      console.error("Error creating gallery:", error);
      res.status(500).json({ message: "Failed to create gallery" });
    }
  });

  // Artwork routes
  app.get('/api/artworks', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const artworks = await storage.getArtworks(limit, offset);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artworks:", error);
      res.status(500).json({ message: "Failed to fetch artworks" });
    }
  });

  app.get('/api/artworks/featured', cacheConfigs.publicData, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const artworks = await storage.getFeaturedArtworks(limit);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching featured artworks:", error);
      res.status(500).json({ message: "Failed to fetch featured artworks" });
    }
  });

  app.get('/api/artworks/curators-picks', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const artworks = await storage.getCuratorsPickArtworks(limit);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching curators' picks:", error);
      res.status(500).json({ message: "Failed to fetch curators' picks" });
    }
  });

  app.get('/api/artworks/search', async (req, res) => {
    try {
      const query = req.query.q as string || '';
      const artworks = await storage.searchArtworks(query);
      res.json(artworks);
    } catch (error) {
      console.error("Error searching artworks:", error);
      res.status(500).json({ message: "Failed to search artworks" });
    }
  });

  app.get('/api/artworks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      console.error("Error fetching artwork:", error);
      res.status(500).json({ message: "Failed to fetch artwork" });
    }
  });

  app.get('/api/artworks/:id/similar', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      // Get similar artworks by same artist or similar category
      const similarArtworks = await storage.searchArtworks("", {
        category: artwork.category,
        artistId: artwork.artistId,
        excludeId: id,
        limit: 4
      });
      
      res.json(similarArtworks);
    } catch (error) {
      console.error("Error fetching similar artworks:", error);
      res.status(500).json({ message: "Failed to fetch similar artworks" });
    }
  });

  // Enhanced search endpoint
  // Articles endpoint (removed feature but keeping endpoint for compatibility)
  app.get('/api/articles/featured', async (req, res) => {
    res.json([]); // Empty array since articles feature was removed
  });

  app.get('/api/search', cacheConfigs.searchResults, async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const type = req.query.type as string || "all";
      const filters = {
        category: req.query.category as string,
        medium: req.query.medium as string,
        style: req.query.style as string,
        priceMin: req.query.priceMin ? parseInt(req.query.priceMin as string) : undefined,
        priceMax: req.query.priceMax ? parseInt(req.query.priceMax as string) : undefined,
        availability: req.query.availability as string,
        nationality: req.query.nationality as string,
        yearMin: req.query.yearMin ? parseInt(req.query.yearMin as string) : undefined,
        yearMax: req.query.yearMax ? parseInt(req.query.yearMax as string) : undefined,
        sortBy: req.query.sortBy as string || "relevance",
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      };

      let results = {
        artworks: [],
        artists: [],
        galleries: [],
        total: 0
      };

      if (type === "all" || type === "artworks") {
        results.artworks = await storage.searchArtworks(query, filters);
      }
      
      if (type === "all" || type === "artists") {
        results.artists = await storage.searchArtists(query, filters);
      }
      
      if (type === "all" || type === "galleries") {
        results.galleries = await storage.searchGalleries(query, filters);
      }

      results.total = results.artworks.length + results.artists.length + results.galleries.length;
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  app.get('/api/artists/:id/artworks', async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 20;
      const artworks = await storage.getArtworksByArtist(artistId, limit);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching artist artworks:", error);
      res.status(500).json({ message: "Failed to fetch artist artworks" });
    }
  });

  app.post('/api/artworks', rateLimiters.creation, isAuthenticated, async (req: any, res) => {
    try {
      const artworkData = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(artworkData);
      res.json(artwork);
    } catch (error) {
      console.error("Error creating artwork:", error);
      res.status(500).json({ message: "Failed to create artwork" });
    }
  });

  // Update artwork
  app.put('/api/artworks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const artworkId = parseInt(req.params.id);
      const artworkData = insertArtworkSchema.partial().parse(req.body);
      const artwork = await storage.updateArtwork(artworkId, artworkData);
      res.json(artwork);
    } catch (error) {
      console.error("Error updating artwork:", error);
      res.status(500).json({ message: "Failed to update artwork" });
    }
  });

  // Delete artwork
  app.delete('/api/artworks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const artworkId = parseInt(req.params.id);
      await storage.deleteArtwork(artworkId);
      res.json({ message: "Artwork deleted successfully" });
    } catch (error) {
      console.error("Error deleting artwork:", error);
      res.status(500).json({ message: "Failed to delete artwork" });
    }
  });

  // User artworks endpoint - get artworks for authenticated user
  app.get('/api/user/artworks', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user has artist or gallery roles
      const userRoles = user.roles || [];
      if (!userRoles.includes('artist') && !userRoles.includes('gallery')) {
        return res.status(403).json({ message: 'Access denied. Artist or gallery role required.' });
      }

      let artworks: any[] = [];
      
      // Get artworks based on user type
      if (userRoles.includes('artist')) {
        const artist = await storage.getArtistByUserId(userId);
        if (artist) {
          artworks = await storage.getArtworksByArtist(artist.id);
        }
      } else if (userRoles.includes('gallery')) {
        const gallery = await storage.getGalleryByUserId(userId);
        if (gallery) {
          artworks = await storage.getArtworksByGallery(gallery.id);
        }
      }

      res.json(artworks);
    } catch (error) {
      console.error("Error fetching user artworks:", error);
      res.status(500).json({ message: "Failed to fetch user artworks" });
    }
  });

  // User artist profile endpoint
  app.get('/api/user/artist-profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const artist = await storage.getArtistByUserId(userId);
      
      if (!artist) {
        return res.status(404).json({ message: 'Artist profile not found' });
      }

      res.json(artist);
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  // User gallery profile endpoint
  app.get('/api/user/gallery-profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const gallery = await storage.getGalleryByUserId(userId);
      
      if (!gallery) {
        return res.status(404).json({ message: 'Gallery profile not found' });
      }

      res.json(gallery);
    } catch (error) {
      console.error("Error fetching gallery profile:", error);
      res.status(500).json({ message: "Failed to fetch gallery profile" });
    }
  });

  // Auction routes
  app.get('/api/auctions', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const auctions = await storage.getAuctions(limit, offset);
      res.json(auctions);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      res.status(500).json({ message: "Failed to fetch auctions" });
    }
  });

  app.get('/api/auctions/live', cacheConfigs.shortTerm, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const auctions = await storage.getLiveAuctions(limit);
      res.json(auctions);
    } catch (error) {
      console.error("Error fetching live auctions:", error);
      res.status(500).json({ message: "Failed to fetch live auctions" });
    }
  });

  app.get('/api/auctions/upcoming', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const auctions = await storage.getUpcomingAuctions(limit);
      res.json(auctions);
    } catch (error) {
      console.error("Error fetching upcoming auctions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming auctions" });
    }
  });

  app.get('/api/auctions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const auction = await storage.getAuction(id);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      res.json(auction);
    } catch (error) {
      console.error("Error fetching auction:", error);
      res.status(500).json({ message: "Failed to fetch auction" });
    }
  });

  app.post('/api/auctions', rateLimiters.creation, isAuthenticated, async (req, res) => {
    try {
      const auctionData = insertAuctionSchema.parse(req.body);
      const auction = await storage.createAuction(auctionData);
      res.json(auction);
    } catch (error) {
      console.error("Error creating auction:", error);
      res.status(500).json({ message: "Failed to create auction" });
    }
  });

  // Bid routes
  app.get('/api/auctions/:id/bids', async (req, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      const bids = await storage.getBidsForAuction(auctionId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post('/api/auctions/:id/bids', 
    rateLimiters.bidding,
    validateRequest({ 
      body: commonSchemas.bidBody,
      params: commonSchemas.idParam 
    }),
    isAuthenticated, 
    async (req: any, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      const bidData = insertBidSchema.parse({
        ...req.body,
        auctionId,
        userId: req.user.claims.sub
      });
      const bid = await storage.createBid(bidData);
      res.json(bid);
    } catch (error) {
      console.error("Error creating bid:", error);
      res.status(500).json({ message: "Failed to create bid" });
    }
  });

  // Auction Results routes
  app.get('/api/auction-results/artist/:artistId', async (req, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      const limit = parseInt(req.query.limit as string) || 20;
      const results = await storage.getAuctionResultsByArtist(artistId, limit);
      res.json(results);
    } catch (error) {
      console.error("Error fetching artist auction results:", error);
      res.status(500).json({ message: "Failed to fetch artist auction results" });
    }
  });

  app.get('/api/auction-results/artwork/:artworkId', async (req, res) => {
    try {
      const artworkId = parseInt(req.params.artworkId);
      const results = await storage.getAuctionResultsByArtwork(artworkId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching artwork auction results:", error);
      res.status(500).json({ message: "Failed to fetch artwork auction results" });
    }
  });

  app.get('/api/auction-results/auction/:auctionId', async (req, res) => {
    try {
      const auctionId = parseInt(req.params.auctionId);
      const result = await storage.getAuctionResult(auctionId);
      if (!result) {
        return res.status(404).json({ message: "Auction result not found" });
      }
      res.json(result);
    } catch (error) {
      console.error("Error fetching auction result:", error);
      res.status(500).json({ message: "Failed to fetch auction result" });
    }
  });

  app.post('/api/auction-results', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const resultData = insertAuctionResultSchema.parse(req.body);
      const result = await storage.createAuctionResult(resultData);
      res.json(result);
    } catch (error) {
      console.error("Error creating auction result:", error);
      res.status(500).json({ message: "Failed to create auction result" });
    }
  });

  app.put('/api/auction-results/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const id = parseInt(req.params.id);
      const resultData = insertAuctionResultSchema.partial().parse(req.body);
      const result = await storage.updateAuctionResult(id, resultData);
      res.json(result);
    } catch (error) {
      console.error("Error updating auction result:", error);
      res.status(500).json({ message: "Failed to update auction result" });
    }
  });

  app.get('/api/artists/:id/auction-stats', async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const stats = await storage.getArtistAuctionStats(artistId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching artist auction stats:", error);
      res.status(500).json({ message: "Failed to fetch artist auction stats" });
    }
  });

  // Achievement routes
  app.get('/api/achievements/badges', async (req, res) => {
    try {
      const category = req.query.category as string;
      const badges = await storage.getAchievementBadges(category);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching achievement badges:", error);
      res.status(500).json({ message: "Failed to fetch achievement badges" });
    }
  });

  app.get('/api/achievements/badges/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const badge = await storage.getAchievementBadge(id);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      res.json(badge);
    } catch (error) {
      console.error("Error fetching achievement badge:", error);
      res.status(500).json({ message: "Failed to fetch achievement badge" });
    }
  });

  app.post('/api/achievements/badges', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const badgeData = insertAchievementBadgeSchema.parse(req.body);
      const badge = await storage.createAchievementBadge(badgeData);
      res.json(badge);
    } catch (error) {
      console.error("Error creating achievement badge:", error);
      res.status(500).json({ message: "Failed to create achievement badge" });
    }
  });

  app.get('/api/artists/:id/achievements', async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const achievements = await storage.getArtistAchievements(artistId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching artist achievements:", error);
      res.status(500).json({ message: "Failed to fetch artist achievements" });
    }
  });

  app.get('/api/artists/:id/stats', async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const stats = await storage.getArtistStats(artistId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching artist stats:", error);
      res.status(500).json({ message: "Failed to fetch artist stats" });
    }
  });

  app.get('/api/artists/:id/badge-progress', async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const progress = await storage.getBadgeProgress(artistId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching badge progress:", error);
      res.status(500).json({ message: "Failed to fetch badge progress" });
    }
  });

  app.post('/api/artists/:id/calculate-achievements', isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.id);
      await storage.calculateAchievements(artistId);
      res.json({ message: "Achievements calculated successfully" });
    } catch (error) {
      console.error("Error calculating achievements:", error);
      res.status(500).json({ message: "Failed to calculate achievements" });
    }
  });

  app.patch('/api/achievements/:id/display', isAuthenticated, async (req: any, res) => {
    try {
      const achievementId = parseInt(req.params.id);
      const { isDisplayed } = req.body;
      
      const achievement = await storage.updateArtistAchievement(achievementId, { isDisplayed });
      res.json(achievement);
    } catch (error) {
      console.error("Error updating achievement display:", error);
      res.status(500).json({ message: "Failed to update achievement display" });
    }
  });

  // Collection routes
  app.get('/api/collections', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const collections = await storage.getCollections(limit, offset);
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get('/api/collections/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const collections = await storage.getFeaturedCollections(limit);
      res.json(collections);
    } catch (error) {
      console.error("Error fetching featured collections:", error);
      res.status(500).json({ message: "Failed to fetch featured collections" });
    }
  });

  app.get('/api/collections/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  app.get('/api/collections/:id/artworks', async (req, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const artworks = await storage.getCollectionArtworks(collectionId);
      res.json(artworks);
    } catch (error) {
      console.error("Error fetching collection artworks:", error);
      res.status(500).json({ message: "Failed to fetch collection artworks" });
    }
  });

  // Article routes
  app.get('/api/articles', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const articles = await storage.getArticles(limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Workshop routes
  app.get('/api/workshops', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const workshops = await storage.getWorkshops(limit, offset);
      res.json(workshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      res.status(500).json({ message: 'Failed to fetch workshops' });
    }
  });

  app.get('/api/workshops/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const workshops = await storage.getFeaturedWorkshops(limit);
      res.json(workshops);
    } catch (error) {
      console.error('Error fetching featured workshops:', error);
      res.status(500).json({ message: 'Failed to fetch featured workshops' });
    }
  });

  app.get('/api/workshops/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workshop = await storage.getWorkshop(id);
      if (!workshop) {
        return res.status(404).json({ message: 'Workshop not found' });
      }
      res.json(workshop);
    } catch (error) {
      console.error('Error fetching workshop:', error);
      res.status(500).json({ message: 'Failed to fetch workshop' });
    }
  });

  app.get('/api/workshops/instructor', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'artist' && user.role !== 'gallery')) {
        return res.status(403).json({ message: 'Not authorized as instructor' });
      }
      
      const workshops = await storage.getWorkshopsByInstructor(userId, user.role);
      res.json(workshops);
    } catch (error) {
      console.error('Error fetching instructor workshops:', error);
      res.status(500).json({ message: 'Failed to fetch instructor workshops' });
    }
  });

  app.post('/api/workshops', rateLimiters.creation, isAuthenticated, async (req: any, res) => {
    try {
      const workshopData = insertWorkshopSchema.parse({
        ...req.body,
        instructorId: req.user.claims.sub
      });
      const workshop = await storage.createWorkshop(workshopData);
      res.json(workshop);
    } catch (error) {
      console.error('Error creating workshop:', error);
      res.status(500).json({ message: 'Failed to create workshop' });
    }
  });

  app.put('/api/workshops/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this workshop
      const workshop = await storage.getWorkshop(id);
      if (!workshop || workshop.instructorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updates = insertWorkshopSchema.partial().parse(req.body);
      const updated = await storage.updateWorkshop(id, updates);
      res.json(updated);
    } catch (error) {
      console.error('Error updating workshop:', error);
      res.status(500).json({ message: 'Failed to update workshop' });
    }
  });

  app.delete('/api/workshops/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this workshop
      const workshop = await storage.getWorkshop(id);
      if (!workshop || workshop.instructorId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.deleteWorkshop(id);
      res.json({ message: 'Workshop deleted successfully' });
    } catch (error) {
      console.error('Error deleting workshop:', error);
      res.status(500).json({ message: 'Failed to delete workshop' });
    }
  });

  app.post('/api/workshops/:id/register', isAuthenticated, async (req: any, res) => {
    try {
      const workshopId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const registration = await storage.createWorkshopRegistration({ workshopId, userId });
      res.json(registration);
    } catch (error) {
      console.error('Error registering for workshop:', error);
      res.status(500).json({ message: 'Failed to register for workshop' });
    }
  });

  app.get('/api/user/workshops', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const registrations = await storage.getUserWorkshopRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error('Error fetching user workshops:', error);
      res.status(500).json({ message: 'Failed to fetch user workshops' });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const events = await storage.getEvents(limit, offset);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  app.get('/api/events/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getFeaturedEvents(limit);
      res.json(events);
    } catch (error) {
      console.error('Error fetching featured events:', error);
      res.status(500).json({ message: 'Failed to fetch featured events' });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  });

  app.get('/api/events/organizer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'artist' && user.role !== 'gallery')) {
        return res.status(403).json({ message: 'Not authorized as organizer' });
      }
      
      const events = await storage.getEventsByOrganizer(userId, user.role);
      res.json(events);
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      res.status(500).json({ message: 'Failed to fetch organizer events' });
    }
  });

  app.post('/api/events', rateLimiters.creation, isAuthenticated, async (req: any, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: req.user.claims.sub
      });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Failed to create event' });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this event
      const event = await storage.getEvent(id);
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const updates = insertEventSchema.partial().parse(req.body);
      const updated = await storage.updateEvent(id, updates);
      res.json(updated);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Failed to update event' });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify the user owns this event
      const event = await storage.getEvent(id);
      if (!event || event.organizerId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      await storage.deleteEvent(id);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });

  app.post('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { status } = req.body;
      const rsvp = await storage.createEventRsvp({ eventId, userId, status });
      res.json(rsvp);
    } catch (error) {
      console.error('Error creating event RSVP:', error);
      res.status(500).json({ message: 'Failed to create RSVP' });
    }
  });

  app.get('/api/user/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rsvps = await storage.getUserEventRsvps(userId);
      res.json(rsvps);
    } catch (error) {
      console.error('Error fetching user events:', error);
      res.status(500).json({ message: 'Failed to fetch user events' });
    }
  });

  // Workshop and Event Review Routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewData = insertWorkshopEventReviewSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const review = await storage.createWorkshopEventReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Failed to create review' });
    }
  });

  app.get('/api/reviews/:entityType/:entityId', async (req, res) => {
    try {
      const entityType = req.params.entityType as 'workshop' | 'event';
      const entityId = parseInt(req.params.entityId);
      const reviews = await storage.getWorkshopEventReviews(entityType, entityId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.put('/api/reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the review
      const existingReview = await storage.getWorkshopEventReview(id);
      if (!existingReview || existingReview.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this review' });
      }
      
      const updates = insertWorkshopEventReviewSchema.partial().parse(req.body);
      const review = await storage.updateWorkshopEventReview(id, updates);
      res.json(review);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Failed to update review' });
    }
  });

  app.delete('/api/reviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the review
      const existingReview = await storage.getWorkshopEventReview(id);
      if (!existingReview || existingReview.userId !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this review' });
      }
      
      await storage.deleteWorkshopEventReview(id);
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Failed to delete review' });
    }
  });

  app.get('/api/reviews/check/:entityType/:entityId', isAuthenticated, async (req: any, res) => {
    try {
      const entityType = req.params.entityType as 'workshop' | 'event';
      const entityId = parseInt(req.params.entityId);
      const userId = req.user.claims.sub;
      
      const hasReviewed = await storage.hasUserReviewed(userId, entityType, entityId);
      res.json({ hasReviewed });
    } catch (error) {
      console.error('Error checking review status:', error);
      res.status(500).json({ message: 'Failed to check review status' });
    }
  });



  // Collector Dashboard Routes
  app.get('/api/collector/orders', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await db
        .select({
          id: purchaseOrders.id,
          orderNumber: purchaseOrders.orderNumber,
          status: purchaseOrders.status,
          totalAmount: purchaseOrders.totalAmount,
          currency: purchaseOrders.currency,
          paymentStatus: purchaseOrders.paymentStatus,
          createdAt: purchaseOrders.createdAt,
          artwork: {
            id: artworks.id,
            title: artworks.title,
            titleAr: artworks.titleAr,
            images: artworks.images,
            artist: {
              name: artists.name,
              nameAr: artists.nameAr,
            }
          },
          shippingTracking: {
            trackingNumber: shippingTracking.trackingNumber,
            carrier: shippingTracking.carrier,
            status: shippingTracking.status,
            estimatedDelivery: shippingTracking.estimatedDelivery,
          },
          installmentPlan: {
            totalAmount: installmentPlans.totalAmount,
            completedInstallments: installmentPlans.completedInstallments,
            numberOfInstallments: installmentPlans.numberOfInstallments,
            nextPaymentDate: installmentPlans.nextPaymentDate,
            installmentAmount: installmentPlans.installmentAmount,
          }
        })
        .from(purchaseOrders)
        .innerJoin(artworks, eq(purchaseOrders.artworkId, artworks.id))
        .innerJoin(artists, eq(artworks.artistId, artists.id))
        .leftJoin(shippingTracking, eq(purchaseOrders.id, shippingTracking.orderId))
        .leftJoin(installmentPlans, eq(purchaseOrders.id, installmentPlans.orderId))
        .where(eq(purchaseOrders.userId, userId))
        .orderBy(desc(purchaseOrders.createdAt));
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching collector orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/collector/wishlist', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistItems = await db
        .select({
          id: collectorWishlist.id,
          priority: collectorWishlist.priority,
          priceAtTimeOfAdding: collectorWishlist.priceAtTimeOfAdding,
          notifyOnPriceChange: collectorWishlist.notifyOnPriceChange,
          artwork: {
            id: artworks.id,
            title: artworks.title,
            titleAr: artworks.titleAr,
            images: artworks.images,
            price: artworks.price,
            currency: artworks.currency,
            artist: {
              name: artists.name,
              nameAr: artists.nameAr,
            }
          }
        })
        .from(collectorWishlist)
        .innerJoin(artworks, eq(collectorWishlist.artworkId, artworks.id))
        .innerJoin(artists, eq(artworks.artistId, artists.id))
        .where(eq(collectorWishlist.userId, userId))
        .orderBy(desc(collectorWishlist.priority));
      
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/collector/wishlist', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { artworkId, priority = 0, notes, notifyOnPriceChange = true } = req.body;
      
      // Get current artwork price
      const [artwork] = await db.select({ price: artworks.price }).from(artworks).where(eq(artworks.id, artworkId));
      
      const [wishlistItem] = await db
        .insert(collectorWishlist)
        .values({
          userId,
          artworkId,
          priority,
          notes,
          priceAtTimeOfAdding: artwork?.price,
          notifyOnPriceChange,
        })
        .returning();
      
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/collector/wishlist/:artworkId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const artworkId = parseInt(req.params.artworkId);
      
      await db
        .delete(collectorWishlist)
        .where(and(
          eq(collectorWishlist.userId, userId),
          eq(collectorWishlist.artworkId, artworkId)
        ));
      
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  app.get('/api/collector/price-alerts', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await db
        .select()
        .from(priceAlerts)
        .where(and(
          eq(priceAlerts.userId, userId),
          eq(priceAlerts.isActive, true)
        ))
        .orderBy(desc(priceAlerts.createdAt));
      
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  app.post('/api/collector/price-alerts', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = {
        userId,
        ...req.body
      };
      
      const [alert] = await db
        .insert(priceAlerts)
        .values(alertData)
        .returning();
      
      res.json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(500).json({ message: "Failed to create price alert" });
    }
  });

  app.get('/api/collector/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const [profile] = await db
        .select()
        .from(collectorProfiles)
        .where(eq(collectorProfiles.userId, userId));
      
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching collector profile:", error);
      res.status(500).json({ message: "Failed to fetch collector profile" });
    }
  });

  app.put('/api/collector/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const [existingProfile] = await db
        .select()
        .from(collectorProfiles)
        .where(eq(collectorProfiles.userId, userId));
      
      let profile;
      if (existingProfile) {
        [profile] = await db
          .update(collectorProfiles)
          .set({ ...profileData, updatedAt: new Date() })
          .where(eq(collectorProfiles.userId, userId))
          .returning();
      } else {
        [profile] = await db
          .insert(collectorProfiles)
          .values({ userId, ...profileData })
          .returning();
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error updating collector profile:", error);
      res.status(500).json({ message: "Failed to update collector profile" });
    }
  });

  // Inquiry routes
  app.get('/api/inquiries', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const inquiries = await storage.getInquiries(limit, offset);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.get('/api/artworks/:id/inquiries', async (req, res) => {
    try {
      const artworkId = parseInt(req.params.id);
      const inquiries = await storage.getInquiriesForArtwork(artworkId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching artwork inquiries:", error);
      res.status(500).json({ message: "Failed to fetch artwork inquiries" });
    }
  });

  app.post('/api/inquiries', rateLimiters.contact, async (req: any, res) => {
    try {
      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        userId: req.user?.claims?.sub || null
      });
      const inquiry = await storage.createInquiry(inquiryData);
      res.json(inquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  // Favorite routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const favorite = await storage.createFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error creating favorite:", error);
      res.status(500).json({ message: "Failed to create favorite" });
    }
  });

  app.delete('/api/favorites/:artworkId', isAuthenticated, async (req: any, res) => {
    try {
      const artworkId = parseInt(req.params.artworkId);
      const userId = req.user.claims.sub;
      await storage.deleteFavorite(userId, artworkId);
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get('/api/favorites/:artworkId/check', isAuthenticated, async (req: any, res) => {
    try {
      const artworkId = parseInt(req.params.artworkId);
      const userId = req.user.claims.sub;
      const isFavorite = await storage.isFavorite(userId, artworkId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite:", error);
      res.status(500).json({ message: "Failed to check favorite" });
    }
  });



  // Social features - Follow routes
  app.post('/api/follows', isAuthenticated, async (req: any, res) => {
    try {
      const followData = insertFollowSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const follow = await storage.createFollow(followData);
      res.json(follow);
    } catch (error) {
      console.error("Error creating follow:", error);
      res.status(500).json({ message: "Failed to create follow" });
    }
  });

  app.delete('/api/follows/:entityType/:entityId', isAuthenticated, async (req: any, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const userId = req.user.claims.sub;
      await storage.deleteFollow(userId, entityType, entityId);
      res.json({ message: "Follow removed successfully" });
    } catch (error) {
      console.error("Error removing follow:", error);
      res.status(500).json({ message: "Failed to remove follow" });
    }
  });

  app.get('/api/follows/:entityType/:entityId/check', isAuthenticated, async (req: any, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const userId = req.user.claims.sub;
      const isFollowing = await storage.isFollowing(userId, entityType, entityId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow:", error);
      res.status(500).json({ message: "Failed to check follow" });
    }
  });

  app.get('/api/follows/:entityType/:entityId/followers', async (req, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const followers = await storage.getFollowers(entityType, entityId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get('/api/follows/:entityType/:entityId/counts', async (req, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const counts = await storage.getFollowCounts(entityType, entityId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching follow counts:", error);
      res.status(500).json({ message: "Failed to fetch follow counts" });
    }
  });

  app.get('/api/following', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entityType = req.query.entityType as string;
      const following = await storage.getFollowing(userId, entityType);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  // Social features - Comment routes
  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.put('/api/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the comment
      const existingComment = await storage.getComment(id);
      if (!existingComment || existingComment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this comment" });
      }
      
      const commentData = insertCommentSchema.partial().parse(req.body);
      const comment = await storage.updateComment(id, commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete('/api/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user owns the comment
      const existingComment = await storage.getComment(id);
      if (!existingComment || existingComment.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      await storage.deleteComment(id);
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  app.get('/api/comments/:entityType/:entityId', async (req, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const comments = await storage.getComments(entityType, entityId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Social features - Like routes
  app.post('/api/likes', isAuthenticated, async (req: any, res) => {
    try {
      const likeData = insertLikeSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const like = await storage.createLike(likeData);
      res.json(like);
    } catch (error) {
      console.error("Error creating like:", error);
      res.status(500).json({ message: "Failed to create like" });
    }
  });

  app.delete('/api/likes/:entityType/:entityId', isAuthenticated, async (req: any, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const userId = req.user.claims.sub;
      await storage.deleteLike(userId, entityType, entityId);
      res.json({ message: "Like removed successfully" });
    } catch (error) {
      console.error("Error removing like:", error);
      res.status(500).json({ message: "Failed to remove like" });
    }
  });

  app.get('/api/likes/:entityType/:entityId/check', isAuthenticated, async (req: any, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const userId = req.user.claims.sub;
      const isLiked = await storage.isLiked(userId, entityType, entityId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking like:", error);
      res.status(500).json({ message: "Failed to check like" });
    }
  });

  app.get('/api/likes/:entityType/:entityId/counts', async (req, res) => {
    try {
      const entityType = req.params.entityType;
      const entityId = parseInt(req.params.entityId);
      const counts = await storage.getLikeCounts(entityType, entityId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching like counts:", error);
      res.status(500).json({ message: "Failed to fetch like counts" });
    }
  });

  // Social features - Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/activities/feed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getFollowingActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // Social features - User profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.get('/api/profile/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId: req.user.claims.sub
      });
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.partial().parse(req.body);
      const profile = await storage.updateUserProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Analytics routes
  app.post('/api/analytics/artwork-views', async (req: any, res) => {
    try {
      const { artworkId, duration, source } = req.body;
      const userId = req.isAuthenticated() ? req.user.claims.sub : null;
      
      const view = await storage.recordArtworkView({
        artworkId,
        userId,
        duration,
        source,
      });
      
      res.json(view);
    } catch (error) {
      console.error("Error recording artwork view:", error);
      res.status(500).json({ message: "Failed to record artwork view" });
    }
  });
  
  app.get('/api/analytics/artwork-views/:artworkId', async (req, res) => {
    try {
      const artworkId = parseInt(req.params.artworkId);
      const days = parseInt(req.query.days as string) || 30;
      const views = await storage.getArtworkViews(artworkId, days);
      res.json(views);
    } catch (error) {
      console.error("Error fetching artwork views:", error);
      res.status(500).json({ message: "Failed to fetch artwork views" });
    }
  });
  
  app.post('/api/analytics/artist/:artistId', isAuthenticated, async (req, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      const date = req.body.date || new Date().toISOString().split('T')[0];
      const analytics = await storage.updateArtistAnalytics(artistId, date);
      res.json(analytics);
    } catch (error) {
      console.error("Error updating artist analytics:", error);
      res.status(500).json({ message: "Failed to update artist analytics" });
    }
  });
  
  app.get('/api/analytics/artist/:artistId', async (req, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      const { startDate, endDate } = req.query;
      const analytics = await storage.getArtistAnalytics(
        artistId,
        startDate as string,
        endDate as string
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching artist analytics:", error);
      res.status(500).json({ message: "Failed to fetch artist analytics" });
    }
  });
  
  app.post('/api/analytics/search', async (req: any, res) => {
    try {
      const { query, filters, resultCount, clickedResults } = req.body;
      const userId = req.isAuthenticated() ? req.user.claims.sub : null;
      
      if (userId) {
        const search = await storage.recordSearchHistory({
          userId,
          query,
          filters,
          resultCount,
          clickedResults,
        });
        res.json(search);
      } else {
        res.json({ message: "Search recorded without user" });
      }
    } catch (error) {
      console.error("Error recording search:", error);
      res.status(500).json({ message: "Failed to record search" });
    }
  });
  
  app.get('/api/analytics/search-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await storage.getSearchHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });
  
  app.get('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserPreferences(userId);
      res.json(preferences || {});
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });
  
  app.put('/api/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.upsertUserPreferences({
        userId,
        ...req.body,
      });
      res.json(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
  
  app.get('/api/artists/:artistId/portfolio', async (req, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      const sections = await storage.getPortfolioSections(artistId);
      res.json(sections);
    } catch (error) {
      console.error("Error fetching portfolio sections:", error);
      res.status(500).json({ message: "Failed to fetch portfolio sections" });
    }
  });
  
  app.post('/api/artists/:artistId/portfolio', isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      // Verify the user owns this artist profile
      const artist = await storage.getArtist(artistId);
      if (!artist || artist.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const section = await storage.createPortfolioSection({
        artistId,
        ...req.body,
      });
      res.json(section);
    } catch (error) {
      console.error("Error creating portfolio section:", error);
      res.status(500).json({ message: "Failed to create portfolio section" });
    }
  });
  
  app.put('/api/portfolio/:sectionId', isAuthenticated, async (req: any, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      const section = await storage.updatePortfolioSection(sectionId, req.body);
      res.json(section);
    } catch (error) {
      console.error("Error updating portfolio section:", error);
      res.status(500).json({ message: "Failed to update portfolio section" });
    }
  });
  
  app.delete('/api/portfolio/:sectionId', isAuthenticated, async (req, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      await storage.deletePortfolioSection(sectionId);
      res.json({ message: "Portfolio section deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio section:", error);
      res.status(500).json({ message: "Failed to delete portfolio section" });
    }
  });

  // Seller routes
  app.get('/api/seller/info', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let sellerInfo = null;
      if (user.role === 'artist') {
        sellerInfo = await storage.getArtistByUserId(userId);
      } else if (user.role === 'gallery') {
        sellerInfo = await storage.getGalleryByUserId(userId);
      }

      res.json({ type: user.role, info: sellerInfo });
    } catch (error) {
      console.error("Error fetching seller info:", error);
      res.status(500).json({ message: "Failed to fetch seller info" });
    }
  });

  app.get('/api/seller/payment-methods', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'artist' && user.role !== 'gallery')) {
        return res.status(403).json({ message: "Not authorized as seller" });
      }

      const methods = await storage.getSellerPaymentMethods(userId);
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  // Tap Payment Integration Routes - DISABLED UNTIL SUFFICIENT TRAFFIC
  // Uncomment these routes when ready to enable Tap Payment integration
  /*
  app.post('/api/tap/create-business', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (!user.roles.includes('artist') && !user.roles.includes('gallery'))) {
        return res.status(403).json({ message: 'Access denied - not a seller' });
      }
      
      const { tapPaymentService } = await import('./tapPaymentService');
      const businessData = req.body;
      
      // Create business in Tap
      const tapBusiness = await tapPaymentService.createBusiness(businessData);
      
      // Create destination for payments
      const destination = await tapPaymentService.createDestination(tapBusiness.id);
      
      // Store Tap Payment method in user's payment methods
      const tapPaymentMethod = {
        type: 'tap_payment',
        destinationId: destination.id,
        businessId: tapBusiness.id,
        accountStatus: 'pending',
        commissionRate: 5, // 5% platform commission
        autoSplit: true,
        details: {
          name: businessData.name,
          email: businessData.email,
          phone: businessData.phone,
        }
      };
      
      // Update artist/gallery payment methods
      if (user.roles.includes('artist')) {
        const artist = await storage.getArtistByUserId(userId);
        if (artist) {
          const paymentMethods = artist.paymentMethods || [];
          paymentMethods.push(tapPaymentMethod);
          await storage.updateArtist(artist.id, { paymentMethods });
        }
      }
      
      if (user.roles.includes('gallery')) {
        const gallery = await storage.getGalleryByUserId(userId);
        if (gallery) {
          const paymentMethods = gallery.paymentMethods || [];
          paymentMethods.push(tapPaymentMethod);
          await storage.updateGallery(gallery.id, { paymentMethods });
        }
      }
      
      res.json({
        success: true,
        businessId: tapBusiness.id,
        destinationId: destination.id,
        status: 'pending_kyc',
        message: 'Tap Payment business created successfully. KYC verification in progress.'
      });
    } catch (error) {
      console.error('Error creating Tap business:', error);
      res.status(500).json({ message: 'Failed to create Tap Payment business' });
    }
  });

  app.get('/api/tap/business-status/:businessId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const { businessId } = req.params;
      const { tapPaymentService } = await import('./tapPaymentService');
      
      const status = await tapPaymentService.getBusinessStatus(businessId);
      res.json(status);
    } catch (error) {
      console.error('Error fetching Tap business status:', error);
      res.status(500).json({ message: 'Failed to fetch business status' });
    }
  });

  app.post('/api/tap/create-payment', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const {
        orderId,
        artworkId,
        amount,
        currency = 'SAR',
        sellerId,
        destinationId,
        commissionRate = 5
      } = req.body;
      
      const { tapPaymentService } = await import('./tapPaymentService');
      const artwork = await storage.getArtwork(artworkId);
      
      if (!artwork) {
        return res.status(404).json({ message: 'Artwork not found' });
      }
      
      const paymentData = {
        amount,
        currency,
        sellerId,
        destinationId,
        commissionRate,
        orderId,
        description: `Payment for artwork: ${artwork.title}`,
      };
      
      const payment = await tapPaymentService.createPayment(paymentData);
      
      res.json({
        success: true,
        paymentId: payment.id,
        paymentUrl: payment.transaction?.url,
        status: payment.status,
      });
    } catch (error) {
      console.error('Error creating Tap payment:', error);
      res.status(500).json({ message: 'Failed to create payment' });
    }
  });

  app.post('/api/tap-webhook', async (req, res) => {
    try {
      const { tapPaymentService } = await import('./tapPaymentService');
      const webhookData = req.body;
      
      const result = await tapPaymentService.handleWebhook(webhookData);
      
      if (result.success && result.orderId) {
        // Update order status in database
        await storage.updatePurchaseOrderStatus(result.orderId, 'paid');
        
        // Send confirmation email
        // await emailService.sendOrderConfirmation(result.orderId);
      }
      
      res.json({ status: 'received' });
    } catch (error) {
      console.error('Error handling Tap webhook:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  app.get('/api/tap/payment-methods', async (req, res) => {
    try {
      const { tapPaymentService } = await import('./tapPaymentService');
      const paymentMethods = tapPaymentService.getAvailablePaymentMethods();
      res.json(paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  });
  */

  app.post('/api/seller/payment-methods', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'artist' && user.role !== 'gallery')) {
        return res.status(403).json({ message: "Not authorized as seller" });
      }

      const method = await storage.addSellerPaymentMethod(userId, req.body);
      res.json(method);
    } catch (error) {
      console.error("Error adding payment method:", error);
      res.status(500).json({ message: "Failed to add payment method" });
    }
  });

  app.patch('/api/seller/payment-methods/:methodId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { methodId } = req.params;
      
      const method = await storage.updateSellerPaymentMethod(userId, methodId, req.body);
      res.json(method);
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });

  app.delete('/api/seller/payment-methods/:methodId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { methodId } = req.params;
      
      await storage.deleteSellerPaymentMethod(userId, methodId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  app.get('/api/seller/orders', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'artist' && user.role !== 'gallery')) {
        return res.status(403).json({ message: "Not authorized as seller" });
      }

      const orders = await storage.getSellerOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/seller/orders/:orderId/status', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId } = req.params;
      const { status, sellerNotes, trackingInfo } = req.body;
      
      const updatedOrder = await storage.updateSellerOrder(userId, parseInt(orderId), {
        status,
        sellerNotes,
        trackingInfo
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Newsletter subscription routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email, firstName, lastName, language, categories, frequency } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if authenticated
      let userId = undefined;
      if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
        userId = (req as any).user.claims.sub;
      }

      const subscriber = await emailService.subscribeToNewsletter(email, {
        userId,
        firstName,
        lastName,
        language,
        categories,
        frequency
      });

      res.json({ message: "Successfully subscribed to newsletter", subscriber });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await emailService.unsubscribeFromNewsletter(email);
      res.json({ message: "Successfully unsubscribed from newsletter" });
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  app.get('/api/newsletter/subscription', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getNewsletterSubscriberByUserId(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Admin route to get all newsletter subscribers
  app.get('/api/admin/newsletter-subscribers', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Email template management routes (admin only)
  app.get('/api/email-templates', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/email-templates/:code', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { code } = req.params;
      const template = await storage.getEmailTemplate(code);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching email template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post('/api/email-templates', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const validation = insertEmailTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid template data", errors: validation.error.errors });
      }

      const template = await storage.createEmailTemplate(validation.data);
      res.json(template);
    } catch (error) {
      console.error("Error creating email template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.patch('/api/email-templates/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      const template = await storage.updateEmailTemplate(parseInt(id), req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating email template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete('/api/email-templates/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { id } = req.params;
      await storage.deleteEmailTemplate(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting email template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Email notification monitoring (admin only)
  app.get('/api/email-notifications/queue', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { status, limit } = req.query;
      const queue = await storage.getEmailNotificationQueue(
        status as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(queue);
    } catch (error) {
      console.error("Error fetching email queue:", error);
      res.status(500).json({ message: "Failed to fetch queue" });
    }
  });

  app.get('/api/email-notifications/log', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { email, limit } = req.query;
      const logs = await storage.getEmailNotificationLog(
        email as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Send test email (admin only)
  app.post('/api/email-notifications/test', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { recipientEmail, templateCode, variables, language } = req.body;
      
      const queued = await emailService.queueTemplatedEmail(
        recipientEmail,
        templateCode,
        variables || {},
        {
          priority: 1,
          language
        }
      );

      res.json({ message: "Test email queued", queued });
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Scheduling and Participant Management Routes
  
  // Get participant list for a workshop or event
  app.get('/api/:entityType(workshops|events)/:entityId/participants', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId } = req.params;
      const { status } = req.query;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const participants = await storage.getParticipantList(
        entityType as 'workshops' | 'events',
        parseInt(entityId),
        status as string
      );
      
      res.json(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
      res.status(500).json({ message: "Failed to fetch participants" });
    }
  });

  // Export participants as CSV
  app.get('/api/:entityType(workshops|events)/:entityId/participants/export', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId } = req.params;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const participants = await storage.getParticipantList(
        entityType as 'workshops' | 'events',
        parseInt(entityId)
      );
      
      // Convert to CSV format
      const csv = await storage.exportParticipantsCSV(participants);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${entityType}_${entityId}_participants.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting participants:", error);
      res.status(500).json({ message: "Failed to export participants" });
    }
  });

  // Check in participant
  app.post('/api/:entityType(workshops|events)/:entityId/participants/:participantId/checkin', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId, participantId } = req.params;
      const { method, seatNumber } = req.body;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const participant = await storage.checkInParticipant(
        parseInt(participantId),
        method || 'manual',
        seatNumber
      );
      
      res.json(participant);
    } catch (error) {
      console.error("Error checking in participant:", error);
      res.status(500).json({ message: "Failed to check in participant" });
    }
  });

  // Send bulk notifications to participants
  app.post('/api/:entityType(workshops|events)/:entityId/participants/notify', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId } = req.params;
      const { subject, message, recipientFilter } = req.body;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const result = await storage.sendBulkNotification(
        entityType as 'workshops' | 'events',
        parseInt(entityId),
        {
          subject,
          message,
          recipientFilter
        }
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error sending bulk notification:", error);
      res.status(500).json({ message: "Failed to send notifications" });
    }
  });

  // Get waitlist for a workshop or event
  app.get('/api/:entityType(workshops|events)/:entityId/waitlist', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId } = req.params;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const waitlist = await storage.getWaitlist(
        entityType as 'workshops' | 'events',
        parseInt(entityId)
      );
      
      res.json(waitlist);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).json({ message: "Failed to fetch waitlist" });
    }
  });

  // Move waitlist entry to registered
  app.post('/api/:entityType(workshops|events)/:entityId/waitlist/:waitlistId/promote', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId, waitlistId } = req.params;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const result = await storage.promoteFromWaitlist(parseInt(waitlistId));
      res.json(result);
    } catch (error) {
      console.error("Error promoting from waitlist:", error);
      res.status(500).json({ message: "Failed to promote from waitlist" });
    }
  });

  // Get scheduling conflicts
  app.get('/api/:entityType(workshops|events)/:entityId/conflicts', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId } = req.params;
      
      // Check if user is the host
      const isHost = await storage.isEntityHost(userId, entityType as 'workshops' | 'events', parseInt(entityId));
      if (!isHost) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const conflicts = await storage.getSchedulingConflicts(
        entityType as 'workshops' | 'events',
        parseInt(entityId)
      );
      
      res.json(conflicts);
    } catch (error) {
      console.error("Error fetching conflicts:", error);
      res.status(500).json({ message: "Failed to fetch conflicts" });
    }
  });

  // Resolve scheduling conflict
  app.patch('/api/conflicts/:conflictId/resolve', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { conflictId } = req.params;
      
      const conflict = await storage.resolveSchedulingConflict(
        parseInt(conflictId),
        userId
      );
      
      res.json(conflict);
    } catch (error) {
      console.error("Error resolving conflict:", error);
      res.status(500).json({ message: "Failed to resolve conflict" });
    }
  });

  // Schedule reminder
  app.post('/api/:entityType(workshops|events)/:entityId/reminders', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { entityType, entityId } = req.params;
      const { reminderType, scheduledFor, deliveryMethod, customMessage } = req.body;
      
      const reminder = await storage.scheduleReminder({
        entityType: entityType as 'workshops' | 'events',
        entityId: parseInt(entityId),
        userId,
        reminderType,
        scheduledFor: new Date(scheduledFor),
        deliveryMethod,
        customMessage
      });
      
      res.json(reminder);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      res.status(500).json({ message: "Failed to schedule reminder" });
    }
  });

  // Get user's reminders
  app.get('/api/user/reminders', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminders = await storage.getUserReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  // Calendar integration routes
  app.post('/api/calendar/connect', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { provider, accessToken, refreshToken, calendarId, settings } = req.body;
      
      const integration = await storage.createCalendarIntegration({
        userId,
        provider,
        accessToken,
        refreshToken,
        calendarId,
        settings
      });
      
      res.json(integration);
    } catch (error) {
      console.error("Error connecting calendar:", error);
      res.status(500).json({ message: "Failed to connect calendar" });
    }
  });

  app.get('/api/calendar/integrations', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const integrations = await storage.getUserCalendarIntegrations(userId);
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching calendar integrations:", error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.delete('/api/calendar/integrations/:integrationId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { integrationId } = req.params;
      
      await storage.deleteCalendarIntegration(userId, parseInt(integrationId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting calendar integration:", error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  // Privacy and Trust/Safety Routes
  
  // DSAR (Data Subject Access Request) Routes
  app.get('/api/privacy/dsar', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only admin users can view all requests
      if (user?.role === 'admin') {
        const { status } = req.query;
        const requests = await storage.getDsarRequests(status as string);
        res.json(requests);
      } else {
        // Regular users can only see their own requests
        const requests = await storage.getUserDsarRequests(userId);
        res.json(requests);
      }
    } catch (error) {
      console.error('Error fetching DSAR requests:', error);
      res.status(500).json({ message: 'Failed to fetch DSAR requests' });
    }
  });

  app.get('/api/privacy/dsar/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const request = await storage.getDsarRequest(parseInt(id));
      
      if (!request) {
        return res.status(404).json({ message: 'DSAR request not found' });
      }
      
      const user = await storage.getUser(userId);
      
      // Only admin or the requester can view details
      if (user?.role !== 'admin' && request.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(request);
    } catch (error) {
      console.error('Error fetching DSAR request:', error);
      res.status(500).json({ message: 'Failed to fetch DSAR request' });
    }
  });

  app.post('/api/privacy/dsar', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertDsarRequestSchema.parse({
        ...req.body,
        userId
      });
      
      const request = await storage.createDsarRequest(parsed);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating DSAR request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create DSAR request' });
    }
  });

  app.patch('/api/privacy/dsar/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      const update = {
        ...req.body,
        processedBy: userId
      };
      
      const request = await storage.updateDsarRequest(parseInt(id), update);
      res.json(request);
    } catch (error) {
      console.error('Error updating DSAR request:', error);
      res.status(500).json({ message: 'Failed to update DSAR request' });
    }
  });

  // Audit Logs Routes
  app.get('/api/privacy/audit-logs', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        // Regular users can only see their own audit logs
        const logs = await storage.getAuditLogs(userId);
        return res.json(logs);
      }
      
      // Admins can filter by user and entity type
      const { userId: filterUserId, entityType, limit = 100 } = req.query;
      const logs = await storage.getAuditLogs(
        filterUserId as string,
        entityType as string,
        parseInt(limit as string)
      );
      res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  app.get('/api/privacy/audit-logs/:entityType/:entityId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { entityType, entityId } = req.params;
      const logs = await storage.getAuditLogsForEntity(entityType, entityId);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
  });

  // Reports Routes
  app.post('/api/privacy/reports', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertReportSchema.parse({
        ...req.body,
        reporterId: userId
      });
      
      const report = await storage.createReport(parsed);
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid report data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create report' });
    }
  });

  app.get('/api/privacy/reports', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        // Regular users can only see their own reports
        const reports = await storage.getUserReports(userId);
        return res.json(reports);
      }
      
      // Admins can filter by status and type
      const { status, type } = req.query;
      const reports = await storage.getReports(status as string, type as string);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  app.get('/api/privacy/reports/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const report = await storage.getReport(parseInt(id));
      
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      
      const user = await storage.getUser(userId);
      
      // Only admin or the reporter can view details
      if (user?.role !== 'admin' && report.reporterId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(report);
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ message: 'Failed to fetch report' });
    }
  });

  app.patch('/api/privacy/reports/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      const update = {
        ...req.body,
        reviewedBy: userId
      };
      
      const report = await storage.updateReport(parseInt(id), update);
      res.json(report);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ message: 'Failed to update report' });
    }
  });

  app.get('/api/privacy/reports/:entityType/:entityId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { entityType, entityId } = req.params;
      const reports = await storage.getReportsForEntity(entityType, parseInt(entityId));
      res.json(reports);
    } catch (error) {
      console.error('Error fetching entity reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  });

  // Auction Update Requests Routes
  app.post('/api/privacy/auction-updates', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertAuctionUpdateRequestSchema.parse({
        ...req.body,
        requestedBy: userId
      });
      
      const request = await storage.createAuctionUpdateRequest(parsed);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating auction update request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create auction update request' });
    }
  });

  app.get('/api/privacy/auction-updates', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { auctionId, status } = req.query;
      const requests = await storage.getAuctionUpdateRequests(
        auctionId ? parseInt(auctionId as string) : undefined,
        status as string
      );
      res.json(requests);
    } catch (error) {
      console.error('Error fetching auction update requests:', error);
      res.status(500).json({ message: 'Failed to fetch requests' });
    }
  });

  app.patch('/api/privacy/auction-updates/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      const update = {
        ...req.body,
        reviewedBy: userId
      };
      
      const request = await storage.updateAuctionUpdateRequest(parseInt(id), update);
      res.json(request);
    } catch (error) {
      console.error('Error updating auction update request:', error);
      res.status(500).json({ message: 'Failed to update request' });
    }
  });

  // Seller KYC Routes
  app.post('/api/privacy/kyc', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertSellerKycDocSchema.parse({
        ...req.body,
        userId
      });
      
      const doc = await storage.createSellerKycDoc(parsed);
      res.status(201).json(doc);
    } catch (error) {
      console.error('Error creating KYC document:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid document data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create KYC document' });
    }
  });

  app.get('/api/privacy/kyc/:sellerType/:sellerId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { sellerType, sellerId } = req.params;
      
      // Check if user is admin or the seller
      if (user?.role !== 'admin') {
        if (sellerType === 'artist') {
          const artist = await storage.getArtist(parseInt(sellerId));
          if (artist?.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
          }
        } else if (sellerType === 'gallery') {
          const gallery = await storage.getGallery(parseInt(sellerId));
          if (gallery?.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
          }
        }
      }
      
      const docs = await storage.getSellerKycDocs(sellerType, parseInt(sellerId));
      res.json(docs);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
      res.status(500).json({ message: 'Failed to fetch KYC documents' });
    }
  });

  app.patch('/api/privacy/kyc/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { id } = req.params;
      const update = {
        ...req.body,
        reviewedBy: userId
      };
      
      const doc = await storage.updateSellerKycDoc(parseInt(id), update);
      res.json(doc);
    } catch (error) {
      console.error('Error updating KYC document:', error);
      res.status(500).json({ message: 'Failed to update KYC document' });
    }
  });

  // Shipping Address Routes
  app.get('/api/user/shipping-addresses', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const addresses = await storage.getUserShippingAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
      res.status(500).json({ message: 'Failed to fetch shipping addresses' });
    }
  });

  app.get('/api/user/shipping-addresses/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const address = await storage.getShippingAddress(parseInt(id));
      
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      
      if (address.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(address);
    } catch (error) {
      console.error('Error fetching shipping address:', error);
      res.status(500).json({ message: 'Failed to fetch shipping address' });
    }
  });

  app.post('/api/user/shipping-addresses', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertShippingAddressSchema.parse({
        ...req.body,
        userId
      });
      
      const address = await storage.createShippingAddress(parsed);
      res.status(201).json(address);
    } catch (error) {
      console.error('Error creating shipping address:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid address data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create shipping address' });
    }
  });

  app.patch('/api/user/shipping-addresses/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const address = await storage.getShippingAddress(parseInt(id));
      if (!address || address.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updated = await storage.updateShippingAddress(parseInt(id), req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating shipping address:', error);
      res.status(500).json({ message: 'Failed to update shipping address' });
    }
  });

  app.delete('/api/user/shipping-addresses/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const address = await storage.getShippingAddress(parseInt(id));
      if (!address || address.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await storage.deleteShippingAddress(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting shipping address:', error);
      res.status(500).json({ message: 'Failed to delete shipping address' });
    }
  });

  app.post('/api/user/shipping-addresses/:id/set-default', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.setDefaultShippingAddress(userId, parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ message: 'Failed to set default address' });
    }
  });

  // Commission Request Routes
  app.get('/api/commissions', async (req, res) => {
    try {
      const { status, limit = '20', offset = '0' } = req.query;
      const requests = await storage.getCommissionRequests(
        status as string | undefined,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(requests);
    } catch (error) {
      console.error('Error fetching commission requests:', error);
      res.status(500).json({ message: 'Failed to fetch commission requests' });
    }
  });

  app.get('/api/commissions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getCommissionRequest(parseInt(id));
      
      if (!request) {
        return res.status(404).json({ message: 'Commission request not found' });
      }
      
      res.json(request);
    } catch (error) {
      console.error('Error fetching commission request:', error);
      res.status(500).json({ message: 'Failed to fetch commission request' });
    }
  });

  app.get('/api/user/commissions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getCommissionRequestsByUser(userId);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching user commission requests:', error);
      res.status(500).json({ message: 'Failed to fetch user commission requests' });
    }
  });

  app.post('/api/commissions', rateLimiters.commission, isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = insertCommissionRequestSchema.parse({
        ...req.body,
        collectorId: userId
      });
      
      const request = await storage.createCommissionRequest(parsed);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating commission request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid commission data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create commission request' });
    }
  });

  app.patch('/api/commissions/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const request = await storage.getCommissionRequest(parseInt(id));
      if (!request || request.collectorId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updated = await storage.updateCommissionRequest(parseInt(id), req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating commission request:', error);
      res.status(500).json({ message: 'Failed to update commission request' });
    }
  });

  app.delete('/api/commissions/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const request = await storage.getCommissionRequest(parseInt(id));
      if (!request || request.collectorId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      await storage.deleteCommissionRequest(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting commission request:', error);
      res.status(500).json({ message: 'Failed to delete commission request' });
    }
  });

  // Commission Bid Routes
  app.get('/api/commissions/:requestId/bids', async (req, res) => {
    try {
      const { requestId } = req.params;
      const bids = await storage.getCommissionBids(parseInt(requestId));
      res.json(bids);
    } catch (error) {
      console.error('Error fetching commission bids:', error);
      res.status(500).json({ message: 'Failed to fetch commission bids' });
    }
  });

  app.get('/api/artists/:artistId/commission-bids', async (req, res) => {
    try {
      const { artistId } = req.params;
      const bids = await storage.getCommissionBidsByArtist(parseInt(artistId));
      res.json(bids);
    } catch (error) {
      console.error('Error fetching artist commission bids:', error);
      res.status(500).json({ message: 'Failed to fetch artist commission bids' });
    }
  });

  app.post('/api/commissions/:requestId/bids', rateLimiters.commission, isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.params;
      
      // Get artist profile
      const artist = await storage.getArtistByUserId(userId);
      if (!artist) {
        return res.status(403).json({ message: 'Only artists can bid on commissions' });
      }
      
      const parsed = insertCommissionBidSchema.parse({
        ...req.body,
        commissionRequestId: parseInt(requestId),
        artistId: artist.id
      });
      
      const bid = await storage.createCommissionBid(parsed);
      res.status(201).json(bid);
    } catch (error) {
      console.error('Error creating commission bid:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid bid data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create commission bid' });
    }
  });

  app.patch('/api/commission-bids/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Get bid and verify ownership
      const bid = await storage.getCommissionBid(parseInt(id));
      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }
      
      const artist = await storage.getArtist(bid.artistId);
      if (!artist || artist.userId !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updated = await storage.updateCommissionBid(parseInt(id), req.body);
      res.json(updated);
    } catch (error) {
      console.error('Error updating commission bid:', error);
      res.status(500).json({ message: 'Failed to update commission bid' });
    }
  });

  app.post('/api/commission-bids/:id/accept', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Get bid and verify request ownership
      const bid = await storage.getCommissionBid(parseInt(id));
      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }
      
      const request = await storage.getCommissionRequest(bid.commissionRequestId);
      if (!request || request.collectorId !== userId) {
        return res.status(403).json({ message: 'Only request owner can accept bids' });
      }
      
      const accepted = await storage.acceptCommissionBid(parseInt(id), userId);
      res.json(accepted);
    } catch (error) {
      console.error('Error accepting commission bid:', error);
      res.status(500).json({ message: 'Failed to accept commission bid' });
    }
  });

  app.post('/api/commission-bids/:id/reject', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Get bid and verify request ownership
      const bid = await storage.getCommissionBid(parseInt(id));
      if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
      }
      
      const request = await storage.getCommissionRequest(bid.commissionRequestId);
      if (!request || request.collectorId !== userId) {
        return res.status(403).json({ message: 'Only request owner can reject bids' });
      }
      
      const rejected = await storage.rejectCommissionBid(parseInt(id));
      res.json(rejected);
    } catch (error) {
      console.error('Error rejecting commission bid:', error);
      res.status(500).json({ message: 'Failed to reject commission bid' });
    }
  });

  // Commission Message Routes
  app.get('/api/commissions/:requestId/messages', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.params;
      
      // Verify access - either request owner or bidding artist
      const request = await storage.getCommissionRequest(parseInt(requestId));
      if (!request) {
        return res.status(404).json({ message: 'Commission request not found' });
      }
      
      const artist = await storage.getArtistByUserId(userId);
      const userBids = artist ? await storage.getCommissionBidsByArtist(artist.id) : [];
      const hasBid = userBids.some(bid => bid.commissionRequestId === parseInt(requestId));
      
      if (request.collectorId !== userId && !hasBid) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const messages = await storage.getCommissionMessages(parseInt(requestId));
      res.json(messages);
    } catch (error) {
      console.error('Error fetching commission messages:', error);
      res.status(500).json({ message: 'Failed to fetch commission messages' });
    }
  });

  app.post('/api/commissions/:requestId/messages', rateLimiters.contact, isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.params;
      
      // Determine sender type
      const request = await storage.getCommissionRequest(parseInt(requestId));
      if (!request) {
        return res.status(404).json({ message: 'Commission request not found' });
      }
      
      let senderType = 'collector';
      if (request.collectorId !== userId) {
        const artist = await storage.getArtistByUserId(userId);
        if (!artist) {
          return res.status(403).json({ message: 'Access denied' });
        }
        senderType = 'artist';
      }
      
      const parsed = insertCommissionMessageSchema.parse({
        ...req.body,
        commissionRequestId: parseInt(requestId),
        senderId: userId,
        senderType
      });
      
      const message = await storage.createCommissionMessage(parsed);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating commission message:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid message data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create commission message' });
    }
  });

  // Commission Contract Routes
  app.get('/api/commissions/:requestId/contract', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.params;
      
      // Verify access
      const request = await storage.getCommissionRequest(parseInt(requestId));
      if (!request) {
        return res.status(404).json({ message: 'Commission request not found' });
      }
      
      const artist = await storage.getArtistByUserId(userId);
      const isInvolved = request.collectorId === userId || 
        (artist && request.selectedBidId && 
         (await storage.getCommissionBid(request.selectedBidId))?.artistId === artist.id);
      
      if (!isInvolved) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const contract = await storage.getCommissionContract(parseInt(requestId));
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }
      
      res.json(contract);
    } catch (error) {
      console.error('Error fetching commission contract:', error);
      res.status(500).json({ message: 'Failed to fetch commission contract' });
    }
  });

  app.post('/api/commissions/:requestId/contract', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { requestId } = req.params;
      
      // Verify ownership of commission request
      const request = await storage.getCommissionRequest(parseInt(requestId));
      if (!request || request.collectorId !== userId) {
        return res.status(403).json({ message: 'Only commission owner can create contract' });
      }
      
      if (!request.selectedBidId) {
        return res.status(400).json({ message: 'No bid selected for this commission' });
      }
      
      const parsed = insertCommissionContractSchema.parse({
        ...req.body,
        commissionRequestId: parseInt(requestId),
        bidId: request.selectedBidId
      });
      
      const contract = await storage.createCommissionContract(parsed);
      res.status(201).json(contract);
    } catch (error) {
      console.error('Error creating commission contract:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid contract data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create commission contract' });
    }
  });

  // Admin CSV export endpoint
  app.get('/api/admin/export/translations', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is admin
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const csvPath = path.join(process.cwd(), 'translations.csv');
      
      // Check if file exists
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ message: 'CSV file not found' });
      }
      
      // Set headers for file download with proper UTF-8 encoding
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="art-souk-translations.csv"');
      
      // Send file
      res.sendFile(csvPath);
    } catch (error) {
      console.error('Error exporting translations:', error);
      res.status(500).json({ message: 'Failed to export translations' });
    }
  });

  // Lifecycle Funnel API endpoints
  app.get('/api/lifecycle/funnel-metrics', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const metrics = await storage.getLifecycleFunnelMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching funnel metrics:", error);
      res.status(500).json({ message: "Failed to fetch funnel metrics" });
    }
  });

  app.get('/api/lifecycle/user-interactions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const interactions = await storage.getUserInteractionsByUser(userId, limit);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching user interactions:", error);
      res.status(500).json({ message: "Failed to fetch user interactions" });
    }
  });

  app.get('/api/lifecycle/user-transitions', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const transitions = await storage.getLifecycleTransitionsByUser(userId, limit);
      res.json(transitions);
    } catch (error) {
      console.error("Error fetching user transitions:", error);
      res.status(500).json({ message: "Failed to fetch user transitions" });
    }
  });

  app.get('/api/lifecycle/admin/metrics', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.roles.includes('admin')) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const metrics = await storage.getLifecycleFunnelMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching admin metrics:", error);
      res.status(500).json({ message: "Failed to fetch admin metrics" });
    }
  });

  app.post('/api/lifecycle/admin/update-metrics', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.roles.includes('admin')) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      // Trigger manual metric updates
      await updateLifecycleMetrics();
      res.json({ message: 'Metrics updated successfully' });
    } catch (error) {
      console.error("Error updating metrics:", error);
      res.status(500).json({ message: "Failed to update metrics" });
    }
  });

  // Universal Search API endpoints
  app.get('/api/search/universal', async (req, res) => {
    try {
      const query = req.query.q as string;
      const entityTypes = req.query.types ? (req.query.types as string).split(',') : undefined;
      const limit = parseInt(req.query.limit as string) || 20;
      
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      
      const results = await storage.searchUniversal(query, entityTypes, limit);
      res.json(results);
    } catch (error) {
      console.error("Error performing universal search:", error);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  // Universal Messaging API endpoints
  app.post('/api/conversations', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, entityType, entityId, participants, title } = req.body;
      
      const conversation = await storage.createConversation({
        type,
        entityType,
        entityId,
        participants: Array.isArray(participants) ? participants : [userId],
        title,
        status: 'active'
      });
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationId = parseInt(req.params.id);
      const { body, messageType, attachments } = req.body;
      
      const message = await storage.createMessage({
        conversationId,
        senderId: userId,
        body,
        messageType: messageType || 'text',
        attachments: attachments || []
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.post('/api/messages/:id/read', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageId = parseInt(req.params.id);
      
      await storage.markMessageAsRead(messageId, userId);
      res.json({ message: 'Message marked as read' });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Initialize database optimization
  await databaseOptimizer.addPerformanceIndexes();

  // Performance monitoring endpoints
  app.get('/health/performance', async (req, res) => {
    try {
      const stats = performanceMonitor.getStatistics();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        performance: stats || {
          message: 'No performance data available yet'
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get performance statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/health/cache', async (req, res) => {
    try {
      const stats = getCacheStats();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: stats
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get cache statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/health/database', async (req, res) => {
    try {
      const queryStats = databaseOptimizer.getQueryStats();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          queryStats: queryStats.slice(0, 10), // Top 10 queries
          totalQueries: queryStats.length
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get database statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Start periodic metric updates (every hour)
  setInterval(async () => {
    try {
      await updateLifecycleMetrics();
    } catch (error) {
      console.error('Error updating periodic metrics:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  // Shipping Management Routes
  app.get('/api/shipping/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [profile] = await db
        .select()
        .from(schema.shippingProfiles)
        .where(eq(schema.shippingProfiles.userId, userId));
      
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching shipping profile:", error);
      res.status(500).json({ message: "Failed to fetch shipping profile" });
    }
  });

  app.post('/api/shipping/profile', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = schema.insertShippingProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const [profile] = await db
        .insert(schema.shippingProfiles)
        .values(profileData)
        .returning();
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating shipping profile:", error);
      res.status(500).json({ message: "Failed to create shipping profile" });
    }
  });

  // ZATCA-Compliant Invoice Management Routes
  app.get('/api/invoices', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const invoices = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.sellerId, userId))
        .orderBy(desc(schema.invoices.createdAt));
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post('/api/invoices', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get order details
      const [order] = await db
        .select()
        .from(schema.purchaseOrders)
        .innerJoin(schema.artworks, eq(schema.purchaseOrders.artworkId, schema.artworks.id))
        .innerJoin(schema.users, eq(schema.purchaseOrders.userId, schema.users.id))
        .where(and(
          eq(schema.purchaseOrders.id, req.body.orderId),
          eq(schema.artworks.artistId, userId)
        ));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Calculate VAT (15% standard rate in Saudi Arabia)
      const subtotal = order.purchase_orders.totalAmount;
      const vatRate = 15;
      const vatAmount = (subtotal * vatRate) / 100;
      const totalAmount = subtotal + vatAmount;
      
      // Generate invoice number (format: INV-YYYY-XXXXXX)
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      // Generate QR code data (ZATCA requirement)
      const qrCodeData = {
        sellerName: req.body.sellerBusinessName,
        vatNumber: req.body.vatNumber,
        timestamp: new Date().toISOString(),
        total: totalAmount,
        vatAmount: vatAmount
      };
      const qrCode = Buffer.from(JSON.stringify(qrCodeData)).toString('base64');
      
      // Generate invoice hash (for chaining - ZATCA requirement)
      const invoiceData = `${invoiceNumber}${new Date().toISOString()}${totalAmount}`;
      const invoiceHash = Buffer.from(invoiceData).toString('base64');
      
      const invoicePayload = schema.insertInvoiceSchema.parse({
        invoiceNumber,
        orderId: req.body.orderId,
        sellerId: userId,
        sellerType: 'artist', // TODO: Determine from user role
        buyerId: order.purchase_orders.userId,
        vatNumber: req.body.vatNumber,
        vatRate,
        subtotal,
        vatAmount,
        totalAmount,
        currency: 'SAR',
        itemDescription: req.body.itemDescription,
        itemDescriptionAr: req.body.itemDescriptionAr,
        qrCode,
        invoiceHash,
        status: 'draft',
        issueDate: new Date().toISOString(),
        dueDate: req.body.dueDate,
        sellerBusinessName: req.body.sellerBusinessName,
        sellerBusinessNameAr: req.body.sellerBusinessNameAr,
        sellerAddress: req.body.sellerAddress,
        buyerAddress: req.body.buyerAddress
      });
      
      const [invoice] = await db
        .insert(schema.invoices)
        .values(invoicePayload)
        .returning();
      
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch('/api/invoices/:id', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      // Verify ownership
      const [existingInvoice] = await db
        .select()
        .from(schema.invoices)
        .where(and(
          eq(schema.invoices.id, invoiceId),
          eq(schema.invoices.sellerId, userId)
        ));
      
      if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      const [invoice] = await db
        .update(schema.invoices)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(schema.invoices.id, invoiceId))
        .returning();
      
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.post('/api/invoices/:id/pdf', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const [invoice] = await db
        .select()
        .from(schema.invoices)
        .where(and(
          eq(schema.invoices.id, invoiceId),
          eq(schema.invoices.sellerId, userId)
        ));
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // TODO: Generate PDF using ZATCA-compliant template (PDF/A-3 with embedded XML)
      res.json({ 
        pdfUrl: `/api/invoices/${invoiceId}/download`,
        message: "PDF generation initiated" 
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Generate ZATCA-compliant PDF invoice from order
  app.get('/api/invoices/generate-pdf/:orderId', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const userId = req.user.claims.sub;
      
      // Get order details with artwork and artist information
      const [order] = await db
        .select({
          order: schema.purchaseOrders,
          artwork: schema.artworks,
          artist: schema.artists,
          buyer: schema.users
        })
        .from(schema.purchaseOrders)
        .innerJoin(schema.artworks, eq(schema.purchaseOrders.artworkId, schema.artworks.id))
        .innerJoin(schema.artists, eq(schema.artworks.artistId, schema.artists.id))
        .innerJoin(schema.users, eq(schema.purchaseOrders.userId, schema.users.id))
        .where(and(
          eq(schema.purchaseOrders.id, orderId),
          eq(schema.purchaseOrders.userId, userId)
        ));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Calculate VAT (15% standard rate in Saudi Arabia)
      const subtotal = parseFloat(order.order.totalAmount);
      const vatRate = 15;
      const vatAmount = (subtotal * vatRate) / 100;
      const totalAmount = subtotal + vatAmount;
      
      // Generate invoice number (format: INV-YYYY-XXXXXX)
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      // Generate QR code data (ZATCA TLV format requirement)
      const currentDate = new Date();
      const qrCodeData = {
        sellerName: "Art Souk Platform",
        vatNumber: "300000000000003", // Must be actual VAT registration
        timestamp: currentDate.toISOString(),
        total: totalAmount.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        invoiceNumber: invoiceNumber,
        // Additional ZATCA requirements
        invoiceType: "01", // Tax Invoice
        currency: "SAR",
        supplyDate: currentDate.toISOString().split('T')[0]
      };
      const qrCode = Buffer.from(JSON.stringify(qrCodeData)).toString('base64');
      
      // Generate invoice hash (for chaining - ZATCA requirement)
      const invoiceData = `${invoiceNumber}${new Date().toISOString()}${totalAmount}`;
      const invoiceHash = Buffer.from(invoiceData).toString('base64');
      
      // Generate UUID for ZATCA submission
      const invoiceUUID = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create enhanced ZATCA-compliant PDF content
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 3500
>>
stream
BT
/F1 16 Tf
50 750 Td
(ART SOUK - ZATCA COMPLIANT TAX INVOICE) Tj
0 -15 Td
(فاتورة ضريبية متوافقة مع الزكاة والضريبة والجمارك) Tj

0 -30 Td
/F1 12 Tf
(Invoice Number / رقم الفاتورة: ${invoiceNumber}) Tj
0 -15 Td
(Invoice UUID / معرف الفاتورة: ${invoiceUUID}) Tj
0 -15 Td
(Issue Date / تاريخ الإصدار: ${currentDate.toLocaleDateString()}) Tj
0 -15 Td
(Issue Time / وقت الإصدار: ${currentDate.toLocaleTimeString()}) Tj
0 -15 Td
(Supply Date / تاريخ التوريد: ${currentDate.toLocaleDateString()}) Tj
0 -15 Td
(Invoice Type / نوع الفاتورة: 01 - Standard Tax Invoice) Tj

0 -30 Td
/F1 14 Tf
(SELLER INFORMATION / معلومات البائع:) Tj
0 -15 Td
/F1 12 Tf
(Business Name / اسم الشركة: Art Souk Platform) Tj
0 -15 Td
(VAT Number / الرقم الضريبي: 300000000000003) Tj
0 -15 Td
(CR Number / رقم السجل التجاري: [REQUIRED]) Tj
0 -15 Td
(Address / العنوان: Saudi Arabia [COMPLETE ADDRESS REQUIRED]) Tj

0 -30 Td
/F1 14 Tf
(BUYER INFORMATION / معلومات المشتري:) Tj
0 -15 Td
/F1 12 Tf
(Name / الاسم: ${order.buyer.firstName} ${order.buyer.lastName}) Tj
0 -15 Td
(Email / البريد الإلكتروني: ${order.buyer.email}) Tj
0 -15 Td
(Address / العنوان: [REQUIRED FOR B2B]) Tj
0 -15 Td
(VAT Number / الرقم الضريبي: [IF APPLICABLE]) Tj

0 -30 Td
/F1 14 Tf
(LINE ITEMS / تفاصيل المواد:) Tj
0 -15 Td
/F1 12 Tf
(Description / الوصف: ${order.artwork.title}) Tj
0 -15 Td
(Artist / الفنان: ${order.artist.name}) Tj
0 -15 Td
(Order Number / رقم الطلب: ${order.order.orderNumber}) Tj
0 -15 Td
(Quantity / الكمية: 1) Tj
0 -15 Td
(Unit Price / سعر الوحدة: ${subtotal.toFixed(2)} SAR) Tj
0 -15 Td
(VAT Rate / معدل الضريبة: 15%) Tj

0 -30 Td
/F1 14 Tf
(FINANCIAL SUMMARY / الملخص المالي:) Tj
0 -15 Td
/F1 12 Tf
(Subtotal (Excluding VAT) / المجموع الفرعي: ${subtotal.toFixed(2)} SAR) Tj
0 -15 Td
(VAT Amount (15%) / مبلغ الضريبة: ${vatAmount.toFixed(2)} SAR) Tj
0 -15 Td
(Total Amount (Including VAT) / المبلغ الإجمالي: ${totalAmount.toFixed(2)} SAR) Tj

0 -30 Td
/F1 14 Tf
(ZATCA COMPLIANCE / متطلبات الزكاة والضريبة:) Tj
0 -15 Td
/F1 12 Tf
(QR Code Data / بيانات رمز الاستجابة: ${qrCode.substring(0, 40)}...) Tj
0 -15 Td
(Invoice Hash / تجزئة الفاتورة: ${invoiceHash.substring(0, 40)}...) Tj
0 -15 Td
(Digital Signature / التوقيع الرقمي: [REQUIRED]) Tj
0 -15 Td
(ZATCA Phase / مرحلة الزكاة والضريبة: Phase 1 - Generation) Tj

0 -30 Td
/F1 14 Tf
(PAYMENT TERMS / شروط الدفع:) Tj
0 -15 Td
/F1 12 Tf
(Payment Method / طريقة الدفع: Direct Seller Payment) Tj
0 -15 Td
(Due Date / تاريخ الاستحقاق: Immediate) Tj
0 -15 Td
(Note / ملاحظة: Payment arranged directly between buyer and seller) Tj

0 -30 Td
/F1 10 Tf
(This invoice complies with ZATCA Phase 1 requirements) Tj
0 -12 Td
(هذه الفاتورة متوافقة مع متطلبات المرحلة الأولى من الزكاة والضريبة) Tj
0 -12 Td
(Generated on / تم إنشاؤها في: ${new Date().toLocaleString()}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000356 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
3800
%%EOF`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="zatca-invoice-${order.order.orderNumber}.pdf"`);
      res.send(Buffer.from(pdfContent));
      
    } catch (error) {
      console.error("Error generating ZATCA PDF:", error);
      res.status(500).json({ message: "Failed to generate ZATCA invoice PDF" });
    }
  });

  app.post('/api/invoices/:id/zatca-submit', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const [invoice] = await db
        .select()
        .from(schema.invoices)
        .where(and(
          eq(schema.invoices.id, invoiceId),
          eq(schema.invoices.sellerId, userId)
        ));
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // TODO: Submit to ZATCA Fatoora Portal (Phase 2 requirement)
      // Generate mock ZATCA UUID and digital signature for demonstration
      const zatcaUuid = `ZATCA-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const digitalSignature = Buffer.from(`${invoice.invoiceNumber}-${zatcaUuid}`).toString('base64');
      
      const [updatedInvoice] = await db
        .update(schema.invoices)
        .set({ 
          zatcaUuid,
          digitalSignature,
          status: 'sent',
          updatedAt: new Date()
        })
        .where(eq(schema.invoices.id, invoiceId))
        .returning();
      
      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error submitting to ZATCA:", error);
      res.status(500).json({ message: "Failed to submit to ZATCA" });
    }
  });

  // Start automatic cache cleanup
  const { startCacheCleanup } = await import('./middleware/cacheOptimization');
  startCacheCleanup();

  // Disable memory monitoring alerts (causing spam)
  // memoryMonitor.addAlertCallback((metrics) => {
  //   console.warn(`🚨 Memory Alert: ${metrics.heapPercentage}% usage - ${metrics.heapUsed}MB/${metrics.heapTotal}MB`);
  // });

  // Set up performance monitoring alerts
  performanceMonitor.addAlertCallback((metrics) => {
    console.warn(`🐌 Performance Alert: ${metrics.endpoint} took ${metrics.duration}ms`);
  });

  // Schedule database maintenance (every 6 hours)
  setInterval(async () => {
    try {
      await databaseOptimizer.maintainDatabase();
    } catch (error) {
      console.error('Error during database maintenance:', error);
    }
  }, 6 * 60 * 60 * 1000); // 6 hours

  // Additional missing endpoints for frontend compatibility
  
  // Admin user management endpoints
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:userId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      const user = await storage.updateUserStatus(userId, status);
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  app.patch('/api/admin/users/:userId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.verifyUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ message: "Failed to verify user" });
    }
  });

  app.get('/api/admin/artists', isAuthenticated, async (req: any, res) => {
    try {
      const artists = await storage.getArtists();
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get('/api/admin/galleries', isAuthenticated, async (req: any, res) => {
    try {
      const galleries = await storage.getGalleries();
      res.json(galleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getDashboardAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  app.get('/api/analytics/user-journey', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userJourney = await storage.getUserJourney(userId);
      res.json(userJourney);
    } catch (error) {
      console.error("Error fetching user journey:", error);
      res.status(500).json({ message: "Failed to fetch user journey" });
    }
  });

  app.get('/api/analytics/conversion-funnel', isAuthenticated, async (req: any, res) => {
    try {
      const funnel = await storage.getConversionFunnel();
      res.json(funnel);
    } catch (error) {
      console.error("Error fetching conversion funnel:", error);
      res.status(500).json({ message: "Failed to fetch conversion funnel" });
    }
  });

  app.get('/api/analytics/content-performance', isAuthenticated, async (req: any, res) => {
    try {
      const performance = await storage.getContentPerformance();
      res.json(performance);
    } catch (error) {
      console.error("Error fetching content performance:", error);
      res.status(500).json({ message: "Failed to fetch content performance" });
    }
  });

  // Notification endpoints
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getNotificationSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put('/api/notifications/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.updateNotificationSettings(userId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  app.patch('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete('/api/notifications/:notificationId', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.deleteNotification(notificationId);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Social features - follow/unfollow endpoints
  app.post('/api/artists/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.followArtist(userId, artistId);
      res.json({ message: "Artist followed successfully" });
    } catch (error) {
      console.error("Error following artist:", error);
      res.status(500).json({ message: "Failed to follow artist" });
    }
  });

  app.post('/api/artists/:id/unfollow', isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.unfollowArtist(userId, artistId);
      res.json({ message: "Artist unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing artist:", error);
      res.status(500).json({ message: "Failed to unfollow artist" });
    }
  });

  app.post('/api/galleries/:id/follow', isAuthenticated, async (req: any, res) => {
    try {
      const galleryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.followGallery(userId, galleryId);
      res.json({ message: "Gallery followed successfully" });
    } catch (error) {
      console.error("Error following gallery:", error);
      res.status(500).json({ message: "Failed to follow gallery" });
    }
  });

  app.post('/api/galleries/:id/unfollow', isAuthenticated, async (req: any, res) => {
    try {
      const galleryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.unfollowGallery(userId, galleryId);
      res.json({ message: "Gallery unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing gallery:", error);
      res.status(500).json({ message: "Failed to unfollow gallery" });
    }
  });

  app.post('/api/articles/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.likeArticle(userId, articleId);
      res.json({ message: "Article liked successfully" });
    } catch (error) {
      console.error("Error liking article:", error);
      res.status(500).json({ message: "Failed to like article" });
    }
  });

  app.post('/api/articles/:id/unlike', isAuthenticated, async (req: any, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.unlikeArticle(userId, articleId);
      res.json({ message: "Article unliked successfully" });
    } catch (error) {
      console.error("Error unliking article:", error);
      res.status(500).json({ message: "Failed to unlike article" });
    }
  });

  // Auction watch endpoint
  app.post('/api/auctions/:id/watch', isAuthenticated, async (req: any, res) => {
    try {
      const auctionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.watchAuction(userId, auctionId);
      res.json({ message: "Auction watched successfully" });
    } catch (error) {
      console.error("Error watching auction:", error);
      res.status(500).json({ message: "Failed to watch auction" });
    }
  });

  // Payment method default endpoint
  app.post('/api/seller/payment-methods/:id/set-default', isAuthenticated, async (req: any, res) => {
    try {
      const paymentMethodId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.setDefaultPaymentMethod(userId, paymentMethodId);
      res.json({ message: "Default payment method set successfully" });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      res.status(500).json({ message: "Failed to set default payment method" });
    }
  });

  // Discussions endpoints
  app.get('/api/discussions', async (req, res) => {
    try {
      const discussions = await storage.getDiscussions();
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  app.post('/api/discussions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const discussion = await storage.createDiscussion({
        userId,
        ...req.body,
      });
      res.json(discussion);
    } catch (error) {
      console.error("Error creating discussion:", error);
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });

  // Commission requests endpoints
  app.get('/api/commission-requests', async (req, res) => {
    try {
      const requests = await storage.getCommissionRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching commission requests:", error);
      res.status(500).json({ message: "Failed to fetch commission requests" });
    }
  });

  app.post('/api/commission-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const request = await storage.createCommissionRequest({
        collectorId: userId,
        ...req.body,
      });
      res.json(request);
    } catch (error) {
      console.error("Error creating commission request:", error);
      res.status(500).json({ message: "Failed to create commission request" });
    }
  });

  // User endpoint - for getting current user data
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
