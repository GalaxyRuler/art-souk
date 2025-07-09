import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  TrendingUp, 
  Eye, 
  Users, 
  Search, 
  Heart, 
  MessageSquare,
  Calendar,
  DollarSign
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";

export default function Analytics() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [dateRange, setDateRange] = useState({ start: 30, end: 0 }); // days ago

  // Get artist profile if user is an artist
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
    enabled: !!user && user.role === "artist",
  });

  const userArtist = artists?.find((artist: any) => artist.userId === user?.id);

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: [`/api/analytics/artist/${userArtist?.id}`, dateRange],
    enabled: !!userArtist?.id,
  });

  const { data: searchHistory } = useQuery({
    queryKey: ["/api/analytics/search-history"],
    enabled: !!user,
  });

  const { data: preferences } = useQuery({
    queryKey: ["/api/preferences"],
    enabled: !!user,
  });

  // Mock data for charts (in real app, this would come from analytics)
  const viewsData = analytics?.map((day: any) => ({
    date: format(new Date(day.date), "MMM dd"),
    views: day.artworkViews,
    profileViews: day.profileViews,
  })) || [];

  const engagementData = analytics?.map((day: any) => ({
    date: format(new Date(day.date), "MMM dd"),
    inquiries: day.inquiries,
    followers: day.followers,
  })) || [];

  const topSearchTerms = searchHistory?.reduce((acc: any, search: any) => {
    acc[search.query] = (acc[search.query] || 0) + 1;
    return acc;
  }, {}) || {};

  const sortedSearchTerms = Object.entries(topSearchTerms)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-navy to-brand-steel bg-clip-text text-transparent">
            {t("analytics.title", "Analytics & Insights")}
          </h1>
          <p className="text-gray-600">
            {t("analytics.subtitle", "Track your performance and understand your audience")}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("analytics.totalViews", "Total Views")}
              </CardTitle>
              <Eye className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {analytics?.reduce((sum: number, day: any) => sum + day.artworkViews, 0) || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+12%</span> {t("analytics.fromLastMonth", "from last month")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("analytics.followers", "Followers")}
              </CardTitle>
              <Users className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {analytics?.[0]?.followers || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+5</span> {t("analytics.thisWeek", "this week")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("analytics.inquiries", "Inquiries")}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {analytics?.reduce((sum: number, day: any) => sum + day.inquiries, 0) || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+3</span> {t("analytics.new", "new")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("analytics.sales", "Total Sales")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {language === "ar" ? "ر.س" : "SAR"} {analytics?.[0]?.totalSales || "0"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("analytics.thisMonth", "This month")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="views" className="space-y-4">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-gray-200/50">
            <TabsTrigger value="views" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">
              {t("analytics.views", "Views")}
            </TabsTrigger>
            <TabsTrigger value="engagement" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">
              {t("analytics.engagement", "Engagement")}
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-brand-navy data-[state=active]:text-white">
              {t("analytics.search", "Search Insights")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>{t("analytics.viewsOverTime", "Views Over Time")}</CardTitle>
                <CardDescription>
                  {t("analytics.viewsDescription", "Track how many people are viewing your artworks and profile")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#1e40af" 
                        strokeWidth={2}
                        name={t("analytics.artworkViews", "Artwork Views")}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profileViews" 
                        stroke="#60a5fa" 
                        strokeWidth={2}
                        name={t("analytics.profileViews", "Profile Views")}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>{t("analytics.engagementMetrics", "Engagement Metrics")}</CardTitle>
                <CardDescription>
                  {t("analytics.engagementDescription", "Monitor inquiries and follower growth")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="inquiries" 
                        fill="#1e40af"
                        name={t("analytics.inquiries", "Inquiries")}
                      />
                      <Bar 
                        dataKey="followers" 
                        fill="#60a5fa"
                        name={t("analytics.newFollowers", "New Followers")}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>{t("analytics.searchInsights", "Search Insights")}</CardTitle>
                <CardDescription>
                  {t("analytics.searchDescription", "Popular search terms leading to your profile")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedSearchTerms.map(([term, count]: any, index) => (
                    <div key={term} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="font-medium">{term}</span>
                      </div>
                      <span className="text-sm text-gray-600">{count} searches</span>
                    </div>
                  ))}
                  {sortedSearchTerms.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      {t("analytics.noSearchData", "No search data available yet")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>{t("analytics.audiencePreferences", "Audience Preferences")}</CardTitle>
                <CardDescription>
                  {t("analytics.preferencesDescription", "What your audience is interested in")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">{t("analytics.topCategories", "Top Categories")}</h4>
                    <div className="space-y-2">
                      {preferences?.preferredCategories?.slice(0, 5).map((cat: string) => (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-sm">{cat}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-brand-navy h-2 rounded-full" style={{ width: "70%" }} />
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">{t("analytics.noData", "No data available")}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t("analytics.topStyles", "Top Styles")}</h4>
                    <div className="space-y-2">
                      {preferences?.preferredStyles?.slice(0, 5).map((style: string) => (
                        <div key={style} className="flex items-center justify-between">
                          <span className="text-sm">{style}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-brand-steel h-2 rounded-full" style={{ width: "60%" }} />
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">{t("analytics.noData", "No data available")}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}