import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search as SearchIcon, Filter, X, SlidersHorizontal } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { ArtworkCard } from "@/components/ArtworkCard";
import { ArtistCard } from "@/components/ArtistCard";

interface SearchFilters {
  query: string;
  type: 'all' | 'artworks' | 'artists' | 'galleries';
  category: string;
  medium: string;
  style: string;
  priceRange: [number, number];
  availability: string[];
  nationality: string;
  yearRange: [number, number];
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'name';
}

interface SearchResult {
  artworks: any[];
  artists: any[];
  galleries: any[];
  total: number;
}

export default function Search() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    category: 'all',
    medium: 'all',
    style: 'all',
    priceRange: [0, 100000],
    availability: [],
    nationality: 'all',
    yearRange: [1900, 2024],
    sortBy: 'relevance'
  });

  // Get query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const query = params.get('q') || '';
    setFilters(prev => ({ ...prev, query }));
  }, [location]);

  const { data: searchResults, isLoading } = useQuery<SearchResult>({
    queryKey: ['/api/search', filters],
    enabled: filters.query.length > 0,
  });

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    setLocation(`/search?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      type: 'all',
      category: '',
      medium: '',
      style: '',
      priceRange: [0, 100000],
      availability: [],
      nationality: 'all',
      yearRange: [1900, 2024],
      sortBy: 'relevance'
    }));
  };

  const categories = [
    'Contemporary', 'Traditional', 'Islamic Art', 'Abstract', 'Landscape', 
    'Portrait', 'Calligraphy', 'Digital', 'Photography', 'Sculpture'
  ];

  const mediums = [
    'Oil on canvas', 'Acrylic', 'Watercolor', 'Mixed media', 'Digital art',
    'Photography', 'Sculpture', 'Installation', 'Video art', 'Printmaking'
  ];

  const styles = [
    'Realism', 'Abstract', 'Impressionism', 'Minimalism', 'Contemporary',
    'Traditional', 'Modern', 'Expressionism', 'Geometric', 'Conceptual'
  ];

  const availabilityOptions = ['available', 'sold', 'on_auction', 'reserved'];

  const nationalities = [
    'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 
    'Jordan', 'Lebanon', 'Egypt', 'Syria', 'Iraq', 'Palestine'
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder={t("search.placeholder")}
                value={filters.query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-12 text-lg border-brand-purple/20 focus:border-brand-purple"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6 border-brand-purple/20 hover:bg-brand-light-gold"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            {['all', 'artworks', 'artists', 'galleries'].map((type) => (
              <Button
                key={type}
                variant={filters.type === type ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('type', type as any)}
                className={cn(
                  filters.type === type 
                    ? "bg-brand-purple text-white" 
                    : "border-brand-purple/20 hover:bg-brand-light-gold"
                )}
              >
                {t(`search.types.${type}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Advanced Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <Card className="card-elevated sticky top-8">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-brand-charcoal">
                      Advanced Filters
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="text-brand-purple hover:bg-brand-light-gold"
                    >
                      Clear All
                    </Button>
                  </div>

                  <Separator />

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Medium Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Medium</Label>
                    <Select value={filters.medium} onValueChange={(value) => handleFilterChange('medium', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Mediums</SelectItem>
                        {mediums.map((medium) => (
                          <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Style Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Style</Label>
                    <Select value={filters.style} onValueChange={(value) => handleFilterChange('style', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Styles</SelectItem>
                        {styles.map((style) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Price Range ({isRTL ? "ر.س" : "SAR"})
                    </Label>
                    <div className="px-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                        max={100000}
                        min={0}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{formatPrice(filters.priceRange[0], "SAR", isRTL ? 'ar' : 'en')}</span>
                        <span>{formatPrice(filters.priceRange[1], "SAR", isRTL ? 'ar' : 'en')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Availability</Label>
                    <div className="space-y-2">
                      {availabilityOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <Checkbox
                            id={option}
                            checked={filters.availability.includes(option)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange('availability', [...filters.availability, option]);
                              } else {
                                handleFilterChange('availability', filters.availability.filter(a => a !== option));
                              }
                            }}
                          />
                          <Label htmlFor={option} className="text-sm">
                            {t(`artwork.status.${option}`)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nationality Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Nationality</Label>
                    <Select value={filters.nationality} onValueChange={(value) => handleFilterChange('nationality', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Nationalities</SelectItem>
                        {nationalities.map((nationality) => (
                          <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Year Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Year</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.yearRange}
                        onValueChange={(value) => handleFilterChange('yearRange', value as [number, number])}
                        max={2024}
                        min={1900}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{filters.yearRange[0]}</span>
                        <span>{filters.yearRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search Results */}
          <div className={cn("space-y-6", showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
            {/* Results Header */}
            {filters.query && (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-brand-charcoal">
                    Search Results for "{filters.query}"
                  </h2>
                  {searchResults && (
                    <p className="text-muted-foreground">
                      {searchResults.total} results found
                    </p>
                  )}
                </div>
                
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value as any)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="year_desc">Newest First</SelectItem>
                    <SelectItem value="year_asc">Oldest First</SelectItem>
                    <SelectItem value="name">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Query State */}
            {!filters.query && (
              <div className="text-center py-16">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                  Start your search
                </h3>
                <p className="text-muted-foreground">
                  Search for artworks, artists, galleries and more
                </p>
              </div>
            )}

            {/* No Results */}
            {filters.query && searchResults && searchResults.total === 0 && (
              <div className="text-center py-16">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-brand-charcoal mb-2">
                  No results found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearFilters} variant="outline" className="border-brand-purple text-brand-purple">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Results */}
            {searchResults && searchResults.total > 0 && (
              <div className="space-y-8">
                {/* Artworks */}
                {(filters.type === 'all' || filters.type === 'artworks') && searchResults.artworks.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-charcoal mb-4">
                      Artworks ({searchResults.artworks.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.artworks.map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Artists */}
                {(filters.type === 'all' || filters.type === 'artists') && searchResults.artists.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-charcoal mb-4">
                      Artists ({searchResults.artists.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.artists.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Galleries */}
                {(filters.type === 'all' || filters.type === 'galleries') && searchResults.galleries.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-brand-charcoal mb-4">
                      Galleries ({searchResults.galleries.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.galleries.map((gallery) => (
                        <Card key={gallery.id} className="card-elevated cursor-pointer">
                          <CardContent className="p-6">
                            <h4 className="font-semibold text-brand-purple mb-2">
                              {isRTL && gallery.nameAr ? gallery.nameAr : gallery.name}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {isRTL && gallery.locationAr ? gallery.locationAr : gallery.location}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}