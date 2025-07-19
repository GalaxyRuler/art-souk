import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, Eye, FileText, Plus, AlertCircle, CheckCircle, Send, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { InvoiceDetail } from "@/components/InvoiceDetail";

export default function InvoiceManagement() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Simplified: Always allow access and fetch invoices
  const hasSellerAccess = true;
  const userRoles = [];

  // Fetch invoices - SIMPLIFIED AND FIXED
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['/api/invoices'], // FIXED: Removed Date.now() which was causing infinite re-renders
    staleTime: 0,
    refetchOnMount: true,
    queryFn: async () => {
      console.log('🔄 STARTING INVOICE FETCH');
      const response = await fetch('/api/invoices', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!response.ok) {
        console.error('❌ FETCH FAILED:', response.status);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ INVOICE FETCH SUCCESS:', data.length, 'invoices');
      return data;
    },
  });

  // Debug logging
  console.log('🔍 InvoiceManagement Debug:', {
    hasSellerAccess,
    userRoles,
    isLoading,
    invoicesData: invoices,
    invoicesLength: invoices?.length || 0,
    invoicesType: typeof invoices,
    invoicesIsArray: Array.isArray(invoices),
    error: error?.message || 'No error',
    queryEnabled: hasSellerAccess,
    rawInvoicesData: JSON.stringify(invoices),
  });

  // Debug first invoice structure
  if (invoices && invoices.length > 0) {
    console.log('🔍 First invoice structure:', {
      id: invoices[0].id,
      invoice_number: invoices[0].invoice_number,
      invoiceNumber: invoices[0].invoiceNumber,
      status: invoices[0].status,
      buyer_name: invoices[0].buyer_name,
      buyerName: invoices[0].buyerName,
      total_amount: invoices[0].total_amount,
      totalAmount: invoices[0].totalAmount,
      created_at: invoices[0].created_at,
      createdAt: invoices[0].createdAt,
      allKeys: Object.keys(invoices[0])
    });
  }

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔄 Creating invoice with data:', data);
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('📄 Invoice creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Invoice creation failed:', errorText);
        throw new Error(`Failed to create invoice: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Invoice created successfully:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 Invoice creation success callback triggered');
      toast({
        title: t('invoice.createSuccess'),
        description: t('invoice.createSuccessDesc'),
      });
      
      // Force refetch and invalidate cache
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.refetchQueries({ queryKey: ['/api/invoices'] });
      
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error('❌ Invoice creation error:', error);
      toast({
        title: t('invoice.createError'),
        description: t('invoice.createErrorDesc'),
        variant: 'destructive',
      });
    },
  });

  // Update invoice status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update invoice');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('invoice.updateSuccess'),
        description: t('invoice.updateSuccessDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    },
  });

  // Handle PDF download
  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: t('invoice.downloadError'),
        description: t('invoice.downloadErrorDesc'),
        variant: 'destructive',
      });
    }
  };

  // Handle ZATCA submission
  const handleZATCASubmit = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/zatca-submit`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to submit to ZATCA');
      
      toast({
        title: t('invoice.zatcaSubmitSuccess'),
        description: t('invoice.zatcaSubmitSuccessDesc'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
    } catch (error) {
      toast({
        title: t('invoice.zatcaSubmitError'),
        description: t('invoice.zatcaSubmitErrorDesc'),
        variant: 'destructive',
      });
    }
  };

  // Enhanced debugging for rendering
  console.log('🎯 INVOICE MANAGEMENT RENDER DEBUG:', {
    invoicesLength: invoices?.length || 0,
    invoicesData: invoices,
    isLoading,
    error: error?.message || 'No error',
    hasSellerAccess,
    timestamp: new Date().toISOString()
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: FileText },
      sent: { variant: 'default' as const, icon: Send },
      paid: { variant: 'success' as const, icon: CheckCircle },
      overdue: { variant: 'destructive' as const, icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t(`invoice.status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* DEBUG DISPLAY */}
          <div className="bg-blue-100 p-4 rounded mb-4">
            <h3 className="font-bold text-blue-800">INVOICE DEBUG INFO:</h3>
            <p>Loading: {isLoading ? 'YES' : 'NO'}</p>
            <p>Error: {error ? error.message : 'None'}</p>
            <p>Invoice Count: {invoices ? invoices.length : 'undefined'}</p>
            <p>First Invoice: {invoices && invoices[0] ? JSON.stringify(invoices[0]).slice(0, 100) + '...' : 'None'}</p>
            <p>Timestamp: {new Date().toLocaleTimeString()}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('invoice.title')}</h1>
              <p className="text-gray-600 mt-2">{t('invoice.subtitle')}</p>
            </div>
            
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('invoice.createNew')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('invoice.createTitle')}</DialogTitle>
                  <DialogDescription>{t('invoice.createDescription')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  createInvoiceMutation.mutate({
                    buyer_name: formData.get('buyer_name'),
                    buyer_vat_number: formData.get('buyer_vat_number'),
                    buyer_address: formData.get('buyer_address'),
                    invoice_description_en: formData.get('invoice_description_en'),
                    invoice_description_ar: formData.get('invoice_description_ar'),
                    amount: parseFloat(formData.get('amount') as string),
                    invoice_type: formData.get('invoice_type'),
                    payment_method: formData.get('payment_method'),
                    discount_percentage: formData.get('discount_percentage') ? parseFloat(formData.get('discount_percentage') as string) : 0,
                    shipping_amount: formData.get('shipping_amount') ? parseFloat(formData.get('shipping_amount') as string) : 0,
                    reference_number: formData.get('reference_number'),
                    supply_date: formData.get('supply_date'),
                    notes: formData.get('notes'),
                    notes_ar: formData.get('notes_ar'),
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyer_name">{t('invoice.buyerName')}</Label>
                      <Input id="buyer_name" name="buyer_name" required />
                    </div>
                    <div>
                      <Label htmlFor="buyer_vat_number">{t('invoice.buyerVatNumber')}</Label>
                      <Input id="buyer_vat_number" name="buyer_vat_number" placeholder="300000000000000" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="buyer_address">{t('invoice.buyerAddress')}</Label>
                    <Textarea id="buyer_address" name="buyer_address" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invoice_type">{t('invoice.type')}</Label>
                      <Select name="invoice_type" defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">{t('invoice.typeStandard')} (B2B)</SelectItem>
                          <SelectItem value="simplified">{t('invoice.typeSimplified')} (B2C)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="payment_method">{t('invoice.paymentMethod')}</Label>
                      <select
                        id="payment_method"
                        name="payment_method"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">{t('invoice.selectPaymentMethod')}</option>
                        <option value="bank_transfer">{t('invoice.bankTransfer')}</option>
                        <option value="cash">{t('invoice.cash')}</option>
                        <option value="credit_card">{t('invoice.creditCard')}</option>
                        <option value="stc_pay">STC Pay</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="invoice_description_en">{t('invoice.descriptionEn')}</Label>
                    <Textarea id="invoice_description_en" name="invoice_description_en" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="invoice_description_ar">{t('invoice.descriptionAr')}</Label>
                    <Textarea id="invoice_description_ar" name="invoice_description_ar" required dir="rtl" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="amount">{t('invoice.amount')}</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" required />
                    </div>
                    <div>
                      <Label htmlFor="discount_percentage">{t('invoice.discountPercentage')}</Label>
                      <Input id="discount_percentage" name="discount_percentage" type="number" step="0.01" placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="shipping_amount">{t('invoice.shippingAmount')}</Label>
                      <Input id="shipping_amount" name="shipping_amount" type="number" step="0.01" placeholder="0" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference_number">{t('invoice.referenceNumber')}</Label>
                      <Input id="reference_number" name="reference_number" placeholder="PO-12345" />
                    </div>
                    <div>
                      <Label htmlFor="supply_date">{t('invoice.supplyDate')}</Label>
                      <Input id="supply_date" name="supply_date" type="date" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">{t('invoice.notes')}</Label>
                    <Textarea id="notes" name="notes" rows={2} placeholder={t('invoice.notesPlaceholder')} />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes_ar">{t('invoice.notesAr')}</Label>
                    <Textarea id="notes_ar" name="notes_ar" rows={2} dir="rtl" placeholder={t('invoice.notesArPlaceholder')} />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createInvoiceMutation.isPending}>
                      {createInvoiceMutation.isPending ? t('common.creating') : t('common.create')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">{t('invoice.tabs.all')}</TabsTrigger>
            <TabsTrigger value="draft">{t('invoice.tabs.draft')}</TabsTrigger>
            <TabsTrigger value="sent">{t('invoice.tabs.sent')}</TabsTrigger>
            <TabsTrigger value="paid">{t('invoice.tabs.paid')}</TabsTrigger>
            <TabsTrigger value="overdue">{t('invoice.tabs.overdue')}</TabsTrigger>
          </TabsList>

          {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
            <TabsContent key={status} value={status}>
              {isLoading ? (
                <div className="text-center py-8">{t('common.loading')}</div>
              ) : (
                <div className="grid gap-4">
                  {invoices
                    .filter((invoice: any) => {
                      const isMatch = status === 'all' || invoice.status === status;
                      console.log(`🔍 Tab ${status} - Invoice ${invoice.invoice_number} (${invoice.status}): ${isMatch ? 'MATCHES' : 'FILTERED OUT'}`);
                      return isMatch;
                    })
                    .map((invoice: any) => (
                      <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{invoice.invoiceNumber || invoice.invoice_number}</h3>
                                {getStatusBadge(invoice.status)}
                              </div>
                              <p className="text-gray-600 mb-1">{invoice.buyerName || invoice.buyer_name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">
                                {(() => {
                                  try {
                                    const dateToFormat = invoice.createdAt || invoice.created_at || invoice.issueDate || invoice.issue_date;
                                    if (!dateToFormat) return 'No date available';
                                    const date = new Date(dateToFormat);
                                    if (isNaN(date.getTime())) return 'Invalid date';
                                    return format(date, 'PPP');
                                  } catch (error) {
                                    return 'Date format error';
                                  }
                                })()}
                              </p>
                              <p className="text-lg font-semibold text-amber-600 mt-2">
                                {(invoice.totalAmount || invoice.total_amount) ? 
                                  parseFloat(invoice.totalAmount || invoice.total_amount).toLocaleString() : '0'} SAR
                              </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('common.view')}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPDF(invoice.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {t('invoice.downloadPDF')}
                              </Button>
                              
                              {invoice.status === 'draft' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleZATCASubmit(invoice.id)}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {t('invoice.submitZATCA')}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  
                  {invoices.filter((invoice: any) => status === 'all' || invoice.status === status).length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">{t('invoice.noInvoices')}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {/* Invoice Detail Dialog */}
      <InvoiceDetail
        invoice={selectedInvoice}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onDownloadPdf={handleDownloadPDF}
        onSubmitToZatca={handleZATCASubmit}
      />
      
      <Footer />
    </div>
  );
}