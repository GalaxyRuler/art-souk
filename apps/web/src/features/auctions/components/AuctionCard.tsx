import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Eye, Gavel } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

interface AuctionCardProps {
  auction: {
    id: number;
    title: string;
    titleAr: string;
    artist: string;
    imageUrl: string;
    currentBid: number;
    estimatedValue: number;
    endDate: string;
    status: "live" | "upcoming" | "ended";
    bidCount: number;
    viewCount: number;
  };
  onToggleFavorite: (auctionId: number) => void;
  isFavorite: boolean;
}

export function AuctionCard({ auction, onToggleFavorite, isFavorite }: AuctionCardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-green-100 text-green-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "ended": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const timeLeft = formatDistanceToNow(new Date(auction.endDate), { addSuffix: true });

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img
          src={auction.imageUrl}
          alt={isArabic ? auction.titleAr : auction.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className={getStatusColor(auction.status)}>
            {t(`auctions.status.${auction.status}`)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(auction.id)}
            className="bg-white/80 hover:bg-white"
            aria-label={isFavorite ? t("common.removeFavorite") : t("common.addFavorite")}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </Button>
        </div>
      </div>

      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">
          {isArabic ? auction.titleAr : auction.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{auction.artist}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{t("auctions.currentBid")}</p>
            <p className="text-lg font-semibold">
              {auction.currentBid.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("auctions.estimate")}</p>
            <p className="text-sm">
              {auction.estimatedValue.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {timeLeft}
          </div>
          <div className="flex items-center gap-1">
            <Gavel className="h-4 w-4" />
            {auction.bidCount} {t("auctions.bids")}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {auction.viewCount}
          </div>
        </div>

        <Link href={`/auctions/${auction.id}`}>
          <Button className="w-full" disabled={auction.status === "ended"}>
            {auction.status === "live" ? t("auctions.placeBid") : t("auctions.viewDetails")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}