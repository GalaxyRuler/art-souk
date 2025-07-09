import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin, Calendar, Clock, Users, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Workshops() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const isRTL = language === "ar";

  const { data: workshops, isLoading } = useQuery({
    queryKey: ['/api/workshops'],
    retry: false,
  });

  const { data: featuredWorkshops } = useQuery({
    queryKey: ['/api/workshops/featured'],
    retry: false,
  });

  const handleRegisterWorkshop = async (workshopId: number) => {
    if (!isAuthenticated) {
      toast({
        title: t("auth.required"),
        description: t("workshops.loginToRegister"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    try {
      await apiRequest(`/api/workshops/${workshopId}/register`, {
        method: "POST",
      });
      toast({
        title: t("workshops.registrationSuccess"),
        description: t("workshops.registrationSuccessDesc"),
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("auth.unauthorized"),
          description: t("auth.loggingInAgain"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("workshops.registrationFailed"),
        description: t("workshops.registrationFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const filteredWorkshops = workshops?.filter((workshop: any) => {
    const matchesSearch = workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workshop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || workshop.category === selectedCategory;
    const matchesLevel = !selectedLevel || selectedLevel === "all" || workshop.skillLevel === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">{t("workshops.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-gradient">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-float">
            <span className="text-gradient">{t("workshops.title", "Art Workshops")}</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("workshops.subtitle", "Learn from skilled artists and galleries through hands-on workshops")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 card-glass rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
              <Input
                placeholder={t("workshops.search", "Search workshops...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 border-gray-300 focus:border-blue-500 rounded-xl"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 bg-white/80 border-gray-300 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder={t("workshops.category", "Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allCategories")}</SelectItem>
                <SelectItem value="painting">{t("workshops.categories.painting")}</SelectItem>
                <SelectItem value="sculpture">{t("workshops.categories.sculpture")}</SelectItem>
                <SelectItem value="drawing">{t("workshops.categories.drawing")}</SelectItem>
                <SelectItem value="digital">{t("workshops.categories.digital_art")}</SelectItem>
                <SelectItem value="photography">{t("workshops.categories.photography")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-12 bg-white/80 border-gray-300 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder={t("workshops.level", "Skill Level")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("workshops.skillLevel.all")}</SelectItem>
                <SelectItem value="beginner">{t("workshops.skillLevel.beginner")}</SelectItem>
                <SelectItem value="intermediate">{t("workshops.skillLevel.intermediate")}</SelectItem>
                <SelectItem value="advanced">{t("workshops.skillLevel.advanced")}</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl">
              <Filter className="h-5 w-5 mr-2" />
              {t("workshops.filter", "Filter")}
            </Button>
          </div>
        </div>

        {/* Featured Workshops */}
        {featuredWorkshops && featuredWorkshops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8">
              <span className="text-gradient">{t("workshops.featured", "Featured Workshops")}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWorkshops.map((workshop: any) => (
                <Card key={workshop.id} className="card-glass hover-lift rounded-2xl overflow-hidden border-gray-200">
                  <CardHeader className="bg-gradient-to-br from-blue-500/10 to-gray-500/10 pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {language === "ar" && workshop.titleAr ? workshop.titleAr : workshop.title}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">{t("common.featured")}</Badge>
                    </div>
                    <CardDescription className="text-gray-600 mt-2">
                      {language === "ar" && workshop.descriptionAr ? workshop.descriptionAr : workshop.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{formatDate(workshop.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="font-medium">{t("workshops.duration", { hours: workshop.duration })}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium">{t("workshops.participants", { current: workshop.currentParticipants, max: workshop.maxParticipants })}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{workshop.isOnline ? t("workshops.online") : workshop.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Badge className={cn("font-semibold", getSkillLevelColor(workshop.skillLevel))}>
                          {t(`workshops.skillLevel.${workshop.skillLevel}`)}
                        </Badge>
                        <span className="text-2xl font-bold text-gradient">
                          {workshop.price ? `${workshop.price} ${workshop.currency}` : t("workshops.free")}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleRegisterWorkshop(workshop.id)}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg"
                        disabled={workshop.currentParticipants >= workshop.maxParticipants}
                      >
                        {workshop.currentParticipants >= workshop.maxParticipants ? t("workshops.full") : t("workshops.register")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Workshops */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-8">
            <span className="text-gradient">{t("workshops.all", "All Workshops")}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorkshops?.map((workshop: any) => (
              <Card key={workshop.id} className="card-glass hover-lift rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {language === "ar" && workshop.titleAr ? workshop.titleAr : workshop.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {language === "ar" && workshop.descriptionAr ? workshop.descriptionAr : workshop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{formatDate(workshop.startDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium">{t("workshops.duration", { hours: workshop.duration })}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium">{t("workshops.participants", { current: workshop.currentParticipants, max: workshop.maxParticipants })}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{workshop.isOnline ? t("workshops.online") : workshop.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Badge className={cn("font-semibold", getSkillLevelColor(workshop.skillLevel))}>
                        {t(`workshops.skillLevel.${workshop.skillLevel}`)}
                      </Badge>
                      <span className="text-2xl font-bold text-gradient">
                        {workshop.price ? `${workshop.price} ${workshop.currency}` : t("workshops.free")}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleRegisterWorkshop(workshop.id)}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg"
                      disabled={workshop.currentParticipants >= workshop.maxParticipants}
                    >
                      {workshop.currentParticipants >= workshop.maxParticipants ? t("workshops.full") : t("workshops.register")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredWorkshops?.length === 0 && (
          <div className="text-center py-12 card-glass rounded-2xl p-16">
            <div className="text-gray-600 text-xl font-medium">
              {t("workshops.empty", "No workshops found matching your criteria.")}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}