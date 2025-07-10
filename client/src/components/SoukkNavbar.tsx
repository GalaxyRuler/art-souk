import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { SoukkLogo } from "@/components/SoukkLogo";
import { Menu, X, User, LogOut, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SoukkNavbar() {
  const { t } = useTranslation();
  const { toggleLanguage, isRTL, currentLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/artworks", label: t("nav.artworks") },
    { href: "/artists", label: t("nav.artists") },
    { href: "/galleries", label: t("nav.galleries") },
    { href: "/auctions", label: t("nav.auctions") },
    { href: "/workshops", label: t("nav.workshops") },
    { href: "/events", label: t("nav.events") },
    { href: "/dashboard", label: t("nav.dashboard"), requireAuth: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-soukk-surface/95 backdrop-blur-md border-b border-soukk-border">
      <div className="soukk-mashrabiya absolute inset-0 pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <SoukkLogo variant="wordmark" size="md" bilingual={isRTL} />
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "soukk-nav-link",
                      location === item.href && "active"
                    )}
                  >
                    {item.label}
                  </a>
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
              className="hidden md:flex items-center gap-2 text-soukk-text-secondary hover:text-soukk-majorelle-blue"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{currentLanguage === 'en' ? 'AR' : 'EN'}</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button className="soukk-button soukk-button-primary">
                    <User className="h-4 w-4 mr-2" />
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-soukk-text-secondary hover:text-soukk-terracotta"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="soukk-button soukk-button-gold">
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-soukk-text-secondary hover:text-soukk-majorelle-blue"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-soukk-border">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "block py-3 soukk-nav-link",
                      location === item.href && "active"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-soukk-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-soukk-text-secondary hover:text-soukk-majorelle-blue"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{currentLanguage === 'en' ? 'العربية' : 'English'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}