import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { cn, formatPrice } from "@/lib/utils";
import { 
  Plus, 
  Upload, 
  X, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Palette,
  Building,
  Eye,
  Heart,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Star,
  Save,
  Loader2
} from "lucide-react";

interface Artwork {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  artistId: number;
  galleryId?: number;
  medium: string;
  mediumAr?: string;
  dimensions: string;
  year: number;
  price: number;
  currency: string;
  availability: string;
  images: string[];
  category: string;
  categoryAr?: string;
  style: string;
  styleAr?: string;
  materials: string[];
  materialsAr?: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Artist {
  id: number;
  name: string;
  nameAr?: string;
}

interface Gallery {
  id: number;
  name: string;
  nameAr?: string;
}

export default function ArtworkManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [userType, setUserType] = useState<'artist' | 'gallery' | null>(null);
  const [userProfile, setUserProfile] = useState<Artist | Gallery | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    medium: '',
    mediumAr: '',
    dimensions: '',
    year: new Date().getFullYear(),
    price: '',
    currency: 'SAR',
    availability: 'available',
    category: '',
    categoryAr: '',
    style: '',
    styleAr: '',
    materials: [] as string[],
    materialsAr: [] as string[],
    featured: false
  });

  // Categories and styles
  const categories = [
    { id: 'painting', name: 'Painting', nameAr: 'اللوحة' },
    { id: 'sculpture', name: 'Sculpture', nameAr: 'النحت' },
    { id: 'photography', name: 'Photography', nameAr: 'التصوير' },
    { id: 'digital', name: 'Digital Art', nameAr: 'الفن الرقمي' },
    { id: 'mixed', name: 'Mixed Media', nameAr: 'الوسائط المختلطة' },
    { id: 'installation', name: 'Installation', nameAr: 'التركيب' },
    { id: 'textile', name: 'Textile Art', nameAr: 'فن النسيج' },
    { id: 'ceramics', name: 'Ceramics', nameAr: 'الخزف' }
  ];

  const styles = [
    { id: 'contemporary', name: 'Contemporary', nameAr: 'المعاصر' },
    { id: 'traditional', name: 'Traditional', nameAr: 'التقليدي' },
    { id: 'abstract', name: 'Abstract', nameAr: 'التجريدي' },
    { id: 'realistic', name: 'Realistic', nameAr: 'الواقعي' },
    { id: 'calligraphy', name: 'Calligraphy', nameAr: 'الخط العربي' },
    { id: 'geometric', name: 'Geometric', nameAr: 'الهندسي' },
    { id: 'landscape', name: 'Landscape', nameAr: 'المناظر الطبيعية' },
    { id: 'portrait', name: 'Portrait', nameAr: 'البورتريه' }
  ];

  // Get user profile to determine if they're an artist or gallery
  const { data: userRoles } = useQuery({
    queryKey: ["/api/user/roles"],
  });

  const { data: artistProfile } = useQuery({
    queryKey: ["/api/user/artist-profile"],
    enabled: userRoles?.roles?.includes('artist'),
  });

  const { data: galleryProfile } = useQuery({
    queryKey: ["/api/user/gallery-profile"],
    enabled: userRoles?.roles?.includes('gallery'),
  });

  // Determine user type and profile
  useEffect(() => {
    if (artistProfile) {
      setUserType('artist');
      setUserProfile(artistProfile);
    } else if (galleryProfile) {
      setUserType('gallery');
      setUserProfile(galleryProfile);
    }
  }, [artistProfile, galleryProfile]);

  // Get artworks based on user type
  const { data: artworks = [], isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/user/artworks"],
    enabled: !!userProfile,
  });

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);
    const promises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      setSelectedImages(prev => [...prev, ...results]);
      setUploadingImages(false);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Create artwork mutation
  const createArtworkMutation = useMutation({
    mutationFn: async (artworkData: any) => {
      const payload = {
        ...artworkData,
        images: selectedImages,
        artistId: userType === 'artist' ? userProfile?.id : null,
        galleryId: userType === 'gallery' ? userProfile?.id : null,
        price: parseFloat(artworkData.price),
        materials: artworkData.materials.filter(Boolean),
        materialsAr: artworkData.materialsAr.filter(Boolean)
      };
      
      return await apiRequest('/api/artworks', {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: () => {
      toast({
        title: t("artworks.createSuccess"),
        description: t("artworks.createSuccessDesc"),
      });
      setIsAddDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/user/artworks"] });
    },
    onError: (error) => {
      toast({
        title: t("artworks.createError"),
        description: t("artworks.createErrorDesc"),
        variant: "destructive",
      });
    },
  });

  // Update artwork mutation
  const updateArtworkMutation = useMutation({
    mutationFn: async ({ id, artworkData }: { id: number; artworkData: any }) => {
      const payload = {
        ...artworkData,
        images: selectedImages,
        price: parseFloat(artworkData.price),
        materials: artworkData.materials.filter(Boolean),
        materialsAr: artworkData.materialsAr.filter(Boolean)
      };
      
      return await apiRequest(`/api/artworks/${id}`, {
        method: 'PUT',
        body: payload
      });
    },
    onSuccess: () => {
      toast({
        title: t("artworks.updateSuccess"),
        description: t("artworks.updateSuccessDesc"),
      });
      setIsEditDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/user/artworks"] });
    },
    onError: (error) => {
      toast({
        title: t("artworks.updateError"),
        description: t("artworks.updateErrorDesc"),
        variant: "destructive",
      });
    },
  });

  // Delete artwork mutation
  const deleteArtworkMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/artworks/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: t("artworks.deleteSuccess"),
        description: t("artworks.deleteSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/artworks"] });
    },
    onError: (error) => {
      toast({
        title: t("artworks.deleteError"),
        description: t("artworks.deleteErrorDesc"),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      medium: '',
      mediumAr: '',
      dimensions: '',
      year: new Date().getFullYear(),
      price: '',
      currency: 'SAR',
      availability: 'available',
      category: '',
      categoryAr: '',
      style: '',
      styleAr: '',
      materials: [],
      materialsAr: [],
      featured: false
    });
    setSelectedImages([]);
    setEditingArtwork(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedImages.length === 0) {
      toast({
        title: t("artworks.noImages"),
        description: t("artworks.noImagesDesc"),
        variant: "destructive",
      });
      return;
    }

    if (editingArtwork) {
      updateArtworkMutation.mutate({ id: editingArtwork.id, artworkData: formData });
    } else {
      createArtworkMutation.mutate(formData);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      title: artwork.title,
      titleAr: artwork.titleAr || '',
      description: artwork.description,
      descriptionAr: artwork.descriptionAr || '',
      medium: artwork.medium,
      mediumAr: artwork.mediumAr || '',
      dimensions: artwork.dimensions,
      year: artwork.year,
      price: artwork.price.toString(),
      currency: artwork.currency,
      availability: artwork.availability,
      category: artwork.category,
      categoryAr: artwork.categoryAr || '',
      style: artwork.style,
      styleAr: artwork.styleAr || '',
      materials: artwork.materials || [],
      materialsAr: artwork.materialsAr || [],
      featured: artwork.featured
    });
    setSelectedImages(artwork.images || []);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("artworks.deleteConfirm"))) {
      deleteArtworkMutation.mutate(id);
    }
  };

  if (!userRoles?.roles?.includes('artist') && !userRoles?.roles?.includes('gallery')) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {t("artworks.accessDenied")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                {t("artworks.accessDeniedDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={cn("flex items-center justify-between mb-8", isRTL && "flex-row-reverse")}>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {t("artworks.management")}
            </h1>
            <p className="text-muted-foreground">
              {userType === 'artist' ? t("artworks.artistDesc") : t("artworks.galleryDesc")}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => resetForm()} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("artworks.addArtwork")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("artworks.addArtwork")}</DialogTitle>
              </DialogHeader>
              <ArtworkForm
                formData={formData}
                setFormData={setFormData}
                selectedImages={selectedImages}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
                uploadingImages={uploadingImages}
                onSubmit={handleSubmit}
                isSubmitting={createArtworkMutation.isPending}
                categories={categories}
                styles={styles}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : artworks.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t("artworks.noArtworks")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("artworks.noArtworksDesc")}
                </p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t("artworks.addFirst")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            artworks.map((artwork) => (
              <Card key={artwork.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(artwork)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(artwork.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {artwork.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      {t("artworks.featured")}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {isRTL ? artwork.titleAr || artwork.title : artwork.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {isRTL ? artwork.descriptionAr || artwork.description : artwork.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatPrice(artwork.price)} {artwork.currency}
                      </span>
                    </div>
                    <Badge variant={artwork.availability === 'available' ? 'default' : 'secondary'}>
                      {t(`artworks.${artwork.availability}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {artwork.year}
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {isRTL ? artwork.categoryAr || artwork.category : artwork.category}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("artworks.editArtwork")}</DialogTitle>
            </DialogHeader>
            <ArtworkForm
              formData={formData}
              setFormData={setFormData}
              selectedImages={selectedImages}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              uploadingImages={uploadingImages}
              onSubmit={handleSubmit}
              isSubmitting={updateArtworkMutation.isPending}
              categories={categories}
              styles={styles}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Artwork Form Component
function ArtworkForm({
  formData,
  setFormData,
  selectedImages,
  handleImageUpload,
  removeImage,
  uploadingImages,
  onSubmit,
  isSubmitting,
  categories,
  styles,
  onCancel
}: {
  formData: any;
  setFormData: (data: any) => void;
  selectedImages: string[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  uploadingImages: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  categories: any[];
  styles: any[];
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("images");

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="w-full">
        <div className="flex space-x-1 rounded-md bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "images"
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-muted hover:text-foreground"
            }`}
          >
            📸 {t("artworks.images")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "basic"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-muted hover:text-foreground"
            }`}
          >
            {t("artworks.basicInfo")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === "details"
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-muted hover:text-foreground"
            }`}
          >
            {t("artworks.details")}
          </button>
        </div>

        {activeTab === "basic" && (
          <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">{t("artworks.title")} (English)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="titleAr">{t("artworks.title")} (Arabic)</Label>
              <Input
                id="titleAr"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="description">{t("artworks.description")} (English)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="descriptionAr">{t("artworks.description")} (Arabic)</Label>
              <Textarea
                id="descriptionAr"
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{t("artworks.category")}</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("artworks.selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {isRTL ? category.nameAr : category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="style">{t("artworks.style")}</Label>
              <Select 
                value={formData.style} 
                onValueChange={(value) => setFormData({ ...formData, style: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("artworks.selectStyle")} />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {isRTL ? style.nameAr : style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medium">{t("artworks.medium")} (English)</Label>
              <Input
                id="medium"
                value={formData.medium}
                onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                placeholder="Oil on canvas, Acrylic, etc."
              />
            </div>
            <div>
              <Label htmlFor="mediumAr">{t("artworks.medium")} (Arabic)</Label>
              <Input
                id="mediumAr"
                value={formData.mediumAr}
                onChange={(e) => setFormData({ ...formData, mediumAr: e.target.value })}
                dir="rtl"
                placeholder="زيت على قماش، أكريليك، إلخ"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dimensions">{t("artworks.dimensions")}</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="100 x 80 cm"
              />
            </div>
            <div>
              <Label htmlFor="year">{t("artworks.year")}</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Label htmlFor="price">{t("artworks.price")}</Label>
              <div className="flex">
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  className="rounded-r-none"
                />
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="w-20 rounded-l-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="availability">{t("artworks.availability")}</Label>
            <Select 
              value={formData.availability} 
              onValueChange={(value) => setFormData({ ...formData, availability: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">{t("artworks.available")}</SelectItem>
                <SelectItem value="sold">{t("artworks.sold")}</SelectItem>
                <SelectItem value="reserved">{t("artworks.reserved")}</SelectItem>
                <SelectItem value="on_loan">{t("artworks.onLoan")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>
        )}

        {activeTab === "images" && (
          <div className="mt-4 space-y-4">
          <div>
            <Label>{t("artworks.images")}</Label>
            <div className="space-y-4">
              <div 
                className="border-4 border-dashed border-blue-300 hover:border-blue-500 rounded-xl p-12 text-center transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 shadow-lg hover:shadow-xl"
                onClick={() => document.getElementById('file-upload')?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files);
                  // Handle dropped files here
                  console.log('Files dropped:', files);
                }}
              >
                <Upload className="h-24 w-24 text-blue-600 mx-auto mb-6 animate-bounce" />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("artworks.selectImages")}
                  </h2>
                  <p className="text-base text-gray-700 max-w-md mx-auto font-medium">
                    {t("artworks.uploadInstructions")}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="default"
                      size="lg"
                      disabled={uploadingImages}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Upload className="h-6 w-6 mr-3" />
                      {t("artworks.selectImages")}
                    </Button>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-600 font-medium">
                      ✨ Supported formats: JPG, PNG, GIF • Max size: 5MB per image
                    </p>
                  </div>
                </div>
              </div>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
              />
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Artwork ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 text-xs">
                          {t("artworks.mainImage")}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {uploadingImages && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("artworks.uploadingImages")}
                </div>
              )}
            </div>
          </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploadingImages || selectedImages.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("common.saving")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("common.save")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}