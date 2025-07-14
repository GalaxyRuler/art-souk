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
  Calendar,
  User,
  Tag,
  Image,
  Info,
  Eye,
  ExternalLink
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
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-purple-50">
                                    <DialogHeader className="pb-6 border-b-2 border-blue-200 bg-white rounded-t-lg -m-6 mb-4 p-6">
                                      <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                                        <Package className="h-6 w-6 text-blue-600" />
                                        {t("collector.order.details", "Order Details")}
                                      </DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6 py-4">
                                      {/* Order Summary Card */}
                                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-brand-navy mb-1">
                                              #{order.orderNumber.replace('ORD-', '')}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                              {t("collector.order.number", "Order #")}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-brand-navy mb-1">
                                              {format(new Date(order.createdAt), "MMM dd")}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                              {t("collector.order.date", "Order Date")}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <Badge className={cn("flex items-center gap-1 w-fit mx-auto text-xs px-3 py-1", getStatusColor(order.status))}>
                                              {getStatusIcon(order.status)}
                                              {t(`collector.status.${order.status}`, order.status)}
                                            </Badge>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                                              {t("collector.order.status", "Status")}
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-2xl font-bold text-brand-gold mb-1">
                                              {language === "ar" ? "ر.س" : "SAR"} {parseFloat(order.totalAmount).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                                              {t("collector.order.total", "Total Amount")}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Artwork Details Card */}
                                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200 shadow-lg">
                                        <div className="flex items-center gap-2 mb-4">
                                          <Image className="h-6 w-6 text-green-600" />
                                          <h4 className="font-bold text-xl text-green-800">
                                            {t("collector.order.artwork", "Artwork Details")}
                                          </h4>
                                        </div>
                                        <div className="flex gap-6">
                                          <div 
                                            className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => setLocation(`/artwork/${order.artwork.id}`)}
                                          >
                                            {order.artwork.images?.[0] ? (
                                              <img
                                                src={order.artwork.images[0]}
                                                alt={isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                              />
                                            ) : (
                                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Image className="h-8 w-8 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1">
                                            <h5 
                                              className="font-bold text-lg text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                                              onClick={() => setLocation(`/artwork/${order.artwork.id}`)}
                                            >
                                              {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                                            </h5>
                                            <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                                              <User className="h-4 w-4" />
                                              {t("common.by")} {isRTL ? order.artwork.artist.nameAr || order.artwork.artist.name : order.artwork.artist.name}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                              <span className="flex items-center gap-1">
                                                <Tag className="h-4 w-4" />
                                                Original Artwork
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {format(new Date(order.createdAt), "yyyy")}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Shipping Information Card */}
                                      {order.shippingTracking && (
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200 shadow-lg">
                                          <div className="flex items-center gap-2 mb-4">
                                            <Truck className="h-6 w-6 text-orange-600" />
                                            <h4 className="font-bold text-xl text-orange-800">
                                              {t("collector.order.shipping", "Shipping Information")}
                                            </h4>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                {t("collector.tracking.number", "Tracking #")}
                                              </div>
                                              <p className="text-sm font-mono font-semibold text-gray-900">{order.shippingTracking.trackingNumber}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                {t("collector.tracking.carrier", "Carrier")}
                                              </div>
                                              <p className="text-sm font-semibold text-gray-900">{order.shippingTracking.carrier}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                                {t("collector.tracking.estimated", "Estimated Delivery")}
                                              </div>
                                              <p className="text-sm font-semibold text-gray-900">
                                                {order.shippingTracking.estimatedDelivery 
                                                  ? format(new Date(order.shippingTracking.estimatedDelivery), "MMM dd, yyyy")
                                                  : t("collector.order.tbd", "TBD")
                                                }
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Payment Information Card */}
                                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-lg">
                                        <div className="flex items-center gap-2 mb-4">
                                          <CreditCard className="h-6 w-6 text-purple-600" />
                                          <h4 className="font-bold text-xl text-purple-800">
                                            {t("collector.order.payment", "Payment Information")}
                                          </h4>
                                        </div>
                                        <div className="bg-gradient-to-r from-blue-50 to-brand-gold/10 p-4 rounded-lg border border-blue-100">
                                          <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-sm font-medium text-blue-900 mb-1">
                                                Direct Payment Model
                                              </p>
                                              <p className="text-sm text-blue-700">
                                                {t("collector.purchases.note", "All payments are handled directly between you and the artist/gallery")}
                                              </p>
                                            </div>
                                          </div>
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
            <TabsContent value="tracking" className="space-y-6">
              {orders?.filter(o => o.status === "shipped" || o.status === "delivered" || o.shippingTracking?.status).length > 0 ? (
                orders?.filter(o => o.status === "shipped" || o.status === "delivered" || o.shippingTracking?.status).map((order) => (
                  <Card key={order.id} className="bg-gradient-to-r from-cyan-100 to-blue-100 border-4 border-cyan-300 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        {/* Artwork Image */}
                        <div 
                          className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => setLocation(`/artwork/${order.artwork.id}`)}
                        >
                          {order.artwork.images?.[0] ? (
                            <img
                              src={order.artwork.images[0]}
                              alt={isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Artwork Details */}
                        <div className="flex-1">
                          <CardTitle 
                            className="text-lg text-teal-800 cursor-pointer hover:text-teal-600 transition-colors"
                            onClick={() => setLocation(`/artwork/${order.artwork.id}`)}
                          >
                            {isRTL ? order.artwork.titleAr || order.artwork.title : order.artwork.title}
                          </CardTitle>
                          <CardDescription className="text-teal-600 mt-1">
                            {order.shippingTracking?.trackingNumber && (
                              <span className="font-mono bg-teal-100 px-2 py-1 rounded text-sm">
                                <Truck className="inline h-3 w-3 mr-1" />
                                {t("collector.tracking.number", "Tracking #")}{order.shippingTracking.trackingNumber}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge className={cn(
                          "px-3 py-1 text-sm font-semibold",
                          order.shippingTracking?.status === "delivered" ? "bg-green-100 text-green-800 border-green-300" :
                          order.shippingTracking?.status === "shipped" ? "bg-blue-100 text-blue-800 border-blue-300" :
                          "bg-gray-100 text-gray-800 border-gray-300"
                        )}>
                          {t(`collector.status.${order.shippingTracking?.status || order.status}`, order.shippingTracking?.status || order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Shipping Progress */}
                      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-teal-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-5 w-5 text-teal-600" />
                          <h4 className="font-bold text-teal-800">
                            {t("collector.tracking.progress", "Shipping Progress")}
                          </h4>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                              {t("collector.tracking.ordered", "Ordered")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {t("collector.tracking.shipped", "Shipped")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {t("collector.tracking.delivered", "Delivered")}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                order.shippingTracking?.status === "delivered" ? "bg-green-500 w-full" :
                                order.shippingTracking?.status === "shipped" ? "bg-blue-500 w-2/3" :
                                "bg-gray-400 w-1/3"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Tracking Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">
                              {t("collector.tracking.carrier", "Carrier")}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-blue-900">
                            {order.shippingTracking?.carrier || "N/A"}
                          </p>
                        </div>
                        
                        {order.shippingTracking?.estimatedDelivery && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-semibold text-green-800">
                                {t("collector.tracking.estimated", "Estimated Delivery")}
                              </span>
                            </div>
                            <p className="text-lg font-bold text-green-900">
                              {format(new Date(order.shippingTracking.estimatedDelivery), "MMM dd, yyyy")}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 bg-gradient-to-r from-cyan-200 to-blue-200 border-2 border-cyan-400 hover:from-cyan-300 hover:to-blue-300 hover:border-cyan-500 transition-all duration-300 font-bold text-cyan-800 shadow-lg hover:shadow-xl"
                          onClick={() => {
                            console.log('🔍 Tracking button clicked!');
                            console.log('Order:', order);
                            console.log('Shipping tracking:', order.shippingTracking);
                            
                            if (order.shippingTracking?.trackingNumber && order.shippingTracking?.carrier) {
                              // Generate tracking URL based on carrier
                              const trackingNumber = order.shippingTracking.trackingNumber;
                              let trackingUrl = '';
                              
                              console.log('📦 Carrier:', order.shippingTracking.carrier);
                              console.log('🏷️ Tracking Number:', trackingNumber);
                              
                              switch (order.shippingTracking.carrier.toLowerCase()) {
                                case 'dhl':
                                  trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
                                  break;
                                case 'fedex':
                                  trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
                                  break;
                                case 'ups':
                                  trackingUrl = `https://www.ups.com/track?track=yes&trackNums=${trackingNumber}`;
                                  break;
                                case 'saudi post':
                                case 'saudipost':
                                  trackingUrl = `https://www.sp.com.sa/en/track?number=${trackingNumber}`;
                                  break;
                                case 'aramex':
                                  trackingUrl = `https://www.aramex.com/track/results?mode=0&ShipmentNumber=${trackingNumber}`;
                                  break;
                                default:
                                  // Generic tracking search
                                  trackingUrl = `https://www.google.com/search?q=${encodeURIComponent(order.shippingTracking.carrier + ' tracking ' + trackingNumber)}`;
                              }
                              
                              console.log('🌐 Opening URL:', trackingUrl);
                              window.open(trackingUrl, '_blank');
                            } else {
                              // Show notification if no tracking info available
                              console.log('❌ No tracking information available');
                              alert('No tracking information available for this order');
                            }
                          }}
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          {t("collector.tracking.viewFull", "View Full Tracking")}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="bg-white/50 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-colors"
                          onClick={() => setLocation(`/artwork/${order.artwork.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 shadow-lg">
                  <CardContent className="text-center py-16">
                    <div className="bg-white/50 backdrop-blur-sm rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Truck className="h-12 w-12 text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-teal-800 mb-3">
                      {t("collector.noTracking", "No shipments to track")}
                    </h3>
                    <p className="text-teal-600 mb-6 max-w-md mx-auto">
                      {t("collector.trackingDescription", "Your shipped orders will appear here with real-time tracking information")}
                    </p>
                    <Button 
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                      onClick={() => setLocation("/artworks")}
                    >
                      <Package className="h-5 w-5 mr-2" />
                      {t("collector.browseArtworks", "Browse Artworks")}
                    </Button>
                  </CardContent>
                </Card>
              )}
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