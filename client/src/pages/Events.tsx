import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, Users, Search, Filter } from "lucide-react";
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

export default function Events() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const isRTL = language === "ar";

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events'],
    retry: false,
  });

  const { data: featuredEvents } = useQuery({
    queryKey: ['/api/events/featured'],
    retry: false,
  });

  const handleRSVPEvent = async (eventId: number, status: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to RSVP for events",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    try {
      await apiRequest(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
      toast({
        title: "RSVP Successful",
        description: `You've successfully RSVP'd as ${status}`,
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
        title: "RSVP Failed",
        description: "Unable to RSVP for this event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events?.filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || event.category === selectedCategory;
    const matchesStatus = !selectedStatus || selectedStatus === "all" || event.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "exhibition":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "workshop":
        return "bg-green-100 text-green-800 border-green-200";
      case "talk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "networking":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Loading events...</p>
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
            <span className="text-gradient">{t("events.title", "Art Events")}</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("events.subtitle", "Discover and attend art events, exhibitions, and cultural gatherings")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-10 card-glass rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
              <Input
                placeholder={t("events.search", "Search events...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl">
                <SelectValue placeholder={t("events.category", "Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="talk">Talk</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-12 bg-white/80 border-purple-200 focus:border-purple-400 rounded-xl">
                <SelectValue placeholder={t("events.status", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl">
              <Filter className="h-5 w-5 mr-2" />
              {t("events.filter", "Filter")}
            </Button>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents && featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8">
              <span className="text-gradient">{t("events.featured", "Featured Events")}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event: any) => (
                <Card key={event.id} className="card-glass hover-lift rounded-2xl overflow-hidden border-purple-200">
                  <CardHeader className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {language === "ar" && event.titleAr ? event.titleAr : event.title}
                      </CardTitle>
                      <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">Featured</Badge>
                    </div>
                    <CardDescription className="text-gray-600 mt-2">
                      {language === "ar" && event.descriptionAr ? event.descriptionAr : event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="font-medium">{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{event.isOnline ? "Online" : event.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="font-medium">{event.currentAttendees}/{event.maxAttendees || "∞"} attendees</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Badge className={cn("font-semibold", getCategoryColor(event.category))}>
                          {event.category}
                        </Badge>
                        <span className="text-2xl font-bold text-gradient">
                          {event.ticketPrice ? `${event.ticketPrice} ${event.currency}` : "Free"}
                        </span>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleRSVPEvent(event.id, "attending")}
                          className="flex-1 h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl"
                        >
                          Attending
                        </Button>
                        <Button
                          onClick={() => handleRSVPEvent(event.id, "maybe")}
                          variant="outline"
                          className="flex-1 h-10 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl"
                        >
                          Maybe
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-8">
            <span className="text-gradient">{t("events.all", "All Events")}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents?.map((event: any) => (
              <Card key={event.id} className="card-glass hover-lift rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {language === "ar" && event.titleAr ? event.titleAr : event.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    {language === "ar" && event.descriptionAr ? event.descriptionAr : event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <span className="font-medium">{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{event.isOnline ? "Online" : event.venue}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium">{event.currentAttendees}/{event.maxAttendees || "∞"} attendees</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Badge className={cn("font-semibold", getCategoryColor(event.category))}>
                        {event.category}
                      </Badge>
                      <span className="text-2xl font-bold text-gradient">
                        {event.ticketPrice ? `${event.ticketPrice} ${event.currency}` : "Free"}
                      </span>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleRSVPEvent(event.id, "attending")}
                        className="flex-1 h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl"
                      >
                        Attending
                      </Button>
                      <Button
                        onClick={() => handleRSVPEvent(event.id, "maybe")}
                        variant="outline"
                        className="flex-1 h-10 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl"
                      >
                        Maybe
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredEvents?.length === 0 && (
          <div className="text-center py-12 card-glass rounded-2xl p-16">
            <div className="text-gray-600 text-xl font-medium">
              {t("events.empty", "No events found matching your criteria.")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}