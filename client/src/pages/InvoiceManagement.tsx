import React, { useState } from "react";
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
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState('all');

  // Simplified: Always allow access and fetch invoices
  const hasSellerAccess = true;
  const userRoles = [];

  // Fetch invoices with enhanced debugging
  const { data: invoices = [], isLoading, error, isSuccess, isFetching } = useQuery({
    queryKey: ['/api/invoices'],
    staleTime: 0,
    refetchOnMount: true,
    retry: false,
    queryFn: async () => {
      console.log('🚀 STARTING INVOICE FETCH');
      const response = await fetch('/api/invoices', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ FETCH FAILED:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('📋 Raw response:', responseText.substring(0, 200) + '...');
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ PARSED JSON SUCCESS:', Array.isArray(data), data?.length || 0, 'items');
        console.log('🔍 First item keys:', data?.[0] ? Object.keys(data[0]) : 'No items');
        return data;
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError);
        throw new Error('Invalid JSON response');
      }
    },
  });

  // Debug: Log actual invoice data structure
  React.useEffect(() => {
    if (invoices && invoices.length > 0) {
      console.log('🔍 Frontend invoice data:', invoices);
      console.log('🔍 First invoice structure:', invoices[0]);
      console.log('🔍 Invoice field names:', Object.keys(invoices[0]));
      console.log('🔍 Invoice number field:', invoices[0].invoice_number);
      console.log('🔍 Total amount field:', invoices[0].total_amount);
    }
  }, [invoices]);

  // Enhanced debug logging for React Query state
  console.log('🔍 REACT QUERY STATE:', {
    isLoading,
    isFetching,
    isSuccess,
    hasError: !!error,
    error: error?.message || null,
    invoicesLength: invoices?.length || 0,
    invoicesType: typeof invoices,
    invoicesIsArray: Array.isArray(invoices),
    rawInvoicesKeys: invoices?.[0] ? Object.keys(invoices[0]) : [],
    timestamp: new Date().toISOString()
  });

  // Debug first invoice structure
  React.useEffect(() => {
    if (invoices && invoices.length > 0) {
      console.log('🔍 TAB DEBUG:', { activeTab, invoicesLength: invoices.length });
      console.log('🔍 First invoice structure:', {
        id: invoices[0].id,
        number: invoices[0].number,
        invoice_number: invoices[0].invoice_number,
        status: invoices[0].status,
        total: invoices[0].total,
        total_amount: invoices[0].total_amount,
        created: invoices[0].created,
        created_at: invoices[0].created_at,
        allKeys: Object.keys(invoices[0])
      });
      
      // Check if the filter is working for drafts
      const draftInvoices = invoices.filter((inv: any) => inv.status === 'draft');
      console.log('🔍 DRAFT FILTER:', { totalInvoices: invoices.length, draftCount: draftInvoices.length });
    }
  }, [invoices, activeTab]);

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

  // Simple display debug
  console.log('🔍 BEFORE RENDER - Invoices array:', JSON.stringify(invoices, null, 2));
  console.log('🔍 BEFORE RENDER - Is Loading:', isLoading);
  console.log('🔍 BEFORE RENDER - Has Error:', !!error);

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

        {/* TEMPORARY DEBUG BOX */}
        <div className="bg-red-100 border border-red-400 p-4 rounded mb-6">
          <h3 className="font-bold text-red-800">FRONTEND DEBUG:</h3>
          <p><strong>Loading:</strong> {isLoading ? 'YES' : 'NO'}</p>
          <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
          <p><strong>Invoices Array:</strong> {invoices ? `${invoices.length} items` : 'undefined'}</p>
          <p><strong>Array Type:</strong> {Array.isArray(invoices) ? 'Array' : typeof invoices}</p>
          {invoices && invoices.length > 0 && (
            <div>
              <p><strong>First Invoice:</strong></p>
              <pre className="text-xs bg-white p-2 mt-1 rounded">
                {JSON.stringify(invoices[0], null, 2).slice(0, 300)}...
              </pre>
            </div>
          )}
        </div>

        {/* SIMPLE STATE-BASED TABS - NO RADIX UI */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'all', label: t('invoice.tabs.all') },
                { id: 'draft', label: t('invoice.tabs.draft') },
                { id: 'sent', label: t('invoice.tabs.sent') },
                { id: 'paid', label: t('invoice.tabs.paid') },
                { id: 'overdue', label: t('invoice.tabs.overdue') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'all' && (
              <div className="grid gap-4">
                {invoices?.map((invoice: any, index: number) => (
                  <Card key={invoice.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{invoice.number || invoice.invoice_number}</h3>
                        <p className="text-gray-600">{invoice.buyer_name || t('invoice.customer')}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.created ? format(new Date(invoice.created), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={invoice.status === 'draft' ? 'secondary' : 'default'}>
                          {t(`invoice.status.${invoice.status}`)}
                        </Badge>
                        <p className="text-lg font-semibold mt-2">
                          {invoice.total || invoice.total_amount} {invoice.currency || 'SAR'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        {t('invoice.view')}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        {t('invoice.download')}
                      </Button>
                    </div>
                  </Card>
                ))}
                {(!invoices || invoices.length === 0) && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('invoice.noInvoices')}</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'draft' && (
              <div className="grid gap-4">
                {invoices?.filter((inv: any) => inv.status === 'draft').map((invoice: any) => (
                  <Card key={invoice.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{invoice.number || invoice.invoice_number}</h3>
                        <p className="text-gray-600">{invoice.buyer_name || t('invoice.customer')}</p>
                        <p className="text-sm text-gray-500">
                          {invoice.created ? format(new Date(invoice.created), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">{t('invoice.status.draft')}</Badge>
                        <p className="text-lg font-semibold mt-2">
                          {invoice.total || invoice.total_amount} {invoice.currency || 'SAR'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        {t('invoice.view')}
                      </Button>
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-2" />
                        {t('invoice.send')}
                      </Button>
                    </div>
                  </Card>
                ))}
                {(!invoices?.filter((inv: any) => inv.status === 'draft').length) && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('invoice.noDraftInvoices')}</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'sent' && (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('invoice.noSentInvoices')}</p>
              </div>
            )}
            
            {activeTab === 'paid' && (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('invoice.noPaidInvoices')}</p>
              </div>
            )}
            
            {activeTab === 'overdue' && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('invoice.noOverdueInvoices')}</p>
              </div>
            )}
          </div>
        </div>
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