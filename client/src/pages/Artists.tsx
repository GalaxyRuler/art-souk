import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArtistCard } from "@/components/ArtistCard";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Search, Filter } from "lucide-react";

export default function Artists() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [nationality, setNationality] = useState("all");

  const { data: artists = [], isLoading, error } = useQuery({
    queryKey: ["/api/artists", { search: searchQuery, sort: sortBy, nationality }],
  });

  const { data: featuredArtists = [] } = useQuery({
    queryKey: ["/api/artists/featured"],
  });

  const filteredArtists = artists.filter((artist: any) => {
    const matchesSearch = searchQuery === "" || 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.nameAr && artist.nameAr.includes(searchQuery));
    
    const matchesNationality = nationality === "all" || artist.nationality === nationality;
    
    return matchesSearch && matchesNationality;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t("errors.loadingArtists")}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-white py-16 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={cn("text-center", isRTL && "text-right")}>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                {t("artists.title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("artists.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Artists */}
        {featuredArtists.length > 0 && (
          <section className="py-16 bg-accent/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className={cn("text-2xl font-bold text-primary mb-8", isRTL && "text-right")}>
                {t("artists.featured")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredArtists.slice(0, 3).map((artist: any) => (
                  <ArtistCard key={artist.id} artist={artist} />
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
                  placeholder={t("artists.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={nationality} onValueChange={setNationality}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("artists.filters.nationality")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("artists.filters.allCountries")}</SelectItem>
                    <SelectItem value="Saudi Arabia">{t("countries.saudiArabia")}</SelectItem>
                    <SelectItem value="UAE">{t("countries.uae")}</SelectItem>
                    <SelectItem value="Kuwait">{t("countries.kuwait")}</SelectItem>
                    <SelectItem value="Qatar">{t("countries.qatar")}</SelectItem>
                    <SelectItem value="Bahrain">{t("countries.bahrain")}</SelectItem>
                    <SelectItem value="Oman">{t("countries.oman")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("common.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t("artists.sort.latest")}</SelectItem>
                    <SelectItem value="name">{t("artists.sort.name")}</SelectItem>
                    <SelectItem value="featured">{t("artists.sort.featured")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Artists Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredArtists.length > 0 ? (
              <>
                <div className={cn("mb-6 text-sm text-gray-600", isRTL && "text-right")}>
                  {t("artists.results", { count: filteredArtists.length })}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredArtists.map((artist: any) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("artists.noResults.title")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("artists.noResults.description")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setNationality("all");
                    setSortBy("latest");
                  }}
                >
                  {t("artists.noResults.clearFilters")}
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
