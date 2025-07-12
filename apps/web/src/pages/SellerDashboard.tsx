import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  details: string;
  instructions?: string;
  isDefault?: boolean;
}

interface SellerOrder {
  id: number;
  orderNumber: string;
  userId: string;
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    price: string;
    images: any[];
  };
  buyer: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  status: string;
  paymentStatus: string;
  totalAmount: string;
  currency: string;
  shippingAddress: any;
  paymentMethod?: string;
  sellerNotes?: string;
  paymentConfirmedAt?: string;
  createdAt: string;
  tracking?: {
    trackingNumber?: string;
    carrier?: string;
    status?: string;
  };
}

export default function SellerDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [paymentMethodDialog, setPaymentMethodDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const isRTL = i18n.language === "ar";

  // Fetch seller info (artist or gallery)
  const { data: sellerInfo } = useQuery({
    queryKey: [`/api/seller/info`],
    enabled: !!user,
  });

  // Fetch payment methods
  const { data: paymentMethods, isLoading: methodsLoading } = useQuery({
    queryKey: [`/api/seller/payment-methods`],
    enabled: !!user,
  });

  // Fetch seller orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/seller/orders`],
    enabled: !!user,
  });

  // Add/Update payment method mutation
  const savePaymentMethod = useMutation({
    mutationFn: async (method: Partial<PaymentMethod>) => {
      const endpoint = method.id 
        ? `/api/seller/payment-methods/${method.id}`
        : '/api/seller/payment-methods';
      const method_type = method.id ? 'PATCH' : 'POST';
      return apiRequest(endpoint, {
        method: method_type,
        body: JSON.stringify(method),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/seller/payment-methods`] });
      toast({
        title: t("seller.paymentMethod.saved", "Payment method saved"),
        description: t("seller.paymentMethod.savedDesc", "Your payment method has been saved successfully"),
      });
      setPaymentMethodDialog(false);
      setEditingMethod(null);
    },
  });

  // Delete payment method mutation
  const deletePaymentMethod = useMutation({
    mutationFn: async (methodId: string) => {
      return apiRequest(`/api/seller/payment-methods/${methodId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/seller/payment-methods`] });
      toast({
        title: t("seller.paymentMethod.deleted", "Payment method deleted"),
      });
    },
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, sellerNotes, trackingInfo }: any) => {
      return apiRequest(`/api/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, sellerNotes, trackingInfo }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/seller/orders`] });
      toast({
        title: t("seller.order.updated", "Order updated"),
        description: t("seller.order.updatedDesc", "Order status has been updated successfully"),
      });
      setSelectedOrder(null);
    },
  });

  const handlePaymentMethodSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const method = {
      id: editingMethod?.id,
      type: formData.get('type') as string,
      name: formData.get('name') as string,
      details: formData.get('details') as string,
      instructions: formData.get('instructions') as string,
    };
    savePaymentMethod.mutate(method);
  };

  const handleOrderUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    const formData = new FormData(e.currentTarget);
    updateOrderStatus.mutate({
      orderId: selectedOrder.id,
      status: formData.get('status') as string,
      sellerNotes: formData.get('sellerNotes') as string,
      trackingInfo: {
        trackingNumber: formData.get('trackingNumber') as string,
        carrier: formData.get('carrier') as string,
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t("seller.dashboard.title", "Seller Dashboard")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("seller.dashboard.subtitle", "Manage your orders and payment methods")}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/manage/workshops">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-navy/10 rounded-full">
                    <Users className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("seller.quickActions.workshops", "Manage Workshops")}</h3>
                    <p className="text-sm text-gray-600">{t("seller.quickActions.workshopsDesc", "Create and manage your workshops")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/manage/events">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-navy/10 rounded-full">
                    <Calendar className="h-6 w-6 text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t("seller.quickActions.events", "Manage Events")}</h3>
                    <p className="text-sm text-gray-600">{t("seller.quickActions.eventsDesc", "Create and manage your events")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("seller.tabs.orders", "Orders")}
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("seller.tabs.paymentMethods", "Payment Methods")}
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t("seller.orders.note", "Manage your orders and update their status once payment is received")}
              </p>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-32"></CardContent>
                  </Card>
                ))}
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: SellerOrder) => (
                  <Card key={order.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                          </CardTitle>
                          <CardDescription>
                            {t("seller.order.number", "Order")} #{order.orderNumber}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {t(`seller.status.${order.status}`, order.status)}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">
                            {t("seller.order.buyer", "Buyer")}
                          </span>
                          <p className="font-medium">
                            {order.buyer.firstName} {order.buyer.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {t("seller.order.amount", "Amount")}
                          </span>
                          <p className="font-medium">
                            {i18n.language === "ar" ? "ر.س" : order.currency} {parseFloat(order.totalAmount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {t("seller.order.date", "Order Date")}
                          </span>
                          <p className="font-medium">
                            {format(new Date(order.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {t("seller.order.paymentStatus", "Payment Status")}
                          </span>
                          <p className="font-medium">
                            {t(`seller.paymentStatus.${order.paymentStatus}`, order.paymentStatus)}
                          </p>
                        </div>
                      </div>

                      {order.tracking?.trackingNumber && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">{t("seller.order.tracking", "Tracking")}:</span>{" "}
                            {order.tracking.carrier} - {order.tracking.trackingNumber}
                          </p>
                        </div>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedOrder(order)}
                          >
                            {t("seller.order.updateStatus", "Update Order Status")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {t("seller.order.updateTitle", "Update Order")} #{order.orderNumber}
                            </DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleOrderUpdate} className="space-y-4">
                            <div>
                              <Label>{t("seller.order.status", "Order Status")}</Label>
                              <Select name="status" defaultValue={order.status}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">{t("seller.status.pending", "Pending")}</SelectItem>
                                  <SelectItem value="confirmed">{t("seller.status.confirmed", "Confirmed")}</SelectItem>
                                  <SelectItem value="processing">{t("seller.status.processing", "Processing")}</SelectItem>
                                  <SelectItem value="shipped">{t("seller.status.shipped", "Shipped")}</SelectItem>
                                  <SelectItem value="delivered">{t("seller.status.delivered", "Delivered")}</SelectItem>
                                  <SelectItem value="cancelled">{t("seller.status.cancelled", "Cancelled")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>{t("seller.order.trackingNumber", "Tracking Number")}</Label>
                              <Input 
                                name="trackingNumber" 
                                defaultValue={order.tracking?.trackingNumber}
                                placeholder={t("seller.order.trackingPlaceholder", "Enter tracking number")}
                              />
                            </div>

                            <div>
                              <Label>{t("seller.order.carrier", "Shipping Carrier")}</Label>
                              <Input 
                                name="carrier" 
                                defaultValue={order.tracking?.carrier}
                                placeholder={t("seller.order.carrierPlaceholder", "e.g., DHL, Aramex")}
                              />
                            </div>

                            <div>
                              <Label>{t("seller.order.notes", "Notes for Buyer")}</Label>
                              <Textarea 
                                name="sellerNotes"
                                defaultValue={order.sellerNotes}
                                placeholder={t("seller.order.notesPlaceholder", "Add any notes about the order")}
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button type="submit" className="flex-1 bg-brand-navy hover:bg-brand-steel">
                                {t("seller.order.save", "Save Changes")}
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setSelectedOrder(null)}
                              >
                                {t("common.cancel", "Cancel")}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t("seller.orders.noOrders", "No orders yet")}
                  </h3>
                  <p className="text-gray-600">
                    {t("seller.orders.noOrdersDesc", "Orders will appear here when collectors purchase your artworks")}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {t("seller.paymentMethods.note", "Add payment methods for collectors to pay you directly")}
              </p>
              <Dialog open={paymentMethodDialog} onOpenChange={setPaymentMethodDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-brand-navy hover:bg-brand-steel"
                    onClick={() => setEditingMethod(null)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("seller.paymentMethod.add", "Add Method")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingMethod 
                        ? t("seller.paymentMethod.edit", "Edit Payment Method")
                        : t("seller.paymentMethod.add", "Add Payment Method")
                      }
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePaymentMethodSubmit} className="space-y-4">
                    <div>
                      <Label>{t("seller.paymentMethod.type", "Payment Type")}</Label>
                      <Select name="type" defaultValue={editingMethod?.type || "bank_transfer"}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">{t("seller.paymentType.bank", "Bank Transfer")}</SelectItem>
                          <SelectItem value="paypal">{t("seller.paymentType.paypal", "PayPal")}</SelectItem>
                          <SelectItem value="stc_pay">{t("seller.paymentType.stc", "STC Pay")}</SelectItem>
                          <SelectItem value="apple_pay">{t("seller.paymentType.apple", "Apple Pay")}</SelectItem>
                          <SelectItem value="cash">{t("seller.paymentType.cash", "Cash")}</SelectItem>
                          <SelectItem value="other">{t("seller.paymentType.other", "Other")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t("seller.paymentMethod.name", "Method Name")}</Label>
                      <Input 
                        name="name" 
                        defaultValue={editingMethod?.name}
                        placeholder={t("seller.paymentMethod.namePlaceholder", "e.g., My Bank Account")}
                        required
                      />
                    </div>

                    <div>
                      <Label>{t("seller.paymentMethod.details", "Account Details")}</Label>
                      <Textarea 
                        name="details"
                        defaultValue={editingMethod?.details}
                        placeholder={t("seller.paymentMethod.detailsPlaceholder", "IBAN, account number, email, etc.")}
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label>{t("seller.paymentMethod.instructions", "Payment Instructions (Optional)")}</Label>
                      <Textarea 
                        name="instructions"
                        defaultValue={editingMethod?.instructions}
                        placeholder={t("seller.paymentMethod.instructionsPlaceholder", "Any special instructions for buyers")}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-brand-navy hover:bg-brand-steel">
                        {editingMethod ? t("common.save", "Save") : t("common.add", "Add")}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setPaymentMethodDialog(false);
                          setEditingMethod(null);
                        }}
                      >
                        {t("common.cancel", "Cancel")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {methodsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-24"></CardContent>
                  </Card>
                ))}
              </div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method: PaymentMethod) => (
                  <Card key={method.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{method.name}</h3>
                            <Badge variant="outline">
                              {t(`seller.paymentType.${method.type}`, method.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {method.details}
                          </p>
                          {method.instructions && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {method.instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingMethod(method);
                              setPaymentMethodDialog(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deletePaymentMethod.mutate(method.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                <CardContent className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {t("seller.paymentMethods.noMethods", "No payment methods added")}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t("seller.paymentMethods.noMethodsDesc", "Add payment methods so collectors can pay you directly")}
                  </p>
                  <Button 
                    className="bg-brand-navy hover:bg-brand-steel"
                    onClick={() => {
                      setEditingMethod(null);
                      setPaymentMethodDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("seller.paymentMethod.addFirst", "Add Your First Payment Method")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}