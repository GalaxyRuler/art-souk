import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Home,
  Sofa,
  Bed,
  UtensilsCrossed,
  Briefcase,
  Ruler,
  Palette,
  Sun,
  Moon,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface WallPreviewProps {
  artworkImage: string;
  artworkTitle: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

const roomPresets = [
  {
    id: 'living',
    name: 'Living Room',
    nameAr: 'غرفة المعيشة',
    icon: Sofa,
    wallColor: '#F5F5F5',
    wallTexture: 'smooth',
    furniture: true,
    baseHeight: 300
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    nameAr: 'غرفة النوم',
    icon: Bed,
    wallColor: '#E8DCC4',
    wallTexture: 'smooth',
    furniture: true,
    baseHeight: 250
  },
  {
    id: 'dining',
    name: 'Dining Room',
    nameAr: 'غرفة الطعام',
    icon: UtensilsCrossed,
    wallColor: '#FFFFFF',
    wallTexture: 'smooth',
    furniture: true,
    baseHeight: 280
  },
  {
    id: 'office',
    name: 'Office',
    nameAr: 'المكتب',
    icon: Briefcase,
    wallColor: '#2C3E50',
    wallTexture: 'smooth',
    furniture: true,
    baseHeight: 240
  },
  {
    id: 'gallery',
    name: 'Gallery',
    nameAr: 'معرض',
    icon: Home,
    wallColor: '#FFFFFF',
    wallTexture: 'smooth',
    furniture: false,
    baseHeight: 350
  }
];

const lightingModes = [
  { id: 'daylight', name: 'Daylight', nameAr: 'ضوء النهار', icon: Sun, brightness: 1.2, warmth: 0 },
  { id: 'evening', name: 'Evening', nameAr: 'المساء', icon: Moon, brightness: 0.9, warmth: 20 },
  { id: 'spotlight', name: 'Spotlight', nameAr: 'كشاف', icon: Lightbulb, brightness: 1.1, warmth: 5 }
];

export function WallPreview({ artworkImage, artworkTitle, dimensions }: WallPreviewProps) {
  const { language } = useLanguage();
  const [selectedRoom, setSelectedRoom] = useState('living');
  const [customWallColor, setCustomWallColor] = useState('#FFFFFF');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 40 });
  const [lighting, setLighting] = useState('daylight');
  const [showRuler, setShowRuler] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentRoom = roomPresets.find(r => r.id === selectedRoom) || roomPresets[0];
  const currentLighting = lightingModes.find(l => l.id === lighting) || lightingModes[0];

  const getRoomName = (room: typeof roomPresets[0]) => 
    language === 'ar' ? room.nameAr : room.name;

  const getLightingName = (mode: typeof lightingModes[0]) => 
    language === 'ar' ? mode.nameAr : mode.name;

  const calculateArtworkSize = () => {
    if (!dimensions) return { width: 150 * scale, height: 100 * scale };
    
    const ratio = dimensions.width / dimensions.height;
    const baseWidth = 150 * scale;
    return {
      width: baseWidth,
      height: baseWidth / ratio
    };
  };

  const artworkSize = calculateArtworkSize();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          {language === 'ar' ? 'معاينة الجدار' : 'Wall Preview'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الغرفة' : 'Room'}
            </label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roomPresets.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    <div className="flex items-center gap-2">
                      <room.icon className="h-4 w-4" />
                      {getRoomName(room)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'لون الجدار' : 'Wall Color'}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customWallColor}
                onChange={(e) => setCustomWallColor(e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomWallColor(currentRoom.wallColor)}
              >
                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الإضاءة' : 'Lighting'}
            </label>
            <Select value={lighting} onValueChange={setLighting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lightingModes.map(mode => (
                  <SelectItem key={mode.id} value={mode.id}>
                    <div className="flex items-center gap-2">
                      <mode.icon className="h-4 w-4" />
                      {getLightingName(mode)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Size Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'حجم العمل الفني' : 'Artwork Size'}: {Math.round(scale * 100)}%
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRuler(!showRuler)}
            >
              <Ruler className="h-4 w-4 mr-2" />
              {showRuler ? (language === 'ar' ? 'إخفاء المسطرة' : 'Hide Ruler') : (language === 'ar' ? 'إظهار المسطرة' : 'Show Ruler')}
            </Button>
          </div>
          <Slider
            value={[scale]}
            onValueChange={([value]) => setScale(value)}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Preview Canvas */}
        <div 
          ref={canvasRef}
          className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-inner"
          style={{
            backgroundColor: customWallColor,
            background: `linear-gradient(180deg, ${customWallColor} 0%, ${customWallColor}dd 100%)`,
            filter: `brightness(${currentLighting.brightness}) hue-rotate(${currentLighting.warmth}deg)`
          }}
        >
          {/* Room Elements */}
          {currentRoom.furniture && (
            <>
              {/* Floor */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-32"
                style={{
                  background: 'linear-gradient(180deg, rgba(139,90,43,0.2) 0%, rgba(139,90,43,0.4) 100%)',
                  borderTop: '2px solid rgba(139,90,43,0.3)'
                }}
              />
              
              {/* Furniture Silhouettes */}
              {selectedRoom === 'living' && (
                <div className="absolute bottom-0 left-1/4 w-1/2 h-24 bg-gray-800/20 rounded-t-lg" />
              )}
              {selectedRoom === 'dining' && (
                <div className="absolute bottom-0 left-1/3 w-1/3 h-20 bg-gray-800/20 rounded-t" />
              )}
            </>
          )}

          {/* Ruler */}
          {showRuler && dimensions && (
            <>
              <div className="absolute top-4 left-4 right-4 h-8 bg-white/80 rounded flex items-center px-2">
                <div className="flex-1 border-t-2 border-gray-400 relative">
                  {[0, 25, 50, 75, 100].map(mark => (
                    <div
                      key={mark}
                      className="absolute top-0 w-px h-4 bg-gray-400"
                      style={{ left: `${mark}%` }}
                    >
                      <span className="absolute top-4 text-xs -translate-x-1/2">
                        {mark}cm
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-12 left-4 bottom-4 w-8 bg-white/80 rounded flex flex-col items-center py-2">
                <div className="flex-1 border-l-2 border-gray-400 relative">
                  {[0, 25, 50, 75, 100].map(mark => (
                    <div
                      key={mark}
                      className="absolute left-0 h-px w-4 bg-gray-400"
                      style={{ top: `${mark}%` }}
                    >
                      <span className="absolute left-6 text-xs -translate-y-1/2">
                        {mark}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Artwork with Shadow */}
          <div
            className="absolute transition-all duration-300 cursor-move"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: 'translate(-50%, -50%)',
              width: artworkSize.width,
              height: artworkSize.height,
              filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
            }}
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;
              const startPosX = position.x;
              const startPosY = position.y;

              const handleMouseMove = (e: MouseEvent) => {
                if (!canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const deltaX = ((e.clientX - startX) / rect.width) * 100;
                const deltaY = ((e.clientY - startY) / rect.height) * 100;
                
                setPosition({
                  x: Math.max(10, Math.min(90, startPosX + deltaX)),
                  y: Math.max(10, Math.min(80, startPosY + deltaY))
                });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <img
              src={artworkImage}
              alt={artworkTitle}
              className="w-full h-full object-contain bg-white p-2"
              draggable={false}
            />
            {/* Frame */}
            <div className="absolute inset-0 border-8 border-gray-800 pointer-events-none" />
          </div>

          {/* Spotlight Effect */}
          {lighting === 'spotlight' && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${position.x}%`,
                top: `${position.y - 20}%`,
                transform: 'translate(-50%, -50%)',
                width: artworkSize.width * 2,
                height: artworkSize.height * 2,
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%)',
                filter: 'blur(20px)'
              }}
            />
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground text-center">
          {language === 'ar' ? 
            'اسحب العمل الفني لتغيير موضعه على الجدار' : 
            'Drag the artwork to reposition it on the wall'
          }
        </p>
      </CardContent>
    </Card>
  );
}
