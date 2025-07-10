import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageSquare, User, Settings, Eye, Calendar, MapPin, Phone, Mail, Edit2, Save, X, BarChart3, Package } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArtworkCard } from "@/components/ArtworkCard";
import { Link } from "wouter";

interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  phone?: string;
  location?: string;
  bio?: string;
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
    language: string;
  };
}

interface Favorite {
  id: number;
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    images: string[];
    price?: string;
    currency?: string;
    availability?: string;
    artist?: {
      name: string;
      nameAr?: string;
    };
  };
  createdAt: string;
}

interface Inquiry {
  id: number;
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    images: string[];
    artist?: {
      name: string;
      nameAr?: string;
    };
  };
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  response?: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: ''
  });

  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/profile'],
  });

  const { data: favorites, isLoading: favoritesLoading } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
  });

  const { data: inquiries, isLoading: inquiriesLoading } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries/user'],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      await apiRequest('/api/profile', {
        method: 'PATCH',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (artworkId: number) => {
      await apiRequest(`/api/favorites/${artworkId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from favorites",
        description: "Artwork removed from your collection",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleEditProfile = () => {
    if (userProfile) {
      setProfileForm({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        location: userProfile.location || '',
        bio: userProfile.bio || ''
      });
    }
    setIsEditing(true);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-muted rounded-2xl"></div>
              <div className="lg:col-span-2 h-96 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-charcoal mb-2">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcomeBack", { name: userProfile?.firstName || user?.claims?.first_name })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card className="card-elevated">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={userProfile?.profileImageUrl || user?.claims?.profile_image_url} />
                  <AvatarFallback className="text-2xl">
                    {(userProfile?.firstName?.[0] || user?.claims?.first_name?.[0] || 'U')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl text-brand-charcoal">
                  {userProfile?.firstName || user?.claims?.first_name} {userProfile?.lastName || user?.claims?.last_name}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {userProfile?.email || user?.claims?.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <>
                    {userProfile?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-brand-purple" />
                        <span className="text-sm">{userProfile.phone}</span>
                      </div>
                    )}
                    
                    {userProfile?.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-brand-purple" />
                        <span className="text-sm">{userProfile.location}</span>
                      </div>
                    )}

                    {userProfile?.bio && (
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {userProfile.bio}
                        </p>
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full border-brand-purple text-brand-purple hover:bg-brand-light-gold"
                      onClick={handleEditProfile}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {t("dashboard.profile.edit")}
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="firstName" className="text-xs">{t("dashboard.profile.firstName")}</Label>
                        <Input
                          id="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-xs">{t("dashboard.profile.lastName")}</Label>
                        <Input
                          id="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs">{t("dashboard.profile.phone")}</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-xs">{t("dashboard.profile.location")}</Label>
                      <Input
                        id="location"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-xs">{t("dashboard.profile.bio")}</Label>
                      <Textarea
                        id="bio"
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="min-h-16 text-xs"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-brand-gradient text-xs h-8"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {t("common.save")}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 text-xs h-8"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                <h3 className="font-semibold text-brand-charcoal mb-4">{t("dashboard.quickStats.title")}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-brand-purple" />
                      <span className="text-sm">{t("dashboard.quickStats.favorites")}</span>
                    </div>
                    <Badge variant="secondary">{favorites?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-brand-purple" />
                      <span className="text-sm">{t("dashboard.quickStats.inquiries")}</span>
                    </div>
                    <Badge variant="secondary">{inquiries?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-brand-purple" />
                      <span className="text-sm">{t("dashboard.quickStats.views")}</span>
                    </div>
                    <Badge variant="secondary">---</Badge>
                  </div>
                </div>
                
                {/* Analytics Link for Artists/Galleries */}
                {(user?.role === 'artist' || user?.role === 'gallery') && (
                  <Link to="/analytics">
                    <Button className="w-full mt-4 bg-brand-navy hover:bg-brand-steel">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {t("dashboard.viewAnalytics")}
                    </Button>
                  </Link>
                )}
                
                {/* Collector Dashboard Link */}
                <Link to="/collector">
                  <Button className="w-full mt-4 bg-brand-navy hover:bg-brand-steel">
                    <Package className="h-4 w-4 mr-2" />
                    {t("dashboard.collectorDashboard")}
                  </Button>
                </Link>
                
                {/* Seller Dashboard Link for Artists/Galleries */}
                {(user?.role === 'artist' || user?.role === 'gallery') && (
                  <Link to="/seller">
                    <Button className="w-full mt-2 bg-brand-navy hover:bg-brand-steel">
                      <Package className="h-4 w-4 mr-2" />
                      {t("dashboard.sellerDashboard")}
                    </Button>
                  </Link>
                )}
                
                {/* Seller Dashboard Link for Artists/Galleries */}
                {(user?.role === 'artist' || user?.role === 'gallery') && (
                  <Link to="/seller">
                    <Button className="w-full mt-2 bg-brand-navy hover:bg-brand-steel">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      {t("dashboard.sellerDashboard")}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="favorites" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="inquiries" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Inquiries
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-brand-charcoal">
                    {t("dashboard.favorites.title")}
                  </h2>
                  <Badge variant="outline">
                    {favorites?.length || 0} {t("common.items")}
                  </Badge>
                </div>

                {favoritesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-t-lg"></div>
                        <CardContent className="p-4 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : favorites && favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="relative group">
                        <ArtworkCard artwork={favorite.artwork} />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFavoriteMutation.mutate(favorite.artwork.id)}
                          disabled={removeFavoriteMutation.isPending}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        {t("dashboard.favorites.empty")}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {t("dashboard.favorites.emptyDescription")}
                      </p>
                      <Button className="bg-brand-gradient">
                        {t("dashboard.favorites.browseArtworks")}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Inquiries Tab */}
              <TabsContent value="inquiries" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-brand-charcoal">
                    {t("dashboard.inquiries.title")}
                  </h2>
                  <Badge variant="outline">
                    {inquiries?.length || 0} {t("dashboard.inquiries.count")}
                  </Badge>
                </div>

                {inquiriesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6 space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-16 bg-muted rounded"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : inquiries && inquiries.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => {
                        const artworkTitle = isRTL && inquiry.artwork.titleAr 
                          ? inquiry.artwork.titleAr 
                          : inquiry.artwork.title;
                        const artistName = isRTL && inquiry.artwork.artist?.nameAr 
                          ? inquiry.artwork.artist.nameAr 
                          : inquiry.artwork.artist?.name;

                        return (
                          <Card key={inquiry.id} className="card-elevated">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <img
                                  src={inquiry.artwork.images[0]}
                                  alt={artworkTitle}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-brand-charcoal">
                                      {artworkTitle}
                                    </h4>
                                    <Badge
                                      variant={
                                        inquiry.status === "responded" 
                                          ? "default" 
                                          : inquiry.status === "pending" 
                                          ? "secondary" 
                                          : "outline"
                                      }
                                    >
                                      {inquiry.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    by {artistName}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {inquiry.message}
                                  </p>
                                  {inquiry.response && (
                                    <div className="mt-3 p-3 bg-brand-light-gold rounded-lg">
                                      <p className="text-sm font-medium text-brand-charcoal mb-1">
                                        Response:
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {inquiry.response}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <Card className="card-elevated">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                        No inquiries yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Contact artists or galleries about artworks you're interested in
                      </p>
                      <Button className="bg-brand-gradient">
                        Browse Artworks
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <h2 className="text-2xl font-semibold text-brand-charcoal">
                  Account Settings
                </h2>
                
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Art Preferences & Recommendations</h4>
                        <p className="text-sm text-muted-foreground">
                          Customize your interests for personalized recommendations
                        </p>
                      </div>
                      <Link href="/preferences">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </Link>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new artworks and auctions
                        </p>
                      </div>
                      <Link href="/preferences">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </Link>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Newsletter</h4>
                        <p className="text-sm text-muted-foreground">
                          Stay updated with art market news and insights
                        </p>
                      </div>
                      <Link href="/preferences">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </Link>
                    </div>

                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Privacy Settings</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage your data and privacy preferences
                        </p>
                      </div>
                      <Link href="/preferences">
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}