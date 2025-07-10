import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { NavbarRedesigned } from "@/components/NavbarRedesigned";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArtistCard } from "@/components/ArtistCard";
import { Badge } from "@/components/ui/badge";
import { FeaturedCollectionsRedesigned } from "@/components/FeaturedCollectionsRedesigned";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { cn, formatPrice } from "@/lib/utils";
import { Link } from "wouter";
import { Heart, TrendingUp, Clock, Users, ChevronRight, ChevronDown } from "lucide-react";

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
    <div className="min-h-screen bg-black">
      <NavbarRedesigned />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-zinc-900">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-50"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-wider mb-6">
              {t("home.welcome", { name: user?.firstName || t("home.user") })}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto">
              {t("home.subtitle")}
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 bg-black border-t border-zinc-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-6 text-center hover:border-orange-500 transition-colors">
                <Heart className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-black text-white mb-2">{userFavorites.length}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">{t("home.stats.favorites")}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 text-center hover:border-orange-500 transition-colors">
                <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-black text-white mb-2">{featuredArtworks.length}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">{t("home.stats.trending")}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 text-center hover:border-orange-500 transition-colors">
                <Clock className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-black text-white mb-2">{liveAuctions.length}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">{t("home.stats.liveAuctions")}</div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 text-center hover:border-orange-500 transition-colors">
                <Users className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-black text-white mb-2">{featuredArtists.length}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">{t("home.stats.artists")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Personalized Recommendations */}
        <section className="py-24 bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className={cn("flex justify-between items-center mb-12", isRTL && "flex-row-reverse")}>
              <div className={cn(isRTL && "text-right")}>
                <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
                  {t("home.recommendations.title")}
                </h2>
                <div className="w-24 h-1 bg-orange-500 mb-4"></div>
                <p className="text-gray-400 text-lg">{t("home.recommendations.subtitle")}</p>
              </div>
              <Link href="/artists">
                <Button className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-bold uppercase tracking-wider">
                  {t("home.recommendations.exploreArtists")}
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
                    {t("auctions.viewAll")}
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

        {/* Featured Collections */}
        <FeaturedCollectionsRedesigned />

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
                  {t("artists.viewAll")}
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
