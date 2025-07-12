import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Palette, Building, ImageIcon, Star, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface AdminStats {
  totalUsers: number;
  totalArtists: number;
  totalGalleries: number;
  totalArtworks: number;
  totalAuctions: number;
  totalOrders: number;
  monthlyRevenue: number;
  newUsersThisMonth: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: string[];
  createdAt: string;
  lastActiveAt: string;
  profileCompleteness: number;
  lifecycleStage: string;
}

interface Artist {
  id: string;
  name: string;
  email: string;
  location: string;
  featured: boolean;
  totalArtworks: number;
  createdAt: string;
}

interface Gallery {
  id: string;
  name: string;
  email: string;
  location: string;
  featured: boolean;
  totalArtists: number;
  createdAt: string;
}

interface Artwork {
  id: string;
  title: string;
  artistName: string;
  price: number;
  currency: string;
  availability: string;
  featured: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: true,
  });

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: selectedTab === 'users',
  });

  // Fetch artists
  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/admin/artists'],
    enabled: selectedTab === 'artists',
  });

  // Fetch galleries
  const { data: galleriesData, isLoading: galleriesLoading } = useQuery({
    queryKey: ['/api/admin/galleries'],
    enabled: selectedTab === 'galleries',
  });

  // Fetch artworks
  const { data: artworksData, isLoading: artworksLoading } = useQuery({
    queryKey: ['/api/admin/artworks'],
    enabled: selectedTab === 'artworks',
  });

  // Extract arrays from API response
  const users = usersData?.users || [];
  const artists = artistsData?.artists || [];
  const galleries = galleriesData?.galleries || [];
  const artworks = artworksData?.artworks || [];

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('admin.success'),
        description: t('admin.roleUpdated'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Feature toggle mutation
  const toggleFeature = useMutation({
    mutationFn: async ({ type, id, featured }: { type: string; id: string; featured: boolean }) => {
      return apiRequest(`/api/admin/${type}/${id}/feature`, {
        method: 'PATCH',
        body: { featured },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/artists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/galleries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/artworks'] });
      toast({
        title: t('admin.success'),
        description: t('admin.featureUpdated'),
      });
    },
    onError: (error) => {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getLifecycleStageColor = (stage: string) => {
    const colors = {
      'aware': 'bg-blue-100 text-blue-800',
      'join': 'bg-green-100 text-green-800',
      'explore': 'bg-yellow-100 text-yellow-800',
      'transact': 'bg-purple-100 text-purple-800',
      'retain': 'bg-orange-100 text-orange-800',
      'advocate': 'bg-red-100 text-red-800',
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.dashboard')}</h1>
          <p className="text-gray-600">{t('admin.dashboardDescription')}</p>
          
          {/* Admin Setup Notice */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Need admin access?
                </p>
                <p className="text-sm text-blue-700">
                  Visit <code className="bg-blue-100 px-2 py-1 rounded text-xs">/admin/setup</code> to become an admin first.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>{t('admin.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{t('admin.users')}</span>
            </TabsTrigger>
            <TabsTrigger value="artists" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>{t('admin.artists')}</span>
            </TabsTrigger>
            <TabsTrigger value="galleries" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>{t('admin.galleries')}</span>
            </TabsTrigger>
            <TabsTrigger value="artworks" className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>{t('admin.artworks')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </CardTitle>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.overview?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats?.growth?.newUsersThisMonth || 0} {t('admin.thisMonth')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.totalArtists')}</CardTitle>
                    <Palette className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.overview?.totalArtists || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.activeArtists')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.totalGalleries')}</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.overview?.totalGalleries || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.activeGalleries')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('admin.totalArtworks')}</CardTitle>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.overview?.totalArtworks || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('admin.listedArtworks')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.userManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.name')}</TableHead>
                          <TableHead>{t('admin.email')}</TableHead>
                          <TableHead>{t('admin.roles')}</TableHead>
                          <TableHead>{t('admin.stage')}</TableHead>
                          <TableHead>{t('admin.joinDate')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles?.map((role) => (
                                  <Badge key={role} variant="secondary">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getLifecycleStageColor(user.lifecycleStage)}>
                                {user.lifecycleStage}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => 
                                  updateUserRole.mutate({ userId: user.id, role: newRole })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="artist">Artist</SelectItem>
                                  <SelectItem value="gallery">Gallery</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.artistManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                {artistsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.name')}</TableHead>
                          <TableHead>{t('admin.email')}</TableHead>
                          <TableHead>{t('admin.location')}</TableHead>
                          <TableHead>{t('admin.artworks')}</TableHead>
                          <TableHead>{t('admin.featured')}</TableHead>
                          <TableHead>{t('admin.joinDate')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {artists?.map((artist: Artist) => (
                          <TableRow key={artist.id}>
                            <TableCell className="font-medium">{artist.name}</TableCell>
                            <TableCell>{artist.email}</TableCell>
                            <TableCell>{artist.location}</TableCell>
                            <TableCell>{artist.totalArtworks}</TableCell>
                            <TableCell>
                              {artist.featured ? (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Regular</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(artist.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => 
                                  toggleFeature.mutate({ 
                                    type: 'artists', 
                                    id: artist.id, 
                                    featured: !artist.featured 
                                  })
                                }
                              >
                                {artist.featured ? t('admin.unfeature') : t('admin.feature')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Galleries Tab */}
          <TabsContent value="galleries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.galleryManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                {galleriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.name')}</TableHead>
                          <TableHead>{t('admin.email')}</TableHead>
                          <TableHead>{t('admin.location')}</TableHead>
                          <TableHead>{t('admin.artists')}</TableHead>
                          <TableHead>{t('admin.featured')}</TableHead>
                          <TableHead>{t('admin.joinDate')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {galleries?.map((gallery: Gallery) => (
                          <TableRow key={gallery.id}>
                            <TableCell className="font-medium">{gallery.name}</TableCell>
                            <TableCell>{gallery.email}</TableCell>
                            <TableCell>{gallery.location}</TableCell>
                            <TableCell>{gallery.totalArtists}</TableCell>
                            <TableCell>
                              {gallery.featured ? (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Regular</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(gallery.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => 
                                  toggleFeature.mutate({ 
                                    type: 'galleries', 
                                    id: gallery.id, 
                                    featured: !gallery.featured 
                                  })
                                }
                              >
                                {gallery.featured ? t('admin.unfeature') : t('admin.feature')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artworks Tab */}
          <TabsContent value="artworks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.artworkManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                {artworksLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.title')}</TableHead>
                          <TableHead>{t('admin.artist')}</TableHead>
                          <TableHead>{t('admin.price')}</TableHead>
                          <TableHead>{t('admin.availability')}</TableHead>
                          <TableHead>{t('admin.featured')}</TableHead>
                          <TableHead>{t('admin.createdDate')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {artworks?.map((artwork: Artwork) => (
                          <TableRow key={artwork.id}>
                            <TableCell className="font-medium">{artwork.title}</TableCell>
                            <TableCell>{artwork.artistName}</TableCell>
                            <TableCell>{formatPrice(artwork.price, artwork.currency)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={artwork.availability === 'available' ? 'default' : 'secondary'}
                              >
                                {artwork.availability}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {artwork.featured ? (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Regular</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(artwork.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => 
                                  toggleFeature.mutate({ 
                                    type: 'artworks', 
                                    id: artwork.id, 
                                    featured: !artwork.featured 
                                  })
                                }
                              >
                                {artwork.featured ? t('admin.unfeature') : t('admin.feature')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}