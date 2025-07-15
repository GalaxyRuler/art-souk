import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, ShoppingCart, Truck, Settings, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface PaymentMethod {
  id: string;
  type: 'saudi_bank' | 'stc_pay' | 'paypal' | 'wise' | 'cash_on_delivery';
  details: {
    bank_name?: string;
    iban?: string;
    phone_number?: string;
    paypal_email?: string;
    wise_email?: string;
    preferred_currency?: string;
    account_holder_name?: string;
  };
  customInstructions?: string;
  isDefault?: boolean;
  displayInfo?: string;
  createdAt?: string;
}

interface Order {
  id: string;
  artworkId: string;
  buyerEmail: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  sellerNotes?: string;
  trackingNumber?: string;
  carrier?: string;
  artwork?: {
    id: string;
    title: string;
    titleAr: string;
    images: string[];
    price: number;
  };
}

interface SellerInfo {
  type: 'artist' | 'gallery';
  name: string;
  email: string;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

const paymentMethodSchema = z.object({
  type: z.enum(['saudi_bank', 'stc_pay', 'paypal', 'wise', 'cash_on_delivery']),
  details: z.object({
    bank_name: z.string().optional(),
    iban: z.string().optional(), 
    phone_number: z.string().optional(),
    paypal_email: z.string().email().optional(),
    wise_email: z.string().email().optional(),
    preferred_currency: z.string().optional(),
    account_holder_name: z.string().optional()
  }),
  customInstructions: z.string().optional(),
  isDefault: z.boolean().optional()
});

const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  sellerNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
});

export default function SellerDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  // Fetch seller info
  const { data: sellerInfo, isLoading: sellerInfoLoading, error: sellerInfoError } = useQuery({
    queryKey: ['/api/seller/info'],
    enabled: true,
  });

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/seller/orders'],
    enabled: selectedTab === 'orders',
  });

  // Ensure sellerOrders is always an array - API returns { orders: [...] }
  const sellerOrders = React.useMemo(() => {
    try {
      console.log('Processing orders data:', ordersData);
      if (!ordersData) {
        console.log('No ordersData, returning empty array');
        return [];
      }
      if (ordersData && typeof ordersData === 'object' && Array.isArray(ordersData.orders)) {
        console.log('Using ordersData.orders:', ordersData.orders);
        return ordersData.orders;
      }
      if (Array.isArray(ordersData)) {
        console.log('Using ordersData directly:', ordersData);
        return ordersData;
      }
      console.log('Fallback to empty array');
      return [];
    } catch (error) {
      console.error('Error processing orders data:', error);
      return [];
    }
  }, [ordersData]);

  // Fetch payment methods
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ['/api/seller/payment-methods'],
    enabled: selectedTab === 'payment-methods',
  });

  const paymentMethods = Array.isArray(paymentMethodsData) ? paymentMethodsData : [];

  // Payment method form
  const paymentMethodForm = useForm({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: 'saudi_bank' as const,
      details: {
        bank_name: '',
        iban: '',
        phone_number: '',
        paypal_email: '',
        wise_email: '',
        preferred_currency: 'SAR',
        account_holder_name: ''
      },
      customInstructions: '',
      isDefault: false
    },
  });

  // Order status form
  const orderStatusForm = useForm({
    resolver: zodResolver(orderStatusSchema),
    defaultValues: {
      status: 'pending' as const,
      sellerNotes: '',
      trackingNumber: '',
      carrier: '',
    },
  });

  // Add/Edit payment method mutation
  const savePaymentMethod = useMutation({
    mutationFn: async (data: any) => {
      const method = editingPaymentMethod ? 'PATCH' : 'POST';
      const url = editingPaymentMethod 
        ? `/api/seller/payment-methods/${editingPaymentMethod.id}`
        : '/api/seller/payment-methods';
      
      return apiRequest(url, {
        method,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/payment-methods'] });
      setPaymentDialogOpen(false);
      setEditingPaymentMethod(null);
      paymentMethodForm.reset();
      toast({
        title: t('seller.success'),
        description: t('seller.paymentMethodSaved'),
      });
    },
    onError: (error) => {
      toast({
        title: t('seller.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete payment method mutation
  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/seller/payment-methods/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/payment-methods'] });
      toast({
        title: t('seller.success'),
        description: t('seller.paymentMethodDeleted'),
      });
    },
    onError: (error) => {
      toast({
        title: t('seller.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest(`/api/seller/orders/${selectedOrder?.id}/status`, {
        method: 'PATCH',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/orders'] });
      setOrderDialogOpen(false);
      setSelectedOrder(null);
      orderStatusForm.reset();
      toast({
        title: t('seller.success'),
        description: t('seller.orderStatusUpdated'),
      });
    },
    onError: (error) => {
      toast({
        title: t('seller.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const openPaymentDialog = (method?: PaymentMethod) => {
    console.log('openPaymentDialog called with method:', method);
    if (method) {
      setEditingPaymentMethod(method);
      paymentMethodForm.reset({
        type: method.type,
        details: {
          bank_name: method.details.bank_name || '',
          iban: method.details.iban || '',
          phone_number: method.details.phone_number || '',
          paypal_email: method.details.paypal_email || '',
          wise_email: method.details.wise_email || '',
          preferred_currency: method.details.preferred_currency || 'SAR',
          account_holder_name: method.details.account_holder_name || ''
        },
        customInstructions: method.customInstructions || '',
        isDefault: method.isDefault || false
      });
    } else {
      setEditingPaymentMethod(null);
      paymentMethodForm.reset({
        type: 'saudi_bank' as const,
        details: {
          bank_name: '',
          iban: '',
          phone_number: '',
          paypal_email: '',
          wise_email: '',
          preferred_currency: 'SAR',
          account_holder_name: ''
        },
        customInstructions: '',
        isDefault: false
      });
    }
    console.log('Setting payment dialog open to true');
    setPaymentDialogOpen(true);
    console.log('Payment dialog state after setting:', paymentDialogOpen);
    console.log('Form values after reset:', paymentMethodForm.getValues());
  };

  const openOrderDialog = (order: Order) => {
    console.log('Opening order dialog for order:', order);
    setSelectedOrder(order);
    // Ensure the status value is properly typed and valid
    const validStatus = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order.status) 
      ? order.status 
      : 'pending';
    
    console.log('Setting form with status:', validStatus);
    orderStatusForm.reset({
      status: validStatus as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
      sellerNotes: order.sellerNotes || '',
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
    });
    setOrderDialogOpen(true);
    console.log('Form values after reset:', orderStatusForm.getValues());
  };

  const onPaymentMethodSubmit = (data: any) => {
    savePaymentMethod.mutate({
      type: data.type,
      details: data.details,
      customInstructions: data.customInstructions,
      isDefault: data.isDefault
    });
  };

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

  // Show loading state
  if (sellerInfoLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (sellerInfoError || !sellerInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">{t('seller.errorLoadingSellerInfo')}</p>
            <p className="text-gray-600 mt-2">{t('seller.checkSellerSetup')}</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'saudi_bank':
        return <CreditCard className="w-5 h-5" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5" />;
      case 'stc_pay':
        return <CreditCard className="w-5 h-5" />;
      case 'wise':
        return <CreditCard className="w-5 h-5" />;
      case 'cash_on_delivery':
        return <Truck className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('seller.dashboard')}</h1>
          <p className="text-gray-600">{t('seller.dashboardDescription')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('seller.totalOrders')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerInfo?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('seller.allTimeOrders')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('seller.totalRevenue')}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(sellerInfo?.totalRevenue || 0, 'SAR')}</div>
              <p className="text-xs text-muted-foreground">
                {t('seller.totalEarnings')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('seller.pendingOrders')}</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sellerInfo?.pendingOrders || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('seller.awaitingAction')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('seller.sellerType')}</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{sellerInfo?.type || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {sellerInfo?.name || 'Unknown'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>{t('seller.orders')}</span>
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>{t('seller.paymentMethods')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('seller.orderManagement')}</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded"></div>
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
                          <TableHead>{t('seller.artwork')}</TableHead>
                          <TableHead>{t('seller.buyer')}</TableHead>
                          <TableHead>{t('seller.amount')}</TableHead>
                          <TableHead>{t('seller.status')}</TableHead>
                          <TableHead>{t('seller.orderDate')}</TableHead>
                          <TableHead>{t('seller.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellerOrders && Array.isArray(sellerOrders) && sellerOrders.length > 0 ? (
                          (() => {
                            console.log('About to map sellerOrders:', sellerOrders, 'isArray:', Array.isArray(sellerOrders));
                            return sellerOrders.map((order: Order, index: number) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.artwork?.title || 'Unknown Artwork'}</TableCell>
                              <TableCell>{order.buyerEmail}</TableCell>
                              <TableCell>{formatPrice(order.totalPrice, order.currency)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(order.createdAt)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Update button clicked for order:', order);
                                    openOrderDialog(order);
                                  }}
                                >
                                  {t('seller.updateStatus')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ));
                          })()
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              {t('seller.noOrdersYet')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('seller.paymentMethodsManagement')}</CardTitle>
                <Button onClick={() => {
                  console.log('Add Payment Method button clicked');
                  openPaymentDialog();
                  console.log('Dialog should now be open:', paymentDialogOpen);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('seller.addPaymentMethod')}
                </Button>
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods && paymentMethods.length > 0 ? (
                      paymentMethods.map((method: PaymentMethod) => (
                        <Card key={method.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getPaymentMethodIcon(method.type)}
                              <div>
                                <p className="font-medium">{method.displayInfo || method.type}</p>
                                <p className="text-sm text-gray-500 capitalize">{method.type.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPaymentDialog(method)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletePaymentMethod.mutate(method.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {method.displayInfo && (
                              <p className="font-medium text-sm">{method.displayInfo}</p>
                            )}
                            {method.details.bank_name && (
                              <p>Bank: {method.details.bank_name}</p>
                            )}
                            {method.details.iban && (
                              <p>IBAN: {method.details.iban}</p>
                            )}
                            {method.details.paypal_email && (
                              <p>PayPal: {method.details.paypal_email}</p>
                            )}
                            {method.details.phone_number && (
                              <p>Phone: {method.details.phone_number}</p>
                            )}
                            {method.details.wise_email && (
                              <p>Wise: {method.details.wise_email}</p>
                            )}
                            {method.isDefault && (
                              <Badge variant="secondary" className="text-xs mt-1">Default</Badge>
                            )}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <p>{t('seller.noPaymentMethodsYet')}</p>
                        <p className="text-sm mt-2">{t('seller.addFirstPaymentMethod')}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Method Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPaymentMethod ? t('seller.editPaymentMethod') : t('seller.addPaymentMethod')}
              </DialogTitle>
            </DialogHeader>
            <Form {...paymentMethodForm}>
              <form onSubmit={paymentMethodForm.handleSubmit(onPaymentMethodSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-type">{t('seller.paymentType')}</Label>
                  <select 
                    id="payment-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={paymentMethodForm.watch('type') || 'saudi_bank'}
                    onChange={(e) => {
                      console.log('Payment type changed to:', e.target.value);
                      console.log('Before setValue - form type:', paymentMethodForm.getValues('type'));
                      paymentMethodForm.setValue('type', e.target.value as any);
                      console.log('After setValue - form type:', paymentMethodForm.getValues('type'));
                    }}
                  >
                    <option value="saudi_bank">{t('seller.bankTransfer')}</option>
                    <option value="paypal">{t('seller.paypal')}</option>
                    <option value="stc_pay">{t('seller.stcPay')}</option>
                    <option value="wise">{t('seller.wise')}</option>
                    <option value="cash_on_delivery">{t('seller.cashOnDelivery')}</option>
                  </select>
                </div>

                {paymentMethodForm.watch('type') === 'saudi_bank' && (
                  <>
                    <FormField
                      control={paymentMethodForm.control}
                      name="details.bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('seller.bankName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('seller.bankNamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentMethodForm.control}
                      name="details.account_holder_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('seller.accountHolderName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('seller.accountHolderNamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentMethodForm.control}
                      name="details.iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('seller.iban')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('seller.ibanPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {paymentMethodForm.watch('type') === 'paypal' && (
                  <FormField
                    control={paymentMethodForm.control}
                    name="details.paypal_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('seller.paypalEmail')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('seller.paypalEmailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {paymentMethodForm.watch('type') === 'stc_pay' && (
                  <FormField
                    control={paymentMethodForm.control}
                    name="details.phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('seller.phoneNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('seller.phoneNumberPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {paymentMethodForm.watch('type') === 'wise' && (
                  <>
                    <FormField
                      control={paymentMethodForm.control}
                      name="details.wise_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('seller.wiseEmail')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('seller.wiseEmailPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="preferred-currency">{t('seller.preferredCurrency')}</Label>
                      <select 
                        id="preferred-currency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={paymentMethodForm.watch('details.preferred_currency') || ''}
                        onChange={(e) => {
                          console.log('Currency changed to:', e.target.value);
                          paymentMethodForm.setValue('details.preferred_currency', e.target.value);
                        }}
                      >
                        <option value="">{t('seller.selectCurrency')}</option>
                        <option value="SAR">SAR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </>
                )}

                <FormField
                  control={paymentMethodForm.control}
                  name="customInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('seller.instructions')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('seller.instructionsPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={paymentMethodForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input 
                          type="checkbox" 
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {t('seller.setAsDefault')}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    {t('seller.cancel')}
                  </Button>
                  <Button type="submit" disabled={savePaymentMethod.isPending}>
                    {savePaymentMethod.isPending ? t('seller.saving') : t('seller.save')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Order Status Dialog */}
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('seller.updateOrderStatus')}</DialogTitle>
            </DialogHeader>
            <Form {...orderStatusForm}>
              <form onSubmit={orderStatusForm.handleSubmit(updateOrderStatus.mutate)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">{t('seller.orderStatus')}</Label>
                  <select 
                    id="status"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={orderStatusForm.watch('status')}
                    onChange={(e) => {
                      console.log('Native select changed to:', e.target.value);
                      orderStatusForm.setValue('status', e.target.value as any);
                    }}
                  >
                    <option value="">{t('seller.selectOrderStatus')}</option>
                    <option value="pending">{t('seller.pending')}</option>
                    <option value="confirmed">{t('seller.confirmed')}</option>
                    <option value="processing">{t('seller.processing')}</option>
                    <option value="shipped">{t('seller.shipped')}</option>
                    <option value="delivered">{t('seller.delivered')}</option>
                    <option value="cancelled">{t('seller.cancelled')}</option>
                  </select>
                </div>

                <FormField
                  control={orderStatusForm.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('seller.trackingNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('seller.trackingNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={orderStatusForm.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('seller.carrier')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('seller.carrierPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={orderStatusForm.control}
                  name="sellerNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('seller.sellerNotes')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('seller.sellerNotesPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOrderDialogOpen(false)}>
                    {t('seller.cancel')}
                  </Button>
                  <Button type="submit" disabled={updateOrderStatus.isPending}>
                    {updateOrderStatus.isPending ? t('seller.updating') : t('seller.update')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}