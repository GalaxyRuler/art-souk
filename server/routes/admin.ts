import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { db } from '../db';
import { eq, desc, count, sql, and, or, ilike } from 'drizzle-orm';
import { 
  users, 
  artists, 
  galleries, 
  artworks, 
  auctions,
  workshops,
  events,
  reports,
  insertReportSchema
} from '@shared/schema';
import { z } from 'zod';

const adminRouter = Router();



// Middleware to ensure user is admin
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user || !req.user.claims || !req.user.claims.sub) {
      return res.status(403).json({ message: 'Authentication required' });
    }
    
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
    
    // Check if user has admin role (check both old role field and new roles array)
    const hasAdminRole = user.roles?.includes('admin') || user.role === 'admin';
    if (!hasAdminRole) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Attach user to request for later use
    req.dbUser = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Apply admin middleware to all routes
adminRouter.use(isAuthenticated);
adminRouter.use(requireAdmin);

// Dashboard Stats
adminRouter.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalArtists,
      totalGalleries,
      totalArtworks,
      activeAuctions,
      totalWorkshops,
      totalEvents,
      pendingReports
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(artists),
      db.select({ count: count() }).from(galleries),
      db.select({ count: count() }).from(artworks),
      db.select({ count: count() }).from(auctions).where(eq(auctions.status, 'live')),
      db.select({ count: count() }).from(workshops),
      db.select({ count: count() }).from(events),
      db.select({ count: count() }).from(reports).where(eq(reports.status, 'pending'))
    ]);

    const stats = {
      overview: {
        totalUsers: totalUsers[0].count,
        totalArtists: totalArtists[0].count,
        totalGalleries: totalGalleries[0].count,
        totalArtworks: totalArtworks[0].count,
        activeAuctions: activeAuctions[0].count,
        totalWorkshops: totalWorkshops[0].count,
        totalEvents: totalEvents[0].count,
        pendingReports: pendingReports[0].count
      },
      growth: {
        // Calculate growth metrics for the last 30 days
        newUsersThisMonth: await getNewUsersCount(30),
        newArtworksThisMonth: await getNewArtworksCount(30)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ 
      overview: {
        totalUsers: 0,
        totalArtists: 0,
        totalGalleries: 0,
        totalArtworks: 0,
        activeAuctions: 0,
        totalWorkshops: 0,
        totalEvents: 0,
        pendingReports: 0
      },
      growth: {
        newUsersThisMonth: 0,
        newArtworksThisMonth: 0
      }
    });
  }
});

// KYC Documents Management
adminRouter.get('/kyc-documents', async (req, res) => {
  try {
    const documents = await storage.getAllKycDocuments();
    res.json({ documents });
  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    res.status(500).json({ documents: [] });
  }
});

// Update KYC document status
adminRouter.patch('/kyc-documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, verificationNotes } = req.body;
    
    const document = await storage.updateKycDocumentStatus(id, verificationStatus, verificationNotes);
    res.json({ document });
  } catch (error) {
    console.error('Error updating KYC document:', error);
    res.status(500).json({ error: 'Failed to update KYC document' });
  }
});

// User Management
adminRouter.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const offset = (page - 1) * limit;
    
    let query = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      roles: users.roles,
      createdAt: users.createdAt,
      lastActiveAt: users.lastActiveAt,
      profileCompleteness: users.profileCompleteness,
      lifecycleStage: users.lifecycleStage
    }).from(users);

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      );
    }
    if (role) {
      conditions.push(sql`${users.roles} @> ${JSON.stringify([role])}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const usersList = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: count() }).from(users);

    res.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// User Details
adminRouter.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get associated profiles
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    // Get user's artworks if they're an artist
    let userArtworks = [];
    if (artist) {
      userArtworks = await db.select().from(artworks).where(eq(artworks.artistId, artist.id));
    }

    res.json({
      user: user[0],
      profiles: {
        artist: artist || null,
        gallery: gallery || null
      },
      artworks: userArtworks,
      stats: {
        totalArtworks: userArtworks.length,
        // Add more stats as needed
      }
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Update User Role
adminRouter.patch('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { roles, action } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({ error: 'Roles must be an array' });
    }

    const user = await db.select().from(users).where(eq(users.id, userId));
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedRoles = user[0].roles || [];
    
    if (action === 'add') {
      updatedRoles = [...new Set([...updatedRoles, ...roles])];
    } else if (action === 'remove') {
      updatedRoles = updatedRoles.filter(role => !roles.includes(role));
    } else {
      updatedRoles = roles;
    }

    await db.update(users)
      .set({ roles: updatedRoles })
      .where(eq(users.id, userId));

    res.json({ success: true, roles: updatedRoles });
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Artists Management
adminRouter.get('/artists', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;
    
    let query = db.select({
      id: artists.id,
      userId: artists.userId,
      name: artists.name,
      nameAr: artists.nameAr,
      nationality: artists.nationality,
      featured: artists.featured,
      createdAt: artists.createdAt
    }).from(artists);

    if (search) {
      query = query.where(
        or(
          ilike(artists.name, `%${search}%`),
          ilike(artists.nameAr, `%${search}%`)
        )
      );
    }

    const artistsList = await query
      .orderBy(desc(artists.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: count() }).from(artists);

    res.json({
      artists: artistsList,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin artists list error:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Galleries Management
adminRouter.get('/galleries', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;
    
    let query = db.select({
      id: galleries.id,
      userId: galleries.userId,
      name: galleries.name,
      nameAr: galleries.nameAr,
      location: galleries.location,
      featured: galleries.featured,
      createdAt: galleries.createdAt
    }).from(galleries);

    if (search) {
      query = query.where(
        or(
          ilike(galleries.name, `%${search}%`),
          ilike(galleries.nameAr, `%${search}%`)
        )
      );
    }

    const galleriesList = await query
      .orderBy(desc(galleries.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: count() }).from(galleries);

    res.json({
      galleries: galleriesList,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin galleries list error:', error);
    res.status(500).json({ error: 'Failed to fetch galleries' });
  }
});

// Artworks Management
adminRouter.get('/artworks', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;
    
    let query = db.select({
      id: artworks.id,
      title: artworks.title,
      titleAr: artworks.titleAr,
      artistId: artworks.artistId,
      price: artworks.price,
      currency: artworks.currency,
      availability: artworks.availability,
      featured: artworks.featured,
      createdAt: artworks.createdAt
    }).from(artworks);

    if (search) {
      query = query.where(
        or(
          ilike(artworks.title, `%${search}%`),
          ilike(artworks.titleAr, `%${search}%`)
        )
      );
    }

    const artworksList = await query
      .orderBy(desc(artworks.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: count() }).from(artworks);

    res.json({
      artworks: artworksList,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin artworks list error:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Content Moderation - Reports
adminRouter.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const type = req.query.type as string;

    const offset = (page - 1) * limit;
    
    let query = db.select().from(reports);

    const conditions = [];
    if (status) {
      conditions.push(eq(reports.status, status as any));
    }
    if (type) {
      conditions.push(eq(reports.entityType, type as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const reportsList = await query
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: count() }).from(reports);

    res.json({
      reports: reportsList,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        pages: Math.ceil(totalCount[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin reports list error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Handle Report
adminRouter.patch('/reports/:reportId/resolve', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { resolution, notes } = req.body;

    await db.update(reports)
      .set({ 
        status: 'resolved',
        resolution,
        adminNotes: notes,
        resolvedAt: new Date(),
        resolvedBy: req.user.id
      })
      .where(eq(reports.id, parseInt(reportId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Admin resolve report error:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Content Management - Feature/Unfeature
adminRouter.patch('/content/:type/:id/feature', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { featured } = req.body;

    let table;
    switch (type) {
      case 'artwork':
        table = artworks;
        break;
      case 'workshop':
        table = workshops;
        break;
      case 'event':
        table = events;
        break;
      default:
        return res.status(400).json({ error: 'Invalid content type' });
    }

    await db.update(table)
      .set({ featured })
      .where(eq(table.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Admin feature content error:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Analytics
adminRouter.get('/analytics/overview', async (req, res) => {
  try {
    const timeRange = req.query.range as string || '30d';
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    const analytics = {
      userGrowth: await getUserGrowthData(days),
      contentActivity: await getContentActivityData(days),
      platformHealth: await getPlatformHealthData()
    };

    res.json(analytics);
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Helper functions
async function getNewUsersCount(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const result = await db.select({ count: count() })
    .from(users)
    .where(sql`${users.createdAt} >= ${cutoff}`);
  
  return result[0].count;
}

async function getNewArtworksCount(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const result = await db.select({ count: count() })
    .from(artworks)
    .where(sql`${artworks.createdAt} >= ${cutoff}`);
  
  return result[0].count;
}

async function getUserGrowthData(days: number) {
  // Implementation for user growth analytics
  return {
    totalUsers: await db.select({ count: count() }).from(users),
    newUsers: await getNewUsersCount(days),
    activeUsers: await getNewUsersCount(7) // Active in last 7 days
  };
}

async function getContentActivityData(days: number) {
  // Implementation for content activity analytics
  return {
    newArtworks: await getNewArtworksCount(days),
    newWorkshops: await getNewWorkshopsCount(days),
    newEvents: await getNewEventsCount(days)
  };
}

async function getNewWorkshopsCount(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const result = await db.select({ count: count() })
    .from(workshops)
    .where(sql`${workshops.createdAt} >= ${cutoff}`);
  
  return result[0].count;
}

async function getNewEventsCount(days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const result = await db.select({ count: count() })
    .from(events)
    .where(sql`${events.createdAt} >= ${cutoff}`);
  
  return result[0].count;
}

async function getPlatformHealthData() {
  // Implementation for platform health metrics
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    // Add more health metrics as needed
  };
}

export { adminRouter };