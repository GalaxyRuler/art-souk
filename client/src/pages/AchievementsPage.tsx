import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementBadge, AchievementGrid } from '@/components/AchievementBadge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/hooks/useLanguage';
import { Loader2, Trophy, Star, Target, TrendingUp, Award } from 'lucide-react';

interface ArtistStats {
  id: number;
  artistId: number;
  totalArtworks: number;
  totalSales: number;
  totalRevenue: string;
  totalViews: number;
  totalLikes: number;
  totalFollowers: number;
  totalWorkshops: number;
  totalExhibitions: number;
  averageRating: string;
  totalReviews: number;
  achievementPoints: number;
  profileCompleteness: number;
  lastActivityAt: string;
  updatedAt: string;
}

export default function AchievementsPage() {
  const { language } = useLanguage();
  const params = useParams();
  const artistId = parseInt(params.id as string);

  const { data: artist, isLoading: artistLoading } = useQuery({
    queryKey: [`/api/artists/${artistId}`],
    enabled: !!artistId,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: [`/api/artists/${artistId}/achievements`],
    enabled: !!artistId,
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: [`/api/artists/${artistId}/badge-progress`],
    enabled: !!artistId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/artists/${artistId}/stats`],
    enabled: !!artistId,
  });

  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['/api/achievements/badges'],
  });

  if (artistLoading || achievementsLoading || progressLoading || statsLoading || badgesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-brand-navy" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">
              {language === 'ar' ? 'فنان غير موجود' : 'Artist Not Found'}
            </h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const earnedAchievements = achievements.filter((a: any) => a.earnedAt);
  const totalBadges = badges.length;
  const completionRate = totalBadges > 0 ? (earnedAchievements.length / totalBadges) * 100 : 0;

  const statCards = [
    {
      title: language === 'ar' ? 'الإنجازات المكتسبة' : 'Earned Achievements',
      value: earnedAchievements.length,
      total: totalBadges,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: language === 'ar' ? 'نقاط الإنجاز' : 'Achievement Points',
      value: stats?.achievementPoints || 0,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: language === 'ar' ? 'معدل الإكمال' : 'Completion Rate',
      value: Math.round(completionRate),
      suffix: '%',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: language === 'ar' ? 'اكتمال الملف الشخصي' : 'Profile Completeness',
      value: stats?.profileCompleteness || 0,
      suffix: '%',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  const rarityStats = badges.reduce((acc: any, badge: any) => {
    const earned = earnedAchievements.find((a: any) => a.badge.id === badge.id);
    if (earned) {
      acc[badge.rarity] = (acc[badge.rarity] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {artist.profileImage && (
              <img
                src={artist.profileImage}
                alt={artist.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-brand-navy dark:text-white">
                {language === 'ar' ? artist.nameAr : artist.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'ar' ? 'إنجازات الفنان' : 'Artist Achievements'}
              </p>
            </div>
          </div>
          
          {/* Achievement Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className={`${stat.bgColor} border-0`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                        {stat.total && `/${stat.total}`}
                        {stat.suffix}
                      </p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements Tabs */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">
              {language === 'ar' ? 'الإنجازات' : 'Achievements'}
            </TabsTrigger>
            <TabsTrigger value="progress">
              {language === 'ar' ? 'التقدم' : 'Progress'}
            </TabsTrigger>
            <TabsTrigger value="stats">
              {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6">
            {earnedAchievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    {language === 'ar' ? 'الإنجازات المكتسبة' : 'Earned Achievements'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {earnedAchievements.map((achievement: any) => (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        size="lg"
                        interactive={true}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <AchievementGrid achievements={achievements} progress={progress} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {language === 'ar' ? 'التقدم نحو الإنجازات' : 'Progress Towards Achievements'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress
                    .filter((p: any) => !p.isCompleted)
                    .sort((a: any, b: any) => parseFloat(b.progressPercentage) - parseFloat(a.progressPercentage))
                    .map((prog: any) => (
                      <div key={prog.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <AchievementBadge progress={prog} size="md" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">
                              {language === 'ar' ? prog.badge.nameAr : prog.badge.name}
                            </h3>
                            <span className="text-sm text-gray-600">
                              {prog.currentValue}/{prog.targetValue}
                            </span>
                          </div>
                          <Progress value={parseFloat(prog.progressPercentage)} className="mb-2" />
                          <p className="text-sm text-gray-600">
                            {language === 'ar' ? prog.badge.descriptionAr : prog.badge.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rarity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ar' ? 'توزيع الندرة' : 'Rarity Distribution'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(rarityStats).map(([rarity, count]) => (
                      <div key={rarity} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {rarity}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Artist Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ar' ? 'إحصائيات الفنان' : 'Artist Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'الأعمال الفنية' : 'Artworks'}</span>
                      <span className="font-semibold">{stats?.totalArtworks || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'المتابعون' : 'Followers'}</span>
                      <span className="font-semibold">{stats?.totalFollowers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'ورش العمل' : 'Workshops'}</span>
                      <span className="font-semibold">{stats?.totalWorkshops || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'المعارض' : 'Exhibitions'}</span>
                      <span className="font-semibold">{stats?.totalExhibitions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}</span>
                      <span className="font-semibold">{stats?.averageRating || '0.0'}/5.0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}