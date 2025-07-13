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

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'SAR'
  }).format(price);
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

  // Check if user is authenticated and has admin role
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: () => apiRequest('/api/auth/user'),
  });

  // Check if user needs to become admin first
  const isAdmin = user?.roles?.includes('admin') || user?.role === 'admin';
  
  // Debug logging to see what's happening
  console.log('Admin Dashboard Debug:', {
    user,
    userRoles: user?.roles,
    userRole: user?.role,
    isAdmin,
    hasUser: !!user
  });

  // Clear cache on mount for fresh data
  const clearCacheAndRefetch = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    queryClient.removeQueries({ queryKey: ['/api/admin/stats'] });
    // Force reload the page to clear any browser cache
    window.location.reload();
  };

  // Admin setup mutation
  const adminSetupMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/setup', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: t('admin.success'),
        description: t('admin.adminSetupSuccess') || "Admin privileges granted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      console.error('Admin setup error:', error);
      toast({
        title: t('admin.error'),
        description: error.message || t('admin.adminSetupError') || "Failed to setup admin",
        variant: 'destructive',
      });
    },
  });

  // Fetch admin statistics (only if user is admin)
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/stats', Date.now()],
    queryFn: () => apiRequest(`/api/admin/stats?_t=${Date.now()}`),
    enabled: isAdmin && !!user,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always treat as stale
    gcTime: 0, // Don't cache (was cacheTime in v4)
  });

  // Fetch users (only if user is admin)
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('/api/admin/users'),
    enabled: isAdmin && !!user,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch KYC documents (only if user is admin)
  const { data: kycDocumentsData, isLoading: kycDocumentsLoading, error: kycError } = useQuery({
    queryKey: ['/api/admin/kyc-documents'],
    queryFn: () => apiRequest('/api/admin/kyc-documents'),
    enabled: isAdmin && !!user,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Update KYC document mutation
  const updateKycDocumentMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      return apiRequest(`/api/admin/kyc-documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          verificationStatus: status,
          verificationNotes: notes
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: t('admin.success'),
        description: t('admin.documentUpdateSuccess'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-documents'] });
    },
    onError: (error) => {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      toast({
        title: t('admin.success'),
        description: t('admin.roleUpdated'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const users = usersData?.users || [];
  const kycDocuments = kycDocumentsData?.documents || [];

  // Debug logging for stats data
  console.log('=== FRONTEND ADMIN STATS DEBUG ===');
  console.log('Loading:', statsLoading);
  console.log('Error:', statsError);
  console.log('Stats object:', stats);
  console.log('Stats overview:', stats?.overview);
  console.log('Stats usersByRole:', stats?.usersByRole);
  console.log('Collectors count:', stats?.usersByRole?.collectors);
  console.log('Raw stats JSON:', JSON.stringify(stats, null, 2));
  console.log('=== END DEBUG ===');

  const overviewStats = stats?.overview || {
    totalUsers: 0,
    totalArtists: 0,
    totalGalleries: 0,
    totalArtworks: 0,
    activeAuctions: 0,
    totalWorkshops: 0,
    totalEvents: 0,
    pendingReports: 0,
  };

  const growthData = stats?.growth || {
    newUsersThisMonth: 0,
    newArtworksThisMonth: 0,
  };

  // Show admin setup if user is not admin
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{t('admin.loadingData')}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
              <p className="text-gray-600 dark:text-gray-300">Please log in to access the admin dashboard.</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Setup Required</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">You need admin privileges to access this dashboard.</p>
              <Button
                onClick={() => adminSetupMutation.mutate()}
                disabled={adminSetupMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                {adminSetupMutation.isPending ? 'Setting up...' : 'Become Admin'}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.dashboard')}</h1>
          <p className="text-gray-600">{t('admin.dashboardDescription')}</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full max-w-6xl">
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
            <TabsTrigger value="kyc-documents" className="flex items-center space-x-1 text-xs lg:text-sm">
              <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>{t('admin.kycDocuments')}</span>
            </TabsTrigger>
          </TabsList>

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
                  <div className="text-2xl font-bold">{stats?.usersByRole?.artists || 0}</div>
                  <p className="text-xs text-muted-foreground">Active creators</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.galleries')}</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.usersByRole?.galleries || 0}</div>
                  <p className="text-xs text-muted-foreground">Partner galleries</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('admin.collectors')}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" key={`collectors-${Date.now()}`}>
                    {stats?.usersByRole?.collectors || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Art collectors</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      // Clear all caches and force reload
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.getRegistrations().then(function(registrations) {
                          for(let registration of registrations) {
                            registration.unregister();
                          }
                        });
                      }
                      // Clear browser cache
                      if ('caches' in window) {
                        caches.keys().then(function(names) {
                          for (let name of names) {
                            caches.delete(name);
                          }
                        });
                      }
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload(true);
                    }}
                    className="mt-2"
                  >
                    Force Full Refresh
                  </Button>
                  <div className="text-xs text-muted-foreground mt-1">
                    Debug: {JSON.stringify(stats?.usersByRole)}
                  </div>
                  <div className="text-xs text-red-500 mt-1">
                    Cache-bust ID: {Date.now()}
                  </div>
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
                    <Button className="w-full" variant="outline">
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