import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, Menu, X, Heart, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { isRTL } = useLanguage();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { key: "artists", href: "/artists" },
    { key: "galleries", href: "/galleries" },
    { key: "auctions", href: "/auctions" },
    { key: "workshops", href: "/workshops" },
    { key: "events", href: "/events" },
    { key: "commissions", href: "/commissions" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-navy to-brand-charcoal bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                {t("site.name")}
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5">
                {t("site.tagline")}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "text-foreground hover:text-brand-purple transition-all duration-300 font-medium text-base relative group",
                  location === item.href && "text-brand-purple"
                )}
              >
                {t(`nav.${item.key}`)}
                <span className={cn(
                  "absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-purple transition-all duration-300 group-hover:w-full",
                  location === item.href && "w-full"
                )} />
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Search */}
            <Button variant="ghost" size="sm" className="hover:bg-brand-light-gold hover:text-brand-purple">
              <Search className="h-5 w-5" />
            </Button>

            {/* User Actions */}
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hover:bg-brand-light-gold hover:text-brand-purple text-xs">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hover:bg-brand-light-gold hover:text-brand-purple">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hover:bg-brand-light-gold hover:text-brand-purple">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white"
                  onClick={() => (window.location.href = "/api/logout")}
                >
                  {t("auth.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-brand-light-gold hover:text-brand-purple"
                  >
                    {t("auth.signin")}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    className="bg-brand-gradient hover:opacity-90 text-white shadow-brand font-medium"
                    size="sm"
                  >
                    {t("auth.signup")}
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-brand-light-gold hover:text-brand-purple"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-brand-light-gold bg-white/95 backdrop-blur-lg">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "text-foreground hover:text-brand-purple transition-colors font-medium text-lg py-2",
                    location === item.href && "text-brand-purple"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
              
              {/* Mobile User Actions */}
              <div className="border-t border-brand-light-gold pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/dashboard"
                      className="text-foreground hover:text-brand-purple transition-colors font-medium text-lg py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("nav.dashboard") || "Dashboard"}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="text-foreground hover:text-brand-purple transition-colors font-medium text-lg py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      className="text-left text-foreground hover:text-brand-purple transition-colors font-medium text-lg py-2"
                      onClick={() => (window.location.href = "/api/logout")}
                    >
                      {t("auth.logout")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/auth"
                      className="text-foreground hover:text-brand-purple transition-colors font-medium text-lg py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("auth.signin")}
                    </Link>
                    <Link
                      href="/auth"
                      className="text-foreground hover:text-brand-purple transition-colors font-medium text-lg py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("auth.signup")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
