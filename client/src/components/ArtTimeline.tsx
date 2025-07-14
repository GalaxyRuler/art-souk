import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Palette,
  TrendingUp,
  Award,
  Users,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface TimelineEvent {
  id: string;
  date: string;
  year: number;
  type: 'artwork' | 'exhibition' | 'award' | 'milestone';
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  location?: string;
  locationAr?: string;
  artist?: {
    name: string;
    nameAr?: string;
  };
  metadata?: {
    medium?: string;
    price?: string;
    visitors?: number;
    artworks?: number;
  };
}

interface ArtTimelineProps {
  events: TimelineEvent[];
  artistId?: number;
  onEventClick?: (event: TimelineEvent) => void;
}

const eventTypeConfig = {
  artwork: { icon: Palette, color: 'bg-blue-500', label: 'Artwork', labelAr: 'عمل فني' },
  exhibition: { icon: Users, color: 'bg-green-500', label: 'Exhibition', labelAr: 'معرض' },
  award: { icon: Award, color: 'bg-yellow-500', label: 'Award', labelAr: 'جائزة' },
  milestone: { icon: TrendingUp, color: 'bg-purple-500', label: 'Milestone', labelAr: 'إنجاز' }
};

export function ArtTimeline({ events, artistId, onEventClick }: ArtTimelineProps) {
  const { language, isRTL } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'chart'>('timeline');
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get unique years
  const years = [...new Set(events.map(e => e.year))].sort();

  // Filter events
  const filteredEvents = sortedEvents.filter(event => {
    if (selectedYear && event.year !== selectedYear) return false;
    if (selectedType && event.type !== selectedType) return false;
    return true;
  });

  // Group events by year for chart view
  const eventsByYear = years.reduce((acc, year) => {
    acc[year] = events.filter(e => e.year === year);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  const getTitle = (event: TimelineEvent) => 
    language === 'ar' && event.titleAr ? event.titleAr : event.title;

  const getDescription = (event: TimelineEvent) => 
    language === 'ar' && event.descriptionAr ? event.descriptionAr : event.description;

  const getLocation = (event: TimelineEvent) => 
    language === 'ar' && event.locationAr ? event.locationAr : event.location;

  const getTypeLabel = (type: keyof typeof eventTypeConfig) => 
    language === 'ar' ? eventTypeConfig[type].labelAr : eventTypeConfig[type].label;

  const checkScroll = () => {
    if (timelineRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 300;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    const element = timelineRef.current;
    if (element) {
      element.addEventListener('scroll', checkScroll);
      return () => element.removeEventListener('scroll', checkScroll);
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {language === 'ar' ? 'الجدول الزمني الفني' : 'Art Timeline'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              onClick={() => setViewMode('timeline')}
            >
              {language === 'ar' ? 'جدول زمني' : 'Timeline'}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
            >
              {language === 'ar' ? 'شبكة' : 'Grid'}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('chart')}
            >
              {language === 'ar' ? 'رسم بياني' : 'Chart'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'تصفية حسب:' : 'Filter by:'}
            </span>
          </div>
          
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            className="text-sm border rounded px-3 py-1"
          >
            <option value="">{language === 'ar' ? 'جميع السنوات' : 'All Years'}</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={selectedType || ''}
            onChange={(e) => setSelectedType(e.target.value || null)}
            className="text-sm border rounded px-3 py-1"
          >
            <option value="">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <option key={type} value={type}>
                {language === 'ar' ? config.labelAr : config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div className="relative">
            {canScrollLeft && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                onClick={() => scrollTimeline('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg"
                onClick={() => scrollTimeline('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            
            <div
              ref={timelineRef}
              className="overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="relative min-w-max">
                {/* Timeline Line */}
                <div className="absolute top-28 left-0 right-0 h-1 bg-gray-300" />
                
                {/* Events */}
                <div className="flex gap-8 px-12 pt-4">
                  {filteredEvents.map((event, index) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    
                    return (
                      <div
                        key={event.id}
                        className="relative flex flex-col items-center"
                        onMouseEnter={() => setHoveredEvent(event.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        {/* Event Card */}
                        <div
                          className={cn(
                            "w-64 p-4 rounded-lg border cursor-pointer transition-all",
                            "hover:shadow-lg hover:-translate-y-1",
                            hoveredEvent === event.id && "ring-2 ring-brand-navy"
                          )}
                          onClick={() => onEventClick?.(event)}
                        >
                          {event.image && (
                            <img
                              src={event.image}
                              alt={getTitle(event)}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {new Date(event.date).toLocaleDateString()}
                            </Badge>
                            <Icon className={cn("h-5 w-5", config.color, "text-white rounded p-1")} />
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{getTitle(event)}</h3>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {getDescription(event)}
                            </p>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {getLocation(event)}
                            </div>
                          )}
                        </div>
                        
                        {/* Timeline Dot */}
                        <div className="absolute top-[7rem] w-4 h-4 rounded-full bg-white border-2 border-gray-400" />
                        
                        {/* Year Label */}
                        {(index === 0 || filteredEvents[index - 1].year !== event.year) && (
                          <div className="absolute top-32 -left-4 bg-brand-navy text-white px-3 py-1 rounded text-sm font-bold">
                            {event.year}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map(event => {
              const config = eventTypeConfig[event.type];
              const Icon = config.icon;
              
              return (
                <Card
                  key={event.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => onEventClick?.(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {event.year}
                        </Badge>
                        <h3 className="font-semibold">{getTitle(event)}</h3>
                      </div>
                      <Icon className={cn("h-6 w-6", config.color, "text-white rounded p-1")} />
                    </div>
                    {event.image && (
                      <img
                        src={event.image}
                        alt={getTitle(event)}
                        className="w-full h-40 object-cover rounded mb-3"
                      />
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {getDescription(event)}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {getLocation(event)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Object.entries(eventTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const count = filteredEvents.filter(e => e.type === type).length;
                
                return (
                  <Card key={type} className="text-center">
                    <CardContent className="p-4">
                      <Icon className={cn("h-8 w-8 mx-auto mb-2", config.color, "text-white rounded p-2")} />
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground">{getTypeLabel(type as keyof typeof eventTypeConfig)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              {years.map(year => {
                const yearEvents = eventsByYear[year] || [];
                const maxEvents = Math.max(...Object.values(eventsByYear).map((e: TimelineEvent[]) => e.length));
                
                return (
                  <div key={year} className="flex items-center gap-4">
                    <div className="w-16 font-bold text-right">{year}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-brand-navy to-brand-gold rounded-full flex items-center justify-end pr-3"
                        style={{ width: `${(yearEvents.length / maxEvents) * 100}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {yearEvents.length} {language === 'ar' ? 'حدث' : 'events'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Object.keys(eventTypeConfig).map(type => {
                        const count = yearEvents.filter((e: TimelineEvent) => e.type === type).length;
                        if (count === 0) return null;
                        const config = eventTypeConfig[type as keyof typeof eventTypeConfig];
                        
                        return (
                          <Badge
                            key={type}
                            variant="secondary"
                            className={cn("text-xs", config.color, "text-white")}
                          >
                            {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}