import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Palette, Bell, Shield } from "lucide-react";

const categories = [
  "Painting", "Sculpture", "Photography", "Digital Art", 
  "Calligraphy", "Mixed Media", "Installation", "Printmaking"
];

const styles = [
  "Abstract", "Contemporary", "Traditional", "Modern",
  "Minimalist", "Expressionist", "Realistic", "Conceptual"
];

interface UserPreferences {
  preferredCategories?: string[];
  preferredStyles?: string[];
  preferredArtists?: number[];
  priceRange?: { min: number; max: number };
  notificationSettings?: {
    newArtworks: boolean;
    auctions: boolean;
    workshops: boolean;
    events: boolean;
    newsletter: boolean;
  };
  privacySettings?: {
    profilePublic: boolean;
    showFavorites: boolean;
    showActivity: boolean;
  };
}

export default function UserPreferences() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/preferences"],
    enabled: !!user,
  });

  const [formData, setFormData] = useState<UserPreferences>({
    preferredCategories: [],
    preferredStyles: [],
    priceRange: { min: 0, max: 100000 },
    notificationSettings: {
      newArtworks: true,
      auctions: true,
      workshops: true,
      events: true,
      newsletter: true,
    },
    privacySettings: {
      profilePublic: true,
      showFavorites: true,
      showActivity: true,
    },
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        preferredCategories: preferences.preferredCategories || [],
        preferredStyles: preferences.preferredStyles || [],
        priceRange: preferences.priceRange || { min: 0, max: 100000 },
        notificationSettings: preferences.notificationSettings || {
          newArtworks: true,
          auctions: true,
          workshops: true,
          events: true,
          newsletter: true,
        },
        privacySettings: preferences.privacySettings || {
          profilePublic: true,
          showFavorites: true,
          showActivity: true,
        },
      });
    }
  }, [preferences]);

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferences) => {
      await apiRequest("/api/preferences", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preferences"] });
      toast({
        title: t("preferences.saved", "Preferences saved"),
        description: t("preferences.savedDesc", "Your preferences have been updated successfully"),
      });
    },
    onError: () => {
      toast({
        title: t("preferences.error", "Error"),
        description: t("preferences.errorDesc", "Failed to save preferences"),
        variant: "destructive",
      });
    },
  });

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories?.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...(prev.preferredCategories || []), category],
    }));
  };

  const toggleStyle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      preferredStyles: prev.preferredStyles?.includes(style)
        ? prev.preferredStyles.filter(s => s !== style)
        : [...(prev.preferredStyles || []), style],
    }));
  };

  const handleSave = () => {
    updatePreferencesMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-navy to-brand-steel bg-clip-text text-transparent">
              {t("preferences.title", "Your Preferences")}
            </h1>
            <p className="text-gray-600">
              {t("preferences.subtitle", "Customize your experience and get personalized recommendations")}
            </p>
          </div>

          <div className="space-y-6">
            {/* Art Preferences */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-brand-navy" />
                  {t("preferences.artPreferences", "Art Preferences")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.artPreferencesDesc", "Help us understand your taste in art")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    {t("preferences.categories", "Preferred Categories")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={formData.preferredCategories?.includes(category) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          formData.preferredCategories?.includes(category)
                            ? "bg-brand-navy hover:bg-brand-steel"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Styles */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    {t("preferences.styles", "Preferred Styles")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {styles.map(style => (
                      <Badge
                        key={style}
                        variant={formData.preferredStyles?.includes(style) ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${
                          formData.preferredStyles?.includes(style)
                            ? "bg-brand-navy hover:bg-brand-steel"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => toggleStyle(style)}
                      >
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    {t("preferences.priceRange", "Price Range")}
                  </Label>
                  <div className="space-y-4">
                    <div className="px-3">
                      <Slider
                        value={[formData.priceRange?.min || 0, formData.priceRange?.max || 100000]}
                        onValueChange={(values) => setFormData(prev => ({
                          ...prev,
                          priceRange: { min: values[0], max: values[1] },
                        }))}
                        max={200000}
                        step={1000}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {language === "ar" ? "ر.س" : "SAR"} {formData.priceRange?.min?.toLocaleString()}
                      </span>
                      <span>
                        {language === "ar" ? "ر.س" : "SAR"} {formData.priceRange?.max?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-brand-navy" />
                  {t("preferences.notifications", "Notification Settings")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.notificationsDesc", "Choose what updates you want to receive")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.notificationSettings || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                      {t(`preferences.notifications.${key}`, key)}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings!,
                          [key]: checked,
                        },
                      }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-brand-navy" />
                  {t("preferences.privacy", "Privacy Settings")}
                </CardTitle>
                <CardDescription>
                  {t("preferences.privacyDesc", "Control your profile visibility")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.privacySettings || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                      {t(`preferences.privacy.${key}`, key)}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        privacySettings: {
                          ...prev.privacySettings!,
                          [key]: checked,
                        },
                      }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                size="lg"
                className="bg-brand-navy hover:bg-brand-steel"
                onClick={handleSave}
                disabled={updatePreferencesMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updatePreferencesMutation.isPending
                  ? t("preferences.saving", "Saving...")
                  : t("preferences.save", "Save Preferences")}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}