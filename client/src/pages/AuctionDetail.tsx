import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gavel, Timer, Users, TrendingUp, ArrowLeft, Heart, Share2, AlertCircle, Eye, DollarSign } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuctionDetail {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  startingPrice: string;
  currentBid: string;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended';
  bidCount: number;
  viewCount?: number;
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    images: string[];
    year?: number;
    medium?: string;
    mediumAr?: string;
    dimensions?: string;
    artist?: {
      id: number;
      name: string;
      nameAr?: string;
      profileImage?: string;
    };
    gallery?: {
      id: number;
      name: string;
      nameAr?: string;
    };
  };
  bids?: Bid[];
  terms?: string;
  termsAr?: string;
  estimateLow?: string;
  estimateHigh?: string;
  reservePrice?: string;
  hasReserve?: boolean;
}

interface Bid {
  id: number;
  amount: string;
  currency: string;
  bidderName?: string; // For privacy, only show partial name
  createdAt: string;
  isWinning: boolean;
}

export default function AuctionDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const { data: auction, isLoading } = useQuery<AuctionDetail>({
    queryKey: [`/api/auctions/${id}`],
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const { data: recentBids } = useQuery<Bid[]>({
    queryKey: [`/api/auctions/${id}/bids`],
    enabled: !!auction,
    refetchInterval: autoRefresh ? 3000 : false,
  });

  const placeBidMutation = useMutation({
    mutationFn: async (amount: string) => {
      await apiRequest(`/api/auctions/${id}/bids`, {
        method: 'POST',
        body: { amount },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/auctions/${id}/bids`] });
      setBidAmount("");
      setIsPlacingBid(false);
      toast({
        title: "Bid placed successfully",
        description: "Your bid has been recorded. Good luck!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bid failed",
        description: error.message || "Failed to place bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const watchAuctionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/auctions/${id}/watch`, { method: 'POST' });
    },
    onSuccess: () => {
      toast({
        title: "Watching auction",
        description: "You'll receive notifications about this auction",
      });
    },
  });

  // Auto-refresh for live auctions
  useEffect(() => {
    if (auction?.status === 'live') {
      setAutoRefresh(true);
    } else {
      setAutoRefresh(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [auction?.status]);

  // Calculate time remaining
  useEffect(() => {
    if (!auction) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(auction.endDate).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining(`${seconds}s`);
        }
      } else {
        setTimeRemaining("Auction ended");
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-2xl"></div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("auctions.notFound")}</h1>
          <Link href="/auctions">
            <Button>{t("auctions.browseAuctions")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = (isRTL && auction.titleAr) ? auction.titleAr : auction.title;
  const description = (isRTL && auction.descriptionAr) ? auction.descriptionAr : auction.description;
  const artworkTitle = (isRTL && auction.artwork?.titleAr) ? auction.artwork?.titleAr : auction.artwork?.title;
  const artistName = (isRTL && auction.artwork?.artist?.nameAr) ? auction.artwork?.artist?.nameAr : auction.artwork?.artist?.name;
  const galleryName = (isRTL && auction.artwork?.gallery?.nameAr) ? auction.artwork?.gallery?.nameAr : auction.artwork?.gallery?.name;
  const medium = (isRTL && auction.artwork?.mediumAr) ? auction.artwork?.mediumAr : auction.artwork?.medium;
  const terms = (isRTL && auction.termsAr) ? auction.termsAr : auction.terms;

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      toast({
        title: t("auctions.bidding.invalidAmount"),
        description: t("auctions.bidding.invalidAmountDesc"),
        variant: "destructive",
      });
      return;
    }

    const currentBidAmount = parseFloat(auction.currentBid);
    const newBidAmount = parseFloat(bidAmount);
    const minBidIncrement = 100; // Minimum bid increment

    if (newBidAmount <= currentBidAmount) {
      toast({
        title: t("auctions.bidding.bidTooLow"),
        description: t("auctions.bidding.bidTooLowDesc", { amount: formatPrice(currentBidAmount, auction.currency, isRTL ? 'ar' : 'en') }),
        variant: "destructive",
      });
      return;
    }

    if (newBidAmount < currentBidAmount + minBidIncrement) {
      toast({
        title: t("auctions.bidding.incrementTooSmall"),
        description: t("auctions.bidding.incrementTooSmallDesc", { amount: formatPrice(minBidIncrement, auction.currency, isRTL ? 'ar' : 'en') }),
        variant: "destructive",
      });
      return;
    }

    placeBidMutation.mutate(bidAmount);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${title} - ${t("auctions.liveAuction")}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("common.linkCopied"),
        description: t("auctions.linkCopiedDesc"),
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return t("auctions.statusText.liveNow");
      case 'upcoming': return t("auctions.statusText.startingSoon");
      case 'ended': return t("auctions.statusText.ended");
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/auctions">
          <Button variant="ghost" className="mb-6 hover:bg-brand-light-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("auctions.backToAuctions")}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artwork Display */}
          <div className="space-y-6">
            <div className="relative">
              <img
                src={auction.artwork?.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"}
                alt={artworkTitle}
                className="w-full h-96 md:h-[500px] object-cover rounded-2xl shadow-brand"
              />
              <div className="absolute top-4 left-4">
                <Badge className={cn("text-white", getStatusColor(auction.status))}>
                  <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                  {getStatusText(auction.status)}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => watchAuctionMutation.mutate()}
                    disabled={watchAuctionMutation.isPending}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Artwork Info */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-brand-charcoal mb-2">
                  {artworkTitle}
                </h2>
                
                {auction.artwork?.artist && (
                  <Link href={`/artists/${auction.artwork.artist.id}`}>
                    <p className="text-lg text-brand-purple font-semibold hover:underline mb-2">
                      {artistName}
                    </p>
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {auction.artwork?.year && (
                    <div>
                      <span className="text-muted-foreground">{t("artwork.year")}:</span>
                      <p className="font-medium">{auction.artwork?.year}</p>
                    </div>
                  )}
                  
                  {medium && (
                    <div>
                      <span className="text-muted-foreground">{t("artwork.medium")}:</span>
                      <p className="font-medium">{medium}</p>
                    </div>
                  )}
                  
                  {auction.artwork?.dimensions && (
                    <div>
                      <span className="text-muted-foreground">{t("artwork.dimensions")}:</span>
                      <p className="font-medium">{auction.artwork?.dimensions}</p>
                    </div>
                  )}

                  {galleryName && (
                    <div>
                      <span className="text-muted-foreground">{t("artwork.gallery")}:</span>
                      <Link href={`/galleries/${auction.artwork?.gallery?.id}`}>
                        <p className="font-medium text-brand-purple hover:underline">{galleryName}</p>
                      </Link>
                    </div>
                  )}
                </div>

                {(auction.estimateLow || auction.estimateHigh) && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">{t("auctions.estimate")}:</span>
                    <p className="font-semibold text-brand-gold">
                      {auction.estimateLow && formatPrice(auction.estimateLow, auction.currency, isRTL ? 'ar' : 'en')}
                      {auction.estimateHigh && ` - ${formatPrice(auction.estimateHigh, auction.currency, isRTL ? 'ar' : 'en')}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bidding Interface */}
          <div className="space-y-6">
            {/* Current Bid & Timer */}
            <Card className="card-elevated border-brand-purple">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-brand-charcoal">{title}</span>
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-brand-purple" />
                    <span className="text-brand-purple font-mono">
                      {timeRemaining}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t("auctions.currentBid")}</p>
                  <p className="text-4xl font-bold text-brand-gold">
                    {formatPrice(auction.currentBid, auction.currency, isRTL ? 'ar' : 'en')}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{auction.bidCount} {t("auctions.bids")}</span>
                    </div>
                    {auction.viewCount && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{auction.viewCount} {t("common.views")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {auction.status === 'live' && isAuthenticated ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bidAmount" className="text-sm font-medium">
                        {t("auctions.yourBid")} ({isRTL ? 'ر.س' : 'SAR'})
                      </Label>
                      <form onSubmit={handlePlaceBid} className="flex gap-2 mt-2">
                        <Input
                          id="bidAmount"
                          type="number"
                          placeholder={t("auctions.enterBidAmount")}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          type="submit"
                          className="bg-brand-gradient"
                          disabled={placeBidMutation.isPending || !bidAmount}
                        >
                          <Gavel className="h-4 w-4 mr-2" />
                          {placeBidMutation.isPending ? t("auctions.placingBid") : t("auctions.placeBid")}
                        </Button>
                      </form>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {t("auctions.minimumBid")}: {formatPrice(parseInt(auction.currentBid) + 100, auction.currency, isRTL ? 'ar' : 'en')}</p>
                      <p>• {t("auctions.biddingIncrements")}: {formatPrice(100, auction.currency, isRTL ? 'ar' : 'en')}</p>
                      {auction.hasReserve && <p>• {t("auctions.hasReserve")}</p>}
                    </div>
                  </div>
                ) : auction.status === 'live' && !isAuthenticated ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-brand-purple mx-auto mb-3" />
                    <p className="text-brand-charcoal font-medium mb-2">{t("auctions.signInToBid")}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("auctions.signInToBidDesc")}
                    </p>
                    <Button className="bg-brand-gradient" onClick={() => window.location.href = '/api/login'}>
                      {t("auctions.signInToBidButton")}
                    </Button>
                  </div>
                ) : auction.status === 'upcoming' ? (
                  <div className="text-center py-4">
                    <Timer className="h-12 w-12 text-brand-purple mx-auto mb-3" />
                    <p className="text-brand-charcoal font-medium mb-2">{t("auctions.auctionStartingSoon")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("auctions.starts")}: {new Date(auction.startDate).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-brand-charcoal font-medium mb-2">{t("auctions.auctionEnded")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("auctions.finalBid")}: {formatPrice(auction.currentBid, auction.currency, isRTL ? 'ar' : 'en')}
                    </p>
                  </div>
                )}

                {auction.status === 'live' && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>{t("auctions.liveBidding")} • {t("auctions.updatesAutomatically")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bids */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-purple" />
                  {t("auctions.biddingActivity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {recentBids && recentBids.length > 0 ? (
                    <div className="space-y-2">
                      {recentBids.slice(0, 10).map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">
                              {formatPrice(bid.amount, bid.currency, isRTL ? 'ar' : 'en')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bid.bidderName || t("common.anonymous")} • {new Date(bid.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          {bid.isWinning && (
                            <Badge variant="default" className="bg-brand-gold text-brand-charcoal text-xs">
                              {t("auctions.leading")}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">{t("auctions.noBidsYet")}</p>
                      <p className="text-xs text-muted-foreground">{t("auctions.beFirstToBid")}</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Auction Details */}
            {description && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>{t("auctions.auctionDetails")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Terms & Conditions */}
            {terms && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>{t("auctions.termsAndConditions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {terms}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
