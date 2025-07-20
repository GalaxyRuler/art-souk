import { useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Share2, Eye, MapPin, Calendar, Palette, Ruler, ArrowLeft, ExternalLink } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArtworkCard } from "@/components/ArtworkCard";
import { LikeButton, CommentsSection } from "@/components/SocialComponents";

interface ArtworkDetail {
  id: number;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  images: string[];
  artist?: {
    id: number;
    name: string;
    nameAr?: string;
    biography?: string;
    biographyAr?: string;
    nationality?: string;
    birthYear?: number;
    profileImage?: string;
  };
  gallery?: {
    id: number;
    name: string;
    nameAr?: string;
    location?: string;
    locationAr?: string;
    website?: string;
    phone?: string;
    email?: string;
  };
  year?: number;
  medium?: string;
  mediumAr?: string;
  dimensions?: string;
  price?: string;
  currency?: string;
  category?: string;
  categoryAr?: string;
  style?: string;
  styleAr?: string;
  availability?: string;
  paymentLink?: string;
  featured?: boolean;
}

interface SimilarArtwork {
  id: number;
  title: string;
  titleAr?: string;
  images: string[];
  artist?: {
    name: string;
    nameAr?: string;
  };
  price?: string;
  currency?: string;
  availability?: string;
}

export default function ArtworkDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const { data: artwork, isLoading } = useQuery<ArtworkDetail>({
    queryKey: [`/api/artworks/${id}`],
  });

  const { data: similarArtworks } = useQuery<SimilarArtwork[]>({
    queryKey: [`/api/artworks/${id}/similar`],
    enabled: !!artwork,
  });

  const { data: isFavorite } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/${id}/check`],
    enabled: isAuthenticated && !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite?.isFavorite) {
        await apiRequest(`/api/favorites/${id}`, { method: 'DELETE' });
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: { artworkId: parseInt(id!) },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${id}/check`] });
      toast({
        title: isFavorite?.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite?.isFavorite ? "Artwork removed from your collection" : "Artwork saved to your collection",
      });
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: typeof inquiryForm) => {
      await apiRequest('/api/inquiries', {
        method: 'POST',
        body: {
          artworkId: parseInt(id!),
          ...data,
        },
      });
    },
    onSuccess: () => {
      setIsInquiryOpen(false);
      setInquiryForm({ name: "", email: "", phone: "", message: "" });
      toast({
        title: "Inquiry sent successfully",
        description: "We'll contact you soon with more information.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="h-96 bg-muted rounded-2xl"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 w-20 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artwork not found</h1>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = isRTL && artwork.titleAr ? artwork.titleAr : artwork.title;
  const description = isRTL && artwork.descriptionAr ? artwork.descriptionAr : artwork.description;
  const artistName = isRTL && artwork.artist?.nameAr ? artwork.artist.nameAr : artwork.artist?.name;
  const artistBio = isRTL && artwork.artist?.biographyAr ? artwork.artist.biographyAr : artwork.artist?.biography;
  const galleryName = isRTL && artwork.gallery?.nameAr ? artwork.gallery.nameAr : artwork.gallery?.name;
  const galleryLocation = isRTL && artwork.gallery?.locationAr ? artwork.gallery.locationAr : artwork.gallery?.location;
  const medium = isRTL && artwork.mediumAr ? artwork.mediumAr : artwork.medium;
  const category = isRTL && artwork.categoryAr ? artwork.categoryAr : artwork.category;
  const style = isRTL && artwork.styleAr ? artwork.styleAr : artwork.style;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${title} by ${artistName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Artwork link copied to clipboard",
      });
    }
  };

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    inquiryMutation.mutate(inquiryForm);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 hover:bg-brand-light-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={artwork?.images?.[selectedImageIndex] || artwork?.images?.[0] || ""}
                alt={title}
                className="w-full h-96 md:h-[500px] lg:h-[600px] object-cover rounded-2xl shadow-brand"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl"></div>
            </div>
            
            {artwork?.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {artwork?.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImageIndex === index 
                        ? "border-brand-purple shadow-lg" 
                        : "border-transparent hover:border-brand-gold"
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
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              {category && (
                <Badge 
                  variant="outline" 
                  className="border-brand-purple/30 text-brand-purple bg-brand-purple/5"
                >
                  {category}
                </Badge>
              )}
              
              <h1 className="text-4xl font-bold text-brand-charcoal leading-tight">
                {title}
              </h1>
              
              {artwork.artist && (
                <div>
                  <Link href={`/artists/${artwork.artist.id}`}>
                    <p className="text-xl text-brand-purple font-semibold hover:underline">
                      {artistName}
                    </p>
                  </Link>
                  {artwork.artist.nationality && artwork.year && (
                    <p className="text-muted-foreground">
                      {artwork.artist.nationality} • {artwork.year}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="space-y-4">
              {artwork.price && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-brand-gold">
                      {formatPrice(artwork.price, artwork.currency || 'SAR', isRTL ? 'ar' : 'en')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`artwork.status.${artwork.availability}`)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => favoriteMutation.mutate()}
                        disabled={favoriteMutation.isPending}
                        className="hover:bg-brand-light-gold"
                      >
                        <Heart className={cn(
                          "h-4 w-4 mr-2",
                          isFavorite?.isFavorite ? "fill-brand-purple text-brand-purple" : ""
                        )} />
                        {isFavorite?.isFavorite ? t("artwork.favorited") : t("artwork.favorite")}
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" onClick={handleShare} className="hover:bg-brand-light-gold">
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("artwork.share")}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-gradient hover:opacity-90 flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      {t("artwork.inquire")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("artwork.inquiryTitle")}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInquiry} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">{t("artwork.inquiryEmail")}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">{t("artwork.inquiryPhone")}</Label>
                        <Input
                          id="phone"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">{t("artwork.inquiryMessage")}</Label>
                        <Textarea
                          id="message"
                          value={inquiryForm.message}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder={t("artwork.inquiryMessagePlaceholder")}
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-gradient"
                        disabled={inquiryMutation.isPending}
                      >
                        {inquiryMutation.isPending ? "Sending..." : t("artwork.sendInquiry")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                {artwork.paymentLink && (
                  <Button 
                    variant="outline" 
                    className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white"
                    onClick={() => window.open(artwork.paymentLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Purchase
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            {description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-brand-charcoal">
                  {t("artwork.description")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-brand-charcoal">
                {t("artwork.details")}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medium && (
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-brand-purple" />
                    <div>
                      <p className="text-sm text-muted-foreground">Medium</p>
                      <p className="font-medium">{medium}</p>
                    </div>
                  </div>
                )}
                
                {artwork.dimensions && (
                  <div className="flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-brand-purple" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dimensions</p>
                      <p className="font-medium">{artwork.dimensions}</p>
                    </div>
                  </div>
                )}
                
                {artwork.year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-brand-purple" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-medium">{artwork.year}</p>
                    </div>
                  </div>
                )}
                
                {style && (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-brand-purple rounded-full" />
                    <div>
                      <p className="text-sm text-muted-foreground">Style</p>
                      <p className="font-medium">{style}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Artist Info */}
            {artwork.artist && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-charcoal">
                  {t("artwork.artist")}
                </h3>
                
                <div className="flex items-start gap-4">
                  {artwork.artist.profileImage && (
                    <img
                      src={artwork.artist.profileImage}
                      alt={artistName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <Link href={`/artists/${artwork.artist.id}`}>
                      <h4 className="font-semibold text-brand-purple hover:underline">
                        {artistName}
                      </h4>
                    </Link>
                    {artwork.artist.nationality && (
                      <p className="text-sm text-muted-foreground">
                        {artwork.artist.nationality}
                        {artwork.artist.birthYear && ` • Born ${artwork.artist.birthYear}`}
                      </p>
                    )}
                    {artistBio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {artistBio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Info */}
            {artwork.gallery && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-brand-charcoal">
                  {t("artwork.gallery")}
                </h3>
                
                <div className="space-y-2">
                  <Link href={`/galleries/${artwork.gallery.id}`}>
                    <h4 className="font-semibold text-brand-purple hover:underline">
                      {galleryName}
                    </h4>
                  </Link>
                  {galleryLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-purple" />
                      <p className="text-sm text-muted-foreground">{galleryLocation}</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    {artwork.gallery.website && (
                      <a 
                        href={artwork.gallery.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-purple hover:underline"
                      >
                        Website
                      </a>
                    )}
                    {artwork.gallery.phone && (
                      <a href={`tel:${artwork.gallery.phone}`} className="text-brand-purple hover:underline">
                        {artwork.gallery.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Social Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <LikeButton
                entityType="artwork"
                entityId={artwork.id}
                showCount={true}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-gray-600 hover:text-brand-purple"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection
          entityType="artwork"
          entityId={artwork.id}
        />

        {/* Similar Artworks */}
        {similarArtworks && similarArtworks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-brand-charcoal mb-8">
              Similar Artworks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarArtworks.map((similarArtwork) => (
                <ArtworkCard key={similarArtwork.id} artwork={similarArtwork} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
