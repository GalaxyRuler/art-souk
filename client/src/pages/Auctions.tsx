import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Clock, Users, TrendingUp, Calendar } from "lucide-react";

export default function Auctions() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("live");

  const { data: liveAuctions = [], isLoading: loadingLive } = useQuery({
    queryKey: ["/api/auctions/live"],
  });

  const { data: upcomingAuctions = [], isLoading: loadingUpcoming } = useQuery({
    queryKey: ["/api/auctions/upcoming"],
  });

  const { data: allAuctions = [], isLoading: loadingAll } = useQuery({
    queryKey: ["/api/auctions"],
  });

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return t("auctions.ended");

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return t("auctions.timeRemaining.days", { count: days });
    if (hours > 0) return t("auctions.timeRemaining.hours", { count: hours });
    if (minutes > 0) return t("auctions.timeRemaining.minutes", { count: minutes });
    return t("auctions.endingSoon");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive" className="animate-pulse">{t("auctions.live")}</Badge>;
      case "upcoming":
        return <Badge variant="secondary">{t("auctions.upcoming")}</Badge>;
      case "ended":
        return <Badge variant="outline">{t("auctions.ended")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const AuctionCard = ({ auction }: { auction: any }) => {
    const title = isRTL && auction.titleAr ? auction.titleAr : auction.title;
    const description = isRTL && auction.descriptionAr ? auction.descriptionAr : auction.description;

    return (
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
        <Link href={`/auctions/${auction.id}`}>
          <div className="relative">
            <img
              src={auction.artwork?.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"}
              alt={title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-3 left-3">
                {getStatusBadge(auction.status)}
              </div>
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                  {auction.bidCount} {t("auctions.bids")}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-2 line-clamp-1">{title}</h3>
            
            {description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("auctions.currentBid")}:</span>
                <span className="text-lg font-bold text-primary">
                  {auction.currency} {auction.currentBid || auction.startingPrice}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("auctions.timeRemaining")}:</span>
                <span className="text-sm font-medium text-red-600">
                  {getTimeRemaining(auction.endDate)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{auction.bidCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{auction.status}</span>
                </div>
              </div>
            </div>

            {isAuthenticated && auction.status === "live" && (
              <Button className="w-full mt-4" size="sm">
                {t("auctions.placeBid")}
              </Button>
            )}
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-white py-16 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("text-center", isRTL && "text-right")}>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                {t("auctions.title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("auctions.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-primary">{liveAuctions.length}</div>
                <div className="text-sm text-gray-600">{t("auctions.stats.live")}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-primary">{upcomingAuctions.length}</div>
                <div className="text-sm text-gray-600">{t("auctions.stats.upcoming")}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {allAuctions.reduce((total: number, auction: any) => total + (auction.bidCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">{t("auctions.stats.totalBids")}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-primary">{allAuctions.length}</div>
                <div className="text-sm text-gray-600">{t("auctions.stats.total")}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Auctions Tabs */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className={cn("grid w-full grid-cols-3", isRTL && "grid-flow-row-dense")}>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {t("auctions.tabs.live")}
                </TabsTrigger>
                <TabsTrigger value="upcoming">{t("auctions.tabs.upcoming")}</TabsTrigger>
                <TabsTrigger value="all">{t("auctions.tabs.all")}</TabsTrigger>
              </TabsList>

              {/* Live Auctions */}
              <TabsContent value="live" className="mt-8">
                {loadingLive ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : liveAuctions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveAuctions.map((auction: any) => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("auctions.noLive.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("auctions.noLive.description")}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Upcoming Auctions */}
              <TabsContent value="upcoming" className="mt-8">
                {loadingUpcoming ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingAuctions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingAuctions.map((auction: any) => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("auctions.noUpcoming.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("auctions.noUpcoming.description")}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* All Auctions */}
              <TabsContent value="all" className="mt-8">
                {loadingAll ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allAuctions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allAuctions.map((auction: any) => (
                      <AuctionCard key={auction.id} auction={auction} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("auctions.noAuctions.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("auctions.noAuctions.description")}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
