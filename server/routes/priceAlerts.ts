import { Router } from "express";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
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

// Price alerts management
router.get("/", isAuthenticated, rateLimiters.standard, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;
    const alerts = await db
      .select({
        id: schema.priceAlerts.id,
        artistId: schema.priceAlerts.artistId,
        artworkId: schema.priceAlerts.artworkId,
        category: schema.priceAlerts.category,
        priceThreshold: schema.priceAlerts.priceThreshold,
        alertType: schema.priceAlerts.alertType,
        isActive: schema.priceAlerts.isActive,
        lastTriggered: schema.priceAlerts.lastTriggered,
        createdAt: schema.priceAlerts.createdAt,
        artistName: schema.artists.name,
        artworkTitle: schema.artworks.title
      })
      .from(schema.priceAlerts)
      .leftJoin(schema.artists, eq(schema.priceAlerts.artistId, schema.artists.id))
      .leftJoin(schema.artworks, eq(schema.priceAlerts.artworkId, schema.artworks.id))
      .where(eq(schema.priceAlerts.userId, userId))
      .orderBy(desc(schema.priceAlerts.createdAt));

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching price alerts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.claims.sub;
    const { artistId, artworkId, category, priceThreshold, alertType } = req.body;

    const newAlert = await db
      .insert(schema.priceAlerts)
      .values({
        userId,
        artistId,
        artworkId,
        category,
        priceThreshold,
        alertType,
        isActive: true
      })
      .returning();

    res.status(201).json(newAlert[0]);
  } catch (error) {
    console.error("Error creating price alert:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", isAuthenticated, rateLimiters.strict, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const userId = (req as AuthenticatedRequest).user.claims.sub;

    const deleted = await db
      .delete(schema.priceAlerts)
      .where(and(eq(schema.priceAlerts.id, alertId), eq(schema.priceAlerts.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Price alert not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting price alert:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as priceAlertsRouter };