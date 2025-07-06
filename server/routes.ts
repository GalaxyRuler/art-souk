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
  insertArticleSchema,
  insertInquirySchema,
  insertFavoriteSchema
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

  app.get('/api/articles/featured', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const articles = await storage.getFeaturedArticles(limit);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching featured articles:", error);
      res.status(500).json({ message: "Failed to fetch featured articles" });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post('/api/articles', isAuthenticated, async (req: any, res) => {
    try {
      const articleData = insertArticleSchema.parse({
        ...req.body,
        authorId: req.user.claims.sub
      });
      const article = await storage.createArticle(articleData);
      res.json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
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



  const httpServer = createServer(app);
  return httpServer;
}
