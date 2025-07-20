import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Search, Filter, Grid, List, ExternalLink, Heart, Clock, Users, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface GalleryEvent {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  eventType: string;
  featured: boolean;
  coverImage?: string;
  status: string;
  maxAttendees?: number;
}

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  images: string[];
  year: number;
  medium: string;
  price: string;
  currency: string;
  availability: string;
  category: string;
  artist: {
    id: number;
    name: string;
    nameAr?: string;
  };
}

// Gallery Events Table Component
export function GalleryEventsTable({ galleryId }: { galleryId: number }) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: events = [], isLoading } = useQuery<GalleryEvent[]>({
    queryKey: [`/api/galleries/${galleryId}/events`],
    staleTime: 30000,
  });

  const filteredEvents = events.filter(event => {
    const title = isRTL && event.titleAr ? event.titleAr : event.title;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={String(t('gallery.searchEvents'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={String(t('gallery.allEvents'))} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('gallery.allEvents')}</SelectItem>
            <SelectItem value="upcoming">{t('gallery.upcoming')}</SelectItem>
            <SelectItem value="ongoing">{t('gallery.ongoing')}</SelectItem>
            <SelectItem value="completed">{t('gallery.completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const title = isRTL && event.titleAr ? event.titleAr : event.title;
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {event.coverImage && (
                      <img
                        src={event.coverImage}
                        alt={title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold truncate">{title}</h3>
                        <div className="flex items-center gap-2">
                          {event.featured && (
                            <Badge variant="secondary">{t('gallery.featured')}</Badge>
                          )}
                          <Badge variant="outline">
                            {t(`gallery.${event.status}`)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                          {event.endDate && (
                            <span>- {new Date(event.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <span className="capitalize">{event.eventType}</span>
                        {event.maxAttendees && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{event.maxAttendees} {t('gallery.maxAttendees')}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {event.description}
                        </p>
                      )}
                      
                      <Button size="sm" variant="outline">
                        {t('gallery.viewDetails')}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('gallery.noEvents')}</h3>
            <p className="text-muted-foreground">{t('gallery.noEventsDescription')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Gallery Works Grid Component
export function GalleryWorksGrid({ galleryId }: { galleryId: number }) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: artworks = [], isLoading, hasNextPage, fetchNextPage } = useQuery<Artwork[]>({
    queryKey: [`/api/galleries/${galleryId}/artworks`, { availability: availabilityFilter, limit, offset: (page - 1) * limit }],
    staleTime: 30000,
  });

  const filteredArtworks = artworks.filter(artwork => {
    const title = isRTL && artwork.titleAr ? artwork.titleAr : artwork.title;
    const artistName = isRTL && artwork.artist.nameAr ? artwork.artist.nameAr : artwork.artist.name;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         artistName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={String(t('gallery.searchArtworks'))}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={String(t('gallery.allArtworks'))} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('gallery.allArtworks')}</SelectItem>
              <SelectItem value="available">{t('gallery.available')}</SelectItem>
              <SelectItem value="sold">{t('gallery.sold')}</SelectItem>
              <SelectItem value="reserved">{t('gallery.reserved')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={String(t('gallery.sortNewest'))} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('gallery.sortNewest')}</SelectItem>
              <SelectItem value="oldest">{t('gallery.sortOldest')}</SelectItem>
              <SelectItem value="price-low">{t('gallery.sortPriceLow')}</SelectItem>
              <SelectItem value="price-high">{t('gallery.sortPriceHigh')}</SelectItem>
              <SelectItem value="title">{t('gallery.sortTitle')}</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {filteredArtworks.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredArtworks.length} {t('gallery.artworksFound')}
        </p>
      )}

      {/* Artworks Grid/List */}
      {filteredArtworks.length > 0 ? (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredArtworks.map((artwork) => {
            const title = isRTL && artwork.titleAr ? artwork.titleAr : artwork.title;
            const artistName = isRTL && artwork.artist.nameAr ? artwork.artist.nameAr : artwork.artist.name;
            
            return (
              <Link key={artwork.id} href={`/artworks/${artwork.id}`}>
                <Card className={cn(
                  "hover:shadow-md transition-shadow",
                  viewMode === "list" && "flex-row"
                )}>
                  <div className={cn(
                    viewMode === "grid" ? "aspect-square" : "w-32 h-32 flex-shrink-0"
                  )}>
                    <img
                      src={artwork.images[0] || "/placeholder-artwork.jpg"}
                      alt={title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className={cn(
                    "p-4",
                    viewMode === "list" && "flex-1"
                  )}>
                    <div className="space-y-2">
                      <h3 className="font-semibold truncate">{title}</h3>
                      <p className="text-sm text-muted-foreground">{artistName} • {artwork.year}</p>
                      <p className="text-xs text-muted-foreground">{artwork.medium}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {artwork.price} {artwork.currency}
                        </span>
                        <Badge 
                          variant={artwork.availability === "available" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {t(`gallery.${artwork.availability}`)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('gallery.noArtworksFound')}</h3>
            <p className="text-muted-foreground">{t('gallery.tryDifferentFilters')}</p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center">
          <Button onClick={() => fetchNextPage()} variant="outline">
            Load More Artworks
          </Button>
        </div>
      )}
    </div>
  );
}

// Gallery Contact Form Component
export function GalleryContactForm({ galleryId }: { galleryId: number }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: String(t('gallery.messageError')),
        description: String(t('gallery.messageErrorDescription')),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest(`/api/galleries/${galleryId}/contact`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast({
        title: String(t('gallery.messageSent')),
        description: String(t('gallery.messageResponseTime')),
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
    } catch (error) {
      toast({
        title: String(t('gallery.messageError')),
        description: String(t('gallery.messageErrorDescription')),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('gallery.contactGallery')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('gallery.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">{t('gallery.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t('gallery.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="inquiryType">{t('gallery.inquiryType')}</Label>
              <Select
                value={formData.inquiryType}
                onValueChange={(value) => setFormData({ ...formData, inquiryType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('gallery.generalInquiry')}</SelectItem>
                  <SelectItem value="artwork">{t('gallery.artworkInquiry')}</SelectItem>
                  <SelectItem value="exhibition">{t('gallery.exhibitionInquiry')}</SelectItem>
                  <SelectItem value="press">{t('gallery.pressInquiry')}</SelectItem>
                  <SelectItem value="partnership">{t('gallery.partnershipInquiry')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="subject">{t('gallery.subject')}</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">{t('gallery.message')}</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t('gallery.sending') : t('gallery.sendMessage')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}