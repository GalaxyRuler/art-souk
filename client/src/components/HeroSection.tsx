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
    <section className="relative bg-zinc-900 overflow-hidden min-h-[80vh] flex items-center">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-40 h-40 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-zinc-700 rounded-full blur-2xl"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-orange-400 rounded-full blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className={cn("space-y-10", isRTL && "text-right")}>
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight uppercase tracking-wider">
                {t("hero.title")}
                <span className="text-orange-500 block text-4xl md:text-5xl lg:text-6xl mt-2">
                  {t("hero.subtitle")}
                </span>
              </h1>
              <div className="w-24 h-1 bg-orange-500 mb-6"></div>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                {t("hero.description")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="bg-orange-500 text-black hover:bg-orange-600 shadow-lg text-lg px-8 py-4 h-auto font-bold uppercase tracking-wider"
                >
                  {t("hero.cta.browse")}
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-orange-500 text-black hover:bg-orange-600 shadow-lg text-lg px-8 py-4 h-auto font-bold uppercase tracking-wider"
                    onClick={() => (window.location.href = "/api/login")}
                  >
                    {t("hero.cta.start")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black text-lg px-8 py-4 h-auto font-bold uppercase tracking-wider"
                  >
                    {t("hero.cta.browse")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Featured Artwork */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/20 to-brand-gold/20 z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt={t("hero.featuredArt")}
                className="w-full h-96 md:h-[500px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 z-20">
                <p className="text-white/80 text-sm font-medium mb-2">{t("hero.featuredArtist")}</p>
                <p className="text-white text-2xl font-bold">{isRTL ? "أحمد الراشد" : "Ahmed Al-Rashid"}</p>
                <p className="text-brand-gold text-sm mt-1 font-medium">{isRTL ? "فنان سعودي معاصر" : "Contemporary Saudi Artist"}</p>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-brand-gold rounded-full shadow-gold opacity-80"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white rounded-full shadow-lg opacity-90"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
