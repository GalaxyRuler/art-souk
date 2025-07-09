import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Package, 
  Truck, 
  CreditCard, 
  Heart, 
  Bell, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PurchaseOrder {
  id: number;
  orderNumber: string;
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    images: string[];
    artist: {
      name: string;
      nameAr?: string;
    };
  };
  status: string;
  totalAmount: string;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  shippingTracking?: {
    trackingNumber?: string;
    carrier?: string;
    status?: string;
    estimatedDelivery?: string;
  };
  installmentPlan?: {
    totalAmount: string;
    completedInstallments: number;
    numberOfInstallments: number;
    nextPaymentDate?: string;
    installmentAmount: string;
  };
}

interface WishlistItem {
  id: number;
  artwork: {
    id: number;
    title: string;
    titleAr?: string;
    images: string[];
    price: string;
    currency: string;
    artist: {
      name: string;
      nameAr?: string;
    };
  };
  priority: number;
  priceAtTimeOfAdding: string;
  notifyOnPriceChange: boolean;
}

export default function CollectorDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: orders, isLoading: ordersLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/collector/orders"],
    enabled: !!user,
  });

  const { data: wishlist, isLoading: wishlistLoading } = useQuery<WishlistItem[]>({
    queryKey: ["/api/collector/wishlist"],
    enabled: !!user,
  });

  const { data: priceAlerts } = useQuery({
    queryKey: ["/api/collector/price-alerts"],
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-navy to-brand-steel bg-clip-text text-transparent">
              {t("collector.dashboard.title", "Collector Dashboard")}
            </h1>
            <p className="text-gray-600">
              {t("collector.dashboard.subtitle", "Manage your art collection and orders")}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("collector.stats.totalOrders", "Total Orders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-navy">
                  {orders?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("collector.stats.inTransit", "In Transit")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-navy">
                  {orders?.filter(o => o.status === "shipped").length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("collector.stats.wishlist", "Wishlist Items")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-navy">
                  {wishlist?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t("collector.stats.activeAlerts", "Active Alerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-brand-navy">
                  {priceAlerts?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t("collector.tabs.orders", "Orders")}
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {t("collector.tabs.tracking", "Tracking")}
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {t("collector.tabs.wishlist", "Wishlist")}
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t("collector.tabs.payments", "Payments")}
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
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
                  {orders.map((order) => (
                    <Card key={order.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {order.artwork.images?.[0] && (
                            <img
                              src={order.artwork.images[0]}
                              alt={isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {t("by")} {isRTL ? order.artwork.artist.nameAr || order.artwork.artist.name : order.artwork.artist.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {t("collector.order.number", "Order #")}{order.orderNumber}
                                </p>
                              </div>
                              <Badge className={cn("flex items-center gap-1", getStatusColor(order.status))}>
                                {getStatusIcon(order.status)}
                                {t(`collector.status.${order.status}`, order.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-gray-500" />
                                  {language === "ar" ? "ر.س" : order.currency} {parseFloat(order.totalAmount).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                </span>
                              </div>
                              <Button variant="outline" size="sm">
                                {t("collector.viewDetails", "View Details")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t("collector.noOrders", "No orders yet")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("collector.startCollecting", "Start building your collection")}
                    </p>
                    <Button className="bg-brand-navy hover:bg-brand-steel">
                      {t("collector.browseArtworks", "Browse Artworks")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-4">
              {orders?.filter(o => o.status === "shipped" || o.status === "delivered").map((order) => (
                <Card key={order.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                    </CardTitle>
                    <CardDescription>
                      {order.shippingTracking?.trackingNumber && (
                        <span className="font-mono">
                          {t("collector.tracking.number", "Tracking #")}{order.shippingTracking.trackingNumber}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {t("collector.tracking.carrier", "Carrier")}
                        </span>
                        <span className="font-medium">
                          {order.shippingTracking?.carrier || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {t("collector.tracking.status", "Status")}
                        </span>
                        <Badge className={getStatusColor(order.shippingTracking?.status || order.status)}>
                          {t(`collector.status.${order.shippingTracking?.status || order.status}`, order.shippingTracking?.status || order.status)}
                        </Badge>
                      </div>
                      {order.shippingTracking?.estimatedDelivery && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {t("collector.tracking.estimated", "Estimated Delivery")}
                          </span>
                          <span className="font-medium">
                            {format(new Date(order.shippingTracking.estimatedDelivery), "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}
                      <Button variant="outline" className="w-full">
                        {t("collector.tracking.viewFull", "View Full Tracking")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-4">
              {wishlistLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-48"></CardContent>
                    </Card>
                  ))}
                </div>
              ) : wishlist && wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {item.artwork.images?.[0] && (
                            <img
                              src={item.artwork.images[0]}
                              alt={isRTL ? item.artwork.titleAr || item.artwork.title : item.artwork.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">
                              {isRTL ? item.artwork.titleAr || item.artwork.title : item.artwork.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {isRTL ? item.artwork.artist.nameAr || item.artwork.artist.name : item.artwork.artist.name}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm font-medium">
                                {language === "ar" ? "ر.س" : item.artwork.currency} {parseFloat(item.artwork.price).toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i < item.priority ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            {item.notifyOnPriceChange && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <Bell className="h-3 w-3" />
                                {t("collector.wishlist.priceAlerts", "Price alerts enabled")}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                  <CardContent className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t("collector.noWishlist", "No items in wishlist")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("collector.saveForLater", "Save artworks you love for later")}
                    </p>
                    <Button className="bg-brand-navy hover:bg-brand-steel">
                      {t("collector.browseArtworks", "Browse Artworks")}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              {orders?.filter(o => o.installmentPlan).map((order) => (
                <Card key={order.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                    </CardTitle>
                    <CardDescription>
                      {t("collector.payment.installmentPlan", "Installment Plan")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            {t("collector.payment.progress", "Payment Progress")}
                          </span>
                          <span className="text-sm font-medium">
                            {order.installmentPlan?.completedInstallments} / {order.installmentPlan?.numberOfInstallments}
                          </span>
                        </div>
                        <Progress 
                          value={(order.installmentPlan?.completedInstallments! / order.installmentPlan?.numberOfInstallments!) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">
                            {t("collector.payment.totalAmount", "Total Amount")}
                          </span>
                          <p className="font-medium">
                            {language === "ar" ? "ر.س" : order.currency} {parseFloat(order.installmentPlan?.totalAmount!).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {t("collector.payment.installmentAmount", "Per Installment")}
                          </span>
                          <p className="font-medium">
                            {language === "ar" ? "ر.س" : order.currency} {parseFloat(order.installmentPlan?.installmentAmount!).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {order.installmentPlan?.nextPaymentDate && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {t("collector.payment.nextPayment", "Next payment due on")} {format(new Date(order.installmentPlan.nextPaymentDate), "MMM dd, yyyy")}
                          </p>
                        </div>
                      )}
                      <Button className="w-full bg-brand-navy hover:bg-brand-steel">
                        {t("collector.payment.makePayment", "Make Payment")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}