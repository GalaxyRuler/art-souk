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
  onSubmitToZatca: (invoiceId: number) => void;
}

export function InvoiceDetail({ invoice, open, onOpenChange, onDownloadPdf, onSubmitToZatca }: InvoiceDetailProps) {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{t('invoice.invoiceNumber')} {invoice.invoiceNumber}</DialogTitle>
              <DialogDescription>
                {formatDate(invoice.issueDate || invoice.createdAt)}
              </DialogDescription>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Invoice Type and Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('invoice.type')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">
                    {invoice.invoiceType === 'standard' ? t('invoice.typeStandard') : t('invoice.typeSimplified')}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {invoice.invoiceType === 'standard' ? 'B2B' : 'B2C'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('invoice.paymentMethod')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">
                    {invoice.paymentMethod ? t(`invoice.${invoice.paymentMethod}`) : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller and Buyer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('invoice.sellerInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{invoice.sellerBusinessName}</p>
                <p className="text-sm text-gray-600" dir="rtl">{invoice.sellerBusinessNameAr}</p>
                {invoice.vatNumber && (
                  <p className="text-sm">
                    <span className="text-gray-600">{t('invoice.vatNumber')}:</span> {invoice.vatNumber}
                  </p>
                )}
                {invoice.sellerCrNumber && (
                  <p className="text-sm">
                    <span className="text-gray-600">CR Number:</span> {invoice.sellerCrNumber}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('invoice.buyerInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold">{invoice.buyerName || '-'}</p>
                {invoice.buyerVatNumber && (
                  <p className="text-sm">
                    <span className="text-gray-600">{t('invoice.buyerVatNumber')}:</span> {invoice.buyerVatNumber}
                  </p>
                )}
                {invoice.buyerAddress && (
                  <div className="text-sm text-gray-600">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {typeof invoice.buyerAddress === 'string' ? invoice.buyerAddress : invoice.buyerAddress.address || '-'}
                  </div>
                )}
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

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onDownloadPdf(invoice.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('invoice.downloadPdf')}
            </Button>
            {invoice.status === 'draft' && (
              <Button
                onClick={() => onSubmitToZatca(invoice.id)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {t('invoice.submitToZatca')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}