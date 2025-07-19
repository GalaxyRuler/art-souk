import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

export function AdvancedAnalyticsDashboard() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState('30d');
  const [compareMode, setCompareMode] = useState(false);

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard', { dateRange }],
    enabled: true,
  });

  // Fetch user journey metrics
  const { data: userJourney } = useQuery({
    queryKey: ['/api/analytics/user-journey', { dateRange }],
    enabled: true,
  });

  // Fetch conversion funnel data
  const { data: conversionFunnel } = useQuery({
    queryKey: ['/api/analytics/conversion-funnel', { dateRange }],
    enabled: true,
  });

  // Fetch content performance
  const { data: contentPerformance } = useQuery({
    queryKey: ['/api/analytics/content-performance', { dateRange }],
    enabled: true,
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const MetricCard = ({ title, value, change, icon: Icon, trend, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-3 w-3 text-red-600" />
          ) : null}
          <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : ''}>
            {change}
          </span>
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-80 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('analytics.advancedDashboard')}</h2>
          <p className="text-gray-600">{t('analytics.comprehensiveInsights')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
              <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
              <SelectItem value="90d">{t('analytics.last90Days')}</SelectItem>
              <SelectItem value="1y">{t('analytics.lastYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {t('analytics.export')}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t('analytics.totalViews')}
          value={analytics?.totalViews?.toLocaleString() || '0'}
          change={`+${analytics?.viewsChange || 0}%`}
          icon={Eye}
          trend={analytics?.viewsChange > 0 ? 'up' : 'down'}
          description={t('analytics.fromLastPeriod')}
        />
        <MetricCard
          title={t('analytics.uniqueVisitors')}
          value={analytics?.uniqueVisitors?.toLocaleString() || '0'}
          change={`+${analytics?.visitorsChange || 0}%`}
          icon={Users}
          trend={analytics?.visitorsChange > 0 ? 'up' : 'down'}
          description={t('analytics.fromLastPeriod')}
        />
        <MetricCard
          title={t('analytics.engagement')}
          value={`${analytics?.engagementRate || 0}%`}
          change={`+${analytics?.engagementChange || 0}%`}
          icon={Heart}
          trend={analytics?.engagementChange > 0 ? 'up' : 'down'}
          description={t('analytics.fromLastPeriod')}
        />
        <MetricCard
          title={t('analytics.conversionRate')}
          value={`${analytics?.conversionRate || 0}%`}
          change={`+${analytics?.conversionChange || 0}%`}
          icon={ShoppingCart}
          trend={analytics?.conversionChange > 0 ? 'up' : 'down'}
          description={t('analytics.fromLastPeriod')}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
          <TabsTrigger value="users">{t('analytics.users')}</TabsTrigger>
          <TabsTrigger value="content">{t('analytics.content')}</TabsTrigger>
          <TabsTrigger value="conversion">{t('analytics.conversion')}</TabsTrigger>
          <TabsTrigger value="revenue">{t('analytics.revenue')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.trafficOverTime')}</CardTitle>
                <CardDescription>{t('analytics.dailyVisitorTrends')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.trafficData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Journey Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.userJourney')}</CardTitle>
                <CardDescription>{t('analytics.conversionFunnelAnalysis')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userJourney?.funnelData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="users" fill="#8884d8" />
                    <Bar dataKey="conversions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Popular Content */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.topPerformingContent')}</CardTitle>
              <CardDescription>{t('analytics.mostViewedArtworks')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentPerformance?.topArtworks?.slice(0, 5).map((artwork: any, index: number) => (
                  <div key={artwork.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{artwork.title}</p>
                        <p className="text-sm text-gray-600">{artwork.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{artwork.views.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{t('analytics.views')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.userDemographics')}</CardTitle>
                <CardDescription>{t('analytics.userTypeDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.userTypes || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {(analytics?.userTypes || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.userActivity')}</CardTitle>
                <CardDescription>{t('analytics.dailyActiveUsers')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.userActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="dau" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="mau" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* User Lifecycle Stages */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.lifecycleStages')}</CardTitle>
              <CardDescription>{t('analytics.userProgressThroughStages')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {userJourney?.stageBreakdown?.map((stage: any) => (
                  <div key={stage.stage} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stage.count}</div>
                    <div className="text-sm text-gray-600">{t(`lifecycle.stages.${stage.stage}`)}</div>
                    <div className="text-xs text-gray-500">{stage.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.contentPerformance')}</CardTitle>
                <CardDescription>{t('analytics.engagementByContentType')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentPerformance?.byType || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views" fill="#8884d8" />
                    <Bar dataKey="likes" fill="#82ca9d" />
                    <Bar dataKey="comments" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Trends */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.categoryTrends')}</CardTitle>
                <CardDescription>{t('analytics.popularArtCategories')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={contentPerformance?.categories || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="views"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(contentPerformance?.categories || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conversion Tab */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.conversionFunnel')}</CardTitle>
                <CardDescription>{t('analytics.userConversionPath')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnel?.stages?.map((stage: any, index: number) => (
                    <div key={stage.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{stage.name}</p>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{stage.users.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{stage.conversionRate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Goal Completions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.goalCompletions')}</CardTitle>
                <CardDescription>{t('analytics.keyActionTracking')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversionFunnel?.goals || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="inquiries" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="favorites" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="purchases" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.revenueTrends')}</CardTitle>
                <CardDescription>{t('analytics.platformCommissions')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics?.revenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Earning Artists */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.topEarningArtists')}</CardTitle>
                <CardDescription>{t('analytics.highestRevenue')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topEarners?.slice(0, 5).map((artist: any, index: number) => (
                    <div key={artist.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{artist.name}</p>
                          <p className="text-sm text-gray-600">{artist.artworksSold} {t('analytics.artworksSold')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{artist.revenue.toLocaleString()} {t('common.sar')}</p>
                        <p className="text-sm text-gray-600">{t('analytics.totalRevenue')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
