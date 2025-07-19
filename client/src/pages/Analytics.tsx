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
  const { language, isRTL } = useLanguage();
  const [dateRange, setDateRange] = useState({ start: 30, end: 0 }); // days ago

  // Translation function helper - temporary solution
  const getText = (key: string, fallback: string) => {
    try {
      // Try to get translation, fallback to English text
      return language === 'ar' ? getArabicText(key) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const getArabicText = (translationKey: string) => {
    const arabicTexts: Record<string, string> = {
      'analytics.title': 'التحليلات والرؤى',
      'analytics.subtitle': 'تتبع أداءك وافهم جمهورك',
      'analytics.totalViews': 'إجمالي المشاهدات',
      'analytics.fromLastMonth': 'من الشهر الماضي',
      'analytics.followers': 'المتابعون',
      'analytics.inquiries': 'الاستفسارات',
      'analytics.profileViews': 'مشاهدات الملف الشخصي',
      'analytics.engagement': 'التفاعل',
      'analytics.topSearchTerms': 'أهم مصطلحات البحث',
      'analytics.viewsOverTime': 'المشاهدات عبر الوقت',
      'analytics.engagementOverTime': 'التفاعل عبر الوقت',
      'analytics.noData': 'لا توجد بيانات متاحة',
      'analytics.thisWeek': 'هذا الأسبوع',
      'analytics.new': 'جديد',
      'analytics.sales': 'إجمالي المبيعات',
      'analytics.thisMonth': 'هذا الشهر',
      'analytics.views': 'المشاهدات',
      'analytics.search': 'رؤى البحث',
      'analytics.viewsDescription': 'تتبع عدد الأشخاص الذين يشاهدون أعمالك وملفك الشخصي',
      'analytics.artworkViews': 'مشاهدات الأعمال الفنية',
      'analytics.engagementMetrics': 'مقاييس التفاعل',
      'analytics.engagementDescription': 'مراقبة الاستفسارات ونمو المتابعين',
      'analytics.newFollowers': 'متابعون جدد',
      'analytics.searchInsights': 'رؤى البحث',
      'analytics.searchDescription': 'مصطلحات البحث الشائعة التي تؤدي إلى ملفك الشخصي',
      'analytics.noSearchData': 'لا توجد بيانات بحث متاحة حتى الآن',
      'analytics.audiencePreferences': 'تفضيلات الجمهور',
      'analytics.preferencesDescription': 'ما يهتم به جمهورك',
      'analytics.topCategories': 'الفئات الأكثر شيوعاً',
      'analytics.topStyles': 'الأساليب الأكثر شيوعاً'
    };
    return arabicTexts[translationKey] || translationKey;
  };

  // Get artist profile if user is an artist
  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
    enabled: !!user && user?.roles?.includes('artist'),
  });

  const userArtist = artists?.find((artist: any) => 
    artist.userId === user?.id || 
    artist.userId === user?.claims?.sub ||
    artist.userId === String(user?.id) ||
    artist.userId === String(user?.claims?.sub)
  );

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: [`/api/analytics/artist/${userArtist?.id}`, dateRange],
    enabled: !!userArtist?.id,
  });

  // Fetch artist stats data
  const { data: artistStats } = useQuery({
    queryKey: [`/api/artists/${userArtist?.id}/stats`],
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



  // Calculate totals from analytics data
  const totalViews = artistStats?.totalViews || 0;
  const totalFollowers = artistStats?.totalFollowers || 0;
  const totalSales = artistStats?.totalSales || 0;
  const totalRevenue = artistStats?.totalRevenue || 0;
  
  // Calculate recent data (last 7 days)
  const recentAnalytics = analytics?.slice(0, 7) || [];
  const recentInquiries = recentAnalytics.reduce((sum: number, day: any) => sum + day.inquiries, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-navy to-brand-steel bg-clip-text text-transparent">
            {getText("analytics.title", "Analytics & Insights")}
          </h1>
          <p className="text-gray-600">
            {getText("analytics.subtitle", "Track your performance and understand your audience")}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {getText("analytics.totalViews", "Total Views")}
              </CardTitle>
              <Eye className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+12%</span> {getText("analytics.fromLastMonth", "from last month")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {getText("analytics.followers", "Followers")}
              </CardTitle>
              <Users className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {totalFollowers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+5</span> {getText("analytics.thisWeek", "this week")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {getText("analytics.inquiries", "Inquiries")}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {recentInquiries.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-green-600">+3</span> {getText("analytics.new", "new")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {getText("analytics.sales", "Total Sales")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-brand-navy" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand-navy">
                {totalRevenue.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getText("analytics.thisMonth", "This month")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="views" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="views">
              {getText("analytics.views", "Views")}
            </TabsTrigger>
            <TabsTrigger value="engagement">
              {getText("analytics.engagement", "Engagement")}
            </TabsTrigger>
            <TabsTrigger value="search">
              {getText("analytics.search", "Search Insights")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="views" className="space-y-4">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>{getText("analytics.viewsOverTime", "Views Over Time")}</CardTitle>
                <CardDescription>
                  {getText("analytics.viewsDescription", "Track how many people are viewing your artworks and profile")}
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
                        name={getText("analytics.artworkViews", "Artwork Views")}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profileViews" 
                        stroke="#60a5fa" 
                        strokeWidth={2}
                        name={getText("analytics.profileViews", "Profile Views")}
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
                <CardTitle>{getText("analytics.engagementMetrics", "Engagement Metrics")}</CardTitle>
                <CardDescription>
                  {getText("analytics.engagementDescription", "Monitor inquiries and follower growth")}
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
                        name={getText("analytics.inquiries", "Inquiries")}
                      />
                      <Bar 
                        dataKey="followers" 
                        fill="#60a5fa"
                        name={getText("analytics.newFollowers", "New Followers")}
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
                <CardTitle>{getText("analytics.searchInsights", "Search Insights")}</CardTitle>
                <CardDescription>
                  {getText("analytics.searchDescription", "Popular search terms leading to your profile")}
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
                      {getText("analytics.noSearchData", "No search data available yet")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle>{getText("analytics.audiencePreferences", "Audience Preferences")}</CardTitle>
                <CardDescription>
                  {getText("analytics.preferencesDescription", "What your audience is interested in")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">{getText("analytics.topCategories", "Top Categories")}</h4>
                    <div className="space-y-2">
                      {preferences?.preferredCategories?.slice(0, 5).map((cat: string) => (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-sm">{cat}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-brand-navy h-2 rounded-full" style={{ width: "70%" }} />
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">{getText("analytics.noData", "No data available")}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{getText("analytics.topStyles", "Top Styles")}</h4>
                    <div className="space-y-2">
                      {preferences?.preferredStyles?.slice(0, 5).map((style: string) => (
                        <div key={style} className="flex items-center justify-between">
                          <span className="text-sm">{style}</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-brand-steel h-2 rounded-full" style={{ width: "60%" }} />
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">{getText("analytics.noData", "No data available")}</p>
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
