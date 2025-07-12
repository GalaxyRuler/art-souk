import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, CreditCard, Smartphone, Globe, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  details: Record<string, any>;
  instructions?: string;
  isDefault?: boolean;
  verified?: boolean;
  createdAt: string;
}

const paymentMethodSchema = z.object({
  type: z.string().min(1, 'Payment method type is required'),
  name: z.string().min(1, 'Payment method name is required'),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
  phoneNumber: z.string().optional(),
  paypalEmail: z.string().email().optional(),
  wiseEmail: z.string().email().optional(),
  preferredCurrency: z.string().optional(),
  instructions: z.string().optional(),
});

export function PaymentMethodManager({ userType = 'artist' }: { userType?: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMethodType, setSelectedMethodType] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const paymentMethodTypes = {
    saudi_bank: {
      label: t('paymentMethods.types.saudiBankTransfer'),
      icon: Building,
      color: 'bg-blue-100 text-blue-800',
      fields: [
        { name: 'bankName', label: t('paymentMethods.fields.bankName'), type: 'text', required: true },
        { name: 'iban', label: t('paymentMethods.fields.iban'), type: 'text', required: true },
        { name: 'accountHolder', label: t('paymentMethods.fields.accountHolder'), type: 'text', required: true },
        { name: 'accountNumber', label: t('paymentMethods.fields.accountNumber'), type: 'text', required: false }
      ]
    },
    stc_pay: {
      label: t('paymentMethods.types.stcPay'),
      icon: Smartphone,
      color: 'bg-purple-100 text-purple-800',
      fields: [
        { name: 'phoneNumber', label: t('paymentMethods.fields.phoneNumber'), type: 'tel', required: true },
        { name: 'accountHolder', label: t('paymentMethods.fields.accountName'), type: 'text', required: true }
      ]
    },
    paypal: {
      label: t('paymentMethods.types.paypal'),
      icon: CreditCard,
      color: 'bg-indigo-100 text-indigo-800',
      fields: [
        { name: 'paypalEmail', label: t('paymentMethods.fields.paypalEmail'), type: 'email', required: true }
      ]
    },
    wise: {
      label: t('paymentMethods.types.wise'),
      icon: Globe,
      color: 'bg-green-100 text-green-800',
      fields: [
        { name: 'wiseEmail', label: t('paymentMethods.fields.wiseEmail'), type: 'email', required: true },
        { 
          name: 'preferredCurrency', 
          label: t('paymentMethods.fields.preferredCurrency'), 
          type: 'select', 
          options: ['SAR', 'USD', 'EUR', 'GBP', 'AED'], 
          required: true 
        }
      ]
    }
  };

  // Fetch payment methods
  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['/api/seller/payment-methods'],
    enabled: true,
  });

  // Form setup
  const form = useForm({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: '',
      name: '',
      bankName: '',
      iban: '',
      accountNumber: '',
      accountHolder: '',
      phoneNumber: '',
      paypalEmail: '',
      wiseEmail: '',
      preferredCurrency: 'SAR',
      instructions: '',
    },
  });

  // Add/Edit payment method mutation
  const savePaymentMethod = useMutation({
    mutationFn: async (data: any) => {
      const method = editingMethod ? 'PATCH' : 'POST';
      const url = editingMethod 
        ? `/api/seller/payment-methods/${editingMethod.id}`
        : '/api/seller/payment-methods';
      
      const details: Record<string, any> = {};
      
      // Map form fields to details object based on payment type
      const methodType = paymentMethodTypes[data.type as keyof typeof paymentMethodTypes];
      methodType.fields.forEach(field => {
        if (data[field.name]) {
          details[field.name] = data[field.name];
        }
      });

      return apiRequest(url, {
        method,
        body: {
          type: data.type,
          name: data.name,
          details,
          instructions: data.instructions,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/payment-methods'] });
      setIsDialogOpen(false);
      setEditingMethod(null);
      setSelectedMethodType('');
      form.reset();
      toast({
        title: t('paymentMethods.success'),
        description: t('paymentMethods.methodSaved'),
      });
    },
    onError: (error) => {
      toast({
        title: t('paymentMethods.error'),
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
        title: t('paymentMethods.success'),
        description: t('paymentMethods.methodDeleted'),
      });
    },
    onError: (error) => {
      toast({
        title: t('paymentMethods.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set default payment method mutation
  const setDefaultMethod = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/seller/payment-methods/${id}/set-default`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/payment-methods'] });
      toast({
        title: t('paymentMethods.success'),
        description: t('paymentMethods.defaultSet'),
      });
    },
  });

  const openAddDialog = () => {
    setEditingMethod(null);
    setSelectedMethodType('');
    form.reset();
    setIsDialogOpen(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setSelectedMethodType(method.type);
    
    // Populate form with existing method data
    const formData: any = {
      type: method.type,
      name: method.name,
      instructions: method.instructions || '',
    };

    // Map details back to form fields
    Object.keys(method.details).forEach(key => {
      formData[key] = method.details[key];
    });

    form.reset(formData);
    setIsDialogOpen(true);
  };

  const handleTypeChange = (type: string) => {
    setSelectedMethodType(type);
    form.setValue('type', type);
    
    // Set a default name based on type
    const defaultName = paymentMethodTypes[type as keyof typeof paymentMethodTypes]?.label || '';
    form.setValue('name', defaultName);
  };

  const onSubmit = (data: any) => {
    savePaymentMethod.mutate(data);
  };

  const getMethodIcon = (type: string) => {
    const methodType = paymentMethodTypes[type as keyof typeof paymentMethodTypes];
    if (!methodType) return CreditCard;
    return methodType.icon;
  };

  const getMethodColor = (type: string) => {
    const methodType = paymentMethodTypes[type as keyof typeof paymentMethodTypes];
    return methodType?.color || 'bg-gray-100 text-gray-800';
  };

  const renderFormFields = () => {
    if (!selectedMethodType) return null;

    const methodType = paymentMethodTypes[selectedMethodType as keyof typeof paymentMethodTypes];
    if (!methodType) return null;

    return methodType.fields.map((field) => (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as any}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label} {field.required && '*'}</FormLabel>
            <FormControl>
              {field.type === 'select' ? (
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={`${t('common.select')} ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  placeholder={`${t('common.enter')} ${field.label.toLowerCase()}`}
                  {...formField}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t('paymentMethods.title')}</h3>
          <p className="text-sm text-gray-600">{t('paymentMethods.description')}</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          {t('paymentMethods.addMethod')}
        </Button>
      </div>

      {(!paymentMethods || paymentMethods.length === 0) ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">{t('paymentMethods.noMethods')}</h4>
            <p className="text-sm mb-4">{t('paymentMethods.noMethodsDescription')}</p>
            <Button onClick={openAddDialog}>
              {t('paymentMethods.addFirstMethod')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method: PaymentMethod) => {
            const IconComponent = getMethodIcon(method.type);
            
            return (
              <Card key={method.id} className={`relative ${method.isDefault ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getMethodColor(method.type)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{method.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {paymentMethodTypes[method.type as keyof typeof paymentMethodTypes]?.label}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <Badge variant="default" className="text-xs">
                          {t('paymentMethods.default')}
                        </Badge>
                      )}
                      {method.verified && (
                        <Badge variant="secondary" className="text-xs">
                          {t('paymentMethods.verified')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    {method.details.bankName && (
                      <div>{t('paymentMethods.fields.bankName')}: {method.details.bankName}</div>
                    )}
                    {method.details.iban && (
                      <div>{t('paymentMethods.fields.iban')}: ****{method.details.iban.slice(-4)}</div>
                    )}
                    {method.details.paypalEmail && (
                      <div>{t('paymentMethods.fields.paypalEmail')}: {method.details.paypalEmail}</div>
                    )}
                    {method.details.phoneNumber && (
                      <div>{t('paymentMethods.fields.phoneNumber')}: {method.details.phoneNumber}</div>
                    )}
                    {method.instructions && (
                      <div className="text-xs bg-gray-50 p-2 rounded">
                        {method.instructions}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs text-gray-500">
                      {t('common.added')} {new Date(method.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDefaultMethod.mutate(method.id)}
                        >
                          {t('paymentMethods.setDefault')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(method)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePaymentMethod.mutate(method.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? t('paymentMethods.editMethod') : t('paymentMethods.addMethod')}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Payment Method Type Selection */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentMethods.selectType')}</FormLabel>
                    <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('paymentMethods.chooseType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(paymentMethodTypes).map(([key, type]) => {
                          const IconComponent = type.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Method Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentMethods.methodName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('paymentMethods.methodNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dynamic Fields Based on Type */}
              {renderFormFields()}

              {/* Instructions */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('paymentMethods.paymentInstructions')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('paymentMethods.instructionsPlaceholder')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={savePaymentMethod.isPending}>
                  {savePaymentMethod.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}