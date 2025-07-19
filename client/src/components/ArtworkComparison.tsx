import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeftRight, 
  Info, 
  Download,
  Share2,
  Heart,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  artist: {
    name: string;
    nameAr?: string;
  };
  year?: number;
  medium?: string;
  mediumAr?: string;
  dimensions?: string;
  price?: string;
  currency?: string;
  images: string[];
}

interface ArtworkComparisonProps {
  artworks: Artwork[];
  onSelect?: (artwork: Artwork) => void;
}

export function ArtworkComparison({ artworks, onSelect }: ArtworkComparisonProps) {
  const { language, isRTL } = useLanguage();
  const [selectedArtworks, setSelectedArtworks] = useState<[Artwork | null, Artwork | null]>([null, null]);
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [showDetails, setShowDetails] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleArtworkSelect = (artwork: Artwork, slot: 0 | 1) => {
    const newSelection: [Artwork | null, Artwork | null] = [...selectedArtworks];
    newSelection[slot] = artwork;
    setSelectedArtworks(newSelection);
  };

  const formatPrice = (price: string, currency: string) => {
    const formattedPrice = parseInt(price).toLocaleString();
    return language === 'ar' ? `${formattedPrice} ${currency === 'SAR' ? 'ر.س' : currency}` : `${formattedPrice} ${currency}`;
  };

  const getTitle = (artwork: Artwork) => language === 'ar' && artwork.titleAr ? artwork.titleAr : artwork.title;
  const getArtistName = (artwork: Artwork) => language === 'ar' && artwork.artist.nameAr ? artwork.artist.nameAr : artwork.artist.name;
  const getMedium = (artwork: Artwork) => language === 'ar' && artwork.mediumAr ? artwork.mediumAr : artwork.medium;

  return (
    <div className="space-y-6">
      {/* Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {artworks.map((artwork) => (
          <Card
            key={artwork.id}
            className={cn(
              "p-2 cursor-pointer transition-all hover:shadow-lg",
              selectedArtworks.includes(artwork) && "ring-2 ring-brand-navy"
            )}
          >
            <img
              src={artwork.images[0]}
              alt={getTitle(artwork)}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <p className="text-sm font-medium truncate">{getTitle(artwork)}</p>
            <p className="text-xs text-muted-foreground">{getArtistName(artwork)}</p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant={selectedArtworks[0]?.id === artwork.id ? "default" : "outline"}
                onClick={() => handleArtworkSelect(artwork, 0)}
                className="flex-1"
              >
                {language === 'ar' ? 'اليسار' : 'Left'}
              </Button>
              <Button
                size="sm"
                variant={selectedArtworks[1]?.id === artwork.id ? "default" : "outline"}
                onClick={() => handleArtworkSelect(artwork, 1)}
                className="flex-1"
              >
                {language === 'ar' ? 'اليمين' : 'Right'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison View */}
      {selectedArtworks[0] && selectedArtworks[1] && (
        <Card className="p-6 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant={compareMode === 'side-by-side' ? 'default' : 'outline'}
                onClick={() => setCompareMode('side-by-side')}
                size="sm"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'جنباً إلى جنب' : 'Side by Side'}
              </Button>
              <Button
                variant={compareMode === 'overlay' ? 'default' : 'outline'}
                onClick={() => setCompareMode('overlay')}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تراكب' : 'Overlay'}
              </Button>
              <Button
                variant={showDetails ? 'default' : 'outline'}
                onClick={() => setShowDetails(!showDetails)}
                size="sm"
              >
                <Info className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'التفاصيل' : 'Details'}
              </Button>
            </div>
            
            {compareMode === 'overlay' && (
              <div className="flex items-center gap-2">
                <span className="text-sm">{language === 'ar' ? 'الشفافية:' : 'Opacity:'}</span>
                <Slider
                  value={[overlayOpacity]}
                  onValueChange={([value]) => setOverlayOpacity(value)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-32"
                />
                <span className="text-sm w-10">{overlayOpacity}%</span>
              </div>
            )}
          </div>

          {/* Comparison Display */}
          <div className="relative">
            {compareMode === 'side-by-side' ? (
              <div className="grid grid-cols-2 gap-4">
                {selectedArtworks.map((artwork, index) => artwork && (
                  <div key={artwork.id} className="space-y-4">
                    <div className="relative group">
                      <img
                        src={artwork.images[0]}
                        alt={getTitle(artwork)}
                        className="w-full h-96 object-contain bg-gray-50 rounded-lg"
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="bg-white/90">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary" className="bg-white/90">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {showDetails && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{getTitle(artwork)}</h3>
                        <p className="text-muted-foreground">{getArtistName(artwork)}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {artwork.year && (
                            <div>
                              <span className="font-medium">{language === 'ar' ? 'السنة:' : 'Year:'}</span> {artwork.year}
                            </div>
                          )}
                          {artwork.medium && (
                            <div>
                              <span className="font-medium">{language === 'ar' ? 'الوسط:' : 'Medium:'}</span> {getMedium(artwork)}
                            </div>
                          )}
                          {artwork.dimensions && (
                            <div className="col-span-2">
                              <span className="font-medium">{language === 'ar' ? 'الأبعاد:' : 'Dimensions:'}</span> {artwork.dimensions}
                            </div>
                          )}
                        </div>
                        
                        {artwork.price && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-lg font-bold">
                              {formatPrice(artwork.price, artwork.currency || 'SAR')}
                            </span>
                            <Button size="sm">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {language === 'ar' ? 'استفسار' : 'Inquire'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={selectedArtworks[0].images[0]}
                  alt={getTitle(selectedArtworks[0])}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
                <img
                  src={selectedArtworks[1].images[0]}
                  alt={getTitle(selectedArtworks[1])}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ 
                    opacity: overlayOpacity / 100,
                    transform: `scale(${zoomLevel})` 
                  }}
                />
                
                {showDetails && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">{getTitle(selectedArtworks[0])}</p>
                        <p className="text-muted-foreground">{getArtistName(selectedArtworks[0])}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{getTitle(selectedArtworks[1])}</p>
                        <p className="text-muted-foreground">{getArtistName(selectedArtworks[1])}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zoom Control */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm">{language === 'ar' ? 'التكبير:' : 'Zoom:'}</span>
            <Slider
              value={[zoomLevel]}
              onValueChange={([value]) => setZoomLevel(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-64"
            />
            <span className="text-sm w-12">{Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* Comparison Table */}
          {showDetails && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      {language === 'ar' ? 'الخاصية' : 'Attribute'}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      {getTitle(selectedArtworks[0])}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      {getTitle(selectedArtworks[1])}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">{language === 'ar' ? 'الفنان' : 'Artist'}</td>
                    <td className="px-4 py-2 text-sm">{getArtistName(selectedArtworks[0])}</td>
                    <td className="px-4 py-2 text-sm">{getArtistName(selectedArtworks[1])}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">{language === 'ar' ? 'السنة' : 'Year'}</td>
                    <td className="px-4 py-2 text-sm">{selectedArtworks[0].year || '-'}</td>
                    <td className="px-4 py-2 text-sm">{selectedArtworks[1].year || '-'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">{language === 'ar' ? 'الوسط' : 'Medium'}</td>
                    <td className="px-4 py-2 text-sm">{getMedium(selectedArtworks[0]) || '-'}</td>
                    <td className="px-4 py-2 text-sm">{getMedium(selectedArtworks[1]) || '-'}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm font-medium">{language === 'ar' ? 'السعر' : 'Price'}</td>
                    <td className="px-4 py-2 text-sm">
                      {selectedArtworks[0].price ? formatPrice(selectedArtworks[0].price, selectedArtworks[0].currency || 'SAR') : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {selectedArtworks[1].price ? formatPrice(selectedArtworks[1].price, selectedArtworks[1].currency || 'SAR') : '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
