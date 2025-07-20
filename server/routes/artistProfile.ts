import { Router } from "express";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
// For now, use a simple rate limiting middleware placeholder
const rateLimiters = {
  standard: (req: any, res: any, next: any) => next(),
  strict: (req: any, res: any, next: any) => next()
};

const router = Router();

// Extend Express Request interface to include user with claims
interface AuthenticatedRequest extends Express.Request {
  user: {
    claims: {
      sub: string;
    };
  };
}

// Artist followers management
router.get("/:id/followers", rateLimiters.standard, async (req, res) => {
  try {
    const artistId = parseInt(req.params.id);
    
    // Get follower count first
    const followerCount = await db
      .select({ count: count() })
      .from(schema.followers)
      .where(eq(schema.followers.artistId, artistId));

    // Get followers list with user details
    const followersList = await db
      .select({
        id: schema.followers.id,
        userId: schema.followers.followerId,
        followedAt: schema.followers.createdAt,
        userName: schema.users.firstName,
        userEmail: schema.users.email
      })
      .from(schema.followers)
      .leftJoin(schema.users, eq(schema.followers.followerId, schema.users.id))
      .where(eq(schema.followers.artistId, artistId))
      .orderBy(desc(schema.followers.createdAt));

    res.json({
      followers: followersList || [],
      totalCount: followerCount[0]?.count || 0
    });
  } catch (error) {
    console.error("Error fetching artist followers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/follow", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const artistId = parseInt(req.params.id);
    const userId = (req as AuthenticatedRequest).user.claims.sub;

    // Check if already following
    const existingFollow = await db
      .select()
      .from(schema.followers)
      .where(and(eq(schema.followers.artistId, artistId), eq(schema.followers.userId, userId)))
      .limit(1);

    if (existingFollow.length > 0) {
      return res.status(400).json({ error: "Already following this artist" });
    }

    const newFollow = await db
      .insert(schema.followers)
      .values({ artistId, userId })
      .returning();

    res.status(201).json(newFollow[0]);
  } catch (error) {
    console.error("Error following artist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id/follow", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const artistId = parseInt(req.params.id);
    const userId = (req as AuthenticatedRequest).user.claims.sub;

    const deleted = await db
      .delete(schema.followers)
      .where(and(eq(schema.followers.artistId, artistId), eq(schema.followers.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Follow relationship not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error unfollowing artist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Artist auction results
router.get("/:id/auction-results", rateLimiters.standard, async (req, res) => {
  try {
    const artistId = parseInt(req.params.id);
    const results = await db
      .select({
        id: schema.auctionResults.id,
        artworkId: schema.auctionResults.artworkId,
        auctionDate: schema.auctionResults.auctionDate,
        hammerPrice: schema.auctionResults.hammerPrice,
        estimateLow: schema.auctionResults.estimateLow,
        estimateHigh: schema.auctionResults.estimateHigh,
        auctionHouse: schema.auctionResults.auctionHouse,
        lotNumber: schema.auctionResults.lotNumber,
        provenance: schema.auctionResults.provenance,
        artworkTitle: schema.artworks.title,
        artworkMedium: schema.artworks.medium
      })
      .from(schema.auctionResults)
      .leftJoin(schema.artworks, eq(schema.auctionResults.artworkId, schema.artworks.id))
      .where(eq(schema.auctionResults.artistId, artistId))
      .orderBy(desc(schema.auctionResults.auctionDate));

    res.json(results);
  } catch (error) {
    console.error("Error fetching auction results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Artist exhibition history
router.get("/:id/shows", rateLimiters.standard, async (req, res) => {
  try {
    const artistId = parseInt(req.params.id);
    const shows = await db
      .select()
      .from(schema.shows)
      .where(eq(schema.shows.artistId, artistId))
      .orderBy(desc(schema.shows.startDate));

    res.json(shows);
  } catch (error) {
    console.error("Error fetching artist shows:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Artist gallery relationships
router.get("/:id/galleries", rateLimiters.standard, async (req, res) => {
  try {
    const artistId = parseInt(req.params.id);
    const relationships = await db
      .select({
        id: schema.artistGalleries.id,
        galleryId: schema.artistGalleries.galleryId,
        exclusivity: schema.artistGalleries.exclusivity,
        startDate: schema.artistGalleries.startDate,
        endDate: schema.artistGalleries.endDate,
        contractDetails: schema.artistGalleries.contractDetails,
        galleryName: schema.galleries.name,
        galleryLocation: schema.galleries.location,
        galleryWebsite: schema.galleries.website
      })
      .from(schema.artistGalleries)
      .leftJoin(schema.galleries, eq(schema.artistGalleries.galleryId, schema.galleries.id))
      .where(eq(schema.artistGalleries.artistId, artistId))
      .orderBy(desc(schema.artistGalleries.startDate));

    res.json(relationships);
  } catch (error) {
    console.error("Error fetching artist gallery relationships:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as artistProfileRouter };