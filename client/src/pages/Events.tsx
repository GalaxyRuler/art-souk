import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Clock, Users, Search, Filter } from "lucide-react";
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

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
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesStatus = !selectedStatus || event.status === selectedStatus;
    
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
        return "bg-blue-100 text-blue-800";
      case "workshop":
        return "bg-green-100 text-green-800";
      case "talk":
        return "bg-yellow-100 text-yellow-800";
      case "networking":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading events...</p>
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
            {t("events.title", "Art Events")}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t("events.subtitle", "Discover and attend art events, exhibitions, and cultural gatherings")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("events.search", "Search events...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("events.category", "Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="talk">Talk</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t("events.status", "Status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <Filter className="h-4 w-4 mr-2" />
              {t("events.filter", "Filter")}
            </Button>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents && featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              {t("events.featured", "Featured Events")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event: any) => (
                <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white">
                        {language === "ar" && event.titleAr ? event.titleAr : event.title}
                      </CardTitle>
                      <Badge className="bg-purple-600 text-white">Featured</Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {language === "ar" && event.descriptionAr ? event.descriptionAr : event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.isOnline ? "Online" : event.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.currentAttendees}/{event.maxAttendees || "∞"} attendees</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(event.category)}>
                          {event.category}
                        </Badge>
                        <span className="text-white font-semibold">
                          {event.ticketPrice ? `${event.ticketPrice} ${event.currency}` : "Free"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRSVPEvent(event.id, "attending")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Attending
                        </Button>
                        <Button
                          onClick={() => handleRSVPEvent(event.id, "maybe")}
                          size="sm"
                          variant="outline"
                          className="border-white text-white hover:bg-white hover:text-black"
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
          <h2 className="text-2xl font-bold text-white mb-6">
            {t("events.all", "All Events")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents?.map((event: any) => (
              <Card key={event.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">
                    {language === "ar" && event.titleAr ? event.titleAr : event.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {language === "ar" && event.descriptionAr ? event.descriptionAr : event.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.isOnline ? "Online" : event.venue}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.currentAttendees}/{event.maxAttendees || "∞"} attendees</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                      <span className="text-white font-semibold">
                        {event.ticketPrice ? `${event.ticketPrice} ${event.currency}` : "Free"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRSVPEvent(event.id, "attending")}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Attending
                      </Button>
                      <Button
                        onClick={() => handleRSVPEvent(event.id, "maybe")}
                        size="sm"
                        variant="outline"
                        className="border-white text-white hover:bg-white hover:text-black"
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
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {t("events.empty", "No events found matching your criteria.")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}