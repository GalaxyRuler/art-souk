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
  const { isAuthenticated } = useAuth();
  const { language, isRTL } = useLanguage();

  // Translation function helper - temporary solution
  const getText = (key: string, fallback: string) => {
    try {
      return language === 'ar' ? getArabicText(key) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const getArabicText = (key: string) => {
    const arabicTexts: Record<string, string> = {
      'common.siteName': 'آرت سوك',
      'common.siteNameAr': 'Art Souk',
      'auth.backToHome': 'العودة للرئيسية',
      'auth.badge': 'منصة جديدة',
      'auth.welcome': 'مرحباً بك في',
      'auth.artSouk': 'آرت سوك',
      'auth.subtitle': 'اكتشف واقتني أفضل الأعمال الفنية من فنانين موهوبين في المملكة العربية السعودية ودول الخليج',
      'auth.features.discover': 'اكتشف الأعمال الفنية',
      'auth.features.discoverDesc': 'تصفح مجموعة واسعة من الأعمال الفنية الأصلية',
      'auth.features.galleries': 'معارض فنية',
      'auth.features.galleriesDesc': 'زر أفضل المعارض الفنية في المنطقة',
      'auth.features.community': 'مجتمع فني',
      'auth.features.communityDesc': 'تواصل مع الفنانين وهواة الفن',
      'auth.features.collections': 'مجموعات مميزة',
      'auth.features.collectionsDesc': 'اكتشف مجموعات فنية منسقة بعناية',
      'auth.benefits.favorites': 'احفظ أعمالك الفنية المفضلة',
      'auth.benefits.inquiries': 'تواصل مباشر مع الفنانين',
      'auth.benefits.auctions': 'شارك في المزادات المباشرة',
      'auth.benefits.personalized': 'توصيات مخصصة لك',
      'auth.joinBenefits': 'مميزات الانضمام',
      'auth.getStarted': 'ابدأ رحلتك الفنية',
      'auth.joinCommunity': 'انضم إلى مجتمع الفن في الخليج',
      'auth.signUpFree': 'سجل مجاناً',
      'auth.alreadyMember': 'عضو بالفعل؟',
      'auth.signIn': 'تسجيل الدخول',
      'auth.trustedBy': 'موثوق من قبل الفنانين في دول الخليج',
      'auth.secureLogin': 'مصادقة آمنة مدعومة بواسطة'
    };
    return arabicTexts[key] || key;
  };

  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  const features = [
    {
      icon: Palette,
      title: getText("auth.features.discover", "Discover Art"),
      description: getText("auth.features.discoverDesc", "Browse a wide collection of original artworks"),
    },
    {
      icon: Building,
      title: getText("auth.features.galleries", "Art Galleries"),
      description: getText("auth.features.galleriesDesc", "Visit the best art galleries in the region"),
    },
    {
      icon: Users,
      title: getText("auth.features.community", "Art Community"),
      description: getText("auth.features.communityDesc", "Connect with artists and art enthusiasts"),
    },
    {
      icon: Crown,
      title: getText("auth.features.collections", "Featured Collections"),
      description: getText("auth.features.collectionsDesc", "Discover carefully curated art collections"),
    },
  ];

  const benefits = [
    getText("auth.benefits.favorites", "Save your favorite artworks"),
    getText("auth.benefits.inquiries", "Direct communication with artists"),
    getText("auth.benefits.auctions", "Participate in live auctions"),
    getText("auth.benefits.personalized", "Personalized recommendations"),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 dark:from-purple-950 dark:via-background dark:to-amber-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      </div>
      
      <div className="relative">
        {/* Header */}
        <header className="px-4 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div className={cn("ml-3", isRTL && "ml-0 mr-3")}>
                <h1 className="text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  {getText("common.siteName", "Art Souk")}
                </h1>
                <p className="text-xs text-muted-foreground">{getText("common.siteNameAr", "آرت سوك")}</p>
              </div>
            </Link>
            
            <Link href="/">
              <Button variant="ghost" size="sm">
                {getText("auth.backToHome", "Back to Home")}
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
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {getText("auth.badge", "New Platform")}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  {getText("auth.welcome", "Welcome to")}
                  <span className="block bg-brand-gradient bg-clip-text text-transparent">
                    {getText("auth.artSouk", "Art Souk")}
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {getText("auth.subtitle", "Discover and collect the finest artworks from talented artists in Saudi Arabia and the GCC countries")}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/70 transition-all duration-300"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Benefits List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center">
                  <Heart className="h-4 w-4 mr-2 text-red-500" />
                  {getText("auth.joinBenefits", "Join Benefits")}
                </h3>
                <div className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Auth Card */}
            <div className={cn("flex justify-center", isRTL && "lg:order-1")}>
              <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <Palette className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {getText("auth.getStarted", "Get Started")}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {getText("auth.joinCommunity", "Join our art community")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Primary CTA */}
                    <Button 
                      className="w-full bg-brand-gradient hover:opacity-90 text-white font-medium py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      <Globe className="h-5 w-5 mr-2" />
                      {getText("auth.signUpFree", "Sign Up Free")}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    {/* Or Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          {getText("auth.alreadyMember", "Already a member?")}
                        </span>
                      </div>
                    </div>

                    {/* Secondary CTA */}
                    <Button 
                      variant="outline" 
                      className="w-full py-6 text-base border-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      {getText("auth.signIn", "Sign In")}
                    </Button>
                  </div>

                  {/* Trust Signals */}
                  <div className="text-center space-y-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getText("auth.trustedBy", "Trusted by artists across the GCC")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {getText("auth.secureLogin", "Secure authentication powered by")} {" "}
            <span className="font-medium text-purple-600">Replit Auth</span>
          </p>
        </div>
      </div>
    </div>
  );
}
