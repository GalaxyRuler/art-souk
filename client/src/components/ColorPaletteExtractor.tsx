import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Palette,
  Copy,
  Download,
  RefreshCw,
  Pipette,
  Grid3x3,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  name: string;
  nameAr: string;
  percentage: number;
}

interface ColorPaletteExtractorProps {
  imageUrl: string;
  artworkTitle: string;
  onColorSelect?: (color: Color) => void;
}

const colorNames: Record<string, { en: string; ar: string }> = {
  '#FF0000': { en: 'Red', ar: 'أحمر' },
  '#00FF00': { en: 'Green', ar: 'أخضر' },
  '#0000FF': { en: 'Blue', ar: 'أزرق' },
  '#FFFF00': { en: 'Yellow', ar: 'أصفر' },
  '#FF00FF': { en: 'Magenta', ar: 'أرجواني' },
  '#00FFFF': { en: 'Cyan', ar: 'سماوي' },
  '#FFA500': { en: 'Orange', ar: 'برتقالي' },
  '#800080': { en: 'Purple', ar: 'بنفسجي' },
  '#FFC0CB': { en: 'Pink', ar: 'وردي' },
  '#A52A2A': { en: 'Brown', ar: 'بني' },
  '#808080': { en: 'Gray', ar: 'رمادي' },
  '#000000': { en: 'Black', ar: 'أسود' },
  '#FFFFFF': { en: 'White', ar: 'أبيض' },
};

export function ColorPaletteExtractor({ imageUrl, artworkTitle, onColorSelect }: ColorPaletteExtractorProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'palette' | 'grid' | 'gradient'>('palette');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Simulate color extraction (in a real app, this would use a proper color extraction library)
  const extractColors = () => {
    setLoading(true);
    
    // Simulated color extraction - in production, use a library like color-thief
    setTimeout(() => {
      const simulatedColors: Color[] = [
        { 
          hex: '#2C3E50', 
          rgb: { r: 44, g: 62, b: 80 }, 
          name: 'Midnight Blue', 
          nameAr: 'أزرق منتصف الليل',
          percentage: 25 
        },
        { 
          hex: '#E74C3C', 
          rgb: { r: 231, g: 76, b: 60 }, 
          name: 'Alizarin', 
          nameAr: 'أليزارين',
          percentage: 20 
        },
        { 
          hex: '#F39C12', 
          rgb: { r: 243, g: 156, b: 18 }, 
          name: 'Orange', 
          nameAr: 'برتقالي',
          percentage: 18 
        },
        { 
          hex: '#27AE60', 
          rgb: { r: 39, g: 174, b: 96 }, 
          name: 'Nephritis', 
          nameAr: 'أخضر نفريت',
          percentage: 15 
        },
        { 
          hex: '#8E44AD', 
          rgb: { r: 142, g: 68, b: 173 }, 
          name: 'Wisteria', 
          nameAr: 'ويستيريا',
          percentage: 12 
        },
        { 
          hex: '#ECF0F1', 
          rgb: { r: 236, g: 240, b: 241 }, 
          name: 'Clouds', 
          nameAr: 'سحاب',
          percentage: 10 
        }
      ];
      
      setColors(simulatedColors);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    extractColors();
  }, [imageUrl]);

  const copyToClipboard = async (color: Color) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopiedColor(color.hex);
      toast({
        title: language === 'ar' ? 'تم النسخ!' : 'Copied!',
        description: `${color.hex} ${language === 'ar' ? 'تم نسخه إلى الحافظة' : 'copied to clipboard'}`,
      });
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل نسخ اللون' : 'Failed to copy color',
        variant: 'destructive',
      });
    }
  };

  const downloadPalette = () => {
    const paletteData = colors.map(c => ({
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      name: language === 'ar' ? c.nameAr : c.name,
      percentage: `${c.percentage}%`
    }));

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artworkTitle.replace(/\s+/g, '-').toLowerCase()}-palette.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: language === 'ar' ? 'تم التنزيل' : 'Downloaded',
      description: language === 'ar' ? 'تم تنزيل لوحة الألوان' : 'Color palette downloaded',
    });
  };

  const getColorName = (color: Color) => language === 'ar' ? color.nameAr : color.name;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {language === 'ar' ? 'لوحة الألوان' : 'Color Palette'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={extractColors}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              {language === 'ar' ? 'إعادة استخراج' : 'Re-extract'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadPalette}
              disabled={colors.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تنزيل' : 'Download'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* View Mode Selector */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'palette' ? 'default' : 'outline'}
            onClick={() => setViewMode('palette')}
          >
            <Pipette className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'لوحة' : 'Palette'}
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'شبكة' : 'Grid'}
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'gradient' ? 'default' : 'outline'}
            onClick={() => setViewMode('gradient')}
          >
            <Palette className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تدرج' : 'Gradient'}
          </Button>
        </div>

        {/* Artwork Preview */}
        <div className="relative">
          <img
            ref={imageRef}
            src={imageUrl}
            alt={artworkTitle}
            className="w-full h-48 object-cover rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Color Display */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
          </div>
        ) : (
          <>
            {/* Palette View */}
            {viewMode === 'palette' && (
              <div className="space-y-3">
                {colors.map((color) => (
                  <div
                    key={color.hex}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:shadow-md hover:scale-[1.02]",
                      selectedColor?.hex === color.hex && "ring-2 ring-brand-navy"
                    )}
                    onClick={() => {
                      setSelectedColor(color);
                      onColorSelect?.(color);
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{getColorName(color)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {color.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{color.hex}</span>
                        <span>RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(color);
                      }}
                    >
                      {copiedColor === color.hex ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-3 gap-4">
                {colors.map((color) => (
                  <div
                    key={color.hex}
                    className={cn(
                      "relative group cursor-pointer transition-all",
                      "hover:scale-105",
                      selectedColor?.hex === color.hex && "ring-2 ring-brand-navy rounded-lg"
                    )}
                    onClick={() => {
                      setSelectedColor(color);
                      onColorSelect?.(color);
                    }}
                  >
                    <div
                      className="aspect-square rounded-lg shadow-lg"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 rounded-lg transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                        <p className="font-semibold text-sm">{getColorName(color)}</p>
                        <p className="text-xs">{color.hex}</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(color);
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {language === 'ar' ? 'نسخ' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs"
                    >
                      {color.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Gradient View */}
            {viewMode === 'gradient' && (
              <div className="space-y-4">
                <div
                  className="h-24 rounded-lg shadow-inner"
                  style={{
                    background: `linear-gradient(to right, ${colors.map(c => c.hex).join(', ')})`
                  }}
                />
                <div className="flex justify-between">
                  {colors.map((color) => (
                    <div
                      key={color.hex}
                      className="text-center cursor-pointer"
                      onClick={() => {
                        setSelectedColor(color);
                        onColorSelect?.(color);
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-1 shadow-md"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="text-xs font-medium">{color.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Selected Color Details */}
        {selectedColor && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">
                {language === 'ar' ? 'اللون المحدد' : 'Selected Color'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </p>
                  <p className="font-medium">{getColorName(selectedColor)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">HEX</p>
                  <p className="font-mono">{selectedColor.hex}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">RGB</p>
                  <p className="font-mono">
                    {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'النسبة' : 'Percentage'}
                  </p>
                  <p className="font-medium">{selectedColor.percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}