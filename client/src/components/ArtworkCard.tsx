import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

interface ArtworkCardProps {
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    images: string[];
    artist?: {
      name: string;
      nameAr?: string;
    };
    gallery?: {
      name: string;
      nameAr?: string;
    };
    year?: number;
    medium?: string;
    mediumAr?: string;
    price?: string;
    currency?: string;
    category?: string;
    categoryAr?: string;
    availability?: string;
  };
  showPrice?: boolean;
  showCategory?: boolean;
  className?: string;
}

export function ArtworkCard({
  artwork,
  showPrice = true,
  showCategory = true,
  className,
}: ArtworkCardProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const title = isRTL && artwork.titleAr ? artwork.titleAr : artwork.title;
  const artistName = isRTL && artwork.artist?.nameAr ? artwork.artist.nameAr : artwork.artist?.name;
  const galleryName = isRTL && artwork.gallery?.nameAr ? artwork.gallery.nameAr : artwork.gallery?.name;
  const medium = isRTL && artwork.mediumAr ? artwork.mediumAr : artwork.medium;
  const category = isRTL && artwork.categoryAr ? artwork.categoryAr : artwork.category;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      setIsFavorited(!isFavorited);
      // TODO: Implement API call to add/remove favorite
    }
  };

  const getImageSrc = () => {
    if (artwork.images && artwork.images.length > 0) {
      return artwork.images[0];
    }
    // Fallback to placeholder
    return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300";
  };

  return (
    <Card
      className={cn(
        "overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/artwork/${artwork.id}`}>
        <div className="relative">
          {/* Artwork Image */}
          <img
            src={getImageSrc()}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay with Actions */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              isHovered && "opacity-100"
            )}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/80 hover:bg-white h-8 w-8 p-0"
                  onClick={handleFavorite}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                    )}
                  />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/80 hover:bg-white h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            {/* Status Badge */}
            {artwork.availability && (
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant={artwork.availability === "available" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {t(`artwork.status.${artwork.availability}`)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {showCategory && category && (
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-primary text-sm mb-1 line-clamp-1">
            {title}
          </h3>

          {/* Artist */}
          {artistName && (
            <p className="text-gray-600 text-xs mb-1 line-clamp-1">
              {artistName}
              {artwork.year && `, ${artwork.year}`}
            </p>
          )}

          {/* Medium */}
          {medium && (
            <p className="text-gray-500 text-xs mb-2 line-clamp-1 italic">
              {medium}
            </p>
          )}

          {/* Gallery */}
          {galleryName && (
            <p className="text-gray-500 text-xs mb-2 line-clamp-1">
              {galleryName}
            </p>
          )}

          {/* Price */}
          {showPrice && artwork.price && (
            <p className="text-primary font-semibold text-sm">
              {artwork.currency} {artwork.price}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
