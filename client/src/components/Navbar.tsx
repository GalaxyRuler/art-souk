import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, Menu, X, Heart, User } from "lucide-react";
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
    { key: "editorial", href: "/editorial" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary">
              <span className="text-accent">Artisan</span>
              <span className="text-xs text-gray-500 ml-2">
                {t("tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "text-gray-700 hover:text-primary transition-colors",
                  location === item.href && "text-primary font-medium"
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <LanguageToggle />

            {/* Search */}
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>

            {/* User Actions */}
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/api/logout")}
                >
                  {t("auth.logout")}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (window.location.href = "/api/login")}
                >
                  {t("auth.signin")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => (window.location.href = "/api/login")}
                >
                  {t("auth.signup")}
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "text-gray-700 hover:text-primary transition-colors",
                    location === item.href && "text-primary font-medium"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
