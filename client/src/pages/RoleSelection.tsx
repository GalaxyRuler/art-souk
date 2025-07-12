import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { 
  Palette, 
  Building, 
  ShoppingBag, 
  Crown,
  Users,
  Sparkles,
  ArrowRight,
  Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface RoleOption {
  id: string;
  icon: React.ElementType;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  features: string[];
  featuresAr: string[];
  badge?: string;
  badgeAr?: string;
  primary?: boolean;
}

export default function RoleSelection() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions: RoleOption[] = [
    {
      id: "collector",
      icon: ShoppingBag,
      title: "Art Collector",
      titleAr: "جامع فني",
      description: "Discover Authentic GCC Art",
      descriptionAr: "اكتشف الفن الأصيل لدول مجلس التعاون الخليجي",
      features: [
        "🎨 Curated artwork from verified artists",
        "🤝 Direct artist communication",
        "🔍 Advanced discovery tools",
        "💎 Access to emerging talent",
        "📱 Seamless browsing experience"
      ],
      featuresAr: [
        "🎨 أعمال فنية منسقة من فنانين معتمدين",
        "🤝 تواصل مباشر مع الفنانين",
        "🔍 أدوات اكتشاف متقدمة",
        "💎 الوصول إلى المواهب الناشئة",
        "📱 تجربة تصفح سلسة"
      ],
      primary: true
    },
    {
      id: "artist",
      icon: Palette,
      title: "Artist",
      titleAr: "فنان",
      description: "Showcase Your Art to GCC Collectors",
      descriptionAr: "اعرض فنك أمام جامعي دول مجلس التعاون الخليجي",
      features: [
        "🎨 Professional artist portfolio",
        "🌍 Reach collectors across the GCC",
        "💼 Direct buyer connections",
        "📈 Track your artwork performance",
        "🤝 Join established artist community"
      ],
      featuresAr: [
        "🎨 ملف فني احترافي",
        "🌍 الوصول لجامعي دول مجلس التعاون الخليجي",
        "💼 اتصالات مباشرة مع المشترين",
        "📈 تتبع أداء أعمالك الفنية",
        "🤝 انضم لمجتمع الفنانين الراسخ"
      ],
      badge: "Popular",
      badgeAr: "شائع"
    },
    {
      id: "gallery",
      icon: Building,
      title: "Gallery",
      titleAr: "معرض",
      description: "Expand Your Gallery's Digital Presence",
      descriptionAr: "وسّع حضور معرضك الرقمي",
      features: [
        "🏛️ Professional gallery storefront",
        "👥 Manage multiple artist portfolios",
        "🎭 Host virtual exhibitions",
        "📊 Access collector insights",
        "🤝 Network with other galleries"
      ],
      featuresAr: [
        "🏛️ واجهة معرض احترافية",
        "👥 إدارة ملفات عدة فنانين",
        "🎭 استضافة معارض افتراضية",
        "📊 الوصول لرؤى الجامعين",
        "🤝 تواصل مع معارض أخرى"
      ],
      badge: "Professional",
      badgeAr: "مهني"
    }
  ];

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleContinue = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: t("roleSelection.selectAtLeastOne"),
        description: t("roleSelection.selectAtLeastOneDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('PUT', '/api/user/roles', { roles: selectedRoles });

      toast({
        title: t("roleSelection.success"),
        description: t("roleSelection.successDesc"),
      });

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error updating user roles:", error);
      toast({
        title: t("roleSelection.error"),
        description: t("roleSelection.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div className={cn("ml-3", isRTL && "ml-0 mr-3")}>
                <h1 className="text-xl font-bold bg-brand-gradient bg-clip-text text-transparent">
                  {t("common.siteName")}
                </h1>
                <p className="text-xs text-muted-foreground">{t("common.siteNameAr")}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                {t("roleSelection.welcome")}, {user?.firstName}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center space-y-6 mb-12">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              {t("roleSelection.setupAccount")}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              {t("roleSelection.chooseRole")}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t("roleSelection.subtitle")}
            </p>

            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{t("roleSelection.multipleRoles")}</span>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("roleSelection.required")}
                </span>
              </div>
            </div>
          </div>

          {/* Role Selection Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {roleOptions.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              const Icon = role.icon;
              
              return (
                <Card 
                  key={role.id}
                  className={cn(
                    "relative cursor-pointer transition-all duration-300 hover:shadow-lg",
                    isSelected && "ring-2 ring-purple-500 shadow-lg border-purple-200",
                    role.primary && "border-purple-200 bg-purple-50/50"
                  )}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          isSelected ? "bg-purple-500 text-white" : "bg-purple-100 text-purple-600"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {isRTL ? role.titleAr : role.title}
                          </CardTitle>
                          {role.badge && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {isRTL ? role.badgeAr : role.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => handleRoleToggle(role.id)}
                        className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-sm mb-4">
                      {isRTL ? role.descriptionAr : role.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      {(isRTL ? role.featuresAr : role.features).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={selectedRoles.length === 0 || isSubmitting}
              className="bg-brand-gradient hover:opacity-90 text-white px-8 py-3"
              size="lg"
            >
              {isSubmitting ? (
                t("roleSelection.setting")
              ) : (
                <>
                  {t("roleSelection.continue")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}