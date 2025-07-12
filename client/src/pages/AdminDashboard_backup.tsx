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

// Utility functions
const getLifecycleStageColor = (stage: string) => {
  switch (stage?.toLowerCase()) {
    case 'aware': return 'text-blue-600 bg-blue-50';
    case 'join': return 'text-green-600 bg-green-50';
    case 'explore': return 'text-purple-600 bg-purple-50';
    case 'transact': return 'text-orange-600 bg-orange-50';
    case 'retain': return 'text-teal-600 bg-teal-50';
    case 'advocate': return 'text-pink-600 bg-pink-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

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

interface KycDocument {
  id: string;
  userId: string;
  sellerType: string;
  sellerId: string;
  documentType: string;
  documentName: string;
  verificationStatus: string;
  verificationNotes: string;
  uploadedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  expiresAt: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  artistName: string;
  galleryName: string;
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

  // Fetch KYC documents
  const { data: kycDocumentsData, isLoading: kycDocumentsLoading } = useQuery({
    queryKey: ['/api/admin/kyc-documents'],
    enabled: selectedTab === 'kyc-documents',
  });

  // Update KYC document status
  const updateKycDocumentMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      return apiRequest(`/api/admin/kyc-documents/${id}`, {
        method: 'PATCH',
        body: { verificationStatus: status, verificationNotes: notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-documents'] });
      toast({ title: t('admin.documentUpdated'), description: t('admin.documentUpdateSuccess') });
    },
    onError: (error) => {
      toast({ title: t('admin.error'), description: error.message, variant: 'destructive' });
    },
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
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full max-w-6xl">
            <TabsTrigger value="overview" className="flex items-center space-x-1 text-xs lg:text-sm">
              <Activity className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-1 text-xs lg:text-sm">
              <Users className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.users')}</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-1 text-xs lg:text-sm">
              <ImageIcon className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.content')}</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center space-x-1 text-xs lg:text-sm">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.communication')}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1 text-xs lg:text-sm">
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.analytics')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-1 text-xs lg:text-sm">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.settings')}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-1 text-xs lg:text-sm">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.security')}</span>
            </TabsTrigger>
            <TabsTrigger value="kyc-documents" className="flex items-center space-x-1 text-xs lg:text-sm">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.kycDocuments')}</span>
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

          {/* Enhanced Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.systemHealth')}</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">99.9% uptime</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.activeUsers')}</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-muted-foreground">Currently online</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.newSubmissions')}</CardTitle>
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.systemAlerts')}</CardTitle>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.recentActivity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registration</p>
                      <p className="text-xs text-muted-foreground">Ahmed Al-Rashid joined as collector - 2 mins ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Artwork submission</p>
                      <p className="text-xs text-muted-foreground">Fatima Al-Zahra uploaded "Desert Sunset" - 5 mins ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Artwork inquiry</p>
                      <p className="text-xs text-muted-foreground">Collector inquired about "Modern Calligraphy" - 8 mins ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System alert</p>
                      <p className="text-xs text-muted-foreground">High memory usage detected - 12 mins ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">+{stats?.growth?.newUsersThisMonth || 0} this month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.artists')}</CardTitle>
                  <Palette className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview?.totalArtists || 0}</div>
                  <p className="text-xs text-muted-foreground">Active creators</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.galleries')}</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview?.totalGalleries || 0}</div>
                  <p className="text-xs text-muted-foreground">Partner galleries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.collectors')}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats?.overview?.totalUsers || 0) - (stats?.overview?.totalArtists || 0) - (stats?.overview?.totalGalleries || 0)}</div>
                  <p className="text-xs text-muted-foreground">Art collectors</p>
                </CardContent>
              </Card>
            </div>

            {/* User Management Interface */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.userManagement')}</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={t('admin.searchUsers')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all-roles">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t('admin.filterByRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-roles">{t('admin.allRoles')}</SelectItem>
                        <SelectItem value="artist">{t('admin.artists')}</SelectItem>
                        <SelectItem value="gallery">{t('admin.galleries')}</SelectItem>
                        <SelectItem value="collector">{t('admin.collectors')}</SelectItem>
                        <SelectItem value="admin">{t('admin.admins')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all-stages">
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t('admin.filterByStage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-stages">{t('admin.allStages')}</SelectItem>
                        <SelectItem value="aware">Aware</SelectItem>
                        <SelectItem value="join">Join</SelectItem>
                        <SelectItem value="explore">Explore</SelectItem>
                        <SelectItem value="transact">Transact</SelectItem>
                        <SelectItem value="retain">Retain</SelectItem>
                        <SelectItem value="advocate">Advocate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                        {usersData?.users?.map((user: User) => (
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
                              <Badge 
                                variant="outline" 
                                className={getLifecycleStageColor(user.lifecycleStage)}
                              >
                                {user.lifecycleStage}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  {t('admin.viewProfile')}
                                </Button>
                                <Button variant="outline" size="sm">
                                  {t('admin.editUser')}
                                </Button>
                              </div>
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

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.artworkManagement')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.totalArtworks')}</span>
                      <span className="font-semibold">{stats?.overview?.totalArtworks || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.pendingApproval')}</span>
                      <span className="font-semibold text-amber-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.featured')}</span>
                      <span className="font-semibold text-blue-600">25</span>
                    </div>
                    <Button className="w-full" onClick={() => setSelectedTab('artworks')}>
                      {t('admin.manageArtworks')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.contentModeration')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.flaggedContent')}</span>
                      <span className="font-semibold text-red-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.autoDetected')}</span>
                      <span className="font-semibold text-orange-600">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.appealRequests')}</span>
                      <span className="font-semibold text-purple-600">2</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.reviewContent')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.featuredContent')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.homepageFeatures')}</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.artistSpotlight')}</span>
                      <span className="font-semibold text-green-600">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.collections')}</span>
                      <span className="font-semibold">15</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.manageFeatured')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Management Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.emailManagement')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.emailQueue')}</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.deliveryRate')}</span>
                      <span className="font-semibold text-green-600">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.bounceRate')}</span>
                      <span className="font-semibold text-red-600">1.2%</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.manageEmails')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.newsletterSystem')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.subscribers')}</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.openRate')}</span>
                      <span className="font-semibold text-blue-600">24.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.clickRate')}</span>
                      <span className="font-semibold text-purple-600">8.7%</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.createNewsletter')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.pageViews')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,847</div>
                  <p className="text-xs text-muted-foreground">+18% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.searchQueries')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,259</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.userSessions')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,924</div>
                  <p className="text-xs text-muted-foreground">+25% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.conversionRate')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4%</div>
                  <p className="text-xs text-muted-foreground">+0.3% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.geographicDistribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">45%</div>
                    <div className="text-sm text-muted-foreground">Saudi Arabia</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">22%</div>
                    <div className="text-sm text-muted-foreground">UAE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">15%</div>
                    <div className="text-sm text-muted-foreground">Qatar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8%</div>
                    <div className="text-sm text-muted-foreground">Kuwait</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">6%</div>
                    <div className="text-sm text-muted-foreground">Bahrain</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">4%</div>
                    <div className="text-sm text-muted-foreground">Oman</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.generalSettings')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.siteName')}</span>
                      <span className="font-semibold">Art Souk</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.primaryLanguage')}</span>
                      <span className="font-semibold">Arabic/English</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.mainCurrency')}</span>
                      <span className="font-semibold">SAR</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.editSettings')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.featureToggles')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.newUserRegistration')}</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.artworkSubmissions')}</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.maintenanceMode')}</span>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.manageFeatures')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security & Compliance Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.securityMonitoring')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.failedLogins')}</span>
                      <span className="font-semibold text-red-600">15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.suspiciousActivity')}</span>
                      <span className="font-semibold text-orange-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.blockedUsers')}</span>
                      <span className="font-semibold">8</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.viewSecurityLogs')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.dataCompliance')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.gdprRequests')}</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.dataRetention')}</span>
                      <Badge variant="default">Compliant</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t('admin.auditLogs')}</span>
                      <span className="font-semibold text-green-600">Active</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      {t('admin.viewComplianceReport')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
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
                        {artistsData?.artists?.map((artist: Artist) => (
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
                        {galleriesData?.galleries?.map((gallery: Gallery) => (
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
                        {artworksData?.artworks?.map((artwork: Artwork) => (
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

          {/* KYC Documents Tab */}
          <TabsContent value="kyc-documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.kycDocuments')}</CardTitle>
              </CardHeader>
              <CardContent>
                {kycDocumentsLoading ? (
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
                          <TableHead>{t('admin.seller')}</TableHead>
                          <TableHead>{t('admin.sellerType')}</TableHead>
                          <TableHead>{t('admin.documentType')}</TableHead>
                          <TableHead>{t('admin.status')}</TableHead>
                          <TableHead>{t('admin.uploadDate')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kycDocumentsData?.documents?.map((document: KycDocument) => (
                          <TableRow key={document.id}>
                            <TableCell className="font-medium">
                              {document.sellerType === 'artist' ? 
                                (document.artistName || `${document.userFirstName} ${document.userLastName}`) : 
                                (document.galleryName || `${document.userFirstName} ${document.userLastName}`)
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={document.sellerType === 'artist' ? 'default' : 'secondary'}>
                                {document.sellerType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {document.documentType.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  document.verificationStatus === 'approved' ? 'default' :
                                  document.verificationStatus === 'pending' ? 'secondary' :
                                  document.verificationStatus === 'rejected' ? 'destructive' :
                                  'outline'
                                }
                              >
                                {document.verificationStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(document.uploadedAt)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Select
                                  value={document.verificationStatus}
                                  onValueChange={(value) => {
                                    updateKycDocumentMutation.mutate({
                                      id: document.id,
                                      status: value,
                                      notes: document.verificationNotes || ''
                                    });
                                  }}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
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