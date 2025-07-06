import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArtistCard } from "@/components/ArtistCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { cn, formatPrice } from "@/lib/utils";
import { Link } from "wouter";
import { Heart, TrendingUp, Clock, Users } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const { data: featuredArtworks = [], isLoading: loadingArtworks } = useQuery({
    queryKey: ["/api/artworks/featured"],
  });

  const { data: featuredArtists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ["/api/artists/featured"],
  });

  const { data: userFavorites = [], isLoading: loadingFavorites } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  const { data: liveAuctions = [], isLoading: loadingAuctions } = useQuery({
    queryKey: ["/api/auctions/live"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Welcome Section */}
        <section className="bg-white py-12 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("text-center", isRTL && "text-right")}>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {t("home.welcome", { name: user?.firstName || t("home.user") })}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("home.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mx-auto mb-2">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-primary">{userFavorites.length}</div>
                <div className="text-sm text-gray-600">{t("home.stats.favorites")}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{featuredArtworks.length}</div>
                <div className="text-sm text-gray-600">{t("home.stats.trending")}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-primary">{liveAuctions.length}</div>
                <div className="text-sm text-gray-600">{t("home.stats.liveAuctions")}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-primary">{featuredArtists.length}</div>
                <div className="text-sm text-gray-600">{t("home.stats.artists")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Personalized Recommendations */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("flex justify-between items-center mb-8", isRTL && "flex-row-reverse")}>
              <div className={cn(isRTL && "text-right")}>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {t("home.recommendations.title")}
                </h2>
                <p className="text-gray-600">{t("home.recommendations.subtitle")}</p>
              </div>
              <Link href="/artworks">
                <Button variant="outline">
                  {t("common.viewAll")}
                </Button>
              </Link>
            </div>

            {loadingArtworks ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : featuredArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredArtworks.slice(0, 8).map((artwork: any) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("home.recommendations.empty")}</p>
                <Link href="/artists">
                  <Button className="mt-4">
                    {t("home.recommendations.exploreArtists")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Live Auctions */}
        {liveAuctions.length > 0 && (
          <section className="py-16 bg-red-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={cn("flex justify-between items-center mb-8", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-3", isRTL && "text-right")}>
                  <Badge variant="destructive" className="animate-pulse">
                    {t("auctions.live")}
                  </Badge>
                  <h2 className="text-2xl font-bold text-primary">
                    {t("home.liveAuctions.title")}
                  </h2>
                </div>
                <Link href="/auctions">
                  <Button variant="outline">
                    {t("common.viewAll")}
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveAuctions.slice(0, 6).map((auction: any) => (
                  <div key={auction.id} className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="destructive" className="text-xs">
                        {t("auctions.live")}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {auction.bidCount} {t("auctions.bids")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-primary mb-2">{auction.title}</h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      {formatPrice(parseFloat(auction.currentBid), auction.currency, isRTL ? 'ar' : 'en')}
                    </p>
                    <Button size="sm" className="w-full">
                      {t("auctions.placeBid")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Artists */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("flex justify-between items-center mb-8", isRTL && "flex-row-reverse")}>
              <div className={cn(isRTL && "text-right")}>
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {t("home.featuredArtists.title")}
                </h2>
                <p className="text-gray-600">{t("home.featuredArtists.subtitle")}</p>
              </div>
              <Link href="/artists">
                <Button variant="outline">
                  {t("common.viewAll")}
                </Button>
              </Link>
            </div>

            {loadingArtists ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : featuredArtists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArtists.slice(0, 6).map((artist: any) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("home.featuredArtists.empty")}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
