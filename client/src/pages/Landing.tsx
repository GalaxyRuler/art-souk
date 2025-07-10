import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/useLanguage";
import { SoukkNavbar } from "@/components/SoukkNavbar";
import { SoukkLogo } from "@/components/SoukkLogo";
import { SoukkFooter } from "@/components/SoukkFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Calendar } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

export default function Landing() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

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
              {t("home.welcome", { name: t("home.guest") })}
            </h1>
            
            <p className="body-large text-soukk-text-secondary max-w-3xl mx-auto mb-8">
              {t("home.subtitle")}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth">
                <Button className="soukk-button soukk-button-primary">
                  {t("auth.signIn")}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="soukk-8-point-star bg-soukk-gold w-12 h-12 mx-auto mb-4"></div>
              <div className="heading-3 text-soukk-text-primary mb-2">5,000+</div>
              <div className="body-small text-soukk-text-secondary">{t("home.stats.artworks")}</div>
            </div>
            <div className="text-center">
              <div className="soukk-8-point-star bg-soukk-terracotta w-12 h-12 mx-auto mb-4"></div>
              <div className="heading-3 text-soukk-text-primary mb-2">500+</div>
              <div className="body-small text-soukk-text-secondary">{t("home.stats.artists")}</div>
            </div>
            <div className="text-center">
              <div className="soukk-8-point-star bg-soukk-majorelle w-12 h-12 mx-auto mb-4"></div>
              <div className="heading-3 text-soukk-text-primary mb-2">100+</div>
              <div className="body-small text-soukk-text-secondary">{t("home.stats.galleries")}</div>
            </div>
            <div className="text-center">
              <div className="soukk-8-point-star bg-soukk-sand w-12 h-12 mx-auto mb-4"></div>
              <div className="heading-3 text-soukk-text-primary mb-2">50+</div>
              <div className="body-small text-soukk-text-secondary">{t("home.stats.auctions")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-soukk-sand/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-soukk-text-primary mb-4">{t("home.featuredCollections")}</h2>
            <p className="body-large text-soukk-text-secondary">{t("home.featuredCollectionsDesc")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.slice(0, 3).map((collection: any) => (
              <div key={collection.id} className="soukk-card group cursor-pointer hover:scale-105 transition-transform duration-300">
                <div className="aspect-video bg-soukk-sand/20 rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-soukk-majorelle/20 to-soukk-terracotta/20"></div>
                </div>
                <h3 className="heading-4 text-soukk-text-primary mb-2">{collection.name}</h3>
                <p className="body-small text-soukk-text-secondary">{collection.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <Badge className="bg-soukk-gold/20 text-soukk-text-primary border-soukk-gold">
                    {collection.artworkCount} {t("home.artworks")}
                  </Badge>
                  <TrendingUp className="h-4 w-4 text-soukk-gold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-soukk-text-primary mb-4">{t("home.liveAuctions")}</h2>
            <p className="body-large text-soukk-text-secondary">{t("home.liveAuctionsDesc")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveAuctions.slice(0, 3).map((auction: any) => (
              <Link key={auction.id} href={`/auctions/${auction.id}`}>
                <div className="soukk-card group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <div className="aspect-video bg-soukk-sand/20 rounded-lg mb-4 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-soukk-majorelle/20 to-soukk-terracotta/20"></div>
                  </div>
                  <h3 className="heading-4 text-soukk-text-primary mb-2">{auction.title}</h3>
                  <p className="body-small text-soukk-text-secondary mb-4">{auction.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="body-small text-soukk-text-secondary">{t("auctions.currentBid")}</div>
                      <div className="heading-4 text-soukk-text-primary">{formatPrice(auction.currentBid)}</div>
                    </div>
                    <Badge className="bg-soukk-gold/20 text-soukk-text-primary border-soukk-gold">
                      <Calendar className="h-3 w-3 mr-1" />
                      {t("auctions.live")}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SoukkFooter />
    </div>
  );
}
