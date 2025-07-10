import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, TrendingUp, Users, Calendar, Globe, User, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function SimpleLanding() {
  const { toggleLanguage, isRTL, currentLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getText = (key: string) => {
    const texts = {
      en: {
        brandName: "Souk.art",
        tagline: "Where Traditional Craft Meets Modern Canvas",
        taglineAr: "ملتقى الحِرفة والفن",
        welcome: "Welcome to the Premier Art Marketplace",
        subtitle: "Discover authentic artwork from Saudi Arabia and the GCC region. Connect with renowned artists, explore curated collections, and participate in exclusive auctions.",
        signIn: "Sign In",
        discoverArtists: "Discover Artists",
        home: "Home",
        artworks: "Artworks", 
        artists: "Artists",
        galleries: "Galleries",
        auctions: "Auctions",
        workshops: "Workshops",
        events: "Events",
        dashboard: "Dashboard",
        login: "Login",
        featuredCollections: "Featured Collections",
        featuredCollectionsDesc: "Curated collections showcasing the finest contemporary art from the region",
        liveAuctions: "Live Auctions",
        liveAuctionsDesc: "Participate in exciting live auctions featuring exceptional artworks",
        currentBid: "Current Bid",
        live: "Live",
        statsArtworks: "Artworks",
        statsArtists: "Artists", 
        statsGalleries: "Galleries",
        statsAuctions: "Auctions"
      },
      ar: {
        brandName: "سوق.آرت",
        tagline: "ملتقى الحِرفة والفن",
        taglineAr: "Where Traditional Craft Meets Modern Canvas",
        welcome: "مرحباً بك في سوق الفن الرائد",
        subtitle: "اكتشف الأعمال الفنية الأصيلة من المملكة العربية السعودية ودول الخليج. تواصل مع فنانين مشهورين واستكشف مجموعات منسقة وشارك في مزادات حصرية.",
        signIn: "تسجيل الدخول",
        discoverArtists: "اكتشف الفنانين",
        home: "الرئيسية",
        artworks: "الأعمال الفنية",
        artists: "الفنانون",
        galleries: "المعارض",
        auctions: "المزادات",
        workshops: "الورش",
        events: "الفعاليات",
        dashboard: "لوحة التحكم",
        login: "تسجيل الدخول",
        featuredCollections: "المجموعات المميزة",
        featuredCollectionsDesc: "مجموعات منسقة تعرض أفضل الفن المعاصر من المنطقة",
        liveAuctions: "المزادات المباشرة",
        liveAuctionsDesc: "شارك في مزادات مباشرة مثيرة تضم أعمالاً فنية استثنائية",
        currentBid: "المزايدة الحالية",
        live: "مباشر",
        statsArtworks: "عمل فني",
        statsArtists: "فنان",
        statsGalleries: "معرض",
        statsAuctions: "مزاد"
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
    { href: "/dashboard", label: getText("dashboard"), requireAuth: true },
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
              {navItems.map((item) => {
                if (item.requireAuth && !user) return null;
                return (
                  <Link key={item.href} href={item.href}>
                    <span className="text-stone-700 hover:text-blue-600 font-medium transition-colors">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
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
              {user ? (
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
              ) : (
                <Link href="/auth">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {getText("login")}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-stone-900 mb-6">
              {getText("welcome")}
            </h1>
            <p className="text-xl text-stone-600 max-w-4xl mx-auto mb-8">
              {getText("subtitle")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {getText("signIn")}
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

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-stone-600">{getText("statsArtworks")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-stone-600">{getText("statsArtists")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100+</div>
              <div className="text-stone-600">{getText("statsGalleries")}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-violet-600 mb-2">50+</div>
              <div className="text-stone-600">{getText("statsAuctions")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-20 bg-gradient-to-br from-stone-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">{getText("featuredCollections")}</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">{getText("featuredCollectionsDesc")}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-6"></div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">Contemporary Saudi Art</h3>
                <p className="text-stone-600 mb-4">A curated collection featuring the finest contemporary artworks from Saudi Arabia.</p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">25 {getText("artworks")}</Badge>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </div>
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