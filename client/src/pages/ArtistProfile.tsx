import { useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Calendar, Users, Heart, Share2, ArrowLeft, ExternalLink, Award, Palette, Eye, HandHeart } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArtworkCard } from "@/components/ArtworkCard";
import { FollowButton } from "@/components/SocialComponents";
import { RepresentationRequestModal } from "@/components/RepresentationRequestModal";

interface ArtistDetail {
  id: number;
  name: string;
  nameAr?: string;
  biography?: string;
  biographyAr?: string;
  nationality?: string;
  birthYear?: number;
  deathYear?: number;
  profileImage?: string;
  coverImage?: string;
  featured?: boolean;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  phone?: string;
  email?: string;
  education?: string;
  awards?: string;
  exhibitions?: string;
  style?: string;
  medium?: string;
  artworkCount?: number;
  totalSales?: number;
  averagePrice?: number;
}

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  images: string[];
  year?: number;
  medium?: string;
  mediumAr?: string;
  dimensions?: string;
  price?: string;
  currency?: string;
  availability?: string;
  category?: string;
  categoryAr?: string;
}

interface Exhibition {
  id: number;
  title: string;
  titleAr?: string;
  year: number;
  venue: string;
  venueAr?: string;
  type: 'solo' | 'group';
  location: string;
  locationAr?: string;
}

export default function ArtistProfile() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("artworks");

  const { data: artist, isLoading } = useQuery<ArtistDetail>({
    queryKey: [`/api/artists/${id}`],
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<Artwork[]>({
    queryKey: [`/api/artists/${id}/artworks`],
    enabled: !!artist,
  });

  const { data: exhibitions } = useQuery<Exhibition[]>({
    queryKey: [`/api/artists/${id}/exhibitions`],
    enabled: !!artist,
  });

  // Enhanced artist profile data
  const { data: followersData } = useQuery({
    queryKey: [`/api/artists/${id}/followers`],
    enabled: !!id,
  });

  const { data: auctionResults } = useQuery({
    queryKey: [`/api/artists/${id}/auction-results`],
    enabled: !!id,
  });

  const { data: galleries } = useQuery({
    queryKey: [`/api/artists/${id}/galleries`],
    enabled: !!id,
  });

  const { data: isFollowing } = useQuery<{ isFollowing: boolean }>({
    queryKey: [`/api/artists/${id}/follow-status`],
    enabled: isAuthenticated && !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing?.isFollowing) {
        await apiRequest(`/api/artists/${id}/unfollow`, { method: 'POST' });
      } else {
        await apiRequest(`/api/artists/${id}/follow`, { method: 'POST' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${id}/follow-status`] });
      toast({
        title: isFollowing?.isFollowing ? t("social.unfollowed") : t("social.followed"),
        description: isFollowing?.isFollowing 
          ? t("social.unfollowedDesc") 
          : t("social.followedDesc"),
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

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("artist.notFound")}</h1>
          <Link href="/artists">
            <Button>{t("artist.browseArtists")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = isRTL && artist.nameAr ? artist.nameAr : artist.name;
  const biography = isRTL && artist.biographyAr ? artist.biographyAr : artist.biography;
  const currencyDisplay = isRTL ? "ر.س" : "SAR";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `${name} - Artist Profile`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("artist.linkCopied"),
        description: t("artist.linkCopiedDescription"),
      });
    }
  };

  const artworkCategories = artworks?.reduce((acc, artwork) => {
    const category = isRTL && artwork.categoryAr ? artwork.categoryAr : artwork.category;
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/artists">
          <Button variant="ghost" className="mb-6 hover:bg-brand-light-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("artist.backToArtists")}
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-brand mb-8">
          {artist.coverImage ? (
            <img
              src={artist.coverImage}
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
                <AvatarImage src={artist.profileImage} />
                <AvatarFallback className="text-2xl bg-brand-purple text-white">
                  {name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {name}
                  </h1>
                  {artist.featured && (
                    <Badge className="bg-brand-gold text-brand-charcoal">
                      <Award className="h-3 w-3 mr-1" />
                      {t("artist.featured")}
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  {artist.nationality && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{artist.nationality}</span>
                    </div>
                  )}
                  {artist.birthYear && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {t("artist.born")} {artist.birthYear}
                        {artist.deathYear && ` - ${t("artist.died")} ${artist.deathYear}`}
                      </span>
                    </div>
                  )}
                  {artist.artworkCount && (
                    <div className="flex items-center gap-1">
                      <Palette className="h-4 w-4" />
                      <span>{artist.artworkCount} {t("artist.artworks")}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <FollowButton
                  entityType="artist"
                  entityId={artist.id}
                />
                
                {/* Show representation request button only for galleries */}
                {isAuthenticated && user?.roles?.includes('gallery') && (
                  <RepresentationRequestModal
                    artistId={artist.id}
                    artistName={name}
                  >
                    <Button
                      variant="secondary"
                      className="bg-brand-purple/20 text-white hover:bg-brand-purple/30 border border-white/30"
                    >
                      <HandHeart className="h-4 w-4 mr-2" />
                      Request Representation
                    </Button>
                  </RepresentationRequestModal>
                )}
                
                <Button
                  variant="secondary"
                  onClick={handleShare}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  {t("artist.share")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artist Info Sidebar */}
          <div className="space-y-6">
            {/* Biography */}
            {biography && (
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                    {t("artist.aboutArtist")}
                  </h3>
                  <ScrollArea className="h-40">
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {biography}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Artist Stats */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                  {t("artist.statistics")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("artist.totalArtworks")}</span>
                    <span className="font-semibold">{artworks?.length || 0}</span>
                  </div>
                  
                  {artist.totalSales && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t("artist.totalSales")}</span>
                      <span className="font-semibold text-brand-gold">
                        {formatPrice(artist.totalSales, "SAR", isRTL ? 'ar' : 'en')}
                      </span>
                    </div>
                  )}
                  
                  {artist.averagePrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t("artist.averagePrice")}</span>
                      <span className="font-semibold">
                        {formatPrice(artist.averagePrice, "SAR", isRTL ? 'ar' : 'en')}
                      </span>
                    </div>
                  )}

                  {artworkCategories && Object.keys(artworkCategories).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <span className="text-sm text-muted-foreground mb-2 block">{t("artist.categories")}</span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(artworkCategories).map(([category, count]) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category} ({count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact & Social */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                  {t("artist.contactSocial")}
                </h3>
                <div className="space-y-3">
                  {artist.website && (
                    <a 
                      href={artist.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-purple hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("artist.website")}
                    </a>
                  )}
                  
                  {artist.instagram && (
                    <a 
                      href={`https://instagram.com/${artist.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-brand-purple hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("artist.instagram")}
                    </a>
                  )}

                  {artist.email && (
                    <a 
                      href={`mailto:${artist.email}`}
                      className="flex items-center gap-2 text-brand-purple hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("artist.email")}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            {(artist.education || artist.awards || artist.style || artist.medium) && (
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
                    {t("artist.additionalInfo")}
                  </h3>
                  <div className="space-y-3">
                    {artist.style && (
                      <div>
                        <span className="text-sm font-medium">{t("artist.style")}:</span>
                        <p className="text-sm text-muted-foreground">{artist.style}</p>
                      </div>
                    )}
                    
                    {artist.medium && (
                      <div>
                        <span className="text-sm font-medium">{t("artist.primaryMedium")}:</span>
                        <p className="text-sm text-muted-foreground">{artist.medium}</p>
                      </div>
                    )}
                    
                    {artist.education && (
                      <div>
                        <span className="text-sm font-medium">{t("artist.education")}:</span>
                        <p className="text-sm text-muted-foreground">{artist.education}</p>
                      </div>
                    )}
                    
                    {artist.awards && (
                      <div>
                        <span className="text-sm font-medium">{t("artist.awards")}:</span>
                        <p className="text-sm text-muted-foreground">{artist.awards}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 text-xs">
                <TabsTrigger value="artworks" className="flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  <span className="hidden sm:inline">{t("artist.tabs.artworks")}</span>
                  <span className="sm:hidden">Art</span>
                  ({artworks?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="exhibitions" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span className="hidden sm:inline">{t("artist.exhibitions")}</span>
                  <span className="sm:hidden">Shows</span>
                </TabsTrigger>
                <TabsTrigger value="followers" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="hidden sm:inline">Followers</span>
                  <span className="sm:hidden">Fans</span>
                  ({followersData?.totalCount || 0})
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span className="hidden sm:inline">Market</span>
                  <span className="sm:hidden">Sales</span>
                </TabsTrigger>
                <TabsTrigger value="galleries" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="hidden sm:inline">Galleries</span>
                  <span className="sm:hidden">Reps</span>
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
                        {t("artist.noArtworksTitle")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t("artist.noArtworksDescription")}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Exhibitions Tab */}
              <TabsContent value="exhibitions" className="space-y-6">
                {exhibitions && exhibitions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <h3 className="text-lg font-semibold text-brand-charcoal">
                        {t("artist.soloExhibitions")}
                      </h3>
                      {exhibitions
                        .filter(ex => ex.type === 'solo')
                        .map((exhibition) => {
                          const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
                          const venue = isRTL && exhibition.venueAr ? exhibition.venueAr : exhibition.venue;
                          const location = isRTL && exhibition.locationAr ? exhibition.locationAr : exhibition.location;
                          
                          return (
                            <Card key={exhibition.id} className="card-elevated">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold text-brand-charcoal">{title}</h4>
                                    <p className="text-sm text-muted-foreground">{venue}</p>
                                    <p className="text-xs text-muted-foreground">{location}</p>
                                  </div>
                                  <Badge variant="outline">{exhibition.year}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>

                    <Separator />

                    <div className="grid gap-2">
                      <h3 className="text-lg font-semibold text-brand-charcoal">
                        {t("artist.groupExhibitions")}
                      </h3>
                      {exhibitions
                        .filter(ex => ex.type === 'group')
                        .map((exhibition) => {
                          const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
                          const venue = isRTL && exhibition.venueAr ? exhibition.venueAr : exhibition.venue;
                          const location = isRTL && exhibition.locationAr ? exhibition.locationAr : exhibition.location;
                          
                          return (
                            <Card key={exhibition.id} className="card-elevated">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold text-brand-charcoal">{title}</h4>
                                    <p className="text-sm text-muted-foreground">{venue}</p>
                                    <p className="text-xs text-muted-foreground">{location}</p>
                                  </div>
                                  <Badge variant="secondary">{exhibition.year}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        {t("artist.noExhibitionsTitle")}
                      </h3>
                      <p className="text-muted-foreground">
                        {t("artist.noExhibitionsDescription")}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Followers Tab */}
              <TabsContent value="followers" className="space-y-6">
                {followersData && followersData.followers?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-brand-charcoal">
                        {followersData.totalCount} Followers
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followersData.followers.map((follower: any) => (
                        <Card key={follower.id} className="card-elevated">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-brand-purple text-white text-sm">
                                  F
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">Follower</h4>
                                <p className="text-xs text-muted-foreground">
                                  Followed {new Date(follower.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        No Followers Yet
                      </h3>
                      <p className="text-muted-foreground">
                        This artist hasn't gained any followers yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Market Performance Tab */}
              <TabsContent value="market" className="space-y-6">
                {auctionResults && auctionResults.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-brand-charcoal">
                      Auction Results ({auctionResults.length})
                    </h3>
                    <div className="space-y-3">
                      {auctionResults.map((result: any) => (
                        <Card key={result.id} className="card-elevated">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-brand-charcoal">{result.artworkTitle}</h4>
                                <p className="text-sm text-muted-foreground">{result.artworkMedium}</p>
                                <p className="text-sm text-muted-foreground">{result.auctionHouse}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(result.auctionDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-brand-gold">
                                  {formatPrice(result.hammerPrice, "SAR", isRTL ? 'ar' : 'en')}
                                </div>
                                {result.estimateLow && result.estimateHigh && (
                                  <div className="text-xs text-muted-foreground">
                                    Est: {formatPrice(result.estimateLow, "SAR", isRTL ? 'ar' : 'en')} - {formatPrice(result.estimateHigh, "SAR", isRTL ? 'ar' : 'en')}
                                  </div>
                                )}
                                {result.lotNumber && (
                                  <div className="text-xs text-muted-foreground">
                                    Lot {result.lotNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        No Auction Results
                      </h3>
                      <p className="text-muted-foreground">
                        This artist hasn't had any recorded auction sales yet.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Galleries Tab */}
              <TabsContent value="galleries" className="space-y-6">
                {galleries && galleries.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-brand-charcoal">
                      Gallery Representation ({galleries.length})
                    </h3>
                    <div className="space-y-3">
                      {galleries.map((relationship: any) => (
                        <Card key={relationship.id} className="card-elevated">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-brand-charcoal">Gallery #{relationship.galleryId}</h4>
                                  {relationship.exclusivity === 'exclusive' && (
                                    <Badge className="bg-brand-gold text-brand-charcoal text-xs">
                                      Exclusive
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">Professional representation</p>
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                {relationship.startDate && (
                                  <div>Since {new Date(relationship.startDate).getFullYear()}</div>
                                )}
                                {relationship.endDate && (
                                  <div>Until {new Date(relationship.endDate).getFullYear()}</div>
                                )}
                                <div className="text-xs">
                                  {relationship.exclusivity || 'Standard'}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        No Gallery Representation
                      </h3>
                      <p className="text-muted-foreground">
                        This artist is not currently represented by any galleries.
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
