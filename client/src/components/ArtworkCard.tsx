import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isHovered, setIsHovered] = useState(false);

  const title = isRTL && artwork.titleAr ? artwork.titleAr : artwork.title;
  const artistName = isRTL && artwork.artist?.nameAr ? artwork.artist.nameAr : artwork.artist?.name;
  const galleryName = isRTL && artwork.gallery?.nameAr ? artwork.gallery.nameAr : artwork.gallery?.name;
  const medium = isRTL && artwork.mediumAr ? artwork.mediumAr : artwork.medium;
  const category = isRTL && artwork.categoryAr ? artwork.categoryAr : artwork.category;

  // Check if artwork is favorited
  const { data: isFavorite } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/${artwork.id}/check`],
    enabled: isAuthenticated,
  });

  // Favorites mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite?.isFavorite) {
        await apiRequest(`/api/favorites/${artwork.id}`, { method: 'DELETE' });
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: { artworkId: artwork.id },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${artwork.id}/check`] });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorite?.isFavorite ? t("favorites.removed") : t("favorites.added"),
        description: isFavorite?.isFavorite ? t("favorites.removedDesc") : t("favorites.addedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: t("favorites.error"),
        variant: "destructive",
      });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      favoriteMutation.mutate();
    } else {
      toast({
        title: t("auth.loginRequired"),
        description: t("favorites.loginToFavorite"),
        variant: "destructive",
      });
    }
  };

  const getImageSrc = () => {
    if (artwork.images && Array.isArray(artwork.images) && artwork.images.length > 0) {
      return artwork.images[0];
    }
    // Fallback to placeholder
    return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300";
  };

  return (
    <Card
      className={cn(
        "overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl card-glass hover-lift",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/artwork/${artwork.id}`}>
        <div className="relative">
          {/* Artwork Image */}
          <div className="relative overflow-hidden">
            <img
              src={getImageSrc()}
              alt={title}
              className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-deep-purple/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Overlay with Actions */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              isHovered && "opacity-100"
            )}
          >
            <div className="absolute top-4 right-4 flex gap-3">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/90 hover:bg-white h-10 w-10 p-0 rounded-full shadow-lg backdrop-blur-sm"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isFavorite?.isFavorite ? "fill-red-500 text-red-500" : "text-brand-charcoal",
                      favoriteMutation.isPending && "opacity-50"
                    )}
                  />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/90 hover:bg-white h-10 w-10 p-0 rounded-full shadow-lg backdrop-blur-sm"
              >
                <Eye className="h-5 w-5 text-brand-charcoal" />
              </Button>
            </div>

            {/* Status Badge */}
            {artwork.availability && (
              <div className="absolute bottom-4 left-4">
                <Badge
                  variant={artwork.availability === "available" ? "default" : "secondary"}
                  className={cn(
                    "text-xs font-semibold px-3 py-1",
                    artwork.availability === "available" 
                      ? "bg-brand-gold text-white shadow-lg" 
                      : "bg-white/90 text-brand-charcoal"
                  )}
                >
                  {t(`artwork.status.${artwork.availability}`)}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-3">
          {/* Category */}
          {showCategory && category && (
            <div>
              <Badge 
                variant="outline" 
                className="text-xs border-brand-purple/30 text-brand-purple bg-brand-purple/5"
              >
                {category}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="font-bold text-brand-charcoal text-lg mb-2 line-clamp-2 leading-tight">
            {title}
          </h3>

          {/* Artist */}
          {artistName && (
            <p className="text-brand-purple font-medium text-sm line-clamp-1">
              {artistName}
              {artwork.year && <span className="text-muted-foreground ml-1">• {artwork.year}</span>}
            </p>
          )}

          {/* Medium */}
          {medium && (
            <p className="text-muted-foreground text-sm line-clamp-1 italic">
              {medium}
            </p>
          )}

          {/* Gallery */}
          {galleryName && (
            <p className="text-muted-foreground text-sm line-clamp-1">
              {galleryName}
            </p>
          )}

          {/* Price */}
          {showPrice && artwork.price && (
            <div className="pt-2 border-t border-brand-light-gold/50">
              <p className="text-brand-gold font-bold text-lg">
                {formatPrice(artwork.price, artwork.currency || 'SAR', isRTL ? 'ar' : 'en')}
              </p>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
