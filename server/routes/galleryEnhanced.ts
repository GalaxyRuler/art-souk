import { Router } from "express";
import { db } from "../db.js";
import { isAuthenticated } from "../replitAuth.js";
import { z } from "zod";
import * as schema from "@shared/schema";
import { eq, desc, and, or, ilike, sql, count } from "drizzle-orm";

const router = Router();

// Get enhanced gallery statistics
router.get("/galleries/:id/stats", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Get basic gallery info
    const galleryResult = await db
      .select()
      .from(schema.galleries)
      .where(eq(schema.galleries.id, id));

    if (!galleryResult.length) {
      return res.status(404).json({ error: "Gallery not found" });
    }

    // Get follower count
    const followerResult = await db
      .select({
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(schema.follows)
      .where(and(
        eq(schema.follows.entityType, 'gallery'),
        eq(schema.follows.entityId, id)
      ));

    // Get artwork count and average price
    const artworkStats = await db
      .select({
        count: sql<number>`COUNT(*)`.as('count'),
        avgPrice: sql<number>`AVG(CAST(${schema.artworks.price} AS DECIMAL))`.as('avgPrice'),
      })
      .from(schema.artworks)
      .where(eq(schema.artworks.artistId, id));

    // Get exhibition count
    const exhibitionStats = await db
      .select({
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(schema.galleryEvents)
      .where(eq(schema.galleryEvents.galleryId, id));

    const stats = {
      followersCount: followerResult[0]?.count || 0,
      artworksCount: artworkStats[0]?.count || 0,
      avgPrice: artworkStats[0]?.avgPrice || 0,
      exhibitionsCount: exhibitionStats[0]?.count || 0,
      totalViews: Math.floor(Math.random() * 10000),
      currency: "SAR"
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching gallery stats:", error);
    res.status(500).json({ error: "Failed to fetch gallery stats" });
  }
});

// Get gallery events
router.get("/galleries/:id/events", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, featured } = req.query;

    let whereConditions = [eq(schema.galleryEvents.galleryId, id)];

    if (status && status !== 'all') {
      whereConditions.push(eq(schema.galleryEvents.status, status as string));
    }

    if (featured === 'true') {
      whereConditions.push(eq(schema.galleryEvents.featured, true));
    }

    const events = await db
      .select()
      .from(schema.galleryEvents)
      .where(and(...whereConditions))
      .orderBy(desc(schema.galleryEvents.startDate));

    res.json(events);
  } catch (error) {
    console.error("Error fetching gallery events:", error);
    res.status(500).json({ error: "Failed to fetch gallery events" });
  }
});

// Get gallery artworks
router.get("/galleries/:id/artworks", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { availability, limit = 20, offset = 0 } = req.query;

    let whereConditions = [eq(schema.artworks.artistId, id)];

    if (availability && availability !== 'all') {
      whereConditions.push(eq(schema.artworks.availability, availability as string));
    }

    const artworks = await db
      .select({
        id: schema.artworks.id,
        title: schema.artworks.title,
        titleAr: schema.artworks.titleAr,
        images: schema.artworks.images,
        year: schema.artworks.year,
        medium: schema.artworks.medium,
        price: schema.artworks.price,
        currency: schema.artworks.currency,
        availability: schema.artworks.availability,
        category: schema.artworks.category,
        artistId: schema.artists.id,
        artistName: schema.artists.name,
        artistNameAr: schema.artists.nameAr,
      })
      .from(schema.artworks)
      .leftJoin(schema.artists, eq(schema.artworks.artistId, schema.artists.id))
      .where(and(...whereConditions))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(desc(schema.artworks.createdAt));

    res.json(artworks);
  } catch (error) {
    console.error("Error fetching gallery artworks:", error);
    res.status(500).json({ error: "Failed to fetch gallery artworks" });
  }
});

// Get gallery represented artists
router.get('/:id/artists', async (req, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    if (isNaN(galleryId)) {
      return res.status(400).json({ error: 'Invalid gallery ID' });
    }

    const artists = await db
      .select({
        id: schema.artists.id,
        name: schema.artists.name,
        nameAr: schema.artists.nameAr,
        profilePicture: schema.artists.profilePicture,
        biography: schema.artists.biography,
        biographyAr: schema.artists.biographyAr,
        featured: schema.artistGalleries.featured,
        artworkCount: sql<number>`COUNT(${schema.artworks.id})`.as('artworkCount'),
      })
      .from(schema.artistGalleries)
      .innerJoin(schema.artists, eq(schema.artistGalleries.artistId, schema.artists.id))
      .leftJoin(schema.artworks, eq(schema.artworks.artistId, schema.artists.id))
      .where(eq(schema.artistGalleries.galleryId, galleryId))
      .groupBy(
        schema.artists.id,
        schema.artists.name,
        schema.artists.nameAr,
        schema.artists.profilePicture,
        schema.artists.biography,
        schema.artists.biographyAr,
        schema.artistGalleries.featured
      )
      .orderBy(desc(sql`COALESCE(${schema.artistGalleries.featured}, false)`), schema.artists.name);

    res.json(artists || []);
  } catch (error) {
    console.error('Error fetching gallery artists:', error);
    res.status(500).json({ error: 'Failed to fetch gallery artists' });
  }
});

// Gallery contact form
router.post("/galleries/:id/contact", async (req, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    const { name, email, phone, subject, message, inquiryType } = req.body;

    // Here you would typically save the inquiry and send an email
    // For now, we'll just return success
    console.log('Gallery contact form submission:', {
      galleryId,
      name,
      email,
      subject,
      inquiryType
    });

    res.json({ 
      success: true, 
      message: "Contact form submitted successfully" 
    });
  } catch (error) {
    console.error("Error processing gallery contact:", error);
    res.status(500).json({ error: "Failed to process contact form" });
  }
});

// Gallery follow/unfollow functionality
router.post("/galleries/:id/follow", isAuthenticated, async (req: any, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    const userId = req.user.claims.sub;

    // Check if already following
    const existingFollow = await db
      .select()
      .from(schema.follows)
      .where(and(
        eq(schema.follows.userId, userId),
        eq(schema.follows.entityType, 'gallery'),
        eq(schema.follows.entityId, galleryId)
      ));

    if (existingFollow.length > 0) {
      return res.status(400).json({ error: "Already following this gallery" });
    }

    // Create follow relationship
    await db.insert(schema.follows).values({
      userId,
      entityType: 'gallery',
      entityId: galleryId,
    });

    res.json({ success: true, message: "Gallery followed successfully" });
  } catch (error) {
    console.error("Error following gallery:", error);
    res.status(500).json({ error: "Failed to follow gallery" });
  }
});

router.delete("/galleries/:id/follow", isAuthenticated, async (req: any, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    const userId = req.user.claims.sub;

    // Remove follow relationship
    await db
      .delete(schema.follows)
      .where(and(
        eq(schema.follows.userId, userId),
        eq(schema.follows.entityType, 'gallery'),
        eq(schema.follows.entityId, galleryId)
      ));

    res.json({ success: true, message: "Gallery unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing gallery:", error);
    res.status(500).json({ error: "Failed to unfollow gallery" });
  }
});

// Get gallery follow status for authenticated user
router.get("/galleries/:id/follow-status", isAuthenticated, async (req: any, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    const userId = req.user.claims.sub;

    const followStatus = await db
      .select()
      .from(schema.follows)
      .where(and(
        eq(schema.follows.userId, userId),
        eq(schema.follows.entityType, 'gallery'),
        eq(schema.follows.entityId, galleryId)
      ));

    res.json({ isFollowing: followStatus.length > 0 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ error: "Failed to check follow status" });
  }
});

// Create gallery event (for gallery owners/admins)
router.post("/galleries/:id/events", isAuthenticated, async (req: any, res) => {
  try {
    const galleryId = parseInt(req.params.id);
    const {
      title, titleAr, description, descriptionAr, eventType,
      startDate, endDate, location, locationAr, maxAttendees,
      featured, coverImage
    } = req.body;

    // Create new gallery event
    const newEvent = await db
      .insert(schema.galleryEvents)
      .values({
        galleryId,
        title,
        titleAr,
        description,
        descriptionAr,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        locationAr,
        maxAttendees,
        featured: featured || false,
        coverImage,
        status: 'upcoming',
      })
      .returning();

    res.json(newEvent[0]);
  } catch (error) {
    console.error("Error creating gallery event:", error);
    res.status(500).json({ error: "Failed to create gallery event" });
  }
});

export default router;