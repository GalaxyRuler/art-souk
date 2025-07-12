import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Building, Phone, Mail, MapPin, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function TapPaymentSetup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    businessType: 'artist',
    email: '',
    phone: '',
    country: 'SA',
    city: '',
    address: '',
    nationalId: '',
    commercialRegister: '',
    bankAccount: {
      accountNumber: '',
      bankName: '',
      iban: '',
      swiftCode: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest('/api/tap/create-business', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        toast({
          title: t('tap.setup.success'),
          description: t('tap.setup.successDesc'),
        });
        // Redirect to dashboard or payment methods page
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error setting up Tap Payment:', error);
      toast({
        title: t('tap.setup.error'),
        description: t('tap.setup.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('bankAccount.')) {
      const bankField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankAccount: {
          ...prev.bankAccount,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const paymentMethods = [
    { id: 'mada', name: 'mada', nameAr: 'مدى', icon: '💳' },
    { id: 'visa', name: 'Visa', nameAr: 'فيزا', icon: '💳' },
    { id: 'mastercard', name: 'Mastercard', nameAr: 'ماستركارد', icon: '💳' },
    { id: 'apple_pay', name: 'Apple Pay', nameAr: 'آبل باي', icon: '📱' },
    { id: 'stc_pay', name: 'STC Pay', nameAr: 'إس تي سي باي', icon: '📱' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('tap.setup.title')}</h1>
        <p className="text-muted-foreground">{t('tap.setup.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Info Section */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('tap.setup.about')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('tap.setup.benefits')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('tap.setup.benefit1')}</li>
                  <li>• {t('tap.setup.benefit2')}</li>
                  <li>• {t('tap.setup.benefit3')}</li>
                  <li>• {t('tap.setup.benefit4')}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t('tap.setup.paymentMethods')}</h4>
                <div className="flex flex-wrap gap-2">
                  {paymentMethods.map(method => (
                    <Badge key={method.id} variant="secondary" className="text-xs">
                      {method.icon} {method.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  {t('tap.setup.commission')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Form Section */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('tap.setup.businessInfo')}</CardTitle>
              <CardDescription>{t('tap.setup.businessInfoDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('tap.setup.businessName')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nameAr">{t('tap.setup.businessNameAr')}</Label>
                      <Input
                        id="nameAr"
                        value={formData.nameAr}
                        onChange={(e) => handleInputChange('nameAr', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessType">{t('tap.setup.businessType')}</Label>
                    <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artist">{t('tap.setup.artist')}</SelectItem>
                        <SelectItem value="gallery">{t('tap.setup.gallery')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{t('tap.setup.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('tap.setup.phone')}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">{t('tap.setup.city')}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationalId">{t('tap.setup.nationalId')}</Label>
                      <Input
                        id="nationalId"
                        value={formData.nationalId}
                        onChange={(e) => handleInputChange('nationalId', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{t('tap.setup.address')}</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Bank Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('tap.setup.bankAccount')}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bankName">{t('tap.setup.bankName')}</Label>
                      <Input
                        id="bankName"
                        value={formData.bankAccount.bankName}
                        onChange={(e) => handleInputChange('bankAccount.bankName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber">{t('tap.setup.accountNumber')}</Label>
                      <Input
                        id="accountNumber"
                        value={formData.bankAccount.accountNumber}
                        onChange={(e) => handleInputChange('bankAccount.accountNumber', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="iban">{t('tap.setup.iban')}</Label>
                      <Input
                        id="iban"
                        value={formData.bankAccount.iban}
                        onChange={(e) => handleInputChange('bankAccount.iban', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="swiftCode">{t('tap.setup.swiftCode')}</Label>
                      <Input
                        id="swiftCode"
                        value={formData.bankAccount.swiftCode}
                        onChange={(e) => handleInputChange('bankAccount.swiftCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? t('tap.setup.setting') : t('tap.setup.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}