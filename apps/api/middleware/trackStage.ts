import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { InsertUserInteraction, InsertLifecycleTransition, InsertMetric } from '@shared/schema';

// Define lifecycle stage progression rules
const STAGE_PROGRESSION: Record<string, string[]> = {
  aware: ['join'],
  join: ['explore'],
  explore: ['transact', 'retain'],
  transact: ['retain'],
  retain: ['advocate'],
  advocate: ['advocate'], // Can stay at advocate level
};

// Define actions that trigger stage transitions
const STAGE_TRIGGERS: Record<string, { stage: string; action: string }> = {
  // Join stage - user completes registration/setup
  'POST /api/user/roles': { stage: 'join', action: 'complete_role_setup' },
  'POST /api/user/profile': { stage: 'join', action: 'complete_profile' },

  // Explore stage - user starts browsing and engaging
  'GET /api/artworks': { stage: 'explore', action: 'browse_artworks' },
  'GET /api/artists': { stage: 'explore', action: 'browse_artists' },
  'POST /api/favorites': { stage: 'explore', action: 'add_favorite' },
  'GET /api/artwork/': { stage: 'explore', action: 'view_artwork_detail' },

  // Transact stage - user makes their first transaction
  'POST /api/bids': { stage: 'transact', action: 'place_bid' },
  'POST /api/commissions': { stage: 'transact', action: 'create_commission' },
  'POST /api/collector/orders': { stage: 'transact', action: 'make_purchase' },
  'POST /api/workshopRegistrations': { stage: 'transact', action: 'register_workshop' },

  // Retain stage - user demonstrates ongoing engagement
  'POST /api/collector/wishlist': { stage: 'retain', action: 'use_wishlist' },
  'POST /api/collector/price-alerts': { stage: 'retain', action: 'set_price_alert' },
  'POST /api/newsletter/subscribe': { stage: 'retain', action: 'subscribe_newsletter' },

  // Advocate stage - user promotes platform to others
  'POST /api/artworks/share': { stage: 'advocate', action: 'share_artwork' },
  'POST /api/reviews': { stage: 'advocate', action: 'write_review' },
  'POST /api/follows': { stage: 'advocate', action: 'follow_artist' },
};

interface AuthenticatedRequest extends Request {
  user?: {
    claims: {
      sub: string;
    };
  };
}

// Middleware to track lifecycle stages
export const trackStageMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Store original end method
  const originalEnd = res.end;

  // Override end method to capture response
  res.end = function (chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Only track for authenticated users and successful responses
    if (req.user?.claims?.sub && res.statusCode >= 200 && res.statusCode < 300) {
      const userId = req.user.claims.sub;
      const route = `${req.method} ${req.route?.path || req.path}`;

      // Track user interaction
      const interaction: InsertUserInteraction = {
        userId,
        action: `${req.method.toLowerCase()}_${req.path.split('/').pop() || 'unknown'}`,
        entityType: extractEntityType(req.path),
        entityId: extractEntityId(req.path),
        metadata: {
          route,
          duration,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          referer: req.get('Referer'),
          query: req.query,
          body: req.method === 'POST' ? req.body : undefined,
        },
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
      };

      // Check if this action should trigger a stage transition
      const trigger = STAGE_TRIGGERS[route] || findPatternMatch(route);

      if (trigger) {
        checkAndUpdateStage(userId, trigger.stage, trigger.action, interaction);
      } else {
        // Still track the interaction even if no stage transition
        storage.trackUserInteraction(interaction).catch(console.error);
      }
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Helper function to extract entity type from path
function extractEntityType(path: string): string | undefined {
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 2 && segments[0] === 'api') {
    const entitySegment = segments[1];
    // Map API endpoints to entity types
    const entityMap: Record<string, string> = {
      artworks: 'artwork',
      artists: 'artist',
      galleries: 'gallery',
      auctions: 'auction',
      workshops: 'workshop',
      events: 'event',
      commissions: 'commission',
    };
    return entityMap[entitySegment] || entitySegment;
  }
  return undefined;
}

// Helper function to extract entity ID from path
function extractEntityId(path: string): string | undefined {
  const segments = path.split('/').filter(Boolean);
  // Look for numeric segments that might be IDs
  for (let i = 0; i < segments.length; i++) {
    if (/^\d+$/.test(segments[i])) {
      return segments[i];
    }
  }
  return undefined;
}

// Helper function to find pattern matches for dynamic routes
function findPatternMatch(route: string): { stage: string; action: string } | undefined {
  for (const [pattern, trigger] of Object.entries(STAGE_TRIGGERS)) {
    if (route.includes(pattern.split(' ')[1])) {
      return trigger;
    }
  }
  return undefined;
}

// Function to check and update user lifecycle stage
async function checkAndUpdateStage(
  userId: string,
  targetStage: string,
  action: string,
  interaction: InsertUserInteraction
) {
  try {
    // Get current user stage
    const user = await storage.getUserById(userId);
    if (!user) return;

    const currentStage = user.lifecycleStage || 'aware';

    // Check if user can progress to target stage
    const allowedProgressions = STAGE_PROGRESSION[currentStage] || [];
    const canProgress = allowedProgressions.includes(targetStage) || currentStage === targetStage;

    if (canProgress && currentStage !== targetStage) {
      // Update user stage
      await storage.updateUserStage(userId, targetStage);

      // Track the transition
      const transition: InsertLifecycleTransition = {
        userId,
        fromStage: currentStage,
        toStage: targetStage,
        trigger: action,
        metadata: {
          actionMetadata: interaction.metadata,
          progressionPath: `${currentStage} → ${targetStage}`,
        },
      };

      await storage.trackLifecycleTransition(transition);

      // Update interaction with stage change info
      interaction.previousStage = currentStage;
      interaction.newStage = targetStage;

      // Track daily stage progression metric
      const metric: InsertMetric = {
        metric: 'stage_progression',
        value: '1',
        stage: targetStage,
        category: 'funnel',
        metadata: {
          fromStage: currentStage,
          toStage: targetStage,
          userId,
          action,
        },
      };

      await storage.trackMetric(metric);
    }

    // Always track the interaction
    await storage.trackUserInteraction(interaction);
  } catch (error) {
    console.error('Error updating lifecycle stage:', error);
    // Still track the interaction even if stage update fails
    await storage.trackUserInteraction(interaction);
  }
}

// Function to calculate and update metrics (to be called via CRON)
export async function updateLifecycleMetrics() {
  try {
    const stages = ['aware', 'join', 'explore', 'transact', 'retain', 'advocate'];

    for (const stage of stages) {
      const count = await storage.getUserCountByStage(stage);

      const metric: InsertMetric = {
        metric: `stage_${stage}_count`,
        value: count.toString(),
        stage,
        category: 'funnel',
        metadata: {
          calculatedAt: new Date().toISOString(),
          type: 'daily_snapshot',
        },
      };

      await storage.trackMetric(metric);
    }

    // Calculate conversion rates
    const totalUsers = await storage.getUserCountByStage('all');
    if (totalUsers > 0) {
      for (let i = 1; i < stages.length; i++) {
        const fromStage = stages[i - 1];
        const toStage = stages[i];
        const fromCount = await storage.getUserCountByStage(fromStage);
        const toCount = await storage.getUserCountByStage(toStage);

        const conversionRate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;

        const metric: InsertMetric = {
          metric: `conversion_${fromStage}_to_${toStage}`,
          value: conversionRate.toFixed(2),
          stage: toStage,
          category: 'conversion',
          metadata: {
            fromStage,
            toStage,
            fromCount,
            toCount,
            calculatedAt: new Date().toISOString(),
          },
        };

        await storage.trackMetric(metric);
      }
    }

    console.log('Lifecycle metrics updated successfully');
  } catch (error) {
    console.error('Error updating lifecycle metrics:', error);
  }
}
