import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash, Calendar, Users, MapPin, DollarSign, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Workshop {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  instructorId: string;
  instructorType: string;
  category: string;
  categoryAr?: string;
  skillLevel: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  price?: string;
  currency?: string;
  location?: string;
  locationAr?: string;
  isOnline: boolean;
  meetingLink?: string;
  materials?: string[];
  materialsAr?: string[];
  images?: string[];
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  status: string;
  featured: boolean;
}

export default function ManageWorkshops() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    category: "",
    categoryAr: "",
    skillLevel: "beginner",
    duration: 2,
    maxParticipants: 10,
    price: "",
    location: "",
    locationAr: "",
    isOnline: false,
    meetingLink: "",
    materials: [""],
    materialsAr: [""],
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    status: "draft",
  });

  // Get seller info to determine instructorType
  const { data: sellerInfo } = useQuery({
    queryKey: ['/api/seller/info'],
  });

  // Get workshops created by this instructor
  const { data: workshops, isLoading } = useQuery<Workshop[]>({
    queryKey: ['/api/workshops/instructor'],
    enabled: !!sellerInfo,
  });

  const createWorkshopMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/workshops', {
        method: 'POST',
        body: {
          ...data,
          instructorType: sellerInfo?.type || 'artist',
          images: selectedImages,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshops/instructor'] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: t("workshops.createSuccess"),
        description: t("workshops.createSuccessDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("workshops.createError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWorkshopMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/workshops/${id}`, {
        method: 'PUT',
        body: {
          ...data,
          images: selectedImages,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshops/instructor'] });
      setEditingWorkshop(null);
      resetForm();
      toast({
        title: t("workshops.updateSuccess"),
        description: t("workshops.updateSuccessDesc"),
      });
    },
  });

  const deleteWorkshopMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/workshops/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workshops/instructor'] });
      toast({
        title: t("workshops.deleteSuccess"),
        description: t("workshops.deleteSuccessDesc"),
      });
    },
  });

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

  const resetForm = () => {
    setFormData({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      category: "",
      categoryAr: "",
      skillLevel: "beginner",
      duration: 2,
      maxParticipants: 10,
      price: "",
      location: "",
      locationAr: "",
      isOnline: false,
      meetingLink: "",
      materials: [""],
      materialsAr: [""],
      startDate: "",
      endDate: "",
      registrationDeadline: "",
      status: "draft",
    });
    setSelectedImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkshop) {
      updateWorkshopMutation.mutate({
        id: editingWorkshop.id,
        data: formData,
      });
    } else {
      createWorkshopMutation.mutate(formData);
    }
  };

  const handleEdit = (workshop: Workshop) => {
    setEditingWorkshop(workshop);
    setFormData({
      title: workshop.title,
      titleAr: workshop.titleAr || "",
      description: workshop.description,
      descriptionAr: workshop.descriptionAr || "",
      category: workshop.category,
      categoryAr: workshop.categoryAr || "",
      skillLevel: workshop.skillLevel,
      duration: workshop.duration,
      maxParticipants: workshop.maxParticipants,
      price: workshop.price || "",
      location: workshop.location || "",
      locationAr: workshop.locationAr || "",
      isOnline: workshop.isOnline,
      meetingLink: workshop.meetingLink || "",
      materials: workshop.materials || [""],
      materialsAr: workshop.materialsAr || [""],
      startDate: workshop.startDate.split('T')[0],
      endDate: workshop.endDate.split('T')[0],
      registrationDeadline: workshop.registrationDeadline?.split('T')[0] || "",
      status: workshop.status,
    });
    setSelectedImages(workshop.images || []);
    setIsCreateOpen(true);
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, ""],
      materialsAr: [...prev.materialsAr, ""],
    }));
  };

  const updateMaterial = (index: number, value: string, isArabic: boolean) => {
    const field = isArabic ? 'materialsAr' : 'materials';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((m, i) => i === index ? value : m),
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
      materialsAr: prev.materialsAr.filter((_, i) => i !== index),
    }));
  };

  if (!sellerInfo || (sellerInfo.type !== 'artist' && sellerInfo.type !== 'gallery')) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                {t("workshops.onlyForArtistsGalleries")}
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-brand-charcoal">
            {t("workshops.manage")}
          </h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-navy hover:bg-brand-steel">
                <Plus className="h-4 w-4 mr-2" />
                {t("workshops.create")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingWorkshop ? t("workshops.edit") : t("workshops.create")}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ar">العربية</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="en" className="space-y-4">
                    <div>
                      <Label htmlFor="title">{t("workshops.title")}</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">{t("workshops.description")}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">{t("workshops.category")}</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">{t("workshops.location")}</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label>{t("workshops.materials")}</Label>
                      {formData.materials.map((material, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={material}
                            onChange={(e) => updateMaterial(index, e.target.value, false)}
                            placeholder={t("workshops.materialPlaceholder")}
                          />
                          {formData.materials.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeMaterial(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMaterial}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("workshops.addMaterial")}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ar" className="space-y-4">
                    <div>
                      <Label htmlFor="titleAr">{t("workshops.titleAr")}</Label>
                      <Input
                        id="titleAr"
                        value={formData.titleAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                        dir="rtl"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="descriptionAr">{t("workshops.descriptionAr")}</Label>
                      <Textarea
                        id="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                        rows={4}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoryAr">{t("workshops.categoryAr")}</Label>
                      <Input
                        id="categoryAr"
                        value={formData.categoryAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryAr: e.target.value }))}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="locationAr">{t("workshops.locationAr")}</Label>
                      <Input
                        id="locationAr"
                        value={formData.locationAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, locationAr: e.target.value }))}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label>{t("workshops.materialsAr")}</Label>
                      {formData.materialsAr.map((material, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={material}
                            onChange={(e) => updateMaterial(index, e.target.value, true)}
                            placeholder={t("workshops.materialPlaceholderAr")}
                            dir="rtl"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skillLevel">{t("workshops.skillLevel")}</Label>
                    <Select
                      value={formData.skillLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, skillLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">{t("workshops.beginner")}</SelectItem>
                        <SelectItem value="intermediate">{t("workshops.intermediate")}</SelectItem>
                        <SelectItem value="advanced">{t("workshops.advanced")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">{t("workshops.duration")}</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">{t("workshops.maxParticipants")}</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">{t("workshops.price")}</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">{t("workshops.startDate")}</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">{t("workshops.endDate")}</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationDeadline">{t("workshops.registrationDeadline")}</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">{t("workshops.status")}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t("workshops.draft")}</SelectItem>
                        <SelectItem value="published">{t("workshops.published")}</SelectItem>
                        <SelectItem value="cancelled">{t("workshops.cancelled")}</SelectItem>
                        <SelectItem value="completed">{t("workshops.completed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isOnline}
                      onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                      className="rounded"
                    />
                    {t("workshops.isOnline")}
                  </Label>

                  {formData.isOnline && (
                    <div>
                      <Label htmlFor="meetingLink">{t("workshops.meetingLink")}</Label>
                      <Input
                        id="meetingLink"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://zoom.us/..."
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>{t("workshops.images")}</Label>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                    />
                    
                    {selectedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-4">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Workshop ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingWorkshop(null);
                      resetForm();
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-navy hover:bg-brand-steel"
                    disabled={createWorkshopMutation.isPending || updateWorkshopMutation.isPending}
                  >
                    {editingWorkshop ? t("common.update") : t("common.create")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-64">
                  <div className="h-full bg-muted rounded-lg"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workshops && workshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="card-elevated overflow-hidden">
                {workshop.images && workshop.images[0] && (
                  <div className="h-48 bg-muted">
                    <img
                      src={workshop.images[0]}
                      alt={isRTL ? workshop.titleAr || workshop.title : workshop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {isRTL ? workshop.titleAr || workshop.title : workshop.title}
                    </CardTitle>
                    <Badge variant={workshop.status === 'published' ? 'default' : 'secondary'}>
                      {t(`workshops.${workshop.status}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {isRTL ? workshop.descriptionAr || workshop.description : workshop.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-purple" />
                      <span>{new Date(workshop.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-purple" />
                      <span>{workshop.currentParticipants} / {workshop.maxParticipants} {t("workshops.participants")}</span>
                    </div>
                    {workshop.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-brand-purple" />
                        <span>{formatPrice(workshop.price, workshop.currency || 'SAR', i18n.language)}</span>
                      </div>
                    )}
                    {workshop.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-purple" />
                        <span>{isRTL ? workshop.locationAr || workshop.location : workshop.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(workshop)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(t("workshops.deleteConfirm"))) {
                          deleteWorkshopMutation.mutate(workshop.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {t("common.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">{t("workshops.noWorkshops")}</p>
              <Button
                className="bg-brand-navy hover:bg-brand-steel"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("workshops.createFirst")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
