import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  Shuffle,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'wouter';

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  artist: {
    id: number;
    name: string;
    nameAr?: string;
  };
  images: string[];
  price?: string;
  currency?: string;
  medium?: string;
  mediumAr?: string;
  year?: number;
  availability?: string;
  matchScore?: number;
  matchReasons?: string[];
}

interface RecommendationProps {
  currentArtworkId?: number;
  userPreferences?: {
    styles?: string[];
    priceRange?: { min: number; max: number };
    mediums?: string[];
  };
  viewingHistory?: number[];
  onArtworkClick?: (artwork: Artwork) => void;
}

const recommendationTypes = [
  { 
    id: 'similar-style', 
    name: 'Similar Style', 
    nameAr: 'نمط مماثل',
    icon: Sparkles,
    color: 'text-purple-500'
  },
  { 
    id: 'same-artist', 
    name: 'Same Artist', 
    nameAr: 'نفس الفنان',
    icon: Target,
    color: 'text-blue-500'
  },
  { 
    id: 'trending', 
    name: 'Trending Now', 
    nameAr: 'رائج الآن',
    icon: TrendingUp,
    color: 'text-green-500'
  },
  { 
    id: 'price-match', 
    name: 'Price Match', 
    nameAr: 'السعر المطابق',
    icon: BarChart3,
    color: 'text-yellow-500'
  },
  { 
    id: 'personalized', 
    name: 'For You', 
    nameAr: 'لك',
    icon: Zap,
    color: 'text-red-500'
  }
];

// Mock recommendations - in production, these would come from an API
const mockRecommendations: Record<string, Artwork[]> = {
  'similar-style': [
    {
      id: 101,
      title: "Desert Mirage",
      titleAr: "سراب الصحراء",
      artist: { id: 1, name: "Ahmed Al-Rashid", nameAr: "أحمد الراشد" },
      images: ["/api/placeholder/400/300"],
      price: "12000",
      currency: "SAR",
      medium: "Oil on Canvas",
      mediumAr: "زيت على قماش",
      year: 2023,
      availability: "available",
      matchScore: 92,
      matchReasons: ["Similar color palette", "Abstract style", "Contemporary period"]
    },
    {
      id: 102,
      title: "Urban Dreams",
      titleAr: "أحلام حضرية",
      artist: { id: 2, name: "Fatima Al-Zahra", nameAr: "فاطمة الزهراء" },
      images: ["/api/placeholder/400/300"],
      price: "15000",
      currency: "SAR",
      medium: "Mixed Media",
      mediumAr: "وسائط مختلطة",
      year: 2023,
      availability: "available",
      matchScore: 88,
      matchReasons: ["Modern aesthetic", "Bold composition", "Similar size"]
    }
  ],
  'trending': [
    {
      id: 103,
      title: "New Horizons",
      titleAr: "آفاق جديدة",
      artist: { id: 3, name: "Khalid Ibrahim", nameAr: "خالد إبراهيم" },
      images: ["/api/placeholder/400/300"],
      price: "25000",
      currency: "SAR",
      medium: "Acrylic",
      mediumAr: "أكريليك",
      year: 2024,
      availability: "available",
      matchScore: 95,
      matchReasons: ["High demand", "Featured artist", "Recent exhibition"]
    }
  ]
};

export function ArtworkRecommendations({ 
  currentArtworkId, 
  userPreferences, 
  viewingHistory = [],
  onArtworkClick 
}: RecommendationProps) {
  const { language } = useLanguage();
  const [activeType, setActiveType] = useState('similar-style');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const recommendations = mockRecommendations[activeType] || [];
  const activeTypeConfig = recommendationTypes.find(t => t.id === activeType);
  
  const getTitle = (artwork: Artwork) => 
    language === 'ar' && artwork.titleAr ? artwork.titleAr : artwork.title;
  
  const getArtistName = (artwork: Artwork) => 
    language === 'ar' && artwork.artist.nameAr ? artwork.artist.nameAr : artwork.artist.name;
  
  const getMedium = (artwork: Artwork) => 
    language === 'ar' && artwork.mediumAr ? artwork.mediumAr : artwork.medium;
  
  const getTypeName = (type: typeof recommendationTypes[0]) => 
    language === 'ar' ? type.nameAr : type.name;
  
  const formatPrice = (price: string, currency: string) => {
    const formattedPrice = parseInt(price).toLocaleString();
    return language === 'ar' ? `${formattedPrice} ${currency === 'SAR' ? 'ر.س' : currency}` : `${formattedPrice} ${currency}`;
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  useEffect(() => {
    if (isAutoPlaying && recommendations.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, recommendations.length, currentIndex]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {language === 'ar' ? 'توصيات مخصصة' : 'Personalized Recommendations'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            >
              {isAutoPlaying ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'تشغيل تلقائي' : 'Auto-play')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Shuffle recommendations
                setCurrentIndex(0);
              }}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recommendation Type Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {recommendationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                size="sm"
                variant={activeType === type.id ? 'default' : 'outline'}
                onClick={() => {
                  setActiveType(type.id);
                  setCurrentIndex(0);
                }}
                className="flex-shrink-0"
              >
                <Icon className={cn("h-4 w-4 mr-2", type.color)} />
                {getTypeName(type)}
              </Button>
            );
          })}
        </div>

        {/* Recommendation Carousel */}
        {recommendations.length > 0 ? (
          <div className="relative">
            {/* Navigation Buttons */}
            {recommendations.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Carousel Content */}
            <div ref={carouselRef} className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {recommendations.map((artwork) => (
                  <div key={artwork.id} className="w-full flex-shrink-0 px-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Artwork Image */}
                        <div className="relative group">
                          <Link href={`/artworks/${artwork.id}`}>
                            <img
                              src={artwork.images[0]}
                              alt={getTitle(artwork)}
                              className="w-full h-64 object-cover rounded-lg cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                          </Link>
                          
                          {/* Match Score */}
                          {artwork.matchScore && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-white/90 text-black">
                                {artwork.matchScore}% Match
                              </Badge>
                            </div>
                          )}

                          {/* Quick Actions */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="bg-white/90">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="bg-white/90">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Artwork Details */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{getTitle(artwork)}</h3>
                            <p className="text-muted-foreground">{getArtistName(artwork)}</p>
                          </div>

                          {/* Match Reasons */}
                          {artwork.matchReasons && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                {language === 'ar' ? 'لماذا نوصي بهذا:' : 'Why we recommend this:'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {artwork.matchReasons.map((reason, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {reason}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Artwork Info */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {artwork.medium && (
                              <div>
                                <span className="text-muted-foreground">
                                  {language === 'ar' ? 'الوسط:' : 'Medium:'}
                                </span>{' '}
                                {getMedium(artwork)}
                              </div>
                            )}
                            {artwork.year && (
                              <div>
                                <span className="text-muted-foreground">
                                  {language === 'ar' ? 'السنة:' : 'Year:'}
                                </span>{' '}
                                {artwork.year}
                              </div>
                            )}
                          </div>

                          {/* Price and Action */}
                          {artwork.price && (
                            <div className="flex items-center justify-between pt-3 border-t">
                              <div>
                                <p className="text-2xl font-bold">
                                  {formatPrice(artwork.price, artwork.currency || 'SAR')}
                                </p>
                                {artwork.availability === 'available' && (
                                  <Badge variant="outline" className="text-xs">
                                    {language === 'ar' ? 'متاح' : 'Available'}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                onClick={() => onArtworkClick?.(artwork)}
                              >
                                {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            {recommendations.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {recommendations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === currentIndex ? "w-8 bg-brand-navy" : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{language === 'ar' ? 'لا توجد توصيات متاحة حالياً' : 'No recommendations available at the moment'}</p>
          </div>
        )}

        {/* Viewing History Summary */}
        {viewingHistory.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {language === 'ar' ? 'بناءً على مشاهداتك الأخيرة' : 'Based on your recent views'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 
                      `شاهدت ${viewingHistory.length} عمل فني مؤخراً` : 
                      `You've viewed ${viewingHistory.length} artworks recently`
                    }
                  </p>
                </div>
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}