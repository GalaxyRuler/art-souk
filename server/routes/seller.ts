import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { db } from '../db';
import { eq, desc, and, or, sql, inArray } from 'drizzle-orm';
import { 
  artists, 
  galleries, 
  purchaseOrders,
  artworks
} from '@shared/schema';
import { z } from 'zod';

const sellerRouter = Router();

// Apply authentication to all seller routes
sellerRouter.use(isAuthenticated);

// Payment Method Schema
const paymentMethodSchema = z.object({
  type: z.enum(['saudi_bank', 'stc_pay', 'paypal', 'wise', 'cash_on_delivery']),
  details: z.object({
    bank_name: z.string().optional(),
    iban: z.string().optional(),
    phone_number: z.string().optional(),
    paypal_email: z.string().email().optional(),
    wise_email: z.string().email().optional(),
    preferred_currency: z.string().optional(),
    account_holder_name: z.string().optional()
  }),
  customInstructions: z.string().optional(),
  isDefault: z.boolean().optional()
});

// Get seller info (determine if user is artist or gallery)
sellerRouter.get('/info', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check if user is an artist
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    
    // Check if user is a gallery
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    if (artist) {
      // Get order statistics for artist
      const artistArtworks = await db.select().from(artworks).where(eq(artworks.artistId, artist.id));
      const artworkIds = artistArtworks.map(a => a.id);
      
      let totalOrders = 0;
      let totalRevenue = 0;
      let pendingOrders = 0;
      
      if (artworkIds.length > 0) {
        const orders = await db.select().from(purchaseOrders).where(inArray(purchaseOrders.artworkId, artworkIds));
        totalOrders = orders.length;
        totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        pendingOrders = orders.filter(order => order.status === 'pending').length;
      }

      res.json({
        type: 'artist',
        name: artist.name,
        email: req.user.email,
        totalOrders,
        totalRevenue,
        pendingOrders
      });
    } else if (gallery) {
      // Get order statistics for gallery
      const galleryArtworks = await db.select().from(artworks).where(eq(artworks.galleryId, gallery.id));
      const artworkIds = galleryArtworks.map(a => a.id);
      
      let totalOrders = 0;
      let totalRevenue = 0;
      let pendingOrders = 0;
      
      if (artworkIds.length > 0) {
        const orders = await db.select().from(purchaseOrders).where(inArray(purchaseOrders.artworkId, artworkIds));
        totalOrders = orders.length;
        totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        pendingOrders = orders.filter(order => order.status === 'pending').length;
      }

      res.json({
        type: 'gallery',
        name: gallery.name,
        email: req.user.email,
        totalOrders,
        totalRevenue,
        pendingOrders
      });
    } else {
      res.status(404).json({ error: 'Seller profile not found' });
    }
  } catch (error) {
    console.error('Get seller info error:', error);
    res.status(500).json({ error: 'Failed to get seller info' });
  }
});

// Get payment methods
sellerRouter.get('/payment-methods', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get seller profile
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    const seller = artist || gallery;
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    res.json(seller.paymentMethods || []);
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// Add payment method
sellerRouter.post('/payment-methods', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedData = paymentMethodSchema.parse(req.body);
    const { type, details, customInstructions, isDefault } = validatedData;
    
    // Get seller profile
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    const seller = artist || gallery;
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const table = artist ? artists : galleries;
    const existingMethods = seller.paymentMethods || [];
    
    // Create new payment method
    const newMethod = {
      id: `pm_${Date.now()}`,
      type,
      details,
      customInstructions,
      isDefault: isDefault || existingMethods.length === 0, // First method becomes default
      displayInfo: generateDisplayInfo(type, details),
      createdAt: new Date().toISOString()
    };

    // If this is set as default, remove default from others
    const updatedMethods = existingMethods.map(method => ({
      ...method,
      isDefault: newMethod.isDefault ? false : method.isDefault
    }));

    updatedMethods.push(newMethod);

    // Update seller profile
    await db.update(table)
      .set({ paymentMethods: updatedMethods })
      .where(eq(table.userId, userId));

    res.json({ success: true, paymentMethod: newMethod });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

// Update payment method
sellerRouter.patch('/payment-methods/:methodId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { methodId } = req.params;
    const updates = req.body;
    
    // Get seller profile
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    const seller = artist || gallery;
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const table = artist ? artists : galleries;
    const existingMethods = seller.paymentMethods || [];
    
    // Find and update the method
    const updatedMethods = existingMethods.map(method => {
      if (method.id === methodId) {
        const updated = { ...method, ...updates };
        if (updates.type || updates.details) {
          updated.displayInfo = generateDisplayInfo(updated.type, updated.details);
        }
        return updated;
      }
      return method;
    });

    // If setting as default, remove default from others
    if (updates.isDefault) {
      updatedMethods.forEach(method => {
        if (method.id !== methodId) {
          method.isDefault = false;
        }
      });
    }

    // Update seller profile
    await db.update(table)
      .set({ paymentMethods: updatedMethods })
      .where(eq(table.userId, userId));

    res.json({ success: true });
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

// Delete payment method
sellerRouter.delete('/payment-methods/:methodId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { methodId } = req.params;
    
    // Get seller profile
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    const seller = artist || gallery;
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const table = artist ? artists : galleries;
    const existingMethods = seller.paymentMethods || [];
    
    // Remove the method
    const updatedMethods = existingMethods.filter(method => method.id !== methodId);
    
    // If deleted method was default and others exist, make first one default
    if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
      updatedMethods[0].isDefault = true;
    }

    // Update seller profile
    await db.update(table)
      .set({ paymentMethods: updatedMethods })
      .where(eq(table.userId, userId));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

// Get seller orders
sellerRouter.get('/orders', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get seller profile
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    const seller = artist || gallery;
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Get artworks by this seller
    const sellerArtworks = await db.select()
      .from(artworks)
      .where(artist ? eq(artworks.artistId, artist.id) : eq(artworks.galleryId, gallery.id));

    const artworkIds = sellerArtworks.map(artwork => artwork.id);

    if (artworkIds.length === 0) {
      return res.json({ orders: [] });
    }

    // Get orders for these artworks
    const orders = await db.select({
      id: purchaseOrders.id,
      artworkId: purchaseOrders.artworkId,
      buyerEmail: purchaseOrders.buyerEmail,
      quantity: purchaseOrders.quantity,
      totalPrice: purchaseOrders.totalPrice,
      currency: purchaseOrders.currency,
      status: purchaseOrders.status,
      paymentStatus: purchaseOrders.paymentStatus,
      createdAt: purchaseOrders.createdAt,
      sellerNotes: purchaseOrders.sellerNotes,
      trackingNumber: purchaseOrders.trackingNumber,
      carrier: purchaseOrders.carrier
    })
    .from(purchaseOrders)
    .where(inArray(purchaseOrders.artworkId, artworkIds))
    .orderBy(desc(purchaseOrders.createdAt));

    // Enrich orders with artwork details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const artwork = sellerArtworks.find(a => a.id === order.artworkId);
        return {
          ...order,
          artwork: artwork ? {
            id: artwork.id,
            title: artwork.title,
            titleAr: artwork.titleAr,
            images: artwork.images,
            price: artwork.price
          } : null
        };
      })
    );

    res.json({ orders: enrichedOrders });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update order status
sellerRouter.patch('/orders/:orderId/status', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { orderId } = req.params;
    const { status, sellerNotes, trackingNumber, carrier } = req.body;
    
    // Verify seller owns this order
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    const [gallery] = await db.select().from(galleries).where(eq(galleries.userId, userId));
    
    const seller = artist || gallery;
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    // Get the order and verify ownership
    const [order] = await db.select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, parseInt(orderId)));

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify seller owns the artwork
    const [artwork] = await db.select()
      .from(artworks)
      .where(eq(artworks.id, order.artworkId));

    const ownsArtwork = artist ? artwork.artistId === artist.id : artwork.galleryId === gallery.id;
    if (!ownsArtwork) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update the order
    const updateData: any = {
      status,
      sellerUpdatedAt: new Date()
    };

    if (sellerNotes) updateData.sellerNotes = sellerNotes;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;

    // If confirming order, update payment status
    if (status === 'confirmed') {
      updateData.paymentConfirmedAt = new Date();
    }

    await db.update(purchaseOrders)
      .set(updateData)
      .where(eq(purchaseOrders.id, parseInt(orderId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Helper function to generate display info
function generateDisplayInfo(type: string, details: any) {
  switch (type) {
    case 'saudi_bank':
      return `${details.bank_name || 'Saudi Bank'} - ${details.iban?.slice(-4) || '****'}`;
    case 'stc_pay':
      return `STC Pay - ${details.phone_number || 'Phone Number'}`;
    case 'paypal':
      return `PayPal - ${details.paypal_email || 'Email'}`;
    case 'wise':
      return `Wise - ${details.wise_email || 'Email'} (${details.preferred_currency || 'Currency'})`;
    case 'cash_on_delivery':
      return 'Cash on Delivery';
    default:
      return 'Payment Method';
  }
}

export { sellerRouter };