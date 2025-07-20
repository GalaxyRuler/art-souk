import { Router } from "express";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, desc, and, or, count } from "drizzle-orm";
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

// Gallery sends representation request to artist
router.post("/send", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;
    const {
      artistId,
      exclusivity,
      proposedStartDate,
      proposedEndDate,
      commissionRate,
      terms,
      termsAr,
      message,
      messageAr
    } = req.body;

    // Check if user owns a gallery
    const gallery = await db
      .select()
      .from(schema.galleries)
      .where(eq(schema.galleries.userId, userId))
      .limit(1);

    if (gallery.length === 0) {
      return res.status(403).json({ error: "Only galleries can send representation requests" });
    }

    // Check if there's already a pending request
    const existingRequest = await db
      .select()
      .from(schema.representationRequests)
      .where(and(
        eq(schema.representationRequests.galleryId, gallery[0].id),
        eq(schema.representationRequests.artistId, artistId),
        eq(schema.representationRequests.status, "pending")
      ))
      .limit(1);

    if (existingRequest.length > 0) {
      return res.status(400).json({ error: "Pending request already exists for this artist" });
    }

    // Check if artist is already represented by this gallery
    const existingRepresentation = await db
      .select()
      .from(schema.artistGalleries)
      .where(and(
        eq(schema.artistGalleries.artistId, artistId),
        eq(schema.artistGalleries.galleryId, gallery[0].id)
      ))
      .limit(1);

    if (existingRepresentation.length > 0) {
      return res.status(400).json({ error: "Artist is already represented by this gallery" });
    }

    const newRequest = await db
      .insert(schema.representationRequests)
      .values({
        galleryId: gallery[0].id,
        artistId,
        exclusivity,
        proposedStartDate,
        proposedEndDate,
        commissionRate,
        terms,
        termsAr,
        message,
        messageAr
      })
      .returning();

    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error("Error sending representation request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all requests for a gallery (sent by gallery)
router.get("/gallery/sent", isAuthenticated, rateLimiters.standard, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;

    // Get gallery ID for user
    const gallery = await db
      .select()
      .from(schema.galleries)
      .where(eq(schema.galleries.userId, userId))
      .limit(1);

    if (gallery.length === 0) {
      return res.status(403).json({ error: "User is not a gallery" });
    }

    const requests = await db
      .select({
        id: schema.representationRequests.id,
        artistId: schema.representationRequests.artistId,
        status: schema.representationRequests.status,
        exclusivity: schema.representationRequests.exclusivity,
        proposedStartDate: schema.representationRequests.proposedStartDate,
        proposedEndDate: schema.representationRequests.proposedEndDate,
        commissionRate: schema.representationRequests.commissionRate,
        terms: schema.representationRequests.terms,
        message: schema.representationRequests.message,
        artistResponse: schema.representationRequests.artistResponse,
        respondedAt: schema.representationRequests.respondedAt,
        createdAt: schema.representationRequests.createdAt,
        artistName: schema.artists.name,
        artistImage: schema.artists.profileImage
      })
      .from(schema.representationRequests)
      .leftJoin(schema.artists, eq(schema.representationRequests.artistId, schema.artists.id))
      .where(eq(schema.representationRequests.galleryId, gallery[0].id))
      .orderBy(desc(schema.representationRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching gallery requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all requests for an artist (received by artist)
router.get("/artist/received", isAuthenticated, rateLimiters.standard, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;

    // Get artist ID for user
    const artist = await db
      .select()
      .from(schema.artists)
      .where(eq(schema.artists.userId, userId))
      .limit(1);

    if (artist.length === 0) {
      return res.status(403).json({ error: "User is not an artist" });
    }

    const requests = await db
      .select({
        id: schema.representationRequests.id,
        galleryId: schema.representationRequests.galleryId,
        status: schema.representationRequests.status,
        exclusivity: schema.representationRequests.exclusivity,
        proposedStartDate: schema.representationRequests.proposedStartDate,
        proposedEndDate: schema.representationRequests.proposedEndDate,
        commissionRate: schema.representationRequests.commissionRate,
        terms: schema.representationRequests.terms,
        message: schema.representationRequests.message,
        artistResponse: schema.representationRequests.artistResponse,
        respondedAt: schema.representationRequests.respondedAt,
        createdAt: schema.representationRequests.createdAt,
        galleryName: schema.galleries.name,
        galleryImage: schema.galleries.profileImage,
        galleryLocation: schema.galleries.location
      })
      .from(schema.representationRequests)
      .leftJoin(schema.galleries, eq(schema.representationRequests.galleryId, schema.galleries.id))
      .where(eq(schema.representationRequests.artistId, artist[0].id))
      .orderBy(desc(schema.representationRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error("Error fetching artist requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Artist responds to representation request
router.patch("/:id/respond", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;
    const requestId = parseInt(req.params.id);
    const { status, artistResponse, artistResponseAr, artistCounterTerms } = req.body;

    // Validate status
    if (!["approved", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'declined'" });
    }

    // Get artist ID for user
    const artist = await db
      .select()
      .from(schema.artists)
      .where(eq(schema.artists.userId, userId))
      .limit(1);

    if (artist.length === 0) {
      return res.status(403).json({ error: "User is not an artist" });
    }

    // Get the request and verify ownership
    const request = await db
      .select()
      .from(schema.representationRequests)
      .where(and(
        eq(schema.representationRequests.id, requestId),
        eq(schema.representationRequests.artistId, artist[0].id),
        eq(schema.representationRequests.status, "pending")
      ))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: "Request not found or already responded to" });
    }

    // Update the request
    const updatedRequest = await db
      .update(schema.representationRequests)
      .set({
        status,
        artistResponse,
        artistResponseAr,
        artistCounterTerms,
        respondedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.representationRequests.id, requestId))
      .returning();

    // If approved, create the artist-gallery relationship
    if (status === "approved") {
      await db
        .insert(schema.artistGalleries)
        .values({
          artistId: artist[0].id,
          galleryId: request[0].galleryId,
          exclusivity: request[0].exclusivity,
          startDate: request[0].proposedStartDate,
          endDate: request[0].proposedEndDate,
          contractDetails: artistCounterTerms || request[0].terms
        });
    }

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error responding to representation request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Gallery withdraws a pending request
router.patch("/:id/withdraw", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;
    const requestId = parseInt(req.params.id);

    // Get gallery ID for user
    const gallery = await db
      .select()
      .from(schema.galleries)
      .where(eq(schema.galleries.userId, userId))
      .limit(1);

    if (gallery.length === 0) {
      return res.status(403).json({ error: "User is not a gallery" });
    }

    // Get the request and verify ownership
    const request = await db
      .select()
      .from(schema.representationRequests)
      .where(and(
        eq(schema.representationRequests.id, requestId),
        eq(schema.representationRequests.galleryId, gallery[0].id),
        eq(schema.representationRequests.status, "pending")
      ))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: "Request not found or cannot be withdrawn" });
    }

    const updatedRequest = await db
      .update(schema.representationRequests)
      .set({
        status: "withdrawn",
        updatedAt: new Date()
      })
      .where(eq(schema.representationRequests.id, requestId))
      .returning();

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error("Error withdrawing representation request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get pending requests count for artist dashboard
router.get("/artist/pending-count", isAuthenticated, rateLimiters.standard, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;

    const artist = await db
      .select()
      .from(schema.artists)
      .where(eq(schema.artists.userId, userId))
      .limit(1);

    if (artist.length === 0) {
      return res.json({ count: 0 });
    }

    const result = await db
      .select({ count: count() })
      .from(schema.representationRequests)
      .where(and(
        eq(schema.representationRequests.artistId, artist[0].id),
        eq(schema.representationRequests.status, "pending")
      ));

    res.json({ count: result[0]?.count || 0 });
  } catch (error) {
    console.error("Error fetching pending requests count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as representationRequestsRouter };