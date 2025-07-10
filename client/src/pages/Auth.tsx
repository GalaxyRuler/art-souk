import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { 
  Palette, 
  Building, 
  Users, 
  Globe, 
  Star, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Crown,
  Heart
} from "lucide-react";
import { Link } from "wouter";

export default function Auth() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { isRTL } = useLanguage();

  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  const features = [
    {
      icon: Palette,
      title: t("auth.features.discover"),
      description: t("auth.features.discoverDesc"),
    },
    {
      icon: Building,
      title: t("auth.features.galleries"),
      description: t("auth.features.galleriesDesc"),
    },
    {
      icon: Users,
      title: t("auth.features.community"),
      description: t("auth.features.communityDesc"),
    },
    {
      icon: Crown,
      title: t("auth.features.collections"),
      description: t("auth.features.collectionsDesc"),
    },
  ];

  const benefits = [
    t("auth.benefits.favorites"),
    t("auth.benefits.inquiries"),
    t("auth.benefits.auctions"),
    t("auth.benefits.personalized"),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative">
        {/* Header */}
        <header className="px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div className={cn("ml-3", isRTL && "ml-0 mr-3")}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  {t("common.siteName")}
                </h1>
                <p className="text-xs text-zinc-400">{t("common.siteNameAr")}</p>
              </div>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
                {t("auth.backToHome")}
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Marketing Content */}
            <div className={cn("space-y-8", isRTL && "lg:order-2")}>
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("auth.badge")}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-wide">
                  {t("auth.welcome")}
                  <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    {t("auth.artSouk")}
                  </span>
                </h1>
                
                <p className="text-xl text-zinc-300 leading-relaxed">
                  {t("auth.subtitle")}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
                      <p className="text-xs text-zinc-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Benefits List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-white flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-orange-500" />
                  {t("auth.joinBenefits")}
                </h3>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Auth Card */}
            <div className={cn("flex justify-center", isRTL && "lg:order-1")}>
              <Card className="w-full max-w-md shadow-2xl border border-zinc-800/50 bg-zinc-900/80 backdrop-blur-lg">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Palette className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {t("auth.getStarted")}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {t("auth.joinCommunity")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Primary CTA */}
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      {t("auth.signUpFree")}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    {/* Or Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-zinc-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-zinc-900 px-2 text-zinc-400">
                          {t("auth.alreadyMember")}
                        </span>
                      </div>
                    </div>

                    {/* Secondary CTA */}
                    <Button 
                      variant="outline" 
                      className="w-full py-6 text-base border-2 border-zinc-700 hover:bg-zinc-800 hover:border-orange-500 text-zinc-300 hover:text-white transition-all duration-300"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      {t("auth.signIn")}
                    </Button>
                  </div>

                  {/* Trust Signals */}
                  <div className="text-center space-y-2 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-center space-x-1 text-orange-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {t("auth.trustedBy")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-zinc-400">
            {t("auth.secureLogin")} {" "}
            <span className="font-medium text-orange-500">Replit Auth</span>
          </p>
        </div>
      </div>
    </div>
  );
}