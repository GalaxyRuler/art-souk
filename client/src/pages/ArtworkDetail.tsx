import { useState } from "react";
import { useParams } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArtworkCard } from "@/components/ArtworkCard";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { Heart, Share2, ZoomIn, Ruler, Calendar, MapPin, Mail, Phone, Eye } from "lucide-react";

export default function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    message: "",
    contactEmail: "",
    contactPhone: "",
  });

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: [`/api/artworks/${id}`],
    enabled: !!id,
  });

  const { data: relatedArtworks = [] } = useQuery({
    queryKey: [`/api/artists/${artwork?.artistId}/artworks`],
    enabled: !!artwork?.artistId,
  });

  const { data: isFavorite = false } = useQuery({
    queryKey: [`/api/favorites/${id}/check`],
    enabled: isAuthenticated && !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { artworkId: parseInt(id!) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}/check`] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorite ? t("artwork.favoriteRemoved") : t("artwork.favoriteAdded"),
        description: isFavorite ? 
          t("artwork.favoriteRemovedDescription") : 
          t("artwork.favoriteAddedDescription"),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("errors.generic"),
        description: t("errors.tryAgainLater"),
        variant: "destructive",
      });
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof inquiryForm) => {
      return await apiRequest("POST", "/api/inquiries", {
        artworkId: parseInt(id!),
        ...data,
      });
    },
    onSuccess: () => {
      toast({
        title: t("artwork.inquirySent"),
        description: t("artwork.inquirySentDescription"),
      });
      setIsInquiryOpen(false);
      setInquiryForm({ message: "", contactEmail: "", contactPhone: "" });
    },
    onError: (error) => {
      toast({
        title: t("errors.generic"),
        description: t("errors.tryAgainLater"),
        variant: "destructive",
      });
    },
  });

  const handleFavorite = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    favoriteMutation.mutate();
  };

  const handleInquiry = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    const formData = {
      ...inquiryForm,
      contactEmail: inquiryForm.contactEmail || user?.email || "",
    };
    
    inquiryMutation.mutate(formData);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork?.title,
          text: t("artwork.shareText", { title: artwork?.title }),
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t("artwork.linkCopied"),
        description: t("artwork.linkCopiedDescription"),
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t("errors.artworkNotFound")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("errors.artworkNotFoundDescription")}
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

  if (isLoading || !artwork) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const title = isRTL && artwork.titleAr ? artwork.titleAr : artwork.title;
  const description = isRTL && artwork.descriptionAr ? artwork.descriptionAr : artwork.description;
  const medium = isRTL && artwork.mediumAr ? artwork.mediumAr : artwork.medium;
  const category = isRTL && artwork.categoryAr ? artwork.categoryAr : artwork.category;

  const images = artwork.images && artwork.images.length > 0 ? artwork.images : 
    ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"];

  const relatedArtworksFiltered = relatedArtworks.filter((item: any) => item.id !== artwork.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={images[selectedImageIndex]}
                  alt={title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative h-20 rounded overflow-hidden border-2 transition-colors",
                        selectedImageIndex === index ? "border-primary" : "border-transparent"
                      )}
                    >
                      <img
                        src={image}
                        alt={`${title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Artwork Details */}
            <div className={cn("space-y-6", isRTL && "text-right")}>
              {/* Category */}
              {category && (
                <Badge variant="outline" className="text-sm">
                  {category}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                {title}
              </h1>

              {/* Artist */}
              {artwork.artist && (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    <span className="font-medium">{t("artwork.artist")}:</span>{" "}
                    {isRTL && artwork.artist.nameAr ? artwork.artist.nameAr : artwork.artist.name}
                  </p>
                  {artwork.year && (
                    <p className="text-gray-600">{artwork.year}</p>
                  )}
                </div>
              )}

              {/* Description */}
              {description && (
                <div>
                  <h3 className="font-semibold text-primary mb-2">{t("artwork.description")}</h3>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-primary">{t("artwork.details")}</h3>
                
                {medium && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{medium}</span>
                  </div>
                )}
                
                {artwork.dimensions && (
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{artwork.dimensions}</span>
                  </div>
                )}
                
                {artwork.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{artwork.year}</span>
                  </div>
                )}
              </div>

              {/* Gallery */}
              {artwork.gallery && (
                <div>
                  <h3 className="font-semibold text-primary mb-2">{t("artwork.gallery")}</h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {isRTL && artwork.gallery.nameAr ? artwork.gallery.nameAr : artwork.gallery.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Price */}
              {artwork.price && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">{t("artwork.price")}</h3>
                  <p className="text-2xl font-bold text-primary">
                    {artwork.currency} {artwork.price}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      {t("artwork.inquire")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("artwork.inquiryTitle")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message">{t("artwork.inquiryMessage")}</Label>
                        <Textarea
                          id="message"
                          placeholder={t("artwork.inquiryMessagePlaceholder")}
                          value={inquiryForm.message}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t("artwork.inquiryEmail")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("artwork.inquiryEmailPlaceholder")}
                          value={inquiryForm.contactEmail}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t("artwork.inquiryPhone")}</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={t("artwork.inquiryPhonePlaceholder")}
                          value={inquiryForm.contactPhone}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                        />
                      </div>
                      <Button 
                        onClick={handleInquiry} 
                        disabled={inquiryMutation.isPending || !inquiryForm.message}
                        className="w-full"
                      >
                        {inquiryMutation.isPending ? t("common.sending") : t("artwork.sendInquiry")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
                  {isFavorite ? t("artwork.favorited") : t("artwork.favorite")}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {t("artwork.share")}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Artworks */}
          {relatedArtworksFiltered.length > 0 && (
            <section>
              <h2 className={cn("text-2xl font-bold text-primary mb-8", isRTL && "text-right")}>
                {t("artwork.moreFromArtist")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArtworksFiltered.slice(0, 4).map((relatedArtwork: any) => (
                  <ArtworkCard key={relatedArtwork.id} artwork={relatedArtwork} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
