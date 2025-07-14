import { Server as SocketServer } from 'socket.io';
import { Server } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { asyncHandler } from './middleware/errorHandler';

interface SocketUser {
  id: string;
  name: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export function setupSocketIO(server: Server) {
  const io = new SocketServer(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      credentials: true,
    },
    transports: ['websocket'],
  });

  // Redis adapter for scaling across multiple instances
  if (process.env.REDIS_URL) {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.IO Redis adapter connected');
      })
      .catch((error) => {
        console.error('❌ Redis adapter connection failed:', error);
      });
  }

  // Authentication middleware
  io.use(
    asyncHandler(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify token and get user info
        // This would typically verify a JWT token
        const user = await verifySocketToken(token);

        if (!user) {
          return next(new Error('Invalid authentication token'));
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    })
  );

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.name || 'Anonymous'} (${socket.id})`);

    // Join user to their personal room
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
    }

    // Auction event handlers
    socket.on(
      'join-auction',
      asyncHandler(async (auctionId: number) => {
        try {
          if (!auctionId || typeof auctionId !== 'number') {
            throw new Error('Invalid auction ID');
          }

          // Verify auction exists and is active
          const auction = await getAuctionById(auctionId);
          if (!auction) {
            socket.emit('error', { message: 'Auction not found' });
            return;
          }

          if (auction.status !== 'live') {
            socket.emit('error', { message: 'Auction is not live' });
            return;
          }

          // Join auction room
          socket.join(`auction:${auctionId}`);

          // Send current auction state
          socket.emit('auction-joined', {
            auctionId,
            currentBid: auction.currentBid,
            bidCount: auction.bidCount,
            timeLeft: auction.endDate,
          });

          console.log(`User ${socket.user?.name} joined auction ${auctionId}`);
        } catch (error) {
          console.error('Join auction error:', error);
          socket.emit('error', { message: 'Failed to join auction' });
        }
      })
    );

    socket.on(
      'leave-auction',
      asyncHandler(async (auctionId: number) => {
        try {
          socket.leave(`auction:${auctionId}`);
          console.log(`User ${socket.user?.name} left auction ${auctionId}`);
        } catch (error) {
          console.error('Leave auction error:', error);
        }
      })
    );

    socket.on(
      'place-bid',
      asyncHandler(async (data: { auctionId: number; amount: number }) => {
        try {
          const { auctionId, amount } = data;

          if (!socket.user) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          // Validate bid data
          if (!auctionId || !amount || typeof amount !== 'number' || amount <= 0) {
            socket.emit('error', { message: 'Invalid bid data' });
            return;
          }

          // Process bid through API
          const bidResult = await placeBid(auctionId, socket.user.id, amount);

          if (bidResult.success) {
            // Broadcast bid to all auction participants
            io.to(`auction:${auctionId}`).emit('bid-placed', {
              id: bidResult.bid.id,
              amount: bidResult.bid.amount,
              userId: socket.user.id,
              userName: socket.user.name,
              createdAt: bidResult.bid.createdAt,
            });

            // Update auction state
            io.to(`auction:${auctionId}`).emit('auction-updated', {
              currentBid: bidResult.bid.amount,
              bidCount: bidResult.auction.bidCount,
            });

            console.log(`Bid placed: ${socket.user.name} bid ${amount} on auction ${auctionId}`);
          } else {
            socket.emit('error', { message: bidResult.error });
          }
        } catch (error) {
          console.error('Place bid error:', error);
          socket.emit('error', { message: 'Failed to place bid' });
        }
      })
    );

    // Live updates for artworks
    socket.on(
      'watch-artwork',
      asyncHandler(async (artworkId: number) => {
        try {
          if (!artworkId || typeof artworkId !== 'number') {
            throw new Error('Invalid artwork ID');
          }

          socket.join(`artwork:${artworkId}`);
          console.log(`User ${socket.user?.name} watching artwork ${artworkId}`);
        } catch (error) {
          console.error('Watch artwork error:', error);
        }
      })
    );

    socket.on(
      'unwatch-artwork',
      asyncHandler(async (artworkId: number) => {
        try {
          socket.leave(`artwork:${artworkId}`);
          console.log(`User ${socket.user?.name} stopped watching artwork ${artworkId}`);
        } catch (error) {
          console.error('Unwatch artwork error:', error);
        }
      })
    );

    // Notification handling
    socket.on(
      'join-notifications',
      asyncHandler(async () => {
        try {
          if (!socket.user) {
            socket.emit('error', { message: 'Authentication required' });
            return;
          }

          socket.join(`notifications:${socket.user.id}`);
          console.log(`User ${socket.user.name} joined notifications`);
        } catch (error) {
          console.error('Join notifications error:', error);
        }
      })
    );

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      console.log(
        `User disconnected: ${socket.user?.name || 'Anonymous'} (${socket.id}) - ${reason}`
      );
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Closing Socket.IO server...');
    io.close();
  });

  return io;
}

// Helper functions (these would be imported from your service layer)
async function verifySocketToken(token: string): Promise<SocketUser | null> {
  // Implement token verification logic
  // This is a placeholder - implement based on your authentication system
  return null;
}

async function getAuctionById(id: number) {
  // Implement auction lookup logic
  // This would typically query your database
  return null;
}

async function placeBid(auctionId: number, userId: string, amount: number) {
  // Implement bid placement logic
  // This would typically interact with your database and validation logic
  return { success: false, error: 'Not implemented' };
}

// Export function to emit real-time updates
export function emitToRoom(io: SocketServer, room: string, event: string, data: any) {
  io.to(room).emit(event, data);
}

export function emitToUser(io: SocketServer, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToAuction(io: SocketServer, auctionId: number, event: string, data: any) {
  io.to(`auction:${auctionId}`).emit(event, data);
}

export function emitToArtwork(io: SocketServer, artworkId: number, event: string, data: any) {
  io.to(`artwork:${artworkId}`).emit(event, data);
}
