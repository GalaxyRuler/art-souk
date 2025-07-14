import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { io, Socket } from "socket.io-client";

interface Bid {
  id: number;
  amount: number;
  userId: string;
  userName: string;
  createdAt: string;
}

interface AuctionData {
  id: number;
  title: string;
  currentBid: number;
  minimumBid: number;
  biddingIncrement: number;
  endDate: string;
  status: "live" | "upcoming" | "ended";
  bids: Bid[];
}

interface UseBiddingResult {
  auctionData: AuctionData | undefined;
  isLoading: boolean;
  error: Error | null;
  placeBid: (amount: number) => Promise<void>;
  isPlacingBid: boolean;
  timeLeft: string;
  canBid: boolean;
}

export function useAuctionBidding(auctionId: number): UseBiddingResult {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Fetch auction data
  const { data: auctionData, isLoading, error } = useQuery<AuctionData>({
    queryKey: ['auction', auctionId],
    queryFn: () => apiRequest(`/api/auctions/${auctionId}`),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Socket connection for real-time updates
  useEffect(() => {
    if (!auctionData || auctionData.status !== "live") return;

    const newSocket = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to auction socket');
      newSocket.emit('join-auction', auctionId);
    });

    newSocket.on('bid-placed', (bidData: Bid) => {
      queryClient.setQueryData(['auction', auctionId], (old: AuctionData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          currentBid: bidData.amount,
          bids: [bidData, ...old.bids],
        };
      });

      toast({
        title: t("auctions.newBidPlaced"),
        description: t("auctions.bidAmount", { amount: bidData.amount.toLocaleString() }),
      });
    });

    newSocket.on('auction-ended', () => {
      queryClient.setQueryData(['auction', auctionId], (old: AuctionData | undefined) => {
        if (!old) return old;
        return { ...old, status: "ended" as const };
      });

      toast({
        title: t("auctions.auctionEnded"),
        description: t("auctions.auctionEndedMessage"),
      });
    });

    newSocket.on('error', (errorData: { message: string }) => {
      toast({
        title: t("common.error"),
        description: errorData.message,
        variant: "destructive",
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-auction', auctionId);
      newSocket.close();
    };
  }, [auctionId, auctionData?.status, queryClient, t]);

  // Calculate time left
  useEffect(() => {
    if (!auctionData || auctionData.status !== "live") return;

    const updateTimeLeft = () => {
      const now = new Date();
      const endDate = new Date(auctionData.endDate);
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(t("auctions.ended"));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auctionData, t]);

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!isAuthenticated) {
        throw new Error(t("auth.loginRequired"));
      }

      if (!auctionData) {
        throw new Error(t("auctions.auctionNotFound"));
      }

      if (amount < auctionData.minimumBid) {
        throw new Error(t("auctions.bidTooLow", { minimum: auctionData.minimumBid }));
      }

      if (amount <= auctionData.currentBid) {
        throw new Error(t("auctions.bidMustBeHigher"));
      }

      const expectedMinimum = auctionData.currentBid + auctionData.biddingIncrement;
      if (amount < expectedMinimum) {
        throw new Error(t("auctions.bidIncrement", { minimum: expectedMinimum }));
      }

      return apiRequest(`/api/auctions/${auctionId}/bid`, {
        method: "POST",
        body: { amount },
      });
    },
    onSuccess: () => {
      toast({
        title: t("auctions.bidPlaced"),
        description: t("auctions.bidPlacedSuccess"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("auctions.bidFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canBid = Boolean(
    isAuthenticated &&
    auctionData &&
    auctionData.status === "live" &&
    new Date(auctionData.endDate) > new Date()
  );

  return {
    auctionData,
    isLoading,
    error,
    placeBid: placeBidMutation.mutateAsync,
    isPlacingBid: placeBidMutation.isPending,
    timeLeft,
    canBid,
  };
}