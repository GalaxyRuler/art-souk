import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Send, CheckCircle, FileText, Clock, QrCode, Shield, Calendar, MapPin, CreditCard, Package, FileSignature } from 'lucide-react';

interface InvoiceDetailProps {
  invoice: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPdf: (invoiceId: number) => void;
}

export function InvoiceDetail({ invoice, open, onOpenChange, onDownloadPdf }: InvoiceDetailProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const dateLocale = isArabic ? ar : enUS;

  if (!invoice) return null;

  // Safe date formatting utility
  const formatDate = (dateValue: string | Date | null | undefined, formatStr: string = 'PPP') => {
    try {
      if (!dateValue) return 'No date available';
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, formatStr, { locale: dateLocale });
    } catch (error) {
      return 'Date format error';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, icon: FileText },
      sent: { variant: 'default' as const, icon: Send },
      paid: { variant: 'outline' as const, icon: CheckCircle },
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-amber-50">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative -m-6 mb-6 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white p-6 rounded-t-lg">
          <div className="absolute inset-0 bg-black/10 rounded-t-lg" />
          <div className="relative">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-bold">{t('invoice.invoiceNumber')} {invoice.invoiceNumber}</DialogTitle>
                    <DialogDescription className="text-amber-100 text-lg">
                      ZATCA Compliant Tax Invoice • {formatDate(invoice.issueDate || invoice.createdAt)}
                    </DialogDescription>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(invoice.status)}
                  <p className="text-2xl font-bold mt-2">
                    {invoice.totalAmount || '0.00'} {invoice.currency || 'SAR'}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>
        </div>

        <div className="space-y-6">
          {/* Invoice Type and Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  {t('invoice.type')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">
                    {invoice.invoiceType === 'standard' ? t('invoice.typeStandard') : t('invoice.typeSimplified')}
                  </span>
                  <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300">
                    {invoice.invoiceType === 'standard' ? 'B2B' : 'B2C'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t('invoice.paymentMethod')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="font-semibold text-green-900">
                  {invoice.paymentMethod ? t(`invoice.${invoice.paymentMethod}`) : 'Not Specified'}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Seller and Buyer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('invoice.sellerInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-bold text-purple-900">{invoice.sellerBusinessName || 'Art Souk Platform'}</p>
                  <p className="text-sm text-purple-700" dir="rtl">{invoice.sellerBusinessNameAr || 'منصة سوق الفن'}</p>
                </div>
                <div className="space-y-1">
                  {invoice.vatNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-600">{t('invoice.vatNumber')}:</span> 
                      <span className="font-mono text-purple-800">{invoice.vatNumber}</span>
                    </div>
                  )}
                  {invoice.sellerCrNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileSignature className="h-3 w-3 text-purple-600" />
                      <span className="text-purple-600">CR Number:</span> 
                      <span className="font-mono text-purple-800">{invoice.sellerCrNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-teal-200 bg-gradient-to-br from-teal-50 to-teal-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-teal-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('invoice.buyerInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-bold text-teal-900">{invoice.buyerName || 'Customer Name Not Available'}</p>
                </div>
                <div className="space-y-1">
                  {invoice.buyerVatNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-3 w-3 text-teal-600" />
                      <span className="text-teal-600">{t('invoice.buyerVatNumber')}:</span> 
                      <span className="font-mono text-teal-800">{invoice.buyerVatNumber}</span>
                    </div>
                  )}
                  {invoice.buyerAddress && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-teal-600 mt-0.5" />
                      <div className="text-teal-800">
                        {typeof invoice.buyerAddress === 'string' ? invoice.buyerAddress : invoice.buyerAddress.address || 'Address Not Available'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('invoice.itemDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{invoice.itemDescription}</p>
              <p className="text-gray-600" dir="rtl">{invoice.itemDescriptionAr}</p>
              {invoice.referenceNumber && (
                <p className="text-sm">
                  <span className="text-gray-600">{t('invoice.referenceNumber')}:</span> {invoice.referenceNumber}
                </p>
              )}
              {invoice.supplyDate && (
                <p className="text-sm">
                  <span className="text-gray-600">{t('invoice.supplyDate')}:</span>{' '}
                  {formatDate(invoice.supplyDate || invoice.supply_date, 'PP')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Amount Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('invoice.amountDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('invoice.subtotal')}</span>
                  <span>{invoice.subtotal} {invoice.currency}</span>
                </div>
                {invoice.discountPercentage > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>{t('invoice.discountPercentage')} ({invoice.discountPercentage}%)</span>
                    <span>-{invoice.discountAmount} {invoice.currency}</span>
                  </div>
                )}
                {invoice.shippingAmount > 0 && (
                  <div className="flex justify-between">
                    <span>{t('invoice.shippingAmount')}</span>
                    <span>{invoice.shippingAmount} {invoice.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>{t('invoice.vat')} ({invoice.vatRate}%)</span>
                  <span>{invoice.vatAmount} {invoice.currency}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>{t('invoice.total')}</span>
                  <span>{invoice.totalAmount} {invoice.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ZATCA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t('invoice.zatcaInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('invoice.zatcaUuid')}</p>
                  <p className="font-mono text-xs break-all">{invoice.zatcaUuid || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('invoice.invoiceHash')}</p>
                  <p className="font-mono text-xs break-all">{invoice.invoiceHash?.substring(0, 20)}...</p>
                </div>
              </div>
              {invoice.qrCode && (
                <div className="flex items-center gap-2 mt-2">
                  <QrCode className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{t('invoice.qrCodeGenerated')}</span>
                </div>
              )}
              {invoice.digitalSignature && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">{t('invoice.digitalSignature')}</span>
                </div>
              )}
              {invoice.zatcaClearanceStatus && (
                <div>
                  <Badge variant={invoice.zatcaClearanceStatus === 'cleared' ? 'outline' : 'secondary'}>
                    ZATCA {invoice.zatcaClearanceStatus}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(invoice.notes || invoice.notesAr) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('invoice.notes')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {invoice.notes && <p className="text-sm">{invoice.notes}</p>}
                {invoice.notesAr && <p className="text-sm" dir="rtl">{invoice.notesAr}</p>}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <Button
              variant="default"
              onClick={() => onDownloadPdf(invoice.id)}
              className="px-8 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('invoice.downloadPdf')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
