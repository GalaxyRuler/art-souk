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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

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
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

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
              <TabsTrigger value="purchases" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t("collector.tabs.purchases", "Purchase History")}
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
                                  <span className="text-gray-500">
                                    {language === "ar" ? "ر.س" : "SAR"} {parseFloat(order.totalAmount).toLocaleString()}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {order.status === "pending" && (
                                  <p className="text-xs text-gray-500">
                                    {t("collector.pendingPayment", "Awaiting payment arrangement")}
                                  </p>
                                )}
                                <Dialog modal={true}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {t("collector.viewDetails", "View Details")}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {t("collector.order.details", "Order Details")}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      {/* Order Info */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-600 mb-1">
                                            {t("collector.order.number", "Order #")}
                                          </h4>
                                          <p className="font-mono text-sm">{order.orderNumber}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-600 mb-1">
                                            {t("collector.order.date", "Order Date")}
                                          </h4>
                                          <p className="text-sm">{format(new Date(order.createdAt), "MMM dd, yyyy")}</p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-600 mb-1">
                                            {t("collector.order.status", "Status")}
                                          </h4>
                                          <Badge className={cn("flex items-center gap-1 w-fit", getStatusColor(order.status))}>
                                            {getStatusIcon(order.status)}
                                            {t(`collector.status.${order.status}`, order.status)}
                                          </Badge>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-sm text-gray-600 mb-1">
                                            {t("collector.order.total", "Total Amount")}
                                          </h4>
                                          <p className="text-sm font-semibold">
                                            {language === "ar" ? "ر.س" : "SAR"} {parseFloat(order.totalAmount).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Artwork Info */}
                                      <div className="border-t pt-4">
                                        <h4 className="font-semibold text-sm text-gray-600 mb-3">
                                          {t("collector.order.artwork", "Artwork Details")}
                                        </h4>
                                        <div className="flex gap-4">
                                          {order.artwork.images?.[0] && (
                                            <img
                                              src={order.artwork.images[0]}
                                              alt={isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                                              className="w-20 h-20 object-cover rounded-lg"
                                            />
                                          )}
                                          <div>
                                            <h5 className="font-semibold">
                                              {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                                            </h5>
                                            <p className="text-sm text-gray-600">
                                              {t("common.by")} {isRTL ? order.artwork.artist.nameAr || order.artwork.artist.name : order.artwork.artist.name}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Shipping Info */}
                                      {order.shippingTracking && (
                                        <div className="border-t pt-4">
                                          <h4 className="font-semibold text-sm text-gray-600 mb-3">
                                            {t("collector.order.shipping", "Shipping Information")}
                                          </h4>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <h5 className="font-semibold text-sm text-gray-600 mb-1">
                                                {t("collector.tracking.number", "Tracking #")}
                                              </h5>
                                              <p className="font-mono text-sm">{order.shippingTracking.trackingNumber}</p>
                                            </div>
                                            <div>
                                              <h5 className="font-semibold text-sm text-gray-600 mb-1">
                                                {t("collector.tracking.carrier", "Carrier")}
                                              </h5>
                                              <p className="text-sm">{order.shippingTracking.carrier}</p>
                                            </div>
                                            {order.shippingTracking.estimatedDelivery && (
                                              <div>
                                                <h5 className="font-semibold text-sm text-gray-600 mb-1">
                                                  {t("collector.tracking.estimated", "Estimated Delivery")}
                                                </h5>
                                                <p className="text-sm">{format(new Date(order.shippingTracking.estimatedDelivery), "MMM dd, yyyy")}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Payment Info */}
                                      <div className="border-t pt-4">
                                        <h4 className="font-semibold text-sm text-gray-600 mb-3">
                                          {t("collector.order.payment", "Payment Information")}
                                        </h4>
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                          <p className="text-sm text-blue-700">
                                            {t("collector.purchases.note", "All payments are handled directly between you and the artist/gallery")}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
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
                    <Button 
                      className="bg-brand-navy hover:bg-brand-steel"
                      onClick={() => setLocation("/artworks")}
                    >
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
                                {language === "ar" ? "ر.س" : "SAR"} {parseFloat(item.artwork.price).toLocaleString()}
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

            {/* Purchase History Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {t("collector.purchases.note", "All payments are handled directly between you and the artist/gallery")}
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
                  {orders.filter(o => o.status === 'delivered' || o.paymentStatus === 'completed').map((order) => (
                    <Card key={order.id} className="bg-white/70 backdrop-blur-sm border-gray-200/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                            </CardTitle>
                            <CardDescription>
                              {t("collector.purchases.purchased", "Purchased on")} {format(new Date(order.createdAt), "MMM dd, yyyy")}
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {t("collector.purchases.completed", "Completed")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">
                              {t("collector.purchases.orderNumber", "Order Number")}
                            </span>
                            <p className="font-medium font-mono">{order.orderNumber}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              {t("collector.purchases.amount", "Amount")}
                            </span>
                            <p className="font-medium">
                              {language === "ar" ? "ر.س" : "SAR"} {parseFloat(order.totalAmount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            {t("collector.purchases.paymentNote", "Payment was arranged directly with the seller")}
                          </p>
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
                      {t("collector.purchases.noPurchases", "No completed purchases yet")}
                    </h3>
                    <p className="text-gray-600">
                      {t("collector.purchases.startBuying", "Your completed purchases will appear here")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}