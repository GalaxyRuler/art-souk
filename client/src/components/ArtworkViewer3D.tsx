import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Move3d,
  Frame,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtworkViewer3DProps {
  imageUrl: string;
  title: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

export function ArtworkViewer3D({ imageUrl, title, dimensions }: ArtworkViewer3DProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState('none');
  const [lighting, setLighting] = useState('gallery');
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const frames = [
    { id: 'none', name: 'No Frame', border: 'none' },
    { id: 'classic', name: 'Classic Gold', border: '20px solid #D4AF37' },
    { id: 'modern', name: 'Modern Black', border: '15px solid #1a1a1a' },
    { id: 'minimal', name: 'Minimal White', border: '10px solid #ffffff' },
  ];

  const lightingModes = [
    { id: 'gallery', name: 'Gallery', filter: 'brightness(1) contrast(1)' },
    { id: 'spotlight', name: 'Spotlight', filter: 'brightness(1.2) contrast(1.1)' },
    { id: 'warm', name: 'Warm', filter: 'brightness(1.1) sepia(0.2)' },
    { id: 'cool', name: 'Cool', filter: 'brightness(1.05) hue-rotate(10deg)' },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentFrame = frames.find(f => f.id === frame);
  const currentLighting = lightingModes.find(l => l.id === lighting);

  return (
    <Card 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gray-100",
        isFullscreen && "fixed inset-0 z-50 rounded-none"
      )}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleFullscreen}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">3D Artwork Viewer</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRotation({ x: 0, y: 0 })}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Frame className="h-3 w-3" />
                Frame Style
              </label>
              <select
                value={frame}
                onChange={(e) => setFrame(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1"
              >
                {frames.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1">
                <Palette className="h-3 w-3" />
                Lighting
              </label>
              <select
                value={lighting}
                onChange={(e) => setLighting(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1"
              >
                {lightingModes.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Zoom: {Math.round(zoom * 100)}%</label>
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Move3d className="h-3 w-3" />
            Click and drag to rotate the artwork
          </p>
        </div>
      </div>

      <div 
        className="relative w-full h-[600px] flex items-center justify-center cursor-move"
        onMouseDown={handleMouseDown}
        style={{
          perspective: '1000px',
          background: 'radial-gradient(circle, #f5f5f5 0%, #e0e0e0 100%)'
        }}
      >
        <div
          className="relative transition-transform duration-100"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
            transformStyle: 'preserve-3d',
            filter: currentLighting?.filter
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[500px] object-contain shadow-2xl"
            style={{
              border: currentFrame?.border,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
            draggable={false}
          />
          {dimensions && (
            <div 
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {dimensions.width} × {dimensions.height} {dimensions.unit}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}