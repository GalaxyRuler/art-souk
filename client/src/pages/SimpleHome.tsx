import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Calendar, Globe, User, LogOut, Heart, Eye, MessageSquare } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";

export default function SimpleHome() {
  const { toggleLanguage, isRTL, currentLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const { data: featuredArtworks = [] } = useQuery<any[]>({
    queryKey: ["/api/artworks/curators-picks"],
  });

  const { data: featuredCollections = [] } = useQuery<any[]>({
    queryKey: ["/api/collections/featured"],
  });

  const { data: liveAuctions = [] } = useQuery<any[]>({
    queryKey: ["/api/auctions/live"],
  });

  const getText = (key: string) => {
    const texts = {
      en: {
        brandName: "Souk.art",
        tagline: "Where Traditional Craft Meets Modern Canvas",
        welcome: "Welcome back",
        subtitle: "Discover and collect exceptional artwork from Saudi Arabia and the GCC region",
        exploreArtworks: "Explore Artworks",
        discoverArtists: "Discover Artists",
        home: "Home",
        artworks: "Artworks", 
        artists: "Artists",
        galleries: "Galleries",
        auctions: "Auctions",
        workshops: "Workshops",
        events: "Events",
        dashboard: "Dashboard",
        logout: "Logout",
        featuredCollections: "Featured Collections",
        featuredCollectionsDesc: "Curated collections showcasing the finest contemporary art",
        liveAuctions: "Live Auctions",
        liveAuctionsDesc: "Participate in exciting live auctions",
        curatorsPicks: "Curator's Picks",
        curatorsPicsDesc: "Hand-selected artworks by our expert curators",
        currentBid: "Current Bid",
        live: "Live",
        viewAll: "View All",
        liked: "Liked",
        viewed: "Viewed",
        inquired: "Inquired"
      },
      ar: {
        brandName: "سوق.آرت",
        tagline: "ملتقى الحِرفة والفن",
        welcome: "أهلاً وسهلاً",
        subtitle: "اكتشف واقتن أعمالاً فنية استثنائية من المملكة العربية السعودية ودول الخليج",
        exploreArtworks: "استكشف الأعمال الفنية",
        discoverArtists: "اكتشف الفنانين",
        home: "الرئيسية",
        artworks: "الأعمال الفنية",
        artists: "الفنانون",
        galleries: "المعارض",
        auctions: "المزادات",
        workshops: "الورش",
        events: "الفعاليات",
        dashboard: "لوحة التحكم",
        logout: "تسجيل الخروج",
        featuredCollections: "المجموعات المميزة",
        featuredCollectionsDesc: "مجموعات منسقة تعرض أفضل الفن المعاصر",
        liveAuctions: "المزادات المباشرة",
        liveAuctionsDesc: "شارك في مزادات مباشرة مثيرة",
        curatorsPicks: "اختيارات المنسقين",
        curatorsPicsDesc: "أعمال فنية مختارة بعناية من قبل منسقينا الخبراء",
        currentBid: "المزايدة الحالية",
        live: "مباشر",
        viewAll: "عرض الكل",
        liked: "أعجب",
        viewed: "شاهد",
        inquired: "استفسر"
      }
    };
    return texts[currentLanguage]?.[key] || key;
  };

  const navItems = [
    { href: "/", label: getText("home") },
    { href: "/artists", label: getText("artists") },
    { href: "/galleries", label: getText("galleries") },
    { href: "/auctions", label: getText("auctions") },
    { href: "/workshops", label: getText("workshops") },
    { href: "/events", label: getText("events") },
    { href: "/dashboard", label: getText("dashboard") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{getText("brandName")}</div>
                  <div className="text-xs text-stone-600">{getText("tagline")}</div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span className="text-stone-700 hover:text-blue-600 font-medium transition-colors">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLanguage === 'en' ? 'AR' : 'EN'}</span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <User className="h-4 w-4 mr-2" />
                    {getText("dashboard")}
                  </Button>
                </Link>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-stone-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-stone-900 mb-4">
              {getText("welcome")}, {user?.firstName || user?.claims?.first_name || "User"}!
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-8">
              {getText("subtitle")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/artworks">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {getText("exploreArtworks")}
                  <ArrowRight className={cn("ml-2 h-5 w-5", isRTL && "mr-2 ml-0 rotate-180")} />
                </Button>
              </Link>
              <Link href="/artists">
                <Button size="lg" variant="outline" className="border-stone-300 text-stone-700 hover:bg-stone-50">
                  {getText("discoverArtists")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curator's Picks */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">{getText("curatorsPicks")}</h2>
              <p className="text-stone-600">{getText("curatorsPicsDesc")}</p>
            </div>
            <Link href="/artworks">
              <Button variant="outline">{getText("viewAll")}</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtworks.slice(0, 6).map((artwork: any) => (
              <Link key={artwork.id} href={`/artwork/${artwork.id}`}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
                  <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-t-xl"></div>
                  <div className="p-6">
                    <h3 className="font-semibold text-stone-900 mb-2">{artwork.title}</h3>
                    <p className="text-stone-600 text-sm mb-4">{artwork.artist?.name || "Unknown Artist"}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-stone-900">
                        {formatPrice(artwork.price)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-xs text-stone-500">
                          <Heart className="h-3 w-3 mr-1" />
                          {artwork.likes || 0}
                        </div>
                        <div className="flex items-center text-xs text-stone-500">
                          <Eye className="h-3 w-3 mr-1" />
                          {artwork.views || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gradient-to-br from-stone-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{getText("featuredCollections")}</h2>
            <p className="text-stone-600">{getText("featuredCollectionsDesc")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.slice(0, 3).map((collection: any) => (
              <div key={collection.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4"></div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">{collection.name}</h3>
                <p className="text-stone-600 mb-4">{collection.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">
                    {collection.artworkCount || 0} {getText("artworks")}
                  </Badge>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{getText("liveAuctions")}</h2>
            <p className="text-stone-600">{getText("liveAuctionsDesc")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveAuctions.slice(0, 3).map((auction: any) => (
              <Link key={auction.id} href={`/auctions/${auction.id}`}>
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-4"></div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">{auction.title}</h3>
                  <p className="text-stone-600 mb-4">{auction.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-stone-600">{getText("currentBid")}</div>
                      <div className="text-lg font-bold text-stone-900">{formatPrice(auction.currentBid)}</div>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      <Calendar className="h-3 w-3 mr-1" />
                      {getText("live")}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">{getText("brandName")}</div>
                <div className="text-sm text-stone-400">{getText("tagline")}</div>
              </div>
            </div>
            <div className="text-stone-400 text-sm">
              © 2025 {getText("brandName")}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}