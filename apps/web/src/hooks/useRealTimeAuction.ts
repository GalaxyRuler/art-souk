import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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

export interface BidPlacedEvent {
  auctionId: number;
  bid: any;
  auctionUpdate: AuctionUpdate;
}

export const useRealTimeAuction = (auctionId: number | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    if (!auctionId) return;

    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? 'wss://yoursite.com' 
      : 'ws://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to auction server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from auction server');
    });

    socketInstance.on('auction_state', (state: AuctionUpdate) => {
      setAuctionState(state);
    });

    socketInstance.on('bid_placed', (event: BidPlacedEvent) => {
      if (event.auctionId === auctionId) {
        setAuctionState(event.auctionUpdate);
        
        // Show toast notification for new bids
        toast({
          title: 'New Bid Placed',
          description: `${event.auctionUpdate.leadingBidder} bid ${event.auctionUpdate.currentBid} SAR`,
        });
      }
    });

    socketInstance.on('bid_error', (error: { message: string }) => {
      setIsPlacingBid(false);
      toast({
        title: 'Bid Error',
        description: error.message,
        variant: 'destructive',
      });
    });

    socketInstance.on('error', (error: { message: string }) => {
      toast({
        title: 'Connection Error',
        description: error.message,
        variant: 'destructive',
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [auctionId, toast]);

  // Join auction room when auction ID changes
  useEffect(() => {
    if (socket && auctionId) {
      socket.emit('join_auction', auctionId);
    }

    return () => {
      if (socket && auctionId) {
        socket.emit('leave_auction', auctionId);
      }
    };
  }, [socket, auctionId]);

  // Place a bid
  const placeBid = useCallback(async (amount: number) => {
    if (!socket || !user || !auctionId) {
      toast({
        title: 'Error',
        description: 'Unable to place bid. Please check your connection.',
        variant: 'destructive',
      });
      return false;
    }

    setIsPlacingBid(true);

    const bidData: BidData = {
      auctionId,
      userId: user.id,
      amount,
      timestamp: new Date()
    };

    return new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        setIsPlacingBid(false);
        toast({
          title: 'Bid Timeout',
          description: 'Bid took too long to process. Please try again.',
          variant: 'destructive',
        });
        resolve(false);
      }, 10000); // 10 second timeout

      // Listen for bid success/error
      const handleBidResult = (event: BidPlacedEvent) => {
        if (event.auctionId === auctionId && event.bid.userId === user.id) {
          clearTimeout(timeout);
          setIsPlacingBid(false);
          toast({
            title: 'Bid Placed Successfully',
            description: `Your bid of ${amount} SAR has been placed.`,
          });
          socket.off('bid_placed', handleBidResult);
          resolve(true);
        }
      };

      const handleBidError = (error: { message: string }) => {
        clearTimeout(timeout);
        setIsPlacingBid(false);
        socket.off('bid_error', handleBidError);
        resolve(false);
      };

      socket.on('bid_placed', handleBidResult);
      socket.on('bid_error', handleBidError);

      socket.emit('place_bid', bidData);
    });
  }, [socket, user, auctionId, toast]);

  // Get minimum bid amount
  const getMinimumBid = useCallback(() => {
    if (!auctionState) return 0;
    return auctionState.currentBid + 100; // Minimum increment of 100 SAR
  }, [auctionState]);

  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    if (!auctionState) return '00:00:00';
    
    const totalSeconds = Math.floor(auctionState.timeRemaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [auctionState]);

  return {
    auctionState,
    isConnected,
    isPlacingBid,
    placeBid,
    getMinimumBid,
    formatTimeRemaining,
    isAuctionActive: auctionState ? auctionState.timeRemaining > 0 : false
  };
};