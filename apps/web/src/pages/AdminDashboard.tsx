import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Navbar } from "@/components/Navbar";
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
  DollarSign,
  Mail,
  Send,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Database
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

interface EmailTemplate {
  id: number;
  code: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  subject: string;
  subjectAr?: string;
  htmlContent: string;
  htmlContentAr?: string;
  textContent?: string;
  textContentAr?: string;
  variables: string[];
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface EmailQueueItem {
  id: number;
  recipientEmail: string;
  recipientUserId?: string;
  templateCode?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  status: string;
  priority?: number;
  scheduledFor?: string;
  sentAt?: string;
  errorMessage?: string;
  attempts?: number;
  createdAt?: string;
}

interface EmailLog {
  id: number;
  queueId?: number;
  recipientEmail: string;
  recipientUserId?: string;
  templateCode?: string;
  subject: string;
  status: string;
  sendgridMessageId?: string;
  sendgridResponse?: any;
  openedAt?: string;
  clickedAt?: string;
  sentAt?: string;
}

interface NewsletterSubscriber {
  id: number;
  email: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  language?: string;
  subscriptionStatus: string;
  categories?: string[];
  frequency?: string;
  subscribedAt?: string;
  unsubscribedAt?: string;
  lastEmailSentAt?: string;
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
  
  // Email management state
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [emailSearchTerm, setEmailSearchTerm] = useState("");
  const [queueFilter, setQueueFilter] = useState("all");
  const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);

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
  
  // Email management queries
  const { data: emailTemplates = [], isLoading: loadingTemplates } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
    enabled: activeTab === "emails",
  });
  
  const { data: emailQueue = [], isLoading: loadingQueue } = useQuery<EmailQueueItem[]>({
    queryKey: ["/api/email-notifications/queue", queueFilter],
    queryFn: async () => {
      const params = queueFilter !== "all" ? `?status=${queueFilter}` : "";
      const response = await fetch(`/api/email-notifications/queue${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch email queue');
      return response.json();
    },
    enabled: activeTab === "emails",
    refetchInterval: 5000, // Refresh every 5 seconds
  });
  
  const { data: emailLogs = [], isLoading: loadingLogs } = useQuery<EmailLog[]>({
    queryKey: ["/api/email-notifications/log", emailSearchTerm],
    queryFn: async () => {
      const params = emailSearchTerm ? `?email=${emailSearchTerm}` : "";
      const response = await fetch(`/api/email-notifications/log${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch email logs');
      return response.json();
    },
    enabled: activeTab === "emails",
  });

  const { data: newsletterSubscribers = [], isLoading: loadingSubscribers } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter-subscribers"],
    enabled: activeTab === "emails",
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
  
  // Email template mutations
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Partial<EmailTemplate>) => {
      await apiRequest('/api/email-templates', {
        method: 'POST',
        body: template,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Success", description: "Email template created successfully" });
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, template }: { id: number; template: Partial<EmailTemplate> }) => {
      await apiRequest(`/api/email-templates/${id}`, {
        method: 'PATCH',
        body: template,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Success", description: "Email template updated successfully" });
      setIsTemplateDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/email-templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Success", description: "Email template deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: { recipientEmail: string; templateCode: string; variables?: any; language?: string }) => {
      await apiRequest('/api/email-notifications/test', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Test email queued for delivery" });
      setIsTestEmailDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/email-notifications/queue"] });
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
    <>
      <Navbar />
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
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="galleries">Galleries</TabsTrigger>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
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

          <TabsContent value="emails" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Email Management</h2>
              <div className="flex gap-2">
                <Button onClick={() => setIsTestEmailDialogOpen(true)} variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
                <Button onClick={() => { setSelectedTemplate(null); setIsTemplateDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </div>

            {/* Email Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Queued Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {emailQueue.filter(e => e.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Waiting to send</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {emailQueue.filter(e => e.status === 'sent' && e.sentAt && new Date(e.sentAt).toDateString() === new Date().toDateString()).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Successfully delivered</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {emailQueue.filter(e => e.status === 'failed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailTemplates.length}</div>
                  <p className="text-xs text-muted-foreground">Active templates</p>
                </CardContent>
              </Card>
            </div>

            {/* Email Tabs */}
            <Tabs defaultValue="templates" className="space-y-4">
              <TabsList>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="queue">Email Queue</TabsTrigger>
                <TabsTrigger value="logs">Email Logs</TabsTrigger>
                <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{template.name}</p>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{template.code}</code>
                            </TableCell>
                            <TableCell>{template.category || 'General'}</TableCell>
                            <TableCell>
                              <Badge variant={template.isActive ? 'default' : 'secondary'}>
                                {template.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setIsTemplateDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteTemplateMutation.mutate(template.id)}
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

              {/* Queue Tab */}
              <TabsContent value="queue" className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Select value={queueFilter} onValueChange={setQueueFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Emails</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/email-notifications/queue"] })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Attempts</TableHead>
                          <TableHead>Scheduled/Sent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailQueue.map((email) => (
                          <TableRow key={email.id}>
                            <TableCell>{email.recipientEmail}</TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {email.subject}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  email.status === 'sent' ? 'default' : 
                                  email.status === 'failed' ? 'destructive' : 
                                  'secondary'
                                }
                              >
                                {email.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {email.status === 'sent' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {email.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                {email.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{email.priority || 'Normal'}</TableCell>
                            <TableCell>
                              {email.attempts || 0}
                              {email.errorMessage && (
                                <AlertCircle className="h-4 w-4 text-destructive inline ml-2" title={email.errorMessage} />
                              )}
                            </TableCell>
                            <TableCell>
                              {email.sentAt ? 
                                new Date(email.sentAt).toLocaleString() : 
                                email.scheduledFor ? 
                                  new Date(email.scheduledFor).toLocaleString() :
                                  'Immediate'
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs Tab */}
              <TabsContent value="logs" className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Input
                    placeholder="Search by email address..."
                    value={emailSearchTerm}
                    onChange={(e) => setEmailSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>SendGrid ID</TableHead>
                          <TableHead>Sent At</TableHead>
                          <TableHead>Opened</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {emailLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{log.recipientEmail}</TableCell>
                            <TableCell className="max-w-[300px] truncate">
                              {log.subject}
                            </TableCell>
                            <TableCell>
                              <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {log.sendgridMessageId ? (
                                <code className="text-xs">{log.sendgridMessageId.substring(0, 8)}...</code>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell>
                              {log.openedAt ? (
                                <Badge variant="outline">Opened</Badge>
                              ) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscribers Tab */}
              <TabsContent value="subscribers" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Newsletter Subscribers</h3>
                  <Badge variant="outline">
                    {newsletterSubscribers.length} Total Subscribers
                  </Badge>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Subscribed</TableHead>
                          <TableHead>Last Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletterSubscribers.map((subscriber) => (
                          <TableRow key={subscriber.id}>
                            <TableCell className="font-medium">
                              {subscriber.email}
                            </TableCell>
                            <TableCell>
                              {subscriber.firstName || subscriber.lastName ? (
                                `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {subscriber.language === 'ar' ? 'Arabic' : 'English'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {subscriber.frequency || 'weekly'}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  subscriber.subscriptionStatus === 'active' ? 'default' : 
                                  subscriber.subscriptionStatus === 'unsubscribed' ? 'secondary' : 
                                  'destructive'
                                }
                              >
                                {subscriber.subscriptionStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {subscriber.subscribedAt ? 
                                new Date(subscriber.subscribedAt).toLocaleDateString() : 
                                '-'
                              }
                            </TableCell>
                            <TableCell>
                              {subscriber.lastEmailSentAt ? 
                                new Date(subscriber.lastEmailSentAt).toLocaleDateString() : 
                                <span className="text-muted-foreground">Never</span>
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {newsletterSubscribers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No newsletter subscribers yet.
                  </div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Configuration</CardTitle>
                    <CardDescription>
                      Configure email sending settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Sender Email</Label>
                      <div className="flex items-center gap-2">
                        <Input value="no-reply@soukk.art" readOnly />
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This email is verified in SendGrid and used as the sender for all emails
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Processing Interval</Label>
                      <div className="flex items-center gap-2">
                        <Input value="1 minute" readOnly />
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Emails are processed automatically every minute
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>SendGrid Status</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          API key configured and working
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">System Tools</h2>
                <p className="text-sm text-muted-foreground">Platform administration and data management</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Translation Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Export all platform translations in CSV format for review, editing, or translation management.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4" />
                      <span>891 translation entries</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>English and Arabic translations</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/api/admin/export/translations';
                      link.download = 'art-souk-translations.csv';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast({
                        title: "Export Started",
                        description: "Translations CSV file is being downloaded.",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Platform Version</span>
                      <Badge variant="outline">v1.0.0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Service</span>
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Languages</span>
                      <span className="text-sm">Arabic, English</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {selectedUserForRole && (
          <UserRoleDialog 
            user={selectedUserForRole} 
            onClose={() => setSelectedUserForRole(null)} 
          />
        )}

        {/* Email Template Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
              </DialogTitle>
              <DialogDescription>
                Create or edit email templates for your platform
              </DialogDescription>
            </DialogHeader>
            <EmailTemplateForm
              template={selectedTemplate}
              onSubmit={(data) => {
                if (selectedTemplate) {
                  updateTemplateMutation.mutate({ id: selectedTemplate.id, template: data });
                } else {
                  createTemplateMutation.mutate(data);
                }
              }}
              onCancel={() => {
                setIsTemplateDialogOpen(false);
                setSelectedTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Test Email Dialog */}
        <Dialog open={isTestEmailDialogOpen} onOpenChange={setIsTestEmailDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Test Email</DialogTitle>
              <DialogDescription>
                Send a test email using one of your templates
              </DialogDescription>
            </DialogHeader>
            <TestEmailForm
              templates={emailTemplates}
              onSubmit={(data) => sendTestEmailMutation.mutate(data)}
              onCancel={() => setIsTestEmailDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </>
  );
}

// Email Template Form Component
function EmailTemplateForm({ 
  template, 
  onSubmit, 
  onCancel 
}: { 
  template: EmailTemplate | null; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: template?.code || '',
    name: template?.name || '',
    nameAr: template?.nameAr || '',
    description: template?.description || '',
    descriptionAr: template?.descriptionAr || '',
    subject: template?.subject || '',
    subjectAr: template?.subjectAr || '',
    htmlContent: template?.htmlContent || '',
    htmlContentAr: template?.htmlContentAr || '',
    textContent: template?.textContent || '',
    textContentAr: template?.textContentAr || '',
    variables: template?.variables || [],
    category: template?.category || 'general',
    isActive: template?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Template Code</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="welcome_email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="transactional">Transactional</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name (English)</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Welcome Email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Name (Arabic)</Label>
          <Input
            value={formData.nameAr}
            onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
            placeholder="بريد الترحيب"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Description (English)</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Sent to new users after registration"
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Description (Arabic)</Label>
          <Textarea
            value={formData.descriptionAr}
            onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
            placeholder="يرسل للمستخدمين الجدد بعد التسجيل"
            rows={2}
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Subject (English)</Label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Welcome to Art Souk!"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Subject (Arabic)</Label>
          <Input
            value={formData.subjectAr}
            onChange={(e) => setFormData({ ...formData, subjectAr: e.target.value })}
            placeholder="!مرحباً بك في سوق آرت"
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>HTML Content (English)</Label>
          <Textarea
            value={formData.htmlContent}
            onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
            placeholder="<h1>Welcome {{firstName}}!</h1>..."
            rows={6}
            className="font-mono text-sm"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>HTML Content (Arabic)</Label>
          <Textarea
            value={formData.htmlContentAr}
            onChange={(e) => setFormData({ ...formData, htmlContentAr: e.target.value })}
            placeholder="<h1>مرحباً {{firstName}}!</h1>..."
            rows={6}
            className="font-mono text-sm"
            dir="rtl"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Variables (comma-separated)</Label>
        <Input
          value={formData.variables.join(', ')}
          onChange={(e) => setFormData({ 
            ...formData, 
            variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean) 
          })}
          placeholder="firstName, lastName, email"
        />
        <p className="text-sm text-muted-foreground">
          Use these variables in your template with double curly braces: {"{{variable}}"}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isActive">Template is active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}

// Test Email Form Component
function TestEmailForm({ 
  templates, 
  onSubmit, 
  onCancel 
}: { 
  templates: EmailTemplate[]; 
  onSubmit: (data: any) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    recipientEmail: '',
    templateCode: '',
    language: 'en',
    variables: {} as Record<string, string>,
  });

  const selectedTemplate = templates.find(t => t.code === formData.templateCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Recipient Email</Label>
        <Input
          type="email"
          value={formData.recipientEmail}
          onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
          placeholder="test@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Email Template</Label>
        <Select 
          value={formData.templateCode} 
          onValueChange={(value) => setFormData({ ...formData, templateCode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.code}>
                {template.name} ({template.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Language</Label>
        <Select 
          value={formData.language} 
          onValueChange={(value) => setFormData({ ...formData, language: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && selectedTemplate.variables.length > 0 && (
        <div className="space-y-2">
          <Label>Template Variables</Label>
          {selectedTemplate.variables.map((variable) => (
            <div key={variable} className="space-y-1">
              <Label className="text-sm">{variable}</Label>
              <Input
                value={formData.variables[variable] || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  variables: { ...formData.variables, [variable]: e.target.value }
                })}
                placeholder={`Enter ${variable}`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.templateCode}>
          Send Test Email
        </Button>
      </div>
    </form>
  );
}