import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Search, Filter, MapPin, Phone, ExternalLink } from "lucide-react";

export default function Galleries() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [location, setLocation] = useState("all");

  const { data: galleries = [], isLoading, error } = useQuery({
    queryKey: ["/api/galleries", { search: searchQuery, sort: sortBy, location }],
  });

  const { data: featuredGalleries = [] } = useQuery({
    queryKey: ["/api/galleries/featured"],
  });

  const filteredGalleries = galleries.filter((gallery: any) => {
    const matchesSearch = searchQuery === "" || 
      gallery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (gallery.nameAr && gallery.nameAr.includes(searchQuery));
    
    const matchesLocation = location === "all" || gallery.location === location;
    
    return matchesSearch && matchesLocation;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t("errors.loadingGalleries")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("errors.tryAgainLater")}
            </p>
            <Button onClick={() => window.location.reload()}>
              {t("common.retry")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const GalleryCard = ({ gallery }: { gallery: any }) => {
    const name = isRTL && gallery.nameAr ? gallery.nameAr : gallery.name;
    const description = isRTL && gallery.descriptionAr ? gallery.descriptionAr : gallery.description;
    const locationText = isRTL && gallery.locationAr ? gallery.locationAr : gallery.location;

    return (
      <Card className="overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg">
        <Link href={`/galleries/${gallery.id}`}>
          <div className="relative">
            <img
              src={gallery.coverImage || "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"}
              alt={name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {gallery.featured && (
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="text-xs">
                    {t("galleries.featured")}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-primary mb-2 line-clamp-1">{name}</h3>
            
            {locationText && (
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{locationText}</span>
              </div>
            )}

            {description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {gallery.website && (
                <div className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>{t("galleries.website")}</span>
                </div>
              )}
              {gallery.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{t("galleries.contact")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-white py-16 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("text-center", isRTL && "text-right")}>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                {t("galleries.title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("galleries.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Galleries */}
        {featuredGalleries.length > 0 && (
          <section className="py-16 bg-accent/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className={cn("text-2xl font-bold text-primary mb-8", isRTL && "text-right")}>
                {t("galleries.featured")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredGalleries.slice(0, 3).map((gallery: any) => (
                  <GalleryCard key={gallery.id} gallery={gallery} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={cn("absolute top-3 h-4 w-4 text-gray-400", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t("galleries.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("galleries.filters.location")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("galleries.filters.allLocations")}</SelectItem>
                    {/* Saudi Arabia */}
                    <SelectItem value="Riyadh">{t("cities.riyadh")}</SelectItem>
                    <SelectItem value="Jeddah">{t("cities.jeddah")}</SelectItem>
                    <SelectItem value="Dammam">{t("cities.dammam")}</SelectItem>
                    <SelectItem value="Khobar">{t("cities.khobar")}</SelectItem>
                    <SelectItem value="Makkah">{t("cities.makkah")}</SelectItem>
                    <SelectItem value="Madinah">{t("cities.madinah")}</SelectItem>
                    <SelectItem value="Tabuk">{t("cities.tabuk")}</SelectItem>
                    <SelectItem value="Abha">{t("cities.abha")}</SelectItem>
                    {/* UAE */}
                    <SelectItem value="Dubai">{t("cities.dubai")}</SelectItem>
                    <SelectItem value="Abu Dhabi">{t("cities.abuDhabi")}</SelectItem>
                    <SelectItem value="Sharjah">{t("cities.sharjah")}</SelectItem>
                    <SelectItem value="Ajman">{t("cities.ajman")}</SelectItem>
                    <SelectItem value="Fujairah">{t("cities.fujairah")}</SelectItem>
                    <SelectItem value="Ras Al Khaimah">{t("cities.rasAlKhaimah")}</SelectItem>
                    {/* Kuwait */}
                    <SelectItem value="Kuwait City">{t("cities.kuwaitCity")}</SelectItem>
                    {/* Qatar */}
                    <SelectItem value="Doha">{t("cities.doha")}</SelectItem>
                    {/* Bahrain */}
                    <SelectItem value="Manama">{t("cities.manama")}</SelectItem>
                    {/* Oman */}
                    <SelectItem value="Muscat">{t("cities.muscat")}</SelectItem>
                    <SelectItem value="Salalah">{t("cities.salalah")}</SelectItem>
                    <SelectItem value="Sohar">{t("cities.sohar")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("common.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t("galleries.sort.latest")}</SelectItem>
                    <SelectItem value="name">{t("galleries.sort.name")}</SelectItem>
                    <SelectItem value="featured">{t("galleries.sort.featured")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Galleries Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredGalleries.length > 0 ? (
              <>
                <div className={cn("mb-6 text-sm text-gray-600", isRTL && "text-right")}>
                  {t("galleries.results", { count: filteredGalleries.length })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGalleries.map((gallery: any) => (
                    <GalleryCard key={gallery.id} gallery={gallery} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("galleries.noResults.title")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("galleries.noResults.description")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setLocation("all");
                    setSortBy("latest");
                  }}
                >
                  {t("galleries.noResults.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
