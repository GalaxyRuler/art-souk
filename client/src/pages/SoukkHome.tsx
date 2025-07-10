import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { SoukkNavbar } from "@/components/SoukkNavbar";
import { SoukkLogo } from "@/components/SoukkLogo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Calendar } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export default function SoukkHome() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const { data: featuredArtworks = [] } = useQuery<any[]>({
    queryKey: ["/api/artworks/curators-picks"],
  });

  const { data: featuredCollections = [] } = useQuery<any[]>({
    queryKey: ["/api/collections/featured"],
  });

  const { data: liveAuctions = [] } = useQuery<any[]>({
    queryKey: ["/api/auctions/live"],
  });

  return (
    <div className="min-h-screen bg-soukk-background">
      <SoukkNavbar />
      
      {/* Hero Section with Arch Frame */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 soukk-zellige"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-soukk-background/50 to-soukk-background"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="soukk-animate-fade-in">
            <SoukkLogo variant="emblem" size="xl" showTagline={true} className="mb-8" />
            
            <h1 className="heading-1 text-soukk-text-primary mb-6">
              {user ? t("home.welcome", { name: user.firstName || t("home.user") }) : t("home.welcome", { name: t("home.guest") })}
            </h1>
            
            <p className="body-large text-soukk-text-secondary max-w-3xl mx-auto mb-8">
              {t("home.subtitle")}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/artworks">
                <Button className="soukk-button soukk-button-primary">
                  {t("home.exploreArtworks")}
                  <ArrowRight className={cn("ml-2 h-4 w-4", isRTL && "mr-2 ml-0 rotate-180")} />
                </Button>
              </Link>
              <Link href="/artists">
                <Button className="soukk-button soukk-button-secondary">
                  {t("home.discoverArtists")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative arch borders */}
        <div className="absolute bottom-0 left-0 w-32 h-32">
          <div className="soukk-arch-frame w-full h-full bg-soukk-gold opacity-10"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 scale-x-[-1]">
          <div className="soukk-arch-frame w-full h-full bg-soukk-gold opacity-10"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="soukk-divider"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Star, label: t("home.stats.featuredArt"), value: featuredArtworks.length, color: "gold" },
              { icon: TrendingUp, label: t("home.stats.liveAuctions"), value: liveAuctions.length, color: "terracotta" },
              { icon: Users, label: t("home.stats.artists"), value: "500+", color: "majorelle-blue" },
              { icon: Calendar, label: t("home.stats.events"), value: "12", color: "gold" },
            ].map((stat, index) => (
              <div key={index} className="soukk-card text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 text-soukk-${stat.color}`} />
                <div className="heading-3 text-soukk-text-primary mb-1">{stat.value}</div>
                <div className="caption text-soukk-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections with Arch Frames */}
      <section className="py-16 bg-soukk-surface relative overflow-hidden">
        <div className="absolute inset-0 soukk-mashrabiya"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-soukk-text-primary mb-4">
              {t("home.featuredCollections.title")}
            </h2>
            <p className="body-large text-soukk-text-secondary max-w-2xl mx-auto">
              {t("home.featuredCollections.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollections.slice(0, 3).map((collection: any) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <div className="group cursor-pointer">
                  <div className="soukk-arch-frame aspect-[4/5] bg-soukk-sand overflow-hidden mb-4">
                    <div className="w-full h-full bg-gradient-to-b from-soukk-majorelle-blue/20 to-soukk-terracotta/20 group-hover:scale-105 transition-transform duration-300"></div>
                  </div>
                  <h3 className="heading-4 text-soukk-text-primary mb-2">
                    {isRTL ? collection.nameAr || collection.name : collection.name}
                  </h3>
                  <p className="body-small text-soukk-text-secondary">
                    {collection.artworkCount} {t("common.artworks")}
                  </p>
                  <Badge className="soukk-badge soukk-badge-gold mt-2">
                    {t("common.featured")}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      {liveAuctions.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="heading-2 text-soukk-text-primary mb-2">
                  {t("home.liveAuctions.title")}
                </h2>
                <Badge className="soukk-badge soukk-badge-blue animate-pulse">
                  {t("auctions.live")}
                </Badge>
              </div>
              <Link href="/auctions">
                <Button className="soukk-button soukk-button-secondary">
                  {t("auctions.viewAll")}
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.slice(0, 3).map((auction: any) => (
                <div key={auction.id} className="soukk-card">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="heading-4 text-soukk-text-primary">{auction.title}</h3>
                    <Badge variant="destructive" className="animate-pulse">
                      {t("auctions.live")}
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="body-small text-soukk-text-secondary">{t("auctions.currentBid")}</span>
                      <span className="body-small font-semibold text-soukk-terracotta">
                        {formatPrice(parseFloat(auction.currentBid), auction.currency, isRTL ? 'ar' : 'en')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="body-small text-soukk-text-secondary">{t("auctions.bids")}</span>
                      <span className="body-small">{auction.bidCount}</span>
                    </div>
                  </div>
                  <Link href={`/auctions/${auction.id}`}>
                    <Button className="soukk-button soukk-button-primary w-full">
                      {t("auctions.placeBid")}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Artworks Grid */}
      <section className="py-16 bg-soukk-surface">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-soukk-text-primary mb-4">
              {t("home.curatorsPicks.title")}
            </h2>
            <p className="body-large text-soukk-text-secondary max-w-2xl mx-auto">
              {t("home.curatorsPicks.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArtworks.slice(0, 8).map((artwork: any) => (
              <Link key={artwork.id} href={`/artworks/${artwork.id}`}>
                <div className="soukk-card group cursor-pointer">
                  <div className="aspect-square bg-soukk-sand rounded-lg overflow-hidden mb-4">
                    {artwork.images?.[0] && (
                      <img 
                        src={artwork.images[0]} 
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h3 className="heading-4 text-soukk-text-primary mb-1 line-clamp-1">
                    {isRTL ? artwork.titleAr || artwork.title : artwork.title}
                  </h3>
                  <p className="body-small text-soukk-text-secondary mb-2">
                    {isRTL ? artwork.artist?.nameAr || artwork.artist?.name : artwork.artist?.name}
                  </p>
                  {artwork.price && (
                    <p className="body-base font-semibold text-soukk-gold">
                      {formatPrice(parseFloat(artwork.price), artwork.currency, isRTL ? 'ar' : 'en')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/artworks">
              <Button className="soukk-button soukk-button-gold">
                {t("home.viewAllArtworks")}
                <ArrowRight className={cn("ml-2 h-4 w-4", isRTL && "mr-2 ml-0 rotate-180")} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="soukk-divider"></div>
      <Footer />
    </div>
  );
}