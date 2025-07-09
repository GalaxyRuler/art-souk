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
        title: "Authentication Required",
        description: "Please log in to register for workshops",
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
        title: "Registration Successful",
        description: "You've successfully registered for this workshop",
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Registration Failed",
        description: "Unable to register for this workshop. Please try again.",
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Loading workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-gradient">
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
              <Input
                placeholder={t("workshops.search", "Search workshops...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl">
                <SelectValue placeholder={t("workshops.category", "Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="sculpture">Sculpture</SelectItem>
                <SelectItem value="drawing">Drawing</SelectItem>
                <SelectItem value="digital">Digital Art</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl">
                <SelectValue placeholder={t("workshops.level", "Skill Level")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl">
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
                <Card key={workshop.id} className="card-glass hover-lift rounded-2xl overflow-hidden border-purple-200">
                  <CardHeader className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {language === "ar" && workshop.titleAr ? workshop.titleAr : workshop.title}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">Featured</Badge>
                    </div>
                    <CardDescription className="text-gray-600 mt-2">
                      {language === "ar" && workshop.descriptionAr ? workshop.descriptionAr : workshop.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{formatDate(workshop.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="font-medium">{workshop.duration} hours</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium">{workshop.currentParticipants}/{workshop.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{workshop.isOnline ? "Online" : workshop.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Badge className={cn("font-semibold", getSkillLevelColor(workshop.skillLevel))}>
                          {workshop.skillLevel}
                        </Badge>
                        <span className="text-2xl font-bold text-gradient">
                          {workshop.price ? `${workshop.price} ${workshop.currency}` : "Free"}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleRegisterWorkshop(workshop.id)}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg"
                        disabled={workshop.currentParticipants >= workshop.maxParticipants}
                      >
                        {workshop.currentParticipants >= workshop.maxParticipants ? "Workshop Full" : "Register Now"}
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
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium">{formatDate(workshop.startDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium">{workshop.duration} hours</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium">{workshop.currentParticipants}/{workshop.maxParticipants} participants</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{workshop.isOnline ? "Online" : workshop.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Badge className={cn("font-semibold", getSkillLevelColor(workshop.skillLevel))}>
                        {workshop.skillLevel}
                      </Badge>
                      <span className="text-2xl font-bold text-gradient">
                        {workshop.price ? `${workshop.price} ${workshop.currency}` : "Free"}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleRegisterWorkshop(workshop.id)}
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg"
                      disabled={workshop.currentParticipants >= workshop.maxParticipants}
                    >
                      {workshop.currentParticipants >= workshop.maxParticipants ? "Workshop Full" : "Register Now"}
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
    </div>
  );
}