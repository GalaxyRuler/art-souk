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
import { FileText, Download, Send, Eye, Plus, Edit, Check, QrCode, Shield, Building2, Calculator } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: number;
  sellerId: string;
  sellerType: 'artist' | 'gallery';
  buyerId: string;
  vatNumber: string;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  itemDescription: string;
  itemDescriptionAr: string;
  qrCode: string;
  digitalSignature: string;
  zatcaUuid: string;
  invoiceHash: string;
  previousInvoiceHash: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate: string;
  sellerBusinessName: string;
  sellerBusinessNameAr: string;
  sellerAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  buyerAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InvoiceFormData {
  orderId: number;
  vatNumber: string;
  itemDescription: string;
  itemDescriptionAr: string;
  sellerBusinessName: string;
  sellerBusinessNameAr: string;
  sellerAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  buyerAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  dueDate: string;
}

export default function InvoiceManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    orderId: 0,
    vatNumber: '',
    itemDescription: '',
    itemDescriptionAr: '',
    sellerBusinessName: '',
    sellerBusinessNameAr: '',
    sellerAddress: {
      street: '',
      city: '',
      state: '',
      country: 'Saudi Arabia',
      postalCode: ''
    },
    buyerAddress: {
      street: '',
      city: '',
      state: '',
      country: 'Saudi Arabia',
      postalCode: ''
    },
    dueDate: ''
  });

  // Fetch user roles
  const { data: userRoles } = useQuery<string[]>({
    queryKey: ['/api/user/roles'],
    retry: false,
  });

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    retry: false,
  });

  // Fetch orders for invoice creation
  const { data: orders } = useQuery<any[]>({
    queryKey: ['/api/seller/orders'],
    retry: false,
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      return apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: t('invoice.created'),
        description: t('invoice.createdDesc'),
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('invoice.createError'),
        variant: 'destructive',
      });
    },
  });

  // Update invoice status mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/invoices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: t('invoice.updated'),
        description: t('invoice.updatedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('invoice.updateError'),
        variant: 'destructive',
      });
    },
  });

  // Generate PDF mutation
  const generatePdfMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest(`/api/invoices/${invoiceId}/pdf`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: (data) => {
      // Handle PDF download
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      link.download = `invoice-${selectedInvoice?.invoiceNumber}.pdf`;
      link.click();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('invoice.pdfError'),
        variant: 'destructive',
      });
    },
  });

  // Submit to ZATCA mutation
  const submitToZatcaMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      return apiRequest(`/api/invoices/${invoiceId}/zatca-submit`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: t('invoice.zatcaSubmitted'),
        description: t('invoice.zatcaSubmittedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: t('invoice.zatcaError'),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      orderId: 0,
      vatNumber: '',
      itemDescription: '',
      itemDescriptionAr: '',
      sellerBusinessName: '',
      sellerBusinessNameAr: '',
      sellerAddress: {
        street: '',
        city: '',
        state: '',
        country: 'Saudi Arabia',
        postalCode: ''
      },
      buyerAddress: {
        street: '',
        city: '',
        state: '',
        country: 'Saudi Arabia',
        postalCode: ''
      },
      dueDate: ''
    });
  };

  const handleCreateInvoice = () => {
    createInvoiceMutation.mutate(formData);
  };

  const handleStatusUpdate = (invoiceId: number, status: string) => {
    updateInvoiceMutation.mutate({ id: invoiceId, status });
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  const handleGeneratePdf = (invoiceId: number) => {
    generatePdfMutation.mutate(invoiceId);
  };

  const handleSubmitToZatca = (invoiceId: number) => {
    submitToZatcaMutation.mutate(invoiceId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const saudiCities = [
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
              {t('invoice.accessDenied')}
            </h1>
            <p className="text-slate-300">
              {t('invoice.artistGalleryOnly')}
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
              <FileText className="h-10 w-10 text-blue-400" />
              {t('invoice.title')}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {t('invoice.subtitle')}
            </p>
            <div className="flex justify-center items-center gap-2 mt-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-medium">{t('invoice.zatcaCompliant')}</span>
            </div>
          </div>

          <Tabs defaultValue="invoices" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('invoice.invoices')}
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('invoice.create')}
              </TabsTrigger>
            </TabsList>

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('invoice.yourInvoices')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                    </div>
                  ) : invoices && invoices.length > 0 ? (
                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-white font-semibold">
                                {t('invoice.invoiceNumber')}: {invoice.invoiceNumber}
                              </p>
                              <p className="text-slate-300">
                                {t('invoice.businessName')}: {invoice.sellerBusinessName}
                              </p>
                              <p className="text-slate-300">
                                {t('invoice.issueDate')}: {new Date(invoice.issueDate).toLocaleDateString()}
                              </p>
                              <p className="text-slate-300">
                                {t('invoice.amount')}: {formatCurrency(invoice.totalAmount)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getStatusColor(invoice.status)}>
                                {t(`invoice.status.${invoice.status}`)}
                              </Badge>
                              {invoice.zatcaUuid && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  {t('invoice.zatcaApproved')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('invoice.view')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGeneratePdf(invoice.id)}
                              disabled={generatePdfMutation.isPending}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {t('invoice.downloadPdf')}
                            </Button>
                            {invoice.status === 'draft' && (
                              <>
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(invoice.id, 'sent')}
                                  disabled={updateInvoiceMutation.isPending}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {t('invoice.send')}
                                </Button>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSubmitToZatca(invoice.id)}
                                  disabled={submitToZatcaMutation.isPending}
                                >
                                  <Shield className="h-4 w-4 mr-1" />
                                  {t('invoice.submitToZatca')}
                                </Button>
                              </>
                            )}
                            {invoice.status === 'sent' && (
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(invoice.id, 'paid')}
                                disabled={updateInvoiceMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                {t('invoice.markPaid')}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {t('invoice.noInvoices')}
                      </h3>
                      <p className="text-slate-300 mb-4">
                        {t('invoice.noInvoicesDesc')}
                      </p>
                      <Button 
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('invoice.createFirst')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create Invoice Tab */}
            <TabsContent value="create">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    {t('invoice.createInvoice')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="orderId" className="text-white">
                          {t('invoice.selectOrder')}
                        </Label>
                        <Select
                          value={formData.orderId.toString()}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            orderId: parseInt(value)
                          })}
                        >
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder={t('invoice.selectOrderPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {orders?.filter(order => order.status === 'confirmed').map(order => (
                              <SelectItem key={order.id} value={order.id.toString()}>
                                {order.orderNumber} - {order.artwork?.title} - {formatCurrency(order.totalAmount)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="vatNumber" className="text-white">
                          {t('invoice.vatNumber')}
                        </Label>
                        <Input
                          id="vatNumber"
                          value={formData.vatNumber}
                          onChange={(e) => setFormData({
                            ...formData,
                            vatNumber: e.target.value
                          })}
                          placeholder="300000000000003"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="itemDescription" className="text-white">
                          {t('invoice.itemDescription')}
                        </Label>
                        <Textarea
                          id="itemDescription"
                          value={formData.itemDescription}
                          onChange={(e) => setFormData({
                            ...formData,
                            itemDescription: e.target.value
                          })}
                          placeholder={t('invoice.itemDescriptionPlaceholder')}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="itemDescriptionAr" className="text-white">
                          {t('invoice.itemDescriptionAr')}
                        </Label>
                        <Textarea
                          id="itemDescriptionAr"
                          value={formData.itemDescriptionAr}
                          onChange={(e) => setFormData({
                            ...formData,
                            itemDescriptionAr: e.target.value
                          })}
                          placeholder={t('invoice.itemDescriptionArPlaceholder')}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="sellerBusinessName" className="text-white">
                          {t('invoice.sellerBusinessName')}
                        </Label>
                        <Input
                          id="sellerBusinessName"
                          value={formData.sellerBusinessName}
                          onChange={(e) => setFormData({
                            ...formData,
                            sellerBusinessName: e.target.value
                          })}
                          placeholder={t('invoice.sellerBusinessNamePlaceholder')}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sellerBusinessNameAr" className="text-white">
                          {t('invoice.sellerBusinessNameAr')}
                        </Label>
                        <Input
                          id="sellerBusinessNameAr"
                          value={formData.sellerBusinessNameAr}
                          onChange={(e) => setFormData({
                            ...formData,
                            sellerBusinessNameAr: e.target.value
                          })}
                          placeholder={t('invoice.sellerBusinessNameArPlaceholder')}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {t('invoice.sellerAddress')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sellerStreet" className="text-white">
                            {t('invoice.street')}
                          </Label>
                          <Input
                            id="sellerStreet"
                            value={formData.sellerAddress.street}
                            onChange={(e) => setFormData({
                              ...formData,
                              sellerAddress: {
                                ...formData.sellerAddress,
                                street: e.target.value
                              }
                            })}
                            placeholder={t('invoice.streetPlaceholder')}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sellerCity" className="text-white">
                            {t('invoice.city')}
                          </Label>
                          <Select
                            value={formData.sellerAddress.city}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              sellerAddress: {
                                ...formData.sellerAddress,
                                city: value
                              }
                            })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder={t('invoice.selectCity')} />
                            </SelectTrigger>
                            <SelectContent>
                              {saudiCities.map(city => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sellerState" className="text-white">
                            {t('invoice.state')}
                          </Label>
                          <Input
                            id="sellerState"
                            value={formData.sellerAddress.state}
                            onChange={(e) => setFormData({
                              ...formData,
                              sellerAddress: {
                                ...formData.sellerAddress,
                                state: e.target.value
                              }
                            })}
                            placeholder={t('invoice.statePlaceholder')}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sellerPostalCode" className="text-white">
                            {t('invoice.postalCode')}
                          </Label>
                          <Input
                            id="sellerPostalCode"
                            value={formData.sellerAddress.postalCode}
                            onChange={(e) => setFormData({
                              ...formData,
                              sellerAddress: {
                                ...formData.sellerAddress,
                                postalCode: e.target.value
                              }
                            })}
                            placeholder="12345"
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {t('invoice.buyerAddress')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buyerStreet" className="text-white">
                            {t('invoice.street')}
                          </Label>
                          <Input
                            id="buyerStreet"
                            value={formData.buyerAddress.street}
                            onChange={(e) => setFormData({
                              ...formData,
                              buyerAddress: {
                                ...formData.buyerAddress,
                                street: e.target.value
                              }
                            })}
                            placeholder={t('invoice.streetPlaceholder')}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buyerCity" className="text-white">
                            {t('invoice.city')}
                          </Label>
                          <Select
                            value={formData.buyerAddress.city}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              buyerAddress: {
                                ...formData.buyerAddress,
                                city: value
                              }
                            })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder={t('invoice.selectCity')} />
                            </SelectTrigger>
                            <SelectContent>
                              {saudiCities.map(city => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="buyerState" className="text-white">
                            {t('invoice.state')}
                          </Label>
                          <Input
                            id="buyerState"
                            value={formData.buyerAddress.state}
                            onChange={(e) => setFormData({
                              ...formData,
                              buyerAddress: {
                                ...formData.buyerAddress,
                                state: e.target.value
                              }
                            })}
                            placeholder={t('invoice.statePlaceholder')}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buyerPostalCode" className="text-white">
                            {t('invoice.postalCode')}
                          </Label>
                          <Input
                            id="buyerPostalCode"
                            value={formData.buyerAddress.postalCode}
                            onChange={(e) => setFormData({
                              ...formData,
                              buyerAddress: {
                                ...formData.buyerAddress,
                                postalCode: e.target.value
                              }
                            })}
                            placeholder="12345"
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="dueDate" className="text-white">
                        {t('invoice.dueDate')}
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          dueDate: e.target.value
                        })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={resetForm}
                        className="border-white/20 text-white hover:bg-white/5"
                      >
                        {t('common.reset')}
                      </Button>
                      <Button 
                        onClick={handleCreateInvoice}
                        disabled={createInvoiceMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createInvoiceMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {t('invoice.createInvoice')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Invoice View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('invoice.invoiceDetails')}
                </DialogTitle>
              </DialogHeader>
              {selectedInvoice && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('invoice.invoiceInfo')}</h3>
                      <div className="space-y-2">
                        <p><strong>{t('invoice.invoiceNumber')}:</strong> {selectedInvoice.invoiceNumber}</p>
                        <p><strong>{t('invoice.issueDate')}:</strong> {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                        <p><strong>{t('invoice.dueDate')}:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                        <p><strong>{t('invoice.status')}:</strong> 
                          <Badge className={`ml-2 ${getStatusColor(selectedInvoice.status)}`}>
                            {t(`invoice.status.${selectedInvoice.status}`)}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('invoice.zatcaInfo')}</h3>
                      <div className="space-y-2">
                        <p><strong>{t('invoice.vatNumber')}:</strong> {selectedInvoice.vatNumber}</p>
                        <p><strong>{t('invoice.zatcaUuid')}:</strong> {selectedInvoice.zatcaUuid || t('invoice.pending')}</p>
                        <p><strong>{t('invoice.digitalSignature')}:</strong> {selectedInvoice.digitalSignature ? t('invoice.signed') : t('invoice.pending')}</p>
                        {selectedInvoice.qrCode && (
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            <span>{t('invoice.qrCodeGenerated')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('invoice.sellerInfo')}</h3>
                      <div className="space-y-2">
                        <p><strong>{t('invoice.businessName')}:</strong> {selectedInvoice.sellerBusinessName}</p>
                        <p><strong>{t('invoice.businessNameAr')}:</strong> {selectedInvoice.sellerBusinessNameAr}</p>
                        <p><strong>{t('invoice.address')}:</strong> {selectedInvoice.sellerAddress.street}, {selectedInvoice.sellerAddress.city}, {selectedInvoice.sellerAddress.postalCode}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{t('invoice.buyerInfo')}</h3>
                      <div className="space-y-2">
                        <p><strong>{t('invoice.address')}:</strong> {selectedInvoice.buyerAddress.street}, {selectedInvoice.buyerAddress.city}, {selectedInvoice.buyerAddress.postalCode}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t('invoice.itemDetails')}</h3>
                    <div className="space-y-2">
                      <p><strong>{t('invoice.description')}:</strong> {selectedInvoice.itemDescription}</p>
                      <p><strong>{t('invoice.descriptionAr')}:</strong> {selectedInvoice.itemDescriptionAr}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t('invoice.amountDetails')}</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>{t('invoice.subtotal')}:</span>
                        <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span>{t('invoice.vat')} ({selectedInvoice.vatRate}%):</span>
                        <span>{formatCurrency(selectedInvoice.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                        <span>{t('invoice.total')}:</span>
                        <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </div>
  );
}