import { useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Phone, Mail, Globe, Clock, Users, Building2, ArrowLeft, ExternalLink, Award, Palette, Eye, Calendar, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArtworkCard } from "@/components/ArtworkCard";
import { FollowButton } from "@/components/SocialComponents";
import { ArtistCard } from "@/components/ArtistCard";

interface GalleryDetail {
  id: number;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
  address?: string;
  addressAr?: string;
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  founded?: number;
  specialties?: string;
  specialtiesAr?: string;
  curatorName?: string;
  curatorNameAr?: string;
  profileImage?: string;
  coverImage?: string;
  featured?: boolean;
  openingHours?: string;
  openingHoursAr?: string;
  artistCount?: number;
  exhibitionCount?: number;
  establishedYear?: number;
}

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  images: string[];
  year?: number;
  medium?: string;
  mediumAr?: string;
  price?: string;
  currency?: string;
  availability?: string;
  category?: string;
  categoryAr?: string;
  artist?: {
    id: number;
    name: string;
    nameAr?: string;
  };
}

interface Artist {
  id: number;
  name: string;
  nameAr?: string;
  biography?: string;
  biographyAr?: string;
  nationality?: string;
  birthYear?: number;
  profileImage?: string;
  artworkCount?: number;
}

interface Exhibition {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'current' | 'past';
  type: 'solo' | 'group';
  curatorName?: string;
  artworkCount?: number;
  coverImage?: string;
  featured?: boolean;
}

export default function GalleryProfile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("artworks");

  const { data: gallery, isLoading } = useQuery<GalleryDetail>({
    queryKey: [`/api/galleries/${id}`],
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<Artwork[]>({
    queryKey: [`/api/galleries/${id}/artworks`],
    enabled: !!gallery,
  });

  const { data: artists, isLoading: artistsLoading } = useQuery<Artist[]>({
    queryKey: [`/api/galleries/${id}/artists`],
    enabled: !!gallery,
  });

  const { data: exhibitions } = useQuery<Exhibition[]>({
    queryKey: [`/api/galleries/${id}/exhibitions`],
    enabled: !!gallery,
  });

  const { data: isFollowing } = useQuery<{ isFollowing: boolean }>({
    queryKey: [`/api/galleries/${id}/follow-status`],
    enabled: isAuthenticated && !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing?.isFollowing) {
        await apiRequest(`/api/galleries/${id}/unfollow`, { method: 'POST' });
      } else {
        await apiRequest(`/api/galleries/${id}/follow`, { method: 'POST' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/galleries/${id}/follow-status`] });
      toast({
        title: isFollowing?.isFollowing ? t('gallery.unfollowedGallery') : t('gallery.followingGallery'),
        description: isFollowing?.isFollowing 
          ? t('gallery.unfollowDescription') 
          : t('gallery.followDescription'),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-muted rounded-2xl"></div>
              <div className="lg:col-span-2 h-96 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('gallery.notFound')}</h1>
          <Link href="/galleries">
            <Button>{t('gallery.browseGalleries')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = isRTL && gallery.nameAr ? gallery.nameAr : gallery.name;
  const description = isRTL && gallery.descriptionAr ? gallery.descriptionAr : gallery.description;
  const location = isRTL && gallery.locationAr ? gallery.locationAr : gallery.location;
  const address = isRTL && gallery.addressAr ? gallery.addressAr : gallery.address;
  const specialties = isRTL && gallery.specialtiesAr ? gallery.specialtiesAr : gallery.specialties;
  const curatorName = isRTL && gallery.curatorNameAr ? gallery.curatorNameAr : gallery.curatorName;
  const openingHours = isRTL && gallery.openingHoursAr ? gallery.openingHoursAr : gallery.openingHours;
  const currencyDisplay = isRTL ? "ر.س" : "SAR";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `${name} - Gallery Profile`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('gallery.linkCopied'),
        description: t('gallery.linkCopiedDescription'),
      });
    }
  };

  const currentExhibitions = exhibitions?.filter(ex => ex.status === 'current') || [];
  const upcomingExhibitions = exhibitions?.filter(ex => ex.status === 'upcoming') || [];
  const pastExhibitions = exhibitions?.filter(ex => ex.status === 'past') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/galleries">
          <Button variant="ghost" className="mb-6 hover:bg-brand-light-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('gallery.backToGalleries')}
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-brand mb-8">
          {gallery.coverImage ? (
            <img
              src={gallery.coverImage}
              alt={`${name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand-gradient" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={gallery.profileImage} />
                <AvatarFallback className="text-2xl bg-brand-purple text-white">
                  <Building2 className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {name}
                  </h1>
                  {gallery.featured && (
                    <Badge className="bg-brand-gold text-brand-charcoal">
                      <Award className="h-3 w-3 mr-1" />
                      {t('gallery.featured')}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {gallery.founded && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{t('gallery.established')} {gallery.founded}</span>
                    </div>
                  )}
                  {gallery.artistCount && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{gallery.artistCount} {t('gallery.artists')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <FollowButton
                  entityType="gallery"
                  entityId={gallery.id}
                />
                
                <Button
                  variant="secondary"
                  onClick={handleShare}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('gallery.share')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gallery Info Sidebar */}
          <div className="space-y-6">
            {/* Description */}
            {description && (
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                    {t('gallery.aboutGallery')}
                  </h3>
                  <ScrollArea className="h-40">
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {description}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                  {t('gallery.contactInfo')}
                </h3>
                <div className="space-y-3">
                  {address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-brand-purple mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{t('gallery.address')}</p>
                        <p className="text-sm text-muted-foreground">{address}</p>
                      </div>
                    </div>
                  )}
                  
                  {gallery.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-brand-purple" />
                      <div>
                        <p className="text-sm font-medium">{t('gallery.phone')}</p>
                        <a href={`tel:${gallery.phone}`} className="text-sm text-brand-purple hover:underline">
                          {gallery.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {gallery.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-brand-purple" />
                      <div>
                        <p className="text-sm font-medium">{t('gallery.email')}</p>
                        <a href={`mailto:${gallery.email}`} className="text-sm text-brand-purple hover:underline">
                          {gallery.email}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {gallery.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-brand-purple" />
                      <div>
                        <p className="text-sm font-medium">{t('gallery.website')}</p>
                        <a 
                          href={gallery.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-brand-purple hover:underline"
                        >
                          {t('gallery.visitWebsite')}
                        </a>
                      </div>
                    </div>
                  )}

                  {openingHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-brand-purple mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{t('gallery.openingHours')}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {openingHours}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gallery Stats */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                  {t('gallery.galleryStats')}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('gallery.representedArtists')}</span>
                    <span className="font-semibold">{artists?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('gallery.availableArtworks')}</span>
                    <span className="font-semibold">{artworks?.length || 0}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('gallery.totalExhibitions')}</span>
                    <span className="font-semibold">{gallery.exhibitionCount || exhibitions?.length || 0}</span>
                  </div>

                  {gallery.founded && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('gallery.yearsInBusiness')}</span>
                      <span className="font-semibold">{new Date().getFullYear() - gallery.founded}</span>
                    </div>
                  )}

                  {specialties && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium mb-2 block">{t('gallery.specialties')}</span>
                        <p className="text-sm text-muted-foreground">{specialties}</p>
                      </div>
                    </>
                  )}

                  {curatorName && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium mb-1 block">{t('gallery.curator')}</span>
                        <p className="text-sm text-muted-foreground">{curatorName}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            {(gallery.instagram || gallery.facebook || gallery.twitter) && (
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                    {t('gallery.socialMedia')}
                  </h3>
                  <div className="space-y-3">
                    {gallery.instagram && (
                      <a 
                        href={`https://instagram.com/${gallery.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-brand-purple hover:underline text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('gallery.instagram')}
                      </a>
                    )}
                    
                    {gallery.facebook && (
                      <a 
                        href={gallery.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-brand-purple hover:underline text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('gallery.facebook')}
                      </a>
                    )}

                    {gallery.twitter && (
                      <a 
                        href={gallery.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-brand-purple hover:underline text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('gallery.twitter')}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Current Exhibitions Alert */}
            {currentExhibitions.length > 0 && (
              <Card className="card-elevated mb-6 border-brand-gold bg-gradient-to-r from-brand-light-gold to-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="h-5 w-5 text-brand-gold" />
                    <h3 className="text-lg font-semibold text-brand-charcoal">
                      {currentExhibitions.length > 1 ? t('gallery.currentExhibitions') : t('gallery.currentExhibition')}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {currentExhibitions.slice(0, 2).map((exhibition) => {
                      const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
                      return (
                        <div key={exhibition.id} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-brand-charcoal">{title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {t('gallery.until')} {new Date(exhibition.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-brand-gold text-brand-charcoal">
                            {exhibition.type === 'solo' ? t('gallery.solo') : t('gallery.group')}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="artworks" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  {t('gallery.artworks')} ({artworks?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="artists" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('gallery.artists')} ({artists?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="exhibitions" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t('gallery.exhibitions')}
                </TabsTrigger>
              </TabsList>

              {/* Artworks Tab */}
              <TabsContent value="artworks" className="space-y-6">
                {artworksLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardContent className="p-4 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : artworks && artworks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artworks.map((artwork) => (
                      <ArtworkCard key={artwork.id} artwork={artwork} />
                    ))}
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        {t('gallery.noArtworksAvailable')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('gallery.noArtworksDescription')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Artists Tab */}
              <TabsContent value="artists" className="space-y-6">
                {artistsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6 space-y-3">
                          <div className="h-16 w-16 bg-muted rounded-full mx-auto"></div>
                          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                          <div className="h-3 bg-muted rounded w-1/2 mx-auto"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : artists && artists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists.map((artist) => (
                      <ArtistCard key={artist.id} artist={artist} showBio={false} />
                    ))}
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        {t('gallery.noArtistsRepresented')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('gallery.noArtistsDescription')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Exhibitions Tab */}
              <TabsContent value="exhibitions" className="space-y-6">
                {exhibitions && exhibitions.length > 0 ? (
                  <div className="space-y-8">
                    {/* Current Exhibitions */}
                    {currentExhibitions.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-charcoal mb-4">
                          {t('gallery.currentExhibitions')}
                        </h3>
                        <div className="grid gap-4">
                          {currentExhibitions.map((exhibition) => {
                            const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
                            const description = isRTL && exhibition.descriptionAr ? exhibition.descriptionAr : exhibition.description;
                            
                            return (
                              <Card key={exhibition.id} className="card-elevated border-brand-gold">
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    {exhibition.coverImage && (
                                      <img
                                        src={exhibition.coverImage}
                                        alt={title}
                                        className="w-24 h-24 rounded-lg object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-lg font-semibold text-brand-charcoal">{title}</h4>
                                        <div className="flex gap-2">
                                          <Badge className="bg-brand-gold text-brand-charcoal">{t('gallery.current')}</Badge>
                                          <Badge variant="outline">
                                            {exhibition.type === 'solo' ? t('gallery.solo') : t('gallery.group')}
                                          </Badge>
                                        </div>
                                      </div>
                                      {description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          <span>
                                            {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                        {exhibition.artworkCount && (
                                          <div className="flex items-center gap-1">
                                            <Palette className="h-4 w-4" />
                                            <span>{exhibition.artworkCount} {t('gallery.artworksLowercase')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Exhibitions */}
                    {upcomingExhibitions.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-charcoal mb-4">
                          {t('gallery.upcomingExhibitions')}
                        </h3>
                        <div className="grid gap-4">
                          {upcomingExhibitions.map((exhibition) => {
                            const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
                            const description = isRTL && exhibition.descriptionAr ? exhibition.descriptionAr : exhibition.description;
                            
                            return (
                              <Card key={exhibition.id} className="card-elevated">
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    {exhibition.coverImage && (
                                      <img
                                        src={exhibition.coverImage}
                                        alt={title}
                                        className="w-24 h-24 rounded-lg object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-lg font-semibold text-brand-charcoal">{title}</h4>
                                        <div className="flex gap-2">
                                          <Badge variant="secondary">{t('gallery.upcoming')}</Badge>
                                          <Badge variant="outline">
                                            {exhibition.type === 'solo' ? t('gallery.solo') : t('gallery.group')}
                                          </Badge>
                                        </div>
                                      </div>
                                      {description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                          {description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          <span>
                                            {t('gallery.starts')} {new Date(exhibition.startDate).toLocaleDateString()}
                                          </span>
                                        </div>
                                        {exhibition.artworkCount && (
                                          <div className="flex items-center gap-1">
                                            <Palette className="h-4 w-4" />
                                            <span>{exhibition.artworkCount} {t('gallery.artworksLowercase')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Past Exhibitions */}
                    {pastExhibitions.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold text-brand-charcoal mb-4">
                          {t('gallery.pastExhibitions')}
                        </h3>
                        <ScrollArea className="h-96">
                          <div className="grid gap-3 pr-4">
                            {pastExhibitions.map((exhibition) => {
                              const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
                              
                              return (
                                <Card key={exhibition.id} className="card-elevated">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-semibold text-brand-charcoal">{title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(exhibition.startDate).getFullYear()}
                                        </p>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {exhibition.type === 'solo' ? t('gallery.solo') : t('gallery.group')}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        {t('gallery.noExhibitions')}
                      </h3>
                      <p className="text-muted-foreground">
                        {t('gallery.noExhibitionsDescription')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}