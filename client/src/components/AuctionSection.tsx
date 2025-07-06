import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "wouter";

interface Auction {
  id: number;
  title: string;
  titleAr?: string;
  artworkId: number;
  startingPrice: string;
  currentBid: string;
  currency: string;
  endDate: string;
  status: string;
  bidCount: number;
  artwork?: {
    title: string;
    titleAr?: string;
    images: string[];
    artist?: {
      name: string;
      nameAr?: string;
    };
  };
}

export function AuctionSection() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const { data: auctions = [], isLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions/live"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Mock data for auctions
  const mockAuctions = [
    {
      id: 1,
      title: "Contemporary Saudi Art Auction",
      titleAr: "مزاد الفن السعودي المعاصر",
      artworkId: 1,
      startingPrice: "15000",
      currentBid: "18000",
      currency: "SAR",
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "live",
      bidCount: 3,
      artwork: {
        title: "Cultural Heritage",
        titleAr: "التراث الثقافي",
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
        artist: {
          name: "Maryam Al-Thani",
          nameAr: "مريم الثاني"
        }
      }
    },
    {
      id: 2,
      title: "Kuwait Heritage Auction",
      titleAr: "مزاد التراث الكويتي",
      artworkId: 2,
      startingPrice: "20000",
      currentBid: "22000",
      currency: "SAR",
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming",
      bidCount: 5,
      artwork: {
        title: "Infinite Patterns",
        titleAr: "أنماط لا نهائية",
        images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
        artist: {
          name: "Abdullah Al-Sabah",
          nameAr: "عبدالله الصباح"
        }
      }
    },
    {
      id: 3,
      title: "UAE Modern Art House",
      titleAr: "دار الفن الحديث الإماراتية",
      artworkId: 3,
      startingPrice: "30000",
      currentBid: "35000",
      currency: "SAR",
      endDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: "live",
      bidCount: 12,
      artwork: {
        title: "Future Cities",
        titleAr: "مدن المستقبل",
        images: ["https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
        artist: {
          name: "Rania Al-Mahmoud",
          nameAr: "رانيا المحمود"
        }
      }
    },
    {
      id: 4,
      title: "Riyadh Fine Arts Auction",
      titleAr: "مزاد الفنون الجميلة بالرياض",
      artworkId: 4,
      startingPrice: "25000",
      currentBid: "28000",
      currency: "SAR",
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming",
      bidCount: 0,
      artwork: {
        title: "Desert Souls",
        titleAr: "أرواح الصحراء",
        images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
        artist: {
          name: "Hassan Al-Otaibi",
          nameAr: "حسن العتيبي"
        }
      }
    }
  ];

  const displayAuctions = auctions.length > 0 ? auctions : mockAuctions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive" className="text-xs">Live</Badge>;
      case "upcoming":
        return <Badge variant="secondary" className="text-xs">Upcoming</Badge>;
      case "ended":
        return <Badge variant="outline" className="text-xs">Ended</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return "Ended";

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days`;
    if (hours > 0) return `${hours} hours`;
    return "Ending soon";
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("flex justify-between items-center mb-12", isRTL && "flex-row-reverse")}>
          <div className={cn(isRTL && "text-right")}>
            <h2 className="text-3xl font-bold text-primary mb-4">
              {t("auctions.title")}
            </h2>
            <p className="text-gray-600">{t("auctions.description")}</p>
          </div>
          <Link href="/auctions">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-white"
            >
              {t("auctions.viewAll")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayAuctions.map((auction) => {
            const title = isRTL && auction.titleAr ? auction.titleAr : auction.title;
            const artworkTitle = isRTL && auction.artwork?.titleAr ? auction.artwork.titleAr : auction.artwork?.title;
            const artistName = isRTL && auction.artwork?.artist?.nameAr ? auction.artwork.artist.nameAr : auction.artwork?.artist?.name;
            const currencyDisplay = isRTL ? "ر.س" : "SAR";

            return (
              <Card key={auction.id} className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
                <div className="relative">
                  <img
                    src={auction.artwork?.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"}
                    alt={artworkTitle}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(auction.status)}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                      {auction.bidCount} bids
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-primary text-sm mb-1 line-clamp-1">
                    {artistName}
                  </h3>
                  <p className="text-gray-600 text-xs italic mb-2 line-clamp-1">
                    {artworkTitle}
                  </p>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-1">
                    {title}
                  </p>
                  <p className="text-primary font-semibold text-sm">
                    {currencyDisplay} {auction.currentBid}
                  </p>
                  <p className="text-xs text-gray-500">
                    {auction.status === "live" ? `Ends in ${getTimeRemaining(auction.endDate)}` : 
                     auction.status === "upcoming" ? `Starts ${getTimeRemaining(auction.endDate)}` : 
                     "Ended"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
