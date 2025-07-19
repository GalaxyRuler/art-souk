import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trophy, Crown, Medal, DollarSign, Users, Eye, Palette, Paintbrush, Building2, GraduationCap, Award, Gem, Building, Zap, Calendar, CheckCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AchievementBadgeProps {
  achievement?: {
    id: number;
    artistId: number;
    badgeId: number;
    earnedAt: string;
    level: number;
    isDisplayed: boolean;
    badge: {
      id: number;
      name: string;
      nameAr: string;
      description: string;
      descriptionAr: string;
      category: string;
      icon: string;
      color: string;
      rarity: string;
      pointsValue: number;
    };
  };
  progress?: {
    id: number;
    artistId: number;
    badgeId: number;
    currentValue: number;
    targetValue: number;
    progressPercentage: string;
    isCompleted: boolean;
    badge: {
      id: number;
      name: string;
      nameAr: string;
      description: string;
      descriptionAr: string;
      category: string;
      icon: string;
      color: string;
      rarity: string;
      pointsValue: number;
    };
  };
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  interactive?: boolean;
  className?: string;
}

const iconMap = {
  Trophy, Crown, Medal, DollarSign, Users, Star, Eye, Palette, Paintbrush, Building2, 
  GraduationCap, Award, Gem, Building, Zap, Calendar, CheckCircle, Sparkles
};

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600'
};

const rarityGlow = {
  common: 'shadow-gray-400/20',
  uncommon: 'shadow-green-400/30',
  rare: 'shadow-blue-400/30',
  epic: 'shadow-purple-400/40',
  legendary: 'shadow-yellow-400/50'
};

export function AchievementBadge({ 
  achievement, 
  progress, 
  size = 'md', 
  showProgress = false,
  interactive = false,
  className = ''
}: AchievementBadgeProps) {
  const { language } = useLanguage();
  
  const badge = achievement?.badge || progress?.badge;
  if (!badge) return null;

  const isEarned = !!achievement;
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Trophy;
  
  const sizeClasses = {
    sm: 'w-8 h-8 p-1',
    md: 'w-12 h-12 p-2',
    lg: 'w-16 h-16 p-3'
  };

  const badgeContent = (
    <div className={`
      relative rounded-full flex items-center justify-center
      ${sizeClasses[size]}
      ${isEarned 
        ? `bg-gradient-to-br ${rarityColors[badge.rarity as keyof typeof rarityColors]} shadow-lg ${rarityGlow[badge.rarity as keyof typeof rarityGlow]}`
        : 'bg-gray-200 dark:bg-gray-700 opacity-60'
      }
      ${interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : ''}
      ${className}
    `}>
      <IconComponent 
        className={`
          ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}
          ${isEarned ? 'text-white' : 'text-gray-400'}
        `}
      />
      
      {isEarned && achievement?.level && achievement.level > 1 && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {achievement.level}
        </div>
      )}
      
      {badge.rarity === 'legendary' && isEarned && (
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-br from-yellow-400/20 to-yellow-600/20"></div>
      )}
    </div>
  );

  const tooltipContent = (
    <div className="p-2 max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${rarityColors[badge.rarity as keyof typeof rarityColors]}`}>
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm">
            {language === 'ar' ? badge.nameAr : badge.name}
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {badge.rarity}
          </Badge>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">
        {language === 'ar' ? badge.descriptionAr : badge.description}
      </p>
      
      {showProgress && progress && !isEarned && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>
              {language === 'ar' ? 'التقدم' : 'Progress'}
            </span>
            <span>{progress.currentValue}/{progress.targetValue}</span>
          </div>
          <Progress 
            value={parseFloat(progress.progressPercentage)} 
            className="h-2"
          />
        </div>
      )}
      
      {isEarned && (
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-green-600">
            {language === 'ar' ? 'تم الحصول عليها' : 'Earned'}
          </span>
          <span className="text-yellow-600">
            +{badge.pointsValue} {language === 'ar' ? 'نقطة' : 'pts'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AchievementGrid({ 
  achievements, 
  progress, 
  className = '' 
}: { 
  achievements: any[], 
  progress: any[], 
  className?: string 
}) {
  const { language } = useLanguage();
  
  // Combine earned achievements and progress
  const allBadges = [...achievements];
  
  // Add progress items that aren't already earned
  progress.forEach(prog => {
    if (!achievements.some(ach => ach.badge.id === prog.badge.id)) {
      allBadges.push(prog);
    }
  });

  const categorizedBadges = {
    sales: allBadges.filter(item => item.badge?.category === 'sales'),
    engagement: allBadges.filter(item => item.badge?.category === 'engagement'),
    participation: allBadges.filter(item => item.badge?.category === 'participation'),
    expertise: allBadges.filter(item => item.badge?.category === 'expertise'),
    time_based: allBadges.filter(item => item.badge?.category === 'time_based'),
  };

  const categoryNames = {
    sales: language === 'ar' ? 'المبيعات' : 'Sales',
    engagement: language === 'ar' ? 'التفاعل' : 'Engagement',
    participation: language === 'ar' ? 'المشاركة' : 'Participation',
    expertise: language === 'ar' ? 'الخبرة' : 'Expertise',
    time_based: language === 'ar' ? 'الوقت' : 'Time-based',
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(categorizedBadges).map(([category, badges]) => (
        badges.length > 0 && (
          <Card key={category} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-brand-navy dark:text-white">
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              <div className="flex flex-wrap gap-4">
                {badges.map((item) => (
                  <AchievementBadge
                    key={item.badge.id}
                    achievement={item.earnedAt ? item : undefined}
                    progress={!item.earnedAt ? item : undefined}
                    size="lg"
                    showProgress={true}
                    interactive={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
}
