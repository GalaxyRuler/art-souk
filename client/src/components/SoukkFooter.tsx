import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "wouter";
import { SoukkLogo } from "@/components/SoukkLogo";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function SoukkFooter() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const footerLinks = {
    marketplace: [
      { href: "/artworks", label: t("footer.marketplace.artworks") },
      { href: "/artists", label: t("footer.marketplace.artists") },
      { href: "/galleries", label: t("footer.marketplace.galleries") },
      { href: "/auctions", label: t("footer.marketplace.auctions") },
    ],
    community: [
      { href: "/workshops", label: t("footer.community.workshops") },
      { href: "/events", label: t("footer.community.events") },
      { href: "/about", label: t("footer.community.about") },
      { href: "/contact", label: t("footer.community.contact") },
    ],
    support: [
      { href: "/help", label: t("footer.support.help") },
      { href: "/terms", label: t("footer.support.terms") },
      { href: "/privacy", label: t("footer.support.privacy") },
      { href: "/shipping", label: t("footer.support.shipping") },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-soukk-charcoal-dark text-soukk-sand relative overflow-hidden">
      <div className="absolute inset-0 soukk-mashrabiya opacity-5"></div>
      
      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Logo and Tagline */}
            <div className="lg:col-span-2">
              <SoukkLogo variant="wordmark" size="lg" className="mb-4" />
              <p className="body-base text-soukk-sand/80 mb-6 max-w-sm">
                {t("footer.tagline")}
              </p>
              <div className="space-y-3">
                <a href="mailto:info@soukk.art" className="flex items-center gap-2 text-soukk-sand/60 hover:text-soukk-gold transition-colors">
                  <Mail className="h-4 w-4" />
                  <span className="body-small">info@soukk.art</span>
                </a>
                <a href="tel:+966501234567" className="flex items-center gap-2 text-soukk-sand/60 hover:text-soukk-gold transition-colors">
                  <Phone className="h-4 w-4" />
                  <span className="body-small" dir="ltr">+966 50 123 4567</span>
                </a>
                <div className="flex items-start gap-2 text-soukk-sand/60">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span className="body-small">{t("footer.location")}</span>
                </div>
              </div>
            </div>

            {/* Marketplace Links */}
            <div>
              <h3 className="heading-4 text-soukk-gold mb-4">{t("footer.marketplace.title")}</h3>
              <ul className="space-y-2">
                {footerLinks.marketplace.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <a className="body-small text-soukk-sand/60 hover:text-soukk-gold transition-colors">
                        {link.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="heading-4 text-soukk-gold mb-4">{t("footer.community.title")}</h3>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <a className="body-small text-soukk-sand/60 hover:text-soukk-gold transition-colors">
                        {link.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="heading-4 text-soukk-gold mb-4">{t("footer.support.title")}</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <a className="body-small text-soukk-sand/60 hover:text-soukk-gold transition-colors">
                        {link.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-12 pt-12 border-t border-soukk-charcoal-light">
            <div className="max-w-md mx-auto text-center">
              <h3 className="heading-4 text-soukk-gold mb-2">{t("footer.newsletter.title")}</h3>
              <p className="body-small text-soukk-sand/60 mb-4">
                {t("footer.newsletter.subtitle")}
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("footer.newsletter.placeholder")}
                  className="soukk-input flex-1 bg-soukk-charcoal border-soukk-charcoal-light text-soukk-sand placeholder:text-soukk-sand/40"
                />
                <button type="submit" className="soukk-button soukk-button-gold">
                  {t("footer.newsletter.subscribe")}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-soukk-charcoal-light">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <p className="caption text-soukk-sand/40 text-center md:text-left">
                © {new Date().getFullYear()} Soukk.art. {t("footer.copyright")}
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-soukk-charcoal-light flex items-center justify-center text-soukk-sand/60 hover:bg-soukk-gold hover:text-soukk-charcoal transition-all duration-200"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>

              {/* Language/Region */}
              <div className="caption text-soukk-sand/40">
                {t("footer.region")} • {isRTL ? "العربية" : "English"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}