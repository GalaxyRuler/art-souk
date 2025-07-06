import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface ArtistCardProps {
  artist: {
    id: number;
    name: string;
    nameAr?: string;
    biography?: string;
    biographyAr?: string;
    nationality?: string;
    birthYear?: number;
    profileImage?: string;
    coverImage?: string;
    featured?: boolean;
  };
  showBio?: boolean;
  className?: string;
}

export function ArtistCard({
  artist,
  showBio = true,
  className,
}: ArtistCardProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const name = isRTL && artist.nameAr ? artist.nameAr : artist.name;
  const biography = isRTL && artist.biographyAr ? artist.biographyAr : artist.biography;

  const getImageSrc = () => {
    if (artist.profileImage) {
      return artist.profileImage;
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
    >
      <Link href={`/artists/${artist.id}`}>
        <div className="relative">
          {/* Artist Image */}
          <img
            src={getImageSrc()}
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {artist.featured && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs">
                  {t("artist.featured")}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Name */}
          <h3 className="font-semibold text-primary text-lg mb-1 line-clamp-1">
            {name}
          </h3>

          {/* Details */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            {artist.nationality && (
              <span>{artist.nationality}</span>
            )}
            {artist.birthYear && (
              <>
                <span>•</span>
                <span>b. {artist.birthYear}</span>
              </>
            )}
          </div>

          {/* Biography */}
          {showBio && biography && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {biography}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
