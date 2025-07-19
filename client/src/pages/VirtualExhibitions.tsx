import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Eye, Play, Clock, Filter, Search, Star, Palette, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface VirtualExhibition {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  coverImage?: string;
  thumbnailImages?: string[];
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'ended';
  type: 'solo' | 'group' | 'thematic' | 'retrospective';
  curatorName?: string;
  curatorNameAr?: string;
  galleryId?: number;
  gallery?: {
    name: string;
    nameAr?: string;
    location?: string;
    locationAr?: string;
  };
  artistIds?: number[];
  artists?: Array<{
    id: number;
    name: string;
    nameAr?: string;
    profileImage?: string;
  }>;
  artworkCount: number;
  viewCount?: number;
  likeCount?: number;
  featured?: boolean;
  category?: string;
  categoryAr?: string;
  tags?: string[];
  tagsAr?: string[];
  interactiveFeatures?: string[];
  duration?: number; // in minutes
  is360?: boolean;
  hasAudio?: boolean;
  hasVideo?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export default function VirtualExhibitions() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: featuredExhibitions, isLoading: featuredLoading } = useQuery<VirtualExhibition[]>({
    queryKey: ['/api/virtual-exhibitions/featured'],
  });

  const { data: liveExhibitions, isLoading: liveLoading } = useQuery<VirtualExhibition[]>({
    queryKey: ['/api/virtual-exhibitions/live'],
  });

  const { data: upcomingExhibitions, isLoading: upcomingLoading } = useQuery<VirtualExhibition[]>({
    queryKey: ['/api/virtual-exhibitions/upcoming'],
  });

  const { data: allExhibitions, isLoading: allLoading } = useQuery<VirtualExhibition[]>({
    queryKey: ['/api/virtual-exhibitions', { search: searchQuery, type: filterType, status: filterStatus, sort: sortBy }],
    enabled: activeTab === 'all',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live Now';
      case 'upcoming': return 'Coming Soon';
      case 'ended': return 'Archived';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'solo': return <Users className="h-4 w-4" />;
      case 'group': return <Building2 className="h-4 w-4" />;
      case 'thematic': return <Palette className="h-4 w-4" />;
      case 'retrospective': return <Star className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const ExhibitionCard = ({ exhibition }: { exhibition: VirtualExhibition }) => {
    const title = isRTL && exhibition.titleAr ? exhibition.titleAr : exhibition.title;
    const description = isRTL && exhibition.descriptionAr ? exhibition.descriptionAr : exhibition.description;
    const galleryName = isRTL && exhibition.gallery?.nameAr ? exhibition.gallery.nameAr : exhibition.gallery?.name;
    const galleryLocation = isRTL && exhibition.gallery?.locationAr ? exhibition.gallery.locationAr : exhibition.gallery?.location;
    const curatorName = isRTL && exhibition.curatorNameAr ? exhibition.curatorNameAr : exhibition.curatorName;
    const category = isRTL && exhibition.categoryAr ? exhibition.categoryAr : exhibition.category;

    return (
      <Link href={`/virtual-exhibitions/${exhibition.id}`}>
        <Card className="card-elevated cursor-pointer transition-all duration-300 hover:shadow-lg group overflow-hidden">
          <div className="relative">
            <img
              src={exhibition.coverImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
              alt={title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={cn("text-white", getStatusColor(exhibition.status))}>
                {exhibition.status === 'live' && <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />}
                {getStatusText(exhibition.status)}
              </Badge>
            </div>

            {/* Featured Badge */}
            {exhibition.featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-brand-gold text-brand-charcoal">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Interactive Features */}
            <div className="absolute bottom-3 left-3 flex gap-1">
              {exhibition.is360 && (
                <Badge variant="secondary" className="text-xs bg-white/90">
                  360°
                </Badge>
              )}
              {exhibition.hasAudio && (
                <Badge variant="secondary" className="text-xs bg-white/90">
                  Audio
                </Badge>
              )}
              {exhibition.hasVideo && (
                <Badge variant="secondary" className="text-xs bg-white/90">
                  Video
                </Badge>
              )}
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="h-6 w-6 text-brand-purple" />
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-3">
              {/* Category & Type */}
              <div className="flex items-center gap-2">
                {category && (
                  <Badge variant="outline" className="text-xs border-brand-purple text-brand-purple">
                    {category}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getTypeIcon(exhibition.type)}
                  <span className="capitalize">{exhibition.type}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-brand-charcoal group-hover:text-brand-purple transition-colors line-clamp-2">
                {title}
              </h3>

              {/* Description */}
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              )}

              {/* Artists */}
              {exhibition.artists && exhibition.artists.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>
                    {exhibition.artists.slice(0, 2).map((artist, index) => {
                      const artistName = isRTL && artist.nameAr ? artist.nameAr : artist.name;
                      return index === 0 ? artistName : `, ${artistName}`;
                    })}
                    {exhibition.artists.length > 2 && ` +${exhibition.artists.length - 2} more`}
                  </span>
                </div>
              )}

              {/* Gallery */}
              {galleryName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span>{galleryName}</span>
                  {galleryLocation && <span>• {galleryLocation}</span>}
                </div>
              )}

              {/* Curator */}
              {curatorName && (
                <div className="text-xs text-muted-foreground">
                  Curated by {curatorName}
                </div>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    <span>{exhibition.artworkCount} works</span>
                  </div>
                  
                  {exhibition.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(exhibition.duration)}</span>
                    </div>
                  )}

                  {exhibition.viewCount && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{exhibition.viewCount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {exhibition.status === 'upcoming' 
                      ? `Opens ${new Date(exhibition.startDate).toLocaleDateString()}`
                      : exhibition.status === 'live'
                      ? `Until ${new Date(exhibition.endDate).toLocaleDateString()}`
                      : `Ended ${new Date(exhibition.endDate).toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-muted rounded-t-lg"></div>
          <CardContent className="p-6 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
            Virtual Exhibitions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience immersive art exhibitions from anywhere in the world. Explore curated collections, 
            meet artists, and discover new perspectives through cutting-edge virtual reality.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Live Now
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              All
            </TabsTrigger>
          </TabsList>

          {/* Search & Filters */}
          {activeTab === 'all' && (
            <Card className="card-elevated">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search exhibitions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                      <SelectItem value="thematic">Thematic</SelectItem>
                      <SelectItem value="retrospective">Retrospective</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="live">Live Now</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ended">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="ending_soon">Ending Soon</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Featured Exhibitions */}
          <TabsContent value="featured" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-brand-charcoal mb-2">
                Curated Highlights
              </h2>
              <p className="text-muted-foreground">
                Exceptional exhibitions handpicked by our curators
              </p>
            </div>

            {featuredLoading ? (
              <LoadingGrid />
            ) : featuredExhibitions && featuredExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <Card className="card-elevated">
                <CardContent className="p-12 text-center">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                    No featured exhibitions
                  </h3>
                  <p className="text-muted-foreground">
                    Check back soon for curated highlights
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Live Exhibitions */}
          <TabsContent value="live" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-brand-charcoal mb-2">
                Live Exhibitions
              </h2>
              <p className="text-muted-foreground">
                Explore exhibitions that are happening right now
              </p>
            </div>

            {liveLoading ? (
              <LoadingGrid />
            ) : liveExhibitions && liveExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <Card className="card-elevated">
                <CardContent className="p-12 text-center">
                  <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                    No live exhibitions
                  </h3>
                  <p className="text-muted-foreground">
                    Check upcoming exhibitions or explore our archive
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upcoming Exhibitions */}
          <TabsContent value="upcoming" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-brand-charcoal mb-2">
                Coming Soon
              </h2>
              <p className="text-muted-foreground">
                Get ready for these exciting upcoming exhibitions
              </p>
            </div>

            {upcomingLoading ? (
              <LoadingGrid />
            ) : upcomingExhibitions && upcomingExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <Card className="card-elevated">
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                    No upcoming exhibitions
                  </h3>
                  <p className="text-muted-foreground">
                    New exhibitions are being planned. Stay tuned!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Exhibitions */}
          <TabsContent value="all" className="space-y-8">
            {allLoading ? (
              <LoadingGrid />
            ) : allExhibitions && allExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <Card className="card-elevated">
                <CardContent className="p-12 text-center">
                  <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                    No exhibitions found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
