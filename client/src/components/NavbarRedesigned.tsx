import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function NavbarRedesigned() {
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 flex items-center justify-center">
                <span className="text-black font-black text-xl">AS</span>
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-wider hidden sm:block">
                {t("site.name")}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null;
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "text-sm font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer",
                      location === item.href
                        ? "text-orange-500"
                        : "text-gray-300 hover:text-white"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="text-gray-300 hover:text-white font-bold uppercase text-sm tracking-wider transition-colors"
            >
              {currentLanguage === "en" ? "عربي" : "EN"}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => logout()}
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button className="bg-orange-500 hover:bg-orange-600 text-black font-bold uppercase tracking-wider">
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-zinc-800">
            {navItems.map((item) => {
              if (item.requireAuth && !user) return null;
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "block py-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer",
                      location === item.href
                        ? "text-orange-500"
                        : "text-gray-300 hover:text-white"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}