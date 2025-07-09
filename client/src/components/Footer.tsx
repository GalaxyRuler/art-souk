import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Newsletter Section */}
          <div>
            <h2 className="text-3xl font-bold mb-4">{t("footer.newsletter.title")}</h2>
            <p className="text-gray-300 mb-6">
              {t("footer.newsletter.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder={t("footer.newsletter.placeholder")}
                className="flex-1 bg-white text-gray-900"
              />
              <Button variant="secondary" className="bg-accent hover:bg-accent/90">
                {t("footer.newsletter.subscribe")}
              </Button>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{t("footer.explore.title")}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/artists" className="hover:text-white transition-colors">
                    {t("nav.artists")}
                  </Link>
                </li>
                <li>
                  <Link href="/galleries" className="hover:text-white transition-colors">
                    {t("nav.galleries")}
                  </Link>
                </li>
                <li>
                  <Link href="/auctions" className="hover:text-white transition-colors">
                    {t("nav.auctions")}
                  </Link>
                </li>
                <li>
                  <Link href="/workshops" className="hover:text-white transition-colors">
                    {t("nav.workshops")}
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-white transition-colors">
                    {t("nav.events")}
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="hover:text-white transition-colors">
                    {t("nav.community")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("footer.resources.title")}</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/guide" className="hover:text-white transition-colors">
                    {t("footer.resources.guide")}
                  </Link>
                </li>
                <li>
                  <Link href="/investment" className="hover:text-white transition-colors">
                    {t("footer.resources.investment")}
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white transition-colors">
                    {t("footer.resources.support")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 mb-4 sm:mb-0">
            <div className="text-xl font-bold">
              <span className="text-accent">{t("common.siteName")}</span>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
