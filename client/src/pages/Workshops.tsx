import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Plus, MapPin, Calendar, Clock, Users, Search, Filter } from "lucide-react";
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
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("workshops.title", "Art Workshops")}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t("workshops.subtitle", "Learn from skilled artists and galleries through hands-on workshops")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("workshops.search", "Search workshops...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder={t("workshops.level", "Skill Level")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <Filter className="h-4 w-4 mr-2" />
              {t("workshops.filter", "Filter")}
            </Button>
          </div>
        </div>

        {/* Featured Workshops */}
        {featuredWorkshops && featuredWorkshops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              {t("workshops.featured", "Featured Workshops")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkshops.map((workshop: any) => (
                <Card key={workshop.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">
                        {language === "ar" && workshop.titleAr ? workshop.titleAr : workshop.title}
                      </CardTitle>
                      <Badge className="bg-purple-600 text-white">Featured</Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {language === "ar" && workshop.descriptionAr ? workshop.descriptionAr : workshop.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(workshop.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{workshop.duration} hours</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{workshop.currentParticipants}/{workshop.maxParticipants} participants</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{workshop.isOnline ? "Online" : workshop.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getSkillLevelColor(workshop.skillLevel)}>
                          {workshop.skillLevel}
                        </Badge>
                        <span className="text-white font-semibold">
                          {workshop.price ? `${workshop.price} ${workshop.currency}` : "Free"}
                        </span>
                      </div>
                      <Button
                        onClick={() => handleRegisterWorkshop(workshop.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={workshop.currentParticipants >= workshop.maxParticipants}
                      >
                        {workshop.currentParticipants >= workshop.maxParticipants ? "Full" : "Register"}
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
          <h2 className="text-2xl font-bold text-white mb-6">
            {t("workshops.all", "All Workshops")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops?.map((workshop: any) => (
              <Card key={workshop.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">
                    {language === "ar" && workshop.titleAr ? workshop.titleAr : workshop.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {language === "ar" && workshop.descriptionAr ? workshop.descriptionAr : workshop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(workshop.startDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{workshop.duration} hours</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{workshop.currentParticipants}/{workshop.maxParticipants} participants</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{workshop.isOnline ? "Online" : workshop.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={getSkillLevelColor(workshop.skillLevel)}>
                        {workshop.skillLevel}
                      </Badge>
                      <span className="text-white font-semibold">
                        {workshop.price ? `${workshop.price} ${workshop.currency}` : "Free"}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleRegisterWorkshop(workshop.id)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={workshop.currentParticipants >= workshop.maxParticipants}
                    >
                      {workshop.currentParticipants >= workshop.maxParticipants ? "Full" : "Register"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredWorkshops?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {t("workshops.empty", "No workshops found matching your criteria.")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}