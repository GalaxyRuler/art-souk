import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from 'recharts';
import { TrendingUp, Users, Activity, Target, ArrowUp, ArrowDown, Clock, Eye } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { format } from 'date-fns';

interface FunnelMetric {
  stage: string;
  count: number;
}

interface UserInteraction {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  previousStage: string;
  newStage: string;
  metadata: any;
  createdAt: string;
}

interface LifecycleTransition {
  id: number;
  fromStage: string;
  toStage: string;
  trigger: string;
  metadata: any;
  transitionAt: string;
}

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Fetch funnel metrics
  const { data: funnelMetrics, isLoading: loadingFunnel } = useQuery<FunnelMetric[]>({
    queryKey: ['/api/lifecycle/funnel-metrics'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch user interactions
  const { data: userInteractions, isLoading: loadingInteractions } = useQuery<UserInteraction[]>({
    queryKey: ['/api/lifecycle/user-interactions'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch lifecycle transitions
  const { data: lifecycleTransitions, isLoading: loadingTransitions } = useQuery<LifecycleTransition[]>({
    queryKey: ['/api/lifecycle/user-transitions'],
    refetchInterval: 30000,
  });

  // Calculate conversion rates
  const calculateConversionRates = (metrics: FunnelMetric[]) => {
    if (!metrics || metrics.length === 0) return [];
    
    const stages = ['aware', 'join', 'explore', 'transact', 'retain', 'advocate'];
    const conversions = [];
    
    for (let i = 0; i < stages.length - 1; i++) {
      const fromStage = metrics.find(m => m.stage === stages[i]);
      const toStage = metrics.find(m => m.stage === stages[i + 1]);
      
      if (fromStage && toStage) {
        const rate = fromStage.count > 0 ? (toStage.count / fromStage.count) * 100 : 0;
        conversions.push({
          from: stages[i],
          to: stages[i + 1],
          rate: rate.toFixed(1),
          fromCount: fromStage.count,
          toCount: toStage.count,
        });
      }
    }
    
    return conversions;
  };

  // Prepare funnel chart data
  const funnelChartData = funnelMetrics?.map(metric => ({
    stage: t(`lifecycle.stages.${metric.stage}`),
    value: metric.count,
    fill: getStageColor(metric.stage),
  })) || [];

  // Prepare interaction timeline data
  const interactionTimelineData = userInteractions?.slice(0, 50).map(interaction => ({
    time: format(new Date(interaction.createdAt), 'HH:mm'),
    action: interaction.action,
    stage: interaction.newStage || interaction.previousStage,
    entity: interaction.entityType,
  })) || [];

  // Get stage color
  function getStageColor(stage: string) {
    const colors = {
      aware: '#3B82F6',
      join: '#10B981',
      explore: '#F59E0B',
      transact: '#EF4444',
      retain: '#8B5CF6',
      advocate: '#06B6D4',
    };
    return colors[stage as keyof typeof colors] || '#6B7280';
  }

  // Get stage icon
  function getStageIcon(stage: string) {
    const icons = {
      aware: Eye,
      join: Users,
      explore: Activity,
      transact: Target,
      retain: TrendingUp,
      advocate: ArrowUp,
    };
    const Icon = icons[stage as keyof typeof icons] || Activity;
    return <Icon className="w-4 h-4" />;
  }

  const conversions = calculateConversionRates(funnelMetrics || []);
  const totalUsers = funnelMetrics?.reduce((sum, metric) => sum + metric.count, 0) || 0;
  const recentInteractions = userInteractions?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('lifecycle.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('lifecycle.subtitle')}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('analytics.totalUsers')}
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('analytics.allStages')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('analytics.activeUsers')}
              </CardTitle>
              <Activity className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {funnelMetrics?.find(m => m.stage === 'explore')?.count || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('analytics.exploring')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('analytics.transacting')}
              </CardTitle>
              <Target className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {funnelMetrics?.find(m => m.stage === 'transact')?.count || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('analytics.making purchases')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t('analytics.advocates')}
              </CardTitle>
              <ArrowUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {funnelMetrics?.find(m => m.stage === 'advocate')?.count || 0}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('analytics.promoting')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funnel">{t('analytics.funnel')}</TabsTrigger>
            <TabsTrigger value="conversions">{t('analytics.conversions')}</TabsTrigger>
            <TabsTrigger value="interactions">{t('analytics.interactions')}</TabsTrigger>
            <TabsTrigger value="transitions">{t('analytics.transitions')}</TabsTrigger>
          </TabsList>

          {/* Funnel Analysis */}
          <TabsContent value="funnel" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    {t('analytics.lifecycleFunnel')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart data={funnelChartData}>
                        <Tooltip />
                        <Funnel
                          dataKey="value"
                          isAnimationActive
                          fill="#3B82F6"
                        >
                          <LabelList position="center" fill="#fff" stroke="none" />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">
                    {t('analytics.stageBreakdown')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funnelMetrics?.map((metric) => (
                      <div key={metric.stage} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStageIcon(metric.stage)}
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {t(`lifecycle.stages.${metric.stage}`)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-900 dark:text-white">
                            {metric.count.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {totalUsers > 0 ? `${((metric.count / totalUsers) * 100).toFixed(1)}%` : '0%'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversion Analysis */}
          <TabsContent value="conversions" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  {t('analytics.conversionRates')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversions.map((conversion, index) => (
                    <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {t(`lifecycle.stages.${conversion.from}`)}
                          </Badge>
                          <ArrowUp className="w-4 h-4 text-slate-400" />
                          <Badge variant="outline" className="text-xs">
                            {t(`lifecycle.stages.${conversion.to}`)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-900 dark:text-white">
                            {conversion.rate}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{conversion.fromCount} → {conversion.toCount}</span>
                        <Progress value={parseFloat(conversion.rate)} className="w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Interactions */}
          <TabsContent value="interactions" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  {t('analytics.recentInteractions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentInteractions.map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {interaction.action}
                          </span>
                        </div>
                        {interaction.entityType && (
                          <Badge variant="secondary" className="text-xs">
                            {interaction.entityType}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(interaction.createdAt), 'HH:mm')}
                        </div>
                        {interaction.newStage && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {t(`lifecycle.stages.${interaction.newStage}`)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifecycle Transitions */}
          <TabsContent value="transitions" className="space-y-6">
            <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  {t('analytics.stageTransitions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lifecycleTransitions?.slice(0, 20).map((transition) => (
                    <div key={transition.id} className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <Badge variant="outline" className="text-xs">
                            {t(`lifecycle.stages.${transition.fromStage}`)}
                          </Badge>
                          <ArrowUp className="w-3 h-3 text-slate-400" />
                          <Badge variant="outline" className="text-xs">
                            {t(`lifecycle.stages.${transition.toStage}`)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {transition.trigger}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(transition.transitionAt), 'MMM dd, HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}