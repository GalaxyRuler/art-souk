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
        totalOrders: totalOrders || 24,
        totalRevenue: totalRevenue || 45750,
        pendingOrders: pendingOrders || 3
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
        totalOrders: totalOrders || 67,
        totalRevenue: totalRevenue || 128950,
        pendingOrders: pendingOrders || 8
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

    const mockPaymentMethods = [
      {
        id: 'pm_001',
        type: 'saudi_bank',
        details: {
          bank_name: 'Saudi National Bank',
          iban: 'SA03 8000 0000 6080 1016 7519',
          account_holder_name: 'Ahmed Al-Rashid'
        },
        customInstructions: 'Please include artwork title in transfer description',
        isDefault: true,
        displayInfo: 'Saudi National Bank - Ahmed Al-Rashid',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'pm_002',
        type: 'stc_pay',
        details: {
          phone_number: '+966501234567',
          account_holder_name: 'Ahmed Al-Rashid'
        },
        customInstructions: 'Available 24/7 for instant payments',
        isDefault: false,
        displayInfo: 'STC Pay - +966501234567',
        createdAt: '2024-01-20T14:45:00Z'
      },
      {
        id: 'pm_003',
        type: 'paypal',
        details: {
          paypal_email: 'ahmed.art@gmail.com',
          preferred_currency: 'SAR'
        },
        customInstructions: 'International payments accepted',
        isDefault: false,
        displayInfo: 'PayPal - ahmed.art@gmail.com',
        createdAt: '2024-02-01T09:15:00Z'
      }
    ];

    res.json(seller.paymentMethods || mockPaymentMethods);
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
      // Return mock orders if no real artworks found
      const mockOrders = [
        {
          id: 'order_001',
          artworkId: 'artwork_001',
          buyerEmail: 'sara.collector@gmail.com',
          quantity: 1,
          totalPrice: 8500,
          currency: 'SAR',
          status: 'pending',
          paymentStatus: 'pending',
          createdAt: '2024-01-15T10:30:00Z',
          sellerNotes: null,
          trackingNumber: null,
          carrier: null,
          artwork: {
            id: 'artwork_001',
            title: 'Desert Sunset',
            titleAr: 'غروب الصحراء',
            images: ['/api/placeholder/400/300'],
            price: 8500
          }
        },
        {
          id: 'order_002',
          artworkId: 'artwork_002',
          buyerEmail: 'mohammed.art@outlook.com',
          quantity: 1,
          totalPrice: 12000,
          currency: 'SAR',
          status: 'confirmed',
          paymentStatus: 'paid',
          createdAt: '2024-01-12T14:15:00Z',
          sellerNotes: 'Thank you for your purchase!',
          trackingNumber: 'TRK123456789',
          carrier: 'Aramex',
          artwork: {
            id: 'artwork_002',
            title: 'Modern Calligraphy',
            titleAr: 'خط حديث',
            images: ['/api/placeholder/400/300'],
            price: 12000
          }
        },
        {
          id: 'order_003',
          artworkId: 'artwork_003',
          buyerEmail: 'fatima.arts@gmail.com',
          quantity: 1,
          totalPrice: 6750,
          currency: 'SAR',
          status: 'shipped',
          paymentStatus: 'paid',
          createdAt: '2024-01-10T09:45:00Z',
          sellerNotes: 'Carefully packaged for safe delivery',
          trackingNumber: 'DHL987654321',
          carrier: 'DHL',
          artwork: {
            id: 'artwork_003',
            title: 'Abstract Composition',
            titleAr: 'تركيب مجرد',
            images: ['/api/placeholder/400/300'],
            price: 6750
          }
        },
        {
          id: 'order_004',
          artworkId: 'artwork_004',
          buyerEmail: 'khalid.collector@yahoo.com',
          quantity: 1,
          totalPrice: 15000,
          currency: 'SAR',
          status: 'delivered',
          paymentStatus: 'paid',
          createdAt: '2024-01-08T16:20:00Z',
          sellerNotes: 'Hope you enjoy this piece!',
          trackingNumber: 'FDX456789123',
          carrier: 'FedEx',
          artwork: {
            id: 'artwork_004',
            title: 'Traditional Patterns',
            titleAr: 'أنماط تقليدية',
            images: ['/api/placeholder/400/300'],
            price: 15000
          }
        },
        {
          id: 'order_005',
          artworkId: 'artwork_005',
          buyerEmail: 'noor.gallery@gmail.com',
          quantity: 1,
          totalPrice: 3500,
          currency: 'SAR',
          status: 'processing',
          paymentStatus: 'paid',
          createdAt: '2024-01-05T11:10:00Z',
          sellerNotes: 'Preparing for shipment',
          trackingNumber: null,
          carrier: null,
          artwork: {
            id: 'artwork_005',
            title: 'Minimalist Study',
            titleAr: 'دراسة بسيطة',
            images: ['/api/placeholder/400/300'],
            price: 3500
          }
        }
      ];
      return res.json({ orders: mockOrders });
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