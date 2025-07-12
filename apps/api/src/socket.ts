import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Redis } from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { db } from '@art-souk/db';
import { auctions, bids, users } from '@art-souk/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export interface BidData {
  auctionId: number;
  userId: string;
  amount: number;
  timestamp: Date;
}

export interface AuctionUpdate {
  auctionId: number;
  currentBid: number;
  bidCount: number;
  timeRemaining: number;
  leadingBidder?: string;
}

export class AuctionSocketServer {
  private io: SocketIOServer;
  private redis: Redis;
  private pubClient: Redis;
  private subClient: Redis;

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://yoursite.com'] 
          : ['http://localhost:5000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Redis setup for scaling across multiple instances
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.subClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    // Set up Redis adapter for multi-instance support
    this.io.adapter(createAdapter(this.pubClient, this.subClient));

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.id} connected`);

      // Join auction room
      socket.on('join_auction', async (auctionId: number) => {
        try {
          await socket.join(`auction:${auctionId}`);
          
          // Send current auction state
          const auctionState = await this.getAuctionState(auctionId);
          socket.emit('auction_state', auctionState);
          
          console.log(`User ${socket.id} joined auction ${auctionId}`);
        } catch (error) {
          console.error('Error joining auction:', error);
          socket.emit('error', { message: 'Failed to join auction' });
        }
      });

      // Leave auction room
      socket.on('leave_auction', (auctionId: number) => {
        socket.leave(`auction:${auctionId}`);
        console.log(`User ${socket.id} left auction ${auctionId}`);
      });

      // Handle new bid
      socket.on('place_bid', async (bidData: BidData) => {
        try {
          const result = await this.processBid(bidData);
          
          if (result.success) {
            // Broadcast to all users in the auction room
            this.io.to(`auction:${bidData.auctionId}`).emit('bid_placed', {
              auctionId: bidData.auctionId,
              bid: result.bid,
              auctionUpdate: result.auctionUpdate
            });

            // Store bid in Redis for real-time leaderboard
            await this.updateBidCache(bidData.auctionId, result.bid);
          } else {
            socket.emit('bid_error', { message: result.error });
          }
        } catch (error) {
          console.error('Error placing bid:', error);
          socket.emit('bid_error', { message: 'Failed to place bid' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
      });
    });
  }

  private async processBid(bidData: BidData) {
    try {
      // Get current auction state
      const [auction] = await db
        .select()
        .from(auctions)
        .where(eq(auctions.id, bidData.auctionId));

      if (!auction) {
        return { success: false, error: 'Auction not found' };
      }

      // Check if auction is still active
      if (new Date() > new Date(auction.endTime)) {
        return { success: false, error: 'Auction has ended' };
      }

      // Get current highest bid
      const [currentHighestBid] = await db
        .select()
        .from(bids)
        .where(eq(bids.auctionId, bidData.auctionId))
        .orderBy(bids.amount.desc())
        .limit(1);

      // Validate bid amount
      const minimumBid = currentHighestBid 
        ? parseFloat(currentHighestBid.amount) + (auction.minimumIncrement || 100)
        : auction.startingBid || 0;

      if (bidData.amount < minimumBid) {
        return { 
          success: false, 
          error: `Bid must be at least ${minimumBid} ${auction.currency}` 
        };
      }

      // Insert new bid
      const [newBid] = await db
        .insert(bids)
        .values({
          auctionId: bidData.auctionId,
          userId: bidData.userId,
          amount: bidData.amount.toString(),
          timestamp: bidData.timestamp
        })
        .returning();

      // Update auction current bid
      await db
        .update(auctions)
        .set({ 
          currentBid: bidData.amount.toString(),
          bidCount: (auction.bidCount || 0) + 1
        })
        .where(eq(auctions.id, bidData.auctionId));

      // Get bidder info
      const [bidder] = await db
        .select({ firstName: users.firstName, lastName: users.lastName })
        .from(users)
        .where(eq(users.id, bidData.userId));

      const auctionUpdate: AuctionUpdate = {
        auctionId: bidData.auctionId,
        currentBid: bidData.amount,
        bidCount: (auction.bidCount || 0) + 1,
        timeRemaining: Math.max(0, new Date(auction.endTime).getTime() - Date.now()),
        leadingBidder: bidder ? `${bidder.firstName} ${bidder.lastName}` : 'Anonymous'
      };

      return { 
        success: true, 
        bid: newBid,
        auctionUpdate 
      };
    } catch (error) {
      console.error('Error processing bid:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  private async getAuctionState(auctionId: number): Promise<AuctionUpdate> {
    const [auction] = await db
      .select()
      .from(auctions)
      .where(eq(auctions.id, auctionId));

    if (!auction) {
      throw new Error('Auction not found');
    }

    const [currentBid] = await db
      .select()
      .from(bids)
      .where(eq(bids.auctionId, auctionId))
      .orderBy(bids.amount.desc())
      .limit(1);

    const [bidder] = currentBid ? await db
      .select({ firstName: users.firstName, lastName: users.lastName })
      .from(users)
      .where(eq(users.id, currentBid.userId))
      : [];

    return {
      auctionId,
      currentBid: currentBid ? parseFloat(currentBid.amount) : auction.startingBid || 0,
      bidCount: auction.bidCount || 0,
      timeRemaining: Math.max(0, new Date(auction.endTime).getTime() - Date.now()),
      leadingBidder: bidder ? `${bidder.firstName} ${bidder.lastName}` : undefined
    };
  }

  private async updateBidCache(auctionId: number, bid: any) {
    await this.redis.zadd(
      `auction:${auctionId}:bids`,
      bid.amount,
      JSON.stringify(bid)
    );
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}