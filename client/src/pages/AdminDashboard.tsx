import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn, formatPrice } from "@/lib/utils";
import { 
  Users, 
  Palette, 
  Building, 
  Image, 
  Gavel, 
  BookOpen, 
  Star, 
  Settings, 
  BarChart3, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Crown,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  DollarSign
} from "lucide-react";

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;
  profileImageUrl?: string;
}

interface Artist {
  id: number;
  name: string;
  nameAr?: string;
  email?: string;
  phone?: string;
  biography?: string;
  biographyAr?: string;
  nationality?: string;
  birthYear?: number;
  featured?: boolean;
  profileImage?: string;
  createdAt?: string;
}

interface Gallery {
  id: number;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  location?: string;
  locationAr?: string;
  website?: string;
  email?: string;
  phone?: string;
  featured?: boolean;
  logoImage?: string;
  createdAt?: string;
}

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  images: string[];
  artist?: { name: string; nameAr?: string };
  gallery?: { name: string; nameAr?: string };
  year?: number;
  medium?: string;
  price?: string;
  currency?: string;
  availability?: string;
  featured?: boolean;
  curatorsPickFeatured?: boolean;
  createdAt?: string;
}

interface AdminStats {
  totalUsers: number;
  totalArtists: number;
  totalGalleries: number;
  totalArtworks: number;
  totalAuctions: number;
  totalArticles: number;
  totalInquiries: number;
  totalFavorites: number;
  recentUsers: number;
  recentArtworks: number;
  liveAuctions: number;
  featuredArtworks: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>("");

  // Fetch admin stats
  const { data: stats, isLoading: loadingStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  // Fetch all users
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch all artists
  const { data: allArtists = [], isLoading: loadingArtists } = useQuery<Artist[]>({
    queryKey: ["/api/admin/artists"],
  });

  // Fetch all galleries
  const { data: allGalleries = [], isLoading: loadingGalleries } = useQuery<Gallery[]>({
    queryKey: ["/api/admin/galleries"],
  });

  // Fetch all artworks
  const { data: allArtworks = [], isLoading: loadingArtworks } = useQuery<Artwork[]>({
    queryKey: ["/api/admin/artworks"],
  });

  // Role update mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Success", description: "User role updated successfully" });
      setSelectedUserForRole(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      await apiRequest(`/api/admin/${type}/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${type}`] });
      toast({ title: "Success", description: `${type} deleted successfully` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Feature toggle mutation
  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ type, id, featured }: { type: string; id: number; featured: boolean }) => {
      await apiRequest(`/api/admin/${type}/${id}/feature`, {
        method: 'PATCH',
        body: { featured },
      });
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/${type}`] });
      toast({ title: "Success", description: `Feature status updated successfully` });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this page.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: number; icon: any; trend?: number }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            {trend > 0 ? '+' : ''}{trend} this month
          </p>
        )}
      </CardContent>
    </Card>
  );

  const UserRoleDialog = ({ user, onClose }: { user: User; onClose: () => void }) => (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user?.firstName} {user?.lastName} ({user?.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Current Role</Label>
            <Badge variant="outline" className="ml-2">
              {user?.role || 'user'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'user' })}
              disabled={updateRoleMutation.isPending}
            >
              Make User
            </Button>
            <Button 
              variant="outline" 
              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'artist' })}
              disabled={updateRoleMutation.isPending}
            >
              Make Artist
            </Button>
            <Button 
              variant="outline" 
              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'gallery' })}
              disabled={updateRoleMutation.isPending}
            >
              Make Gallery
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}
              disabled={updateRoleMutation.isPending}
            >
              <Crown className="h-4 w-4 mr-2" />
              Make Admin
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn("flex items-center justify-between mb-8", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your Art Souk platform</p>
          </div>
          <Badge variant="destructive" className="px-4 py-2">
            <Crown className="h-4 w-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="galleries">Galleries</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loadingStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} trend={stats?.recentUsers} />
                  <StatCard title="Total Artists" value={stats?.totalArtists || 0} icon={Palette} />
                  <StatCard title="Total Galleries" value={stats?.totalGalleries || 0} icon={Building} />
                  <StatCard title="Total Artworks" value={stats?.totalArtworks || 0} icon={Image} trend={stats?.recentArtworks} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Live Auctions" value={stats?.liveAuctions || 0} icon={Gavel} />
                  <StatCard title="Total Articles" value={stats?.totalArticles || 0} icon={BookOpen} />
                  <StatCard title="Total Inquiries" value={stats?.totalInquiries || 0} icon={MessageSquare} />
                  <StatCard title="Total Favorites" value={stats?.totalFavorites || 0} icon={Heart} />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers
                      .filter(user => 
                        !searchTerm || 
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {user.firstName?.[0] || user.email?.[0] || '?'}
                            </div>
                            <div>
                              <div className="font-medium">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                            {user.role || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUserForRole(user)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artists" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Artist Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Artist
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artist</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead>Birth Year</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allArtists.map((artist) => (
                      <TableRow key={artist.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {artist.name[0]}
                            </div>
                            <div>
                              <div className="font-medium">{artist.name}</div>
                              {artist.nameAr && (
                                <div className="text-sm text-muted-foreground">{artist.nameAr}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{artist.nationality || 'N/A'}</TableCell>
                        <TableCell>{artist.birthYear || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatureMutation.mutate({ 
                              type: 'artists', 
                              id: artist.id, 
                              featured: !artist.featured 
                            })}
                          >
                            {artist.featured ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Artist</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {artist.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate({ type: 'artists', id: artist.id })}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="galleries" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gallery Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Gallery
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gallery</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allGalleries.map((gallery) => (
                      <TableRow key={gallery.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {gallery.name[0]}
                            </div>
                            <div>
                              <div className="font-medium">{gallery.name}</div>
                              {gallery.nameAr && (
                                <div className="text-sm text-muted-foreground">{gallery.nameAr}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{gallery.location || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatureMutation.mutate({ 
                              type: 'galleries', 
                              id: gallery.id, 
                              featured: !gallery.featured 
                            })}
                          >
                            {gallery.featured ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {gallery.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate({ type: 'galleries', id: gallery.id })}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artworks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Artwork Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Artwork
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allArtworks.map((artwork) => (
                      <TableRow key={artwork.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Image className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{artwork.title}</div>
                              {artwork.titleAr && (
                                <div className="text-sm text-muted-foreground">{artwork.titleAr}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{artwork.artist?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {artwork.price ? formatPrice(artwork.price, artwork.currency || 'SAR', 'en') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={artwork.availability === 'available' ? 'default' : 'secondary'}>
                            {artwork.availability || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatureMutation.mutate({ 
                              type: 'artworks', 
                              id: artwork.id, 
                              featured: !artwork.featured 
                            })}
                          >
                            {artwork.featured ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {artwork.title}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate({ type: 'artworks', id: artwork.id })}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auctions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Auction Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Auction
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Auction management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Article Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Article
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Article management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedUserForRole && (
          <UserRoleDialog 
            user={selectedUserForRole} 
            onClose={() => setSelectedUserForRole(null)} 
          />
        )}
      </div>
    </div>
  );
}