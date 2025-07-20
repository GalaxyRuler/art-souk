import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Phone, Mail, Globe, ExternalLink, Share2, Heart, Users, Building, Palette, Camera, Clock, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GalleryEventsTable, GalleryWorksGrid, GalleryContactForm } from "@/components/GalleryComponents";

interface Gallery {
  id: number;
  name: string;
  nameAr?: string;
  bio?: string;
  bioAr?: string;
  location?: string;
  locationAr?: string;
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  address?: string;
  profileImage?: string;
  coverImage?: string;
  established?: number;
  specialties?: string[];
  specialtiesAr?: string[];
}

interface GalleryStats {
  followersCount: number;
  artistsCount: number;
  artworksCount: number;
  exhibitionsCount: number;
  totalViews: number;
  avgPrice: string;
  currency: string;
}

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
}

interface Artist {
  id: number;
  name: string;
  nameAr?: string;
  profileImage?: string;
  nationality?: string;
  artworkCount: number;
  featured: boolean;
}

export default function GalleryProfileEnhanced() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");

  // Gallery data queries
  const { data: gallery, isLoading: galleryLoading } = useQuery<Gallery>({
    queryKey: [`/api/galleries/${id}`],
    enabled: !!id,
  });

  const { data: galleryStats } = useQuery<GalleryStats>({
    queryKey: [`/api/galleries/${id}/stats`],
    enabled: !!id,
  });

  const { data: isFollowing } = useQuery<{ isFollowing: boolean }>({
    queryKey: [`/api/galleries/${id}/follow-status`],
    enabled: !!user && !!id,
  });

  const { data: featuredEvents } = useQuery<GalleryEvent[]>({
    queryKey: [`/api/galleries/${id}/events`],
    staleTime: 30000,
    enabled: !!id,
  });

  const { data: representedArtists } = useQuery<Artist[]>({
    queryKey: [`/api/galleries/${id}/artists`],
    enabled: !!id,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: () => apiRequest(`/api/galleries/${id}/follow`, {
      method: isFollowing?.isFollowing ? "DELETE" : "POST",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/galleries/${id}/follow-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/galleries/${id}/stats`] });
      toast({
        title: String(isFollowing?.isFollowing ? t('gallery.unfollowedGallery') : t('gallery.followingGallery')),
        description: String(isFollowing?.isFollowing 
          ? t('gallery.unfollowDescription') 
          : t('gallery.followDescription')),
      });
    },
  });

  const handleShare = () => {
    if (navigator.share && window.innerWidth <= 768) {
      navigator.share({
        title: isRTL && gallery?.nameAr ? gallery.nameAr : gallery?.name || "",
        text: isRTL && gallery?.bioAr ? gallery.bioAr : gallery?.bio || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: String(t('gallery.linkCopied')),
        description: String(t('gallery.linkCopiedDescription')),
      });
    }
  };

  if (galleryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{t('gallery.notFound')}</h1>
        <p className="text-muted-foreground mb-8">{t('gallery.notFoundDescription')}</p>
        <Button asChild>
          <Link href="/galleries">{t('gallery.browseGalleries')}</Link>
        </Button>
      </div>
    );
  }

  const galleryName = isRTL && gallery.nameAr ? gallery.nameAr : gallery.name;
  const galleryBio = isRTL && gallery.bioAr ? gallery.bioAr : gallery.bio;
  const galleryLocation = isRTL && gallery.locationAr ? gallery.locationAr : gallery.location;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section with Cover Image */}
      <div className="relative mb-8">
        {gallery.coverImage && (
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl overflow-hidden">
            <img
              src={gallery.coverImage}
              alt={galleryName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}
        
        {/* Gallery Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-4 ring-white">
                  <AvatarImage src={gallery.profileImage} alt={galleryName} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {galleryName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{galleryName}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {galleryLocation && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{galleryLocation}</span>
                      </div>
                    )}
                    {gallery.established && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{t('gallery.establishedIn')} {gallery.established}</span>
                      </div>
                    )}
                    {galleryStats && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{galleryStats.followersCount} {t('gallery.followers')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {user && (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    variant={isFollowing?.isFollowing ? "outline" : "default"}
                    size="sm"
                    className={cn(
                      isFollowing?.isFollowing && "border-red-200 text-red-600 hover:bg-red-50"
                    )}
                  >
                    <Heart className={cn(
                      "h-4 w-4 mr-2",
                      isFollowing?.isFollowing && "fill-current"
                    )} />
                    {isFollowing?.isFollowing ? t('gallery.following') : t('gallery.follow')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Statistics Cards */}
      {galleryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{galleryStats.artistsCount}</div>
              <div className="text-sm text-muted-foreground">{t('gallery.artists')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{galleryStats.artworksCount}</div>
              <div className="text-sm text-muted-foreground">{t('gallery.artworks')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{galleryStats.exhibitionsCount}</div>
              <div className="text-sm text-muted-foreground">{t('gallery.exhibitions')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{galleryStats.avgPrice}</div>
              <div className="text-sm text-muted-foreground">{t('gallery.avgPrice')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VEFA Gallery Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5">
          <TabsTrigger value="overview" className="text-sm">
            <Building className="h-4 w-4 mr-2" />
            {t('gallery.overview')}
          </TabsTrigger>
          <TabsTrigger value="events" className="text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            {t('gallery.events')}
          </TabsTrigger>
          <TabsTrigger value="works" className="text-sm">
            <Palette className="h-4 w-4 mr-2" />
            {t('gallery.works')}
          </TabsTrigger>
          <TabsTrigger value="artists" className="text-sm">
            <Users className="h-4 w-4 mr-2" />
            {t('gallery.artists')}
          </TabsTrigger>
          <TabsTrigger value="contact" className="text-sm">
            <Mail className="h-4 w-4 mr-2" />
            {t('gallery.contact')}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery Description */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('gallery.aboutGallery')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {galleryBio || t('gallery.noBiography')}
                  </p>
                  
                  {gallery.specialties && gallery.specialties.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">{t('gallery.specialties')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {(isRTL && gallery.specialtiesAr ? gallery.specialtiesAr : gallery.specialties).map((specialty, index) => (
                          <Badge key={index} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Featured Events */}
              {featuredEvents && featuredEvents.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('gallery.featuredEvents')}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("events")}>
                      {t('gallery.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featuredEvents.slice(0, 3).map((event) => {
                        const title = isRTL && event.titleAr ? event.titleAr : event.title;
                        return (
                          <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            {event.coverImage && (
                              <img
                                src={event.coverImage}
                                alt={title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="capitalize">{event.eventType}</span>
                                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                <Badge variant="outline">
                                  {t(`gallery.${event.status}`)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('gallery.contactInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {gallery.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{gallery.phone}</span>
                    </div>
                  )}
                  
                  {gallery.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{gallery.email}</span>
                    </div>
                  )}
                  
                  {gallery.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={gallery.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t('gallery.visitWebsite')}
                      </a>
                    </div>
                  )}
                  
                  <Button className="w-full" onClick={() => setActiveTab("contact")}>
                    {t('gallery.sendMessage')}
                  </Button>
                </CardContent>
              </Card>

              {/* Represented Artists Preview */}
              {representedArtists && representedArtists.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('gallery.representedArtists')}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("artists")}>
                      {t('gallery.viewAll')}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {representedArtists.slice(0, 4).map((artist) => {
                        const artistName = isRTL && artist.nameAr ? artist.nameAr : artist.name;
                        return (
                          <Link key={artist.id} href={`/artists/${artist.id}`}>
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={artist.profileImage} alt={artistName} />
                                <AvatarFallback>{artistName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{artistName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {artist.artworkCount} {t('gallery.artworks')}
                                </div>
                              </div>
                              {artist.featured && (
                                <Star className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <GalleryEventsTable galleryId={Number(id)} />
        </TabsContent>

        {/* Works Tab */}
        <TabsContent value="works">
          <GalleryWorksGrid galleryId={Number(id)} />
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('gallery.representedArtists')}</h2>
            <p className="text-muted-foreground mb-6">{t('gallery.artistsDescription')}</p>
          </div>
          
          {representedArtists && representedArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {representedArtists.map((artist) => {
                const artistName = isRTL && artist.nameAr ? artist.nameAr : artist.name;
                return (
                  <Link key={artist.id} href={`/artists/${artist.id}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={artist.profileImage} alt={artistName} />
                            <AvatarFallback className="text-lg">{artistName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{artistName}</h3>
                            <p className="text-sm text-muted-foreground">{artist.nationality}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {artist.artworkCount} {t('gallery.artworks')}
                              </span>
                              {artist.featured && (
                                <Badge variant="secondary">
                                  {t('gallery.featured')}
                                </Badge>
                              )}
                            </div>
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
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('gallery.noArtists')}</h3>
                <p className="text-muted-foreground">{t('gallery.noArtistsDescription')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">{t('gallery.getInTouch')}</h2>
                <p className="text-muted-foreground mb-6">{t('gallery.contactDescription')}</p>
                
                <div className="space-y-4">
                  {gallery.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                      <div>
                        <div className="font-medium">{t('gallery.address')}</div>
                        <div className="text-sm text-muted-foreground">{gallery.address}</div>
                      </div>
                    </div>
                  )}
                  
                  {gallery.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{t('gallery.phone')}</div>
                        <div className="text-sm text-muted-foreground">{gallery.phone}</div>
                      </div>
                    </div>
                  )}
                  
                  {gallery.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{t('gallery.email')}</div>
                        <div className="text-sm text-muted-foreground">{gallery.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <GalleryContactForm galleryId={Number(id)} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}