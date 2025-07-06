import { useState } from "react";
import { useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtworkCard } from "@/components/ArtworkCard";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, ExternalLink, Instagram, Globe, Share2 } from "lucide-react";

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("artworks");

  const { data: artist, isLoading, error } = useQuery({
    queryKey: [`/api/artists/${id}`],
    enabled: !!id,
  });

  const { data: artworks = [] } = useQuery({
    queryKey: [`/api/artists/${id}/artworks`],
    enabled: !!id,
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artist?.name,
          text: t("artist.shareText", { name: artist?.name }),
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t("errors.artistNotFound")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("errors.artistNotFoundDescription")}
            </p>
            <Button onClick={() => window.history.back()}>
              {t("common.goBack")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading || !artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <div className="animate-pulse">
            {/* Cover Image Skeleton */}
            <div className="h-64 md:h-80 bg-gray-200"></div>
            
            {/* Profile Content Skeleton */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const name = isRTL && artist.nameAr ? artist.nameAr : artist.name;
  const biography = isRTL && artist.biographyAr ? artist.biographyAr : artist.biography;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={artist.coverImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=400"}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Profile Image */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end pb-6">
                <div className="relative">
                  <img
                    src={artist.profileImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200"}
                    alt={name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover"
                  />
                  {artist.featured && (
                    <Badge className="absolute -top-2 -right-2 bg-accent text-white">
                      {t("artist.featured")}
                    </Badge>
                  )}
                </div>
                <div className={cn("ml-6 flex-1", isRTL && "ml-0 mr-6")}>
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    {artist.nationality && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{artist.nationality}</span>
                      </div>
                    )}
                    {artist.birthYear && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>b. {artist.birthYear}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    {t("artist.share")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={cn("grid w-full grid-cols-2", isRTL && "grid-flow-row-dense")}>
                  <TabsTrigger value="artworks">{t("artist.tabs.artworks")}</TabsTrigger>
                  <TabsTrigger value="about">{t("artist.tabs.about")}</TabsTrigger>
                </TabsList>

                {/* Artworks Tab */}
                <TabsContent value="artworks" className="mt-6">
                  {artworks.length > 0 ? (
                    <>
                      <div className={cn("mb-6 text-sm text-gray-600", isRTL && "text-right")}>
                        {t("artist.artworksCount", { count: artworks.length })}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {artworks.map((artwork: any) => (
                          <ArtworkCard key={artwork.id} artwork={artwork} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("artist.noArtworks.title")}
                      </h3>
                      <p className="text-gray-600">
                        {t("artist.noArtworks.description")}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about" className="mt-6">
                  <div className={cn("space-y-6", isRTL && "text-right")}>
                    <div>
                      <h2 className="text-2xl font-bold text-primary mb-4">
                        {t("artist.about.title")}
                      </h2>
                      {biography ? (
                        <div className="prose max-w-none text-gray-600">
                          <p className="leading-relaxed">{biography}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          {t("artist.about.noBiography")}
                        </p>
                      )}
                    </div>

                    {/* Artist Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-4">
                        {t("artist.about.details")}
                      </h3>
                      <div className="space-y-3">
                        {artist.nationality && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              <strong>{t("artist.about.nationality")}:</strong> {artist.nationality}
                            </span>
                          </div>
                        )}
                        {artist.birthYear && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              <strong>{t("artist.about.birthYear")}:</strong> {artist.birthYear}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Links */}
                    {(artist.website || artist.instagram) && (
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-4">
                          {t("artist.about.links")}
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {artist.website && (
                            <a
                              href={artist.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                            >
                              <Globe className="h-4 w-4" />
                              {t("artist.about.website")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {artist.instagram && (
                            <a
                              href={`https://instagram.com/${artist.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                            >
                              <Instagram className="h-4 w-4" />
                              @{artist.instagram}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className={cn("font-semibold text-primary mb-4", isRTL && "text-right")}>
                  {t("artist.sidebar.quickInfo")}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t("artist.sidebar.artworks")}:</span>
                    <span className="font-medium">{artworks.length}</span>
                  </div>
                  {artist.nationality && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("artist.sidebar.nationality")}:</span>
                      <span className="font-medium">{artist.nationality}</span>
                    </div>
                  )}
                  {artist.birthYear && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("artist.sidebar.age")}:</span>
                      <span className="font-medium">{new Date().getFullYear() - artist.birthYear}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact/Follow */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className={cn("font-semibold text-primary mb-4", isRTL && "text-right")}>
                  {t("artist.sidebar.follow")}
                </h3>
                <div className="space-y-3">
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      {t("artist.sidebar.website")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {artist.instagram && (
                    <a
                      href={`https://instagram.com/${artist.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
