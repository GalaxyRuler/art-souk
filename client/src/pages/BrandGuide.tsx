import { SoukkNavbar } from "@/components/SoukkNavbar";
import { SoukkFooter } from "@/components/SoukkFooter";
import { SoukkLogo } from "@/components/SoukkLogo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Download } from "lucide-react";

export default function BrandGuide() {
  const colors = {
    primary: [
      { name: "Majorelle Blue", var: "--soukk-majorelle-blue", value: "#5A4FCF" },
      { name: "Majorelle Dark", var: "--soukk-majorelle-dark", value: "#4039A3" },
      { name: "Majorelle Light", var: "--soukk-majorelle-light", value: "#7B71E0" },
    ],
    secondary: [
      { name: "Terracotta", var: "--soukk-terracotta", value: "#D2775D" },
      { name: "Terracotta Dark", var: "--soukk-terracotta-dark", value: "#B85A3C" },
      { name: "Terracotta Light", var: "--soukk-terracotta-light", value: "#E09981" },
    ],
    accent: [
      { name: "Gold", var: "--soukk-gold", value: "#D4A574" },
      { name: "Gold Dark", var: "--soukk-gold-dark", value: "#B88A4E" },
      { name: "Gold Light", var: "--soukk-gold-light", value: "#E6C19C" },
    ],
    neutral: [
      { name: "Sand Light", var: "--soukk-sand-light", value: "#FAF6F0" },
      { name: "Sand", var: "--soukk-sand", value: "#F4E8D8" },
      { name: "Sand Dark", var: "--soukk-sand-dark", value: "#E6D4BC" },
      { name: "Charcoal Light", var: "--soukk-charcoal-light", value: "#4A433E" },
      { name: "Charcoal", var: "--soukk-charcoal", value: "#2C2825" },
      { name: "Charcoal Dark", var: "--soukk-charcoal-dark", value: "#1A1714" },
    ],
  };

  const taglines = [
    { en: "Where Craft Meets Canvas", ar: "ملتقى الحِرفة والفن" },
    { en: "Authentic Art, Modern Souk", ar: "فن أصيل، سوق عصري" },
    { en: "Bridging Heritage & Artistry", ar: "جسر بين التراث والإبداع" },
  ];

  return (
    <div className="min-h-screen bg-soukk-background">
      <SoukkNavbar />
      
      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <h1 className="text-5xl font-bold text-soukk-text-primary mb-4">
            Souk.art Brand Identity Guide
          </h1>
          <p className="text-xl text-soukk-text-secondary max-w-3xl">
            A comprehensive guide to the visual identity of Souk.art - where traditional Gulf souks meet modern digital artistry.
          </p>
        </section>

        {/* Logo Variations */}
        <section className="bg-soukk-surface py-16 mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-soukk-text-primary mb-8">Logo System</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-soukk-sand-light p-8 rounded-lg mb-4">
                  <SoukkLogo variant="icon" size="lg" />
                </div>
                <h3 className="font-medium text-lg mb-2">Icon</h3>
                <p className="text-sm text-soukk-text-secondary">For app icons and small spaces</p>
              </div>
              
              <div className="text-center">
                <div className="bg-soukk-sand-light p-8 rounded-lg mb-4">
                  <SoukkLogo variant="wordmark" size="lg" />
                </div>
                <h3 className="font-medium text-lg mb-2">Wordmark</h3>
                <p className="text-sm text-soukk-text-secondary">Primary logo for headers</p>
              </div>
              
              <div className="text-center">
                <div className="bg-soukk-sand-light p-8 rounded-lg mb-4">
                  <SoukkLogo variant="emblem" size="lg" showTagline={true} />
                </div>
                <h3 className="font-medium text-lg mb-2">Emblem with Tagline</h3>
                <p className="text-sm text-soukk-text-secondary">For hero sections and marketing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <h2 className="text-3xl font-semibold text-soukk-text-primary mb-8">Color Palette</h2>
          
          {Object.entries(colors).map(([category, colorSet]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-medium text-soukk-text-primary mb-4 capitalize">
                {category} Colors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {colorSet.map((color) => (
                  <div key={color.var} className="text-center">
                    <div 
                      className="h-24 rounded-lg mb-2 border-2 border-soukk-border"
                      style={{ backgroundColor: color.value }}
                    />
                    <p className="text-sm font-medium">{color.name}</p>
                    <p className="text-xs text-soukk-text-secondary">{color.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Typography */}
        <section className="bg-soukk-surface py-16 mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-soukk-text-primary mb-8">Typography</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-medium mb-4">English - Poppins</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-5xl font-bold">Heading 1</p>
                    <p className="text-sm text-soukk-text-secondary">48px / Bold</p>
                  </div>
                  <div>
                    <p className="text-4xl font-semibold">Heading 2</p>
                    <p className="text-sm text-soukk-text-secondary">36px / Semibold</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">Heading 3</p>
                    <p className="text-sm text-soukk-text-secondary">30px / Semibold</p>
                  </div>
                  <div>
                    <p className="text-2xl font-medium">Heading 4</p>
                    <p className="text-sm text-soukk-text-secondary">24px / Medium</p>
                  </div>
                  <div>
                    <p className="text-lg">Body Large</p>
                    <p className="text-sm text-soukk-text-secondary">18px / Regular</p>
                  </div>
                  <div>
                    <p className="text-base">Body Base</p>
                    <p className="text-sm text-soukk-text-secondary">16px / Regular</p>
                  </div>
                </div>
              </div>
              
              <div dir="rtl">
                <h3 className="text-xl font-medium mb-4">العربية - Cairo</h3>
                <div className="space-y-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  <div>
                    <p className="text-5xl font-bold">عنوان رئيسي ١</p>
                    <p className="text-sm text-soukk-text-secondary">٤٨ بكسل / عريض</p>
                  </div>
                  <div>
                    <p className="text-4xl font-semibold">عنوان رئيسي ٢</p>
                    <p className="text-sm text-soukk-text-secondary">٣٦ بكسل / شبه عريض</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold">عنوان رئيسي ٣</p>
                    <p className="text-sm text-soukk-text-secondary">٣٠ بكسل / شبه عريض</p>
                  </div>
                  <div>
                    <p className="text-2xl font-medium">عنوان رئيسي ٤</p>
                    <p className="text-sm text-soukk-text-secondary">٢٤ بكسل / متوسط</p>
                  </div>
                  <div>
                    <p className="text-lg">نص كبير</p>
                    <p className="text-sm text-soukk-text-secondary">١٨ بكسل / عادي</p>
                  </div>
                  <div>
                    <p className="text-base">نص أساسي</p>
                    <p className="text-sm text-soukk-text-secondary">١٦ بكسل / عادي</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Taglines */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <h2 className="text-3xl font-semibold text-soukk-text-primary mb-8">Brand Taglines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {taglines.map((tagline, index) => (
              <Card key={index} className="p-6 text-center">
                <p className="text-lg font-medium text-soukk-text-primary mb-2">{tagline.en}</p>
                <p className="text-lg font-medium text-soukk-text-secondary" dir="rtl">{tagline.ar}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* UI Components */}
        <section className="bg-soukk-surface py-16 mb-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-soukk-text-primary mb-8">UI Components</h2>
            
            <div className="space-y-8">
              {/* Buttons */}
              <div>
                <h3 className="text-xl font-medium mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="soukk-button soukk-button-primary">Primary Button</Button>
                  <Button className="soukk-button soukk-button-secondary">Secondary Button</Button>
                  <Button className="soukk-button soukk-button-gold">Gold Button</Button>
                </div>
              </div>
              
              {/* Badges */}
              <div>
                <h3 className="text-xl font-medium mb-4">Badges</h3>
                <div className="flex flex-wrap gap-4">
                  <Badge className="soukk-badge soukk-badge-gold">Featured</Badge>
                  <Badge className="soukk-badge soukk-badge-blue">New</Badge>
                  <Badge variant="destructive">Live</Badge>
                </div>
              </div>
              
              {/* Cards */}
              <div>
                <h3 className="text-xl font-medium mb-4">Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="soukk-card">
                    <h4 className="font-medium mb-2">Standard Card</h4>
                    <p className="text-sm text-soukk-text-secondary">
                      Cards feature a subtle top border gradient and hover effects.
                    </p>
                  </div>
                  <div className="soukk-card soukk-arch-frame aspect-[4/5] flex items-center justify-center">
                    <p className="text-center">Arch Frame Card</p>
                  </div>
                  <div className="soukk-card relative overflow-hidden">
                    <div className="absolute inset-0 soukk-mashrabiya"></div>
                    <div className="relative">
                      <h4 className="font-medium mb-2">Pattern Overlay</h4>
                      <p className="text-sm text-soukk-text-secondary">
                        Mashrabiya pattern overlay for decorative effect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Motifs */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <h2 className="text-3xl font-semibold text-soukk-text-primary mb-8">Visual Motifs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="h-32 w-32 mx-auto mb-4 soukk-arch-frame bg-soukk-majorelle-blue/20"></div>
              <h3 className="font-medium">Arch Shape</h3>
              <p className="text-sm text-soukk-text-secondary">Islamic architecture inspired</p>
            </div>
            
            <div className="text-center">
              <div className="h-32 w-32 mx-auto mb-4 bg-soukk-sand relative overflow-hidden rounded-lg">
                <div className="absolute inset-0 soukk-mashrabiya"></div>
              </div>
              <h3 className="font-medium">Mashrabiya Pattern</h3>
              <p className="text-sm text-soukk-text-secondary">Traditional lattice work</p>
            </div>
            
            <div className="text-center">
              <div className="h-32 w-32 mx-auto mb-4 bg-soukk-sand rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 soukk-star bg-contain bg-no-repeat bg-center"></div>
              </div>
              <h3 className="font-medium">8-Point Star</h3>
              <p className="text-sm text-soukk-text-secondary">Islamic geometric motif</p>
            </div>
            
            <div className="text-center">
              <div className="h-32 w-32 mx-auto mb-4 soukk-zellige rounded-lg"></div>
              <h3 className="font-medium">Zellige Pattern</h3>
              <p className="text-sm text-soukk-text-secondary">Moroccan tile inspiration</p>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="bg-soukk-majorelle-blue py-16 text-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold mb-4">Download Brand Assets</h2>
            <p className="text-xl mb-8 opacity-90">
              Get the complete brand kit including logos, colors, and guidelines
            </p>
            <Button className="bg-white text-soukk-majorelle-blue hover:bg-soukk-sand">
              <Download className="mr-2 h-5 w-5" />
              Download Brand Kit
            </Button>
          </div>
        </section>
      </main>
      
      <SoukkFooter />
    </div>
  );
}