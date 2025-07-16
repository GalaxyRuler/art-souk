import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Truck, Package, MapPin, Clock, Settings, Phone, Mail, Building, Plus, Edit, Trash2, Check, Search, Filter, Grid, List, TrendingUp, TrendingDown, BarChart3, Eye, Calendar, DollarSign, Users, ShoppingCart, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface ShippingProfile {
  id: number;
  userId: string;
  userType: 'artist' | 'gallery';
  businessName: string;
  businessNameAr: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: {
    // Saudi National Address format
    buildingNumber: string;        // 4 unique numbers (e.g., "1234")
    streetName: string;            // Street name where main entrance is located
    secondaryNumber: string;       // 4 numbers for exact coordinates (e.g., "5678")
    district: string;             // District/Neighborhood name
    postalCode: string;           // 5-digit postal code (e.g., "12345")
    city: string;                 // City name
    shortAddressCode?: string;    // Optional 4 letters + 4 numbers (e.g., "RRRD2929")
    // Legacy/International format (for backup)
    street?: string;
    state?: string;
    country: string;
  };
  defaultCarrier: string;
  packagingInstructions: string;
  packagingInstructionsAr: string;
  handlingTime: number;
  domesticShippingRate: number;
  internationalShippingRate: number;
  freeShippingThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShippingTracking {
  id: number;
  orderId: number;
  trackingNumber: string;
  carrier: string;
  status: 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned';
  estimatedDelivery: string;
  actualDelivery: string;
  trackingHistory: Array<{
    date: string;
    status: string;
    location: string;
    notes: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ShippingManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [profileFormData, setProfileFormData] = useState<Partial<ShippingProfile>>({
    businessName: '',
    businessNameAr: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Saudi Arabia',
      postalCode: ''
    },
    defaultCarrier: '',
    packagingInstructions: '',
    packagingInstructionsAr: '',
    handlingTime: 3,
    domesticShippingRate: 0,
    internationalShippingRate: 0,
    freeShippingThreshold: 0,
    isActive: true
  });
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    carrier: '',
    status: 'in_transit' as const,
    estimatedDelivery: '',
    notes: ''
  });

  // Enhanced state management for advanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCarrier, setFilterCarrier] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Fetch user roles
  const { data: userRolesData, isLoading: isLoadingRoles, error: rolesError } = useQuery<{ roles: string[], setupComplete: boolean }>({
    queryKey: ['/api/user/roles'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Defensive extraction of userRoles with comprehensive safety checks
  const userRoles = useMemo(() => {
    try {
      console.log('🔍 userRolesData:', userRolesData);
      if (!userRolesData) {
        console.log('❌ No userRolesData, returning null');
        return null;
      }
      console.log('🔍 userRolesData.roles:', userRolesData.roles);
      if (!userRolesData.roles) {
        console.log('❌ No roles property, returning null');
        return null;
      }
      if (!Array.isArray(userRolesData.roles)) {
        console.log('❌ roles is not an array:', typeof userRolesData.roles, userRolesData.roles);
        return null;
      }
      console.log('✅ Returning valid roles array:', userRolesData.roles);
      return userRolesData.roles;
    } catch (error) {
      console.error('❌ Error extracting user roles:', error);
      return null;
    }
  }, [userRolesData]);

  // Fetch shipping profile
  const { data: shippingProfile, isLoading: isLoadingProfile } = useQuery<ShippingProfile>({
    queryKey: ['/api/shipping/profile'],
    retry: false,
  });

  // Fetch shipping tracking info
  const { data: trackingInfo, isLoading: isLoadingTracking } = useQuery<ShippingTracking[]>({
    queryKey: ['/api/shipping/tracking'],
    retry: false,
  });

  // Fetch orders for tracking
  const { data: orders, isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ['/api/seller/orders'],
    retry: false,
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Debug logging
  console.log('🔍 Orders data:', orders);
  console.log('🔍 Orders length:', orders?.length);
  console.log('🔍 Orders isArray:', Array.isArray(orders));
  console.log('🔍 Shipping profile:', shippingProfile);
  console.log('🔍 User roles:', userRoles);
  console.log('🔍 isLoadingOrders:', isLoadingOrders);
  console.log('🔍 isLoadingProfile:', isLoadingProfile);
  
  // If we have orders data, log the first order to check structure
  if (orders && orders.length > 0) {
    console.log('🔍 First order sample:', orders[0]);
  }

  // Force refresh orders on mount
  React.useEffect(() => {
    console.log('🔍 Forcing orders cache invalidation...');
    queryClient.invalidateQueries({ queryKey: ['/api/seller/orders'] });
  }, [queryClient]);

  // Add controlled tabs state
  const [activeTab, setActiveTab] = React.useState('analytics');
  
  // Enhanced debugging for tabs and data
  React.useEffect(() => {
    console.log('🔍 Component render debug:', {
      activeTab,
      hasOrders: !!orders,
      ordersLength: orders?.length,
      isLoadingOrders,
      filteredOrdersLength: filteredAndSortedOrders?.length,
      hasValidRoles,
      userRoles
    });
  }, [activeTab, orders, isLoadingOrders, filteredAndSortedOrders, hasValidRoles, userRoles]);

  // Tab change handler with debugging
  const handleTabChange = (value: string) => {
    console.log('🔍 Tab changed to:', value);
    setActiveTab(value);
  };

  // Create/update shipping profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ShippingProfile>) => {
      const method = shippingProfile ? 'PATCH' : 'POST';
      return apiRequest(`/api/shipping/profile`, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipping/profile'] });
      toast({
        title: t('shipping.profileUpdated'),
        description: t('shipping.profileUpdatedDesc'),
      });
      setIsProfileDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('shipping.profileUpdateError'),
        variant: 'destructive',
      });
    },
  });

  // Update tracking info mutation
  const updateTrackingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/shipping/tracking/${selectedOrder}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shipping/tracking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/orders'] });
      toast({
        title: t('shipping.trackingUpdated'),
        description: t('shipping.trackingUpdatedDesc'),
      });
      setIsTrackingDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('shipping.trackingUpdateError'),
        variant: 'destructive',
      });
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (shippingProfile) {
      setProfileFormData(shippingProfile);
    }
  }, [shippingProfile]);

  const handleProfileSubmit = () => {
    updateProfileMutation.mutate(profileFormData);
  };

  const handleTrackingSubmit = () => {
    updateTrackingMutation.mutate({
      ...trackingData,
      orderId: selectedOrder,
    });
  };

  const openTrackingDialog = (orderId: number) => {
    setSelectedOrder(orderId);
    setIsTrackingDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const carriers = [
    'Aramex', 'DHL', 'FedEx', 'UPS', 'Saudi Post', 'SMSA Express', 'J&T Express'
  ];

  // Enhanced Components
  function ShippingAnalytics() {
    console.log('🔍 ShippingAnalytics rendering with orders:', orders);
    const ordersArray = Array.isArray(orders) ? orders : [];
    const totalOrders = ordersArray.length;
    const shippedOrders = ordersArray.filter(o => o.status === 'shipped').length;
    const inTransitOrders = ordersArray.filter(o => o.status === 'processing').length;
    const deliveredOrders = ordersArray.filter(o => o.status === 'delivered').length;
    const totalRevenue = ordersArray.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    
    console.log('🔍 Analytics stats:', { totalOrders, shippedOrders, inTransitOrders, deliveredOrders, totalRevenue });
    
    return (
      <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Shipping Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/30 rounded-lg">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{totalOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Delivered</p>
                  <p className="text-2xl font-bold text-white">{deliveredOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/30 rounded-lg">
                  <Truck className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">In Transit</p>
                  <p className="text-2xl font-bold text-white">{inTransitOrders}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/30 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-300">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} SAR</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Delivery Success Rate</span>
                <span className="text-sm font-medium text-white">
                  {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0} 
                className="h-2" 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Orders In Transit</span>
                <span className="text-sm font-medium text-white">
                  {totalOrders > 0 ? Math.round((inTransitOrders / totalOrders) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={totalOrders > 0 ? (inTransitOrders / totalOrders) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function ShippingFilters() {
    return (
      <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders, customers, or tracking numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCarrier} onValueChange={setFilterCarrier}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by carrier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Carriers</SelectItem>
                {carriers.map(carrier => (
                  <SelectItem key={carrier} value={carrier}>{carrier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Sort by Date</SelectItem>
                <SelectItem value="orderNumber">Order Number</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="totalAmount">Amount</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="border-white/10 text-white hover:bg-white/10"
            >
              {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  function BulkShippingActions() {
    if (selectedOrders.size === 0) return null;
    
    return (
      <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">
                {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10">
                <Package className="h-4 w-4 mr-1" />
                Add Tracking
              </Button>
              <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10">
                <Edit className="h-4 w-4 mr-1" />
                Update Status
              </Button>
              <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/10">
                <Mail className="h-4 w-4 mr-1" />
                Send Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const saudCities = [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
    'Tabuk', 'Buraidah', 'Khamis Mushait', 'Hofuf', 'Taif', 'Najran', 'Jubail'
  ];

  // Memoized filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    console.log('🔍 Running filteredAndSortedOrders with:', {
      orders: orders,
      ordersLength: orders?.length,
      ordersType: typeof orders,
      ordersIsArray: Array.isArray(orders),
      searchTerm: searchTerm,
      filterStatus: filterStatus,
      filterCarrier: filterCarrier
    });
    
    if (!orders || !Array.isArray(orders)) {
      console.log('❌ No orders or not array:', {
        orders: orders,
        type: typeof orders,
        isArray: Array.isArray(orders),
        isNull: orders === null,
        isUndefined: orders === undefined
      });
      return [];
    }
    
    let filtered = orders.filter(order => {
      console.log('🔍 Filtering order:', order);
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        order.order_number?.toLowerCase().includes(searchLower) ||
        order.user?.firstName?.toLowerCase().includes(searchLower) ||
        order.user?.lastName?.toLowerCase().includes(searchLower) ||
        order.artwork?.title?.toLowerCase().includes(searchLower) ||
        order.tracking_number?.toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      
      // Carrier filter
      const matchesCarrier = filterCarrier === 'all' || order.shipping_method === filterCarrier;
      
      console.log('🔍 Filter results:', {
        matchesSearch,
        matchesStatus,
        matchesCarrier,
        passes: matchesSearch && matchesStatus && matchesCarrier
      });
      
      return matchesSearch && matchesStatus && matchesCarrier;
    });
    
    // Sort orders
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'orderNumber':
          aValue = a.order_number || '';
          bValue = b.order_number || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'totalAmount':
          aValue = parseFloat(a.total_amount) || 0;
          bValue = parseFloat(b.total_amount) || 0;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return filtered;
  }, [orders, searchTerm, filterStatus, filterCarrier, sortBy, sortOrder]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedOrders.size === filteredAndSortedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredAndSortedOrders.map(order => order.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedOrders(new Set());
  };

  // Show loading state while checking user roles or if roles are not loaded yet
  if (isLoadingRoles || !userRolesData || userRoles === null || userRoles === undefined || !Array.isArray(userRoles)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading user roles...</p>
        </div>
      </div>
    );
  }

  // Check if user has proper roles - userRoles is guaranteed to be an array at this point
  // Additional defensive check to prevent TypeError
  const hasValidRoles = userRoles && Array.isArray(userRoles) && userRoles.length > 0 && (userRoles.includes('artist') || userRoles.includes('gallery'));
  
  if (!hasValidRoles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {t('shipping.accessDenied')}
            </h1>
            <p className="text-slate-300">
              {t('shipping.artistGalleryOnly')}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Truck className="h-10 w-10 text-blue-400" />
              {t('shipping.title')}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {t('shipping.subtitle')}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('shipping.profile')}
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('shipping.tracking')}
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('shipping.orders')}
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              {isLoadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                </div>
              ) : (
                <>
                  <ShippingAnalytics />
                  <ShippingFilters />
                  <BulkShippingActions />
                </>
              )}
              
              {/* DEBUG: Raw orders data display */}
              {orders && orders.length > 0 && (
                <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20 mb-4">
                  <CardHeader>
                    <CardTitle className="text-red-400">🔍 DEBUG: Raw Orders Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-white text-sm">
                      <p>Raw orders count: {orders.length}</p>
                      <p>Filtered orders count: {filteredAndSortedOrders.length}</p>
                      <p>First order: {JSON.stringify(orders[0], null, 2)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Management ({filteredAndSortedOrders.length} orders)
                      {filteredAndSortedOrders.length > 0 && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            className="border-white/10 text-white hover:bg-white/10"
                          >
                            {selectedOrders.size === filteredAndSortedOrders.length ? 'Deselect All' : 'Select All'}
                          </Button>
                          {selectedOrders.size > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDeselectAll}
                              className="border-white/10 text-white hover:bg-white/10"
                            >
                              Clear ({selectedOrders.size})
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn(
                          "border-white/10 text-white hover:bg-white/10",
                          viewMode === 'grid' && "bg-white/20"
                        )}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(
                          "border-white/10 text-white hover:bg-white/10",
                          viewMode === 'list' && "bg-white/20"
                        )}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredAndSortedOrders.length > 0 ? (
                    <div className={cn(
                      "gap-4",
                      viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
                    )}>
                      {filteredAndSortedOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className={cn(
                            "bg-white/5 rounded-lg p-4 border border-white/10 relative",
                            selectedOrders.has(order.id) && "ring-2 ring-blue-500 bg-blue-500/10"
                          )}
                        >
                          <div className="absolute top-3 right-3">
                            <Checkbox
                              checked={selectedOrders.has(order.id)}
                              onCheckedChange={(checked) => {
                                const newSelected = new Set(selectedOrders);
                                if (checked) {
                                  newSelected.add(order.id);
                                } else {
                                  newSelected.delete(order.id);
                                }
                                setSelectedOrders(newSelected);
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-start mb-3 mr-8">
                            <div>
                              <p className="text-white font-semibold">
                                Order #{order.order_number}
                              </p>
                              <p className="text-slate-300 text-sm">
                                {order.user?.firstName} {order.user?.lastName}
                              </p>
                              <p className="text-slate-300 text-sm">
                                {order.artwork?.title}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">Amount:</span>
                              <span className="text-white">{parseFloat(order.total_amount)?.toLocaleString()} {order.currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">Date:</span>
                              <span className="text-white">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            {order.tracking_number && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-300">Tracking:</span>
                                <span className="text-white">{order.tracking_number}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end gap-2 mt-4">
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => openTrackingDialog(order.id)}
                              className="border-white/10 text-white hover:bg-white/10"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Track
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {orders && orders.length > 0 ? 'No Matching Orders' : 'No Orders Found'}
                      </h3>
                      <p className="text-slate-300">
                        {orders && orders.length > 0 
                          ? 'No orders match your current filters. Try adjusting your search or filter criteria.' 
                          : 'Orders will appear here when customers purchase your artworks.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Shipping Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {t('shipping.businessProfile')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {shippingProfile ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                              {t('shipping.businessInfo')}
                            </h3>
                            <div className="space-y-2">
                              <p className="text-slate-300">
                                <strong>{t('shipping.businessName')}:</strong> {shippingProfile.businessName}
                              </p>
                              <p className="text-slate-300">
                                <strong>{t('shipping.contactPerson')}:</strong> {shippingProfile.contactPerson}
                              </p>
                              <p className="text-slate-300">
                                <strong>{t('shipping.phone')}:</strong> {shippingProfile.contactPhone}
                              </p>
                              <p className="text-slate-300">
                                <strong>{t('shipping.email')}:</strong> {shippingProfile.contactEmail}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">
                              {t('shipping.shippingRates')}
                            </h3>
                            <div className="space-y-2">
                              <p className="text-slate-300">
                                <strong>{t('shipping.domesticRate')}:</strong> {shippingProfile.domesticShippingRate} SAR
                              </p>
                              <p className="text-slate-300">
                                <strong>{t('shipping.internationalRate')}:</strong> {shippingProfile.internationalShippingRate} SAR
                              </p>
                              <p className="text-slate-300">
                                <strong>{t('shipping.freeShippingThreshold')}:</strong> {shippingProfile.freeShippingThreshold} SAR
                              </p>
                              <p className="text-slate-300">
                                <strong>{t('shipping.handlingTime')}:</strong> {shippingProfile.handlingTime} {t('shipping.days')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {t('shipping.noProfile')}
                          </h3>
                          <p className="text-slate-300 mb-4">
                            {t('shipping.noProfileDesc')}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-center">
                        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                              <Plus className="h-5 w-5 mr-2" />
                              {shippingProfile ? t('shipping.updateProfile') : t('shipping.createProfile')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                {shippingProfile ? t('shipping.updateProfile') : t('shipping.createProfile')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="businessName">{t('shipping.businessName')}</Label>
                                  <Input
                                    id="businessName"
                                    value={profileFormData.businessName}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      businessName: e.target.value
                                    })}
                                    placeholder={t('shipping.businessNamePlaceholder')}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="businessNameAr">{t('shipping.businessNameAr')}</Label>
                                  <Input
                                    id="businessNameAr"
                                    value={profileFormData.businessNameAr}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      businessNameAr: e.target.value
                                    })}
                                    placeholder={t('shipping.businessNameArPlaceholder')}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="contactPerson">{t('shipping.contactPerson')}</Label>
                                  <Input
                                    id="contactPerson"
                                    value={profileFormData.contactPerson}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      contactPerson: e.target.value
                                    })}
                                    placeholder={t('shipping.contactPersonPlaceholder')}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="contactPhone">{t('shipping.contactPhone')}</Label>
                                  <Input
                                    id="contactPhone"
                                    value={profileFormData.contactPhone}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      contactPhone: e.target.value
                                    })}
                                    placeholder="+966 50 123 4567"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="contactEmail">{t('shipping.contactEmail')}</Label>
                                <Input
                                  id="contactEmail"
                                  type="email"
                                  value={profileFormData.contactEmail}
                                  onChange={(e) => setProfileFormData({
                                    ...profileFormData,
                                    contactEmail: e.target.value
                                  })}
                                  placeholder="contact@business.com"
                                />
                              </div>
                              
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  Saudi National Address Format
                                </h4>
                                <p className="text-sm text-blue-700 mb-4">
                                  Required for compliance with Saudi regulations and accurate delivery
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="buildingNumber">Building Number *</Label>
                                    <Input
                                      id="buildingNumber"
                                      value={profileFormData.address?.buildingNumber || ''}
                                      onChange={(e) => setProfileFormData({
                                        ...profileFormData,
                                        address: {
                                          ...profileFormData.address!,
                                          buildingNumber: e.target.value
                                        }
                                      })}
                                      placeholder="e.g., 1234"
                                      maxLength={4}
                                      pattern="[0-9]{4}"
                                      title="4-digit building number"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="streetName">Street Name *</Label>
                                    <Input
                                      id="streetName"
                                      value={profileFormData.address?.streetName || ''}
                                      onChange={(e) => setProfileFormData({
                                        ...profileFormData,
                                        address: {
                                          ...profileFormData.address!,
                                          streetName: e.target.value
                                        }
                                      })}
                                      placeholder="e.g., King Fahd Road"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="secondaryNumber">Secondary Number *</Label>
                                    <Input
                                      id="secondaryNumber"
                                      value={profileFormData.address?.secondaryNumber || ''}
                                      onChange={(e) => setProfileFormData({
                                        ...profileFormData,
                                        address: {
                                          ...profileFormData.address!,
                                          secondaryNumber: e.target.value
                                        }
                                      })}
                                      placeholder="e.g., 5678"
                                      maxLength={4}
                                      pattern="[0-9]{4}"
                                      title="4-digit secondary number for exact coordinates"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="district">District/Neighborhood *</Label>
                                    <Input
                                      id="district"
                                      value={profileFormData.address?.district || ''}
                                      onChange={(e) => setProfileFormData({
                                        ...profileFormData,
                                        address: {
                                          ...profileFormData.address!,
                                          district: e.target.value
                                        }
                                      })}
                                      placeholder="e.g., Al-Olaya"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="postalCode">Postal Code *</Label>
                                    <Input
                                      id="postalCode"
                                      value={profileFormData.address?.postalCode || ''}
                                      onChange={(e) => setProfileFormData({
                                        ...profileFormData,
                                        address: {
                                          ...profileFormData.address!,
                                          postalCode: e.target.value
                                        }
                                      })}
                                      placeholder="e.g., 12345"
                                      maxLength={5}
                                      pattern="[0-9]{5}"
                                      title="5-digit postal code"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="city">City *</Label>
                                    <Select
                                      value={profileFormData.address?.city}
                                      onValueChange={(value) => setProfileFormData({
                                        ...profileFormData,
                                        address: {
                                          ...profileFormData.address!,
                                          city: value
                                        }
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('shipping.selectCity')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {saudCities.map(city => (
                                          <SelectItem key={city} value={city}>
                                            {city}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <Label htmlFor="shortAddressCode">Short Address Code (Optional)</Label>
                                  <Input
                                    id="shortAddressCode"
                                    value={profileFormData.address?.shortAddressCode || ''}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      address: {
                                        ...profileFormData.address!,
                                        shortAddressCode: e.target.value.toUpperCase()
                                      }
                                    })}
                                    placeholder="e.g., RRRD2929"
                                    maxLength={8}
                                    pattern="[A-Z]{4}[0-9]{4}"
                                    title="4 letters + 4 numbers (e.g., RRRD2929)"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Format: 4 letters + 4 numbers (e.g., RRRD2929)
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="defaultCarrier">{t('shipping.defaultCarrier')}</Label>
                                <Select
                                  value={profileFormData.defaultCarrier}
                                  onValueChange={(value) => setProfileFormData({
                                    ...profileFormData,
                                    defaultCarrier: value
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('shipping.selectCarrier')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {carriers.map(carrier => (
                                      <SelectItem key={carrier} value={carrier}>
                                        {carrier}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="domesticRate">{t('shipping.domesticRate')} (SAR)</Label>
                                  <Input
                                    id="domesticRate"
                                    type="number"
                                    value={profileFormData.domesticShippingRate}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      domesticShippingRate: Number(e.target.value)
                                    })}
                                    placeholder="25"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="internationalRate">{t('shipping.internationalRate')} (SAR)</Label>
                                  <Input
                                    id="internationalRate"
                                    type="number"
                                    value={profileFormData.internationalShippingRate}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      internationalShippingRate: Number(e.target.value)
                                    })}
                                    placeholder="75"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="freeShippingThreshold">{t('shipping.freeShippingThreshold')} (SAR)</Label>
                                  <Input
                                    id="freeShippingThreshold"
                                    type="number"
                                    value={profileFormData.freeShippingThreshold}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      freeShippingThreshold: Number(e.target.value)
                                    })}
                                    placeholder="500"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor="handlingTime">{t('shipping.handlingTime')} ({t('shipping.days')})</Label>
                                <Input
                                  id="handlingTime"
                                  type="number"
                                  value={profileFormData.handlingTime}
                                  onChange={(e) => setProfileFormData({
                                    ...profileFormData,
                                    handlingTime: Number(e.target.value)
                                  })}
                                  placeholder="3"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="packagingInstructions">{t('shipping.packagingInstructions')}</Label>
                                <Textarea
                                  id="packagingInstructions"
                                  value={profileFormData.packagingInstructions}
                                  onChange={(e) => setProfileFormData({
                                    ...profileFormData,
                                    packagingInstructions: e.target.value
                                  })}
                                  placeholder={t('shipping.packagingInstructionsPlaceholder')}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="packagingInstructionsAr">{t('shipping.packagingInstructionsAr')}</Label>
                                <Textarea
                                  id="packagingInstructionsAr"
                                  value={profileFormData.packagingInstructionsAr}
                                  onChange={(e) => setProfileFormData({
                                    ...profileFormData,
                                    packagingInstructionsAr: e.target.value
                                  })}
                                  placeholder={t('shipping.packagingInstructionsArPlaceholder')}
                                />
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsProfileDialogOpen(false)}
                                >
                                  {t('common.cancel')}
                                </Button>
                                <Button 
                                  onClick={handleProfileSubmit}
                                  disabled={updateProfileMutation.isPending}
                                >
                                  {updateProfileMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                  )}
                                  {t('common.save')}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t('shipping.trackingInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTracking ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                    </div>
                  ) : trackingInfo && trackingInfo.length > 0 ? (
                    <div className="space-y-4">
                      {trackingInfo.map((tracking) => (
                        <div key={tracking.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white font-semibold">
                                {t('shipping.trackingNumber')}: {tracking.trackingNumber}
                              </p>
                              <p className="text-slate-300">
                                {t('shipping.carrier')}: {tracking.carrier}
                              </p>
                            </div>
                            <Badge className={getStatusColor(tracking.status)}>
                              {t(`shipping.status.${tracking.status}`)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-slate-300">
                                <strong>{t('shipping.estimatedDelivery')}:</strong> {tracking.estimatedDelivery}
                              </p>
                              {tracking.actualDelivery && (
                                <p className="text-slate-300">
                                  <strong>{t('shipping.actualDelivery')}:</strong> {tracking.actualDelivery}
                                </p>
                              )}
                            </div>
                            <div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openTrackingDialog(tracking.orderId)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                {t('shipping.updateTracking')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {t('shipping.noTracking')}
                      </h3>
                      <p className="text-slate-300">
                        {t('shipping.noTrackingDesc')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('shipping.ordersToShip')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders && Array.isArray(orders) && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.filter(order => order.status === 'confirmed' || order.status === 'processing').map((order) => (
                        <div key={order.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white font-semibold">
                                {t('shipping.orderNumber')}: {order.orderNumber}
                              </p>
                              <p className="text-slate-300">
                                {t('shipping.customer')}: {order.user?.firstName} {order.user?.lastName}
                              </p>
                              <p className="text-slate-300">
                                {t('shipping.artwork')}: {order.artwork?.title}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {t(`shipping.orderStatus.${order.status}`)}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm"
                              onClick={() => openTrackingDialog(order.id)}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              {t('shipping.addTracking')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {t('shipping.noOrders')}
                      </h3>
                      <p className="text-slate-300">
                        {t('shipping.noOrdersDesc')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Tracking Update Dialog */}
          <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('shipping.updateTracking')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trackingNumber">{t('shipping.trackingNumber')}</Label>
                  <Input
                    id="trackingNumber"
                    value={trackingData.trackingNumber}
                    onChange={(e) => setTrackingData({
                      ...trackingData,
                      trackingNumber: e.target.value
                    })}
                    placeholder="1234567890"
                  />
                </div>
                
                <div>
                  <Label htmlFor="carrier">{t('shipping.carrier')}</Label>
                  <Select
                    value={trackingData.carrier}
                    onValueChange={(value) => setTrackingData({
                      ...trackingData,
                      carrier: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('shipping.selectCarrier')} />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map(carrier => (
                        <SelectItem key={carrier} value={carrier}>
                          {carrier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">{t('shipping.status')}</Label>
                  <Select
                    value={trackingData.status}
                    onValueChange={(value) => setTrackingData({
                      ...trackingData,
                      status: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_transit">{t('shipping.status.in_transit')}</SelectItem>
                      <SelectItem value="out_for_delivery">{t('shipping.status.out_for_delivery')}</SelectItem>
                      <SelectItem value="delivered">{t('shipping.status.delivered')}</SelectItem>
                      <SelectItem value="returned">{t('shipping.status.returned')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="estimatedDelivery">{t('shipping.estimatedDelivery')}</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={trackingData.estimatedDelivery}
                    onChange={(e) => setTrackingData({
                      ...trackingData,
                      estimatedDelivery: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">{t('shipping.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={trackingData.notes}
                    onChange={(e) => setTrackingData({
                      ...trackingData,
                      notes: e.target.value
                    })}
                    placeholder={t('shipping.notesPlaceholder')}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsTrackingDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    onClick={handleTrackingSubmit}
                    disabled={updateTrackingMutation.isPending}
                  >
                    {updateTrackingMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
}