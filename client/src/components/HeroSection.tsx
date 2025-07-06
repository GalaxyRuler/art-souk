import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  return (
    <section className="relative bg-gradient-to-r from-warm-sand to-gray-100 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-accent rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-arabic-gold rounded-full opacity-15"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={cn("space-y-8", isRTL && "text-right")}>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
              {t("hero.title")}
              <span className="text-accent block">{t("hero.subtitle")}</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="bg-primary hover:bg-gray-800 text-white"
                >
                  {t("hero.cta.browse")}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-gray-800 text-white"
                    onClick={() => (window.location.href = "/api/login")}
                  >
                    {t("hero.cta.start")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {t("hero.cta.browse")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Featured Artwork */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt={t("hero.featuredArt")}
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <p className="text-white text-sm">{t("hero.featuredArtist")}</p>
                <p className="text-white text-lg font-medium">Ahmed Al-Rashid</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
