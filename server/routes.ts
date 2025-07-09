import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertArtistSchema, 
  insertGallerySchema, 
  insertArtworkSchema, 
  insertAuctionSchema,
  insertBidSchema,
  insertCollectionSchema,
  insertWorkshopSchema,
  insertWorkshopRegistrationSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertDiscussionSchema,
  insertDiscussionReplySchema,
  insertInquirySchema,
  insertFavoriteSchema,
  insertFollowSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertUserProfileSchema
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin setup endpoint - can be called once to make first user admin
  app.post('/api/admin/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allUsers = await storage.getAllUsers();
      
      // Check if there are any admins already
      const hasAdmin = allUsers.some(user => user.role === 'admin');
      
      if (hasAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }
      
      // Make this user an admin
      const adminUser = await storage.updateUserRole(userId, 'admin');
      res.json({ message: "Admin user created successfully", user: adminUser });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });

  // Admin stats endpoint
  app.get('/api/admin/stats', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const stats = {
        totalUsers: await storage.getUserCount(),
        totalArtists: await storage.getArtistCount(),
        totalGalleries: await storage.getGalleryCount(),
        totalArtworks: await storage.getArtworkCount(),
        totalAuctions: await storage.getAuctionCount(),
        totalArticles: await storage.getArticleCount(),
        totalInquiries: await storage.getInquiryCount(),
        totalFavorites: await storage.getFavoriteCount(),
        recentUsers: 0,
        recentArtworks: 0,
        liveAuctions: 0,
        featuredArtworks: 0,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Admin users endpoint
  app.get('/api/admin/users', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin artists endpoint
  app.get('/api/admin/artists', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const artists = await storage.getArtists(100, 0);
      res.json(artists);
    } catch (error) {
      console.error("Error fetching artists:", error);
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  // Admin galleries endpoint
  app.get('/api/admin/galleries', isAuthenticated, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const galleries = await storage.getGalleries(100, 0);
      res.json(galleries);
    } catch (error) {
      console.error("Error fetching galleries:", error);
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  });

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

  app.post('/api/galleries', isAuthenticated, async (req, res) => {
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

  app.get('/api/artworks/featured', async (req, res) => {
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
  app.get('/api/search', async (req, res) => {
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

  app.post('/api/artworks', isAuthenticated, async (req: any, res) => {
    try {
      const artworkData = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(artworkData);
      res.json(artwork);
    } catch (error) {
      console.error("Error creating artwork:", error);
      res.status(500).json({ message: "Failed to create artwork" });
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

  app.get('/api/auctions/live', async (req, res) => {
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

  app.post('/api/auctions', isAuthenticated, async (req, res) => {
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

  app.post('/api/auctions/:id/bids', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/workshops', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/inquiries', async (req: any, res) => {
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
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
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

  const httpServer = createServer(app);
  return httpServer;
}
