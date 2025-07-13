import { useState, useEffect } from 'react';
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
import { Truck, Package, MapPin, Clock, Settings, Phone, Mail, Building, Plus, Edit, Trash2, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
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

  // Fetch user roles
  const { data: userRoles } = useQuery<string[]>({
    queryKey: ['/api/user/roles'],
    retry: false,
  });

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
  const { data: orders } = useQuery<any[]>({
    queryKey: ['/api/seller/orders'],
    retry: false,
  });

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

  const saudCities = [
    'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar', 'Dhahran',
    'Tabuk', 'Buraidah', 'Khamis Mushait', 'Hofuf', 'Taif', 'Najran', 'Jubail'
  ];

  if (!userRoles || (!userRoles.includes('artist') && !userRoles.includes('gallery'))) {
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

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
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
                              
                              <div>
                                <Label htmlFor="street">{t('shipping.address')}</Label>
                                <Input
                                  id="street"
                                  value={profileFormData.address?.street}
                                  onChange={(e) => setProfileFormData({
                                    ...profileFormData,
                                    address: {
                                      ...profileFormData.address!,
                                      street: e.target.value
                                    }
                                  })}
                                  placeholder={t('shipping.streetPlaceholder')}
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="city">{t('shipping.city')}</Label>
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
                                <div>
                                  <Label htmlFor="state">{t('shipping.state')}</Label>
                                  <Input
                                    id="state"
                                    value={profileFormData.address?.state}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      address: {
                                        ...profileFormData.address!,
                                        state: e.target.value
                                      }
                                    })}
                                    placeholder={t('shipping.statePlaceholder')}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="postalCode">{t('shipping.postalCode')}</Label>
                                  <Input
                                    id="postalCode"
                                    value={profileFormData.address?.postalCode}
                                    onChange={(e) => setProfileFormData({
                                      ...profileFormData,
                                      address: {
                                        ...profileFormData.address!,
                                        postalCode: e.target.value
                                      }
                                    })}
                                    placeholder="12345"
                                  />
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
                  {orders && orders.length > 0 ? (
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