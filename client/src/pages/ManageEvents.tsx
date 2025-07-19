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
import { Plus, Edit, Trash, Calendar, Users, MapPin, DollarSign, Upload, X, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/useLanguage";
import { formatPrice } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Event {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  organizerId: string;
  organizerType: string;
  category: string;
  categoryAr?: string;
  venue?: string;
  venueAr?: string;
  address?: string;
  addressAr?: string;
  isOnline: boolean;
  meetingLink?: string;
  startDate: string;
  endDate: string;
  maxAttendees?: number;
  currentAttendees: number;
  ticketPrice?: string;
  currency?: string;
  images?: string[];
  tags?: string[];
  tagsAr?: string[];
  status: string;
  featured: boolean;
}

export default function ManageEvents() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    category: "exhibition",
    categoryAr: "",
    venue: "",
    venueAr: "",
    address: "",
    addressAr: "",
    isOnline: false,
    meetingLink: "",
    startDate: "",
    endDate: "",
    maxAttendees: "",
    ticketPrice: "",
    tags: [""],
    tagsAr: [""],
    status: "draft",
  });

  // Get seller info to determine organizerType
  const { data: sellerInfo } = useQuery({
    queryKey: ['/api/seller/info'],
  });

  // Get events created by this organizer
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events/organizer'],
    enabled: !!sellerInfo,
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/events', {
        method: 'POST',
        body: {
          ...data,
          organizerType: sellerInfo?.type || 'artist',
          images: selectedImages,
          maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/organizer'] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: t("events.createSuccess"),
        description: t("events.createSuccessDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("events.createError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/events/${id}`, {
        method: 'PUT',
        body: {
          ...data,
          images: selectedImages,
          maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/organizer'] });
      setEditingEvent(null);
      resetForm();
      toast({
        title: t("events.updateSuccess"),
        description: t("events.updateSuccessDesc"),
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/events/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/organizer'] });
      toast({
        title: t("events.deleteSuccess"),
        description: t("events.deleteSuccessDesc"),
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
      category: "exhibition",
      categoryAr: "",
      venue: "",
      venueAr: "",
      address: "",
      addressAr: "",
      isOnline: false,
      meetingLink: "",
      startDate: "",
      endDate: "",
      maxAttendees: "",
      ticketPrice: "",
      tags: [""],
      tagsAr: [""],
      status: "draft",
    });
    setSelectedImages([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEventMutation.mutate({
        id: editingEvent.id,
        data: formData,
      });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      titleAr: event.titleAr || "",
      description: event.description,
      descriptionAr: event.descriptionAr || "",
      category: event.category,
      categoryAr: event.categoryAr || "",
      venue: event.venue || "",
      venueAr: event.venueAr || "",
      address: event.address || "",
      addressAr: event.addressAr || "",
      isOnline: event.isOnline,
      meetingLink: event.meetingLink || "",
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
      maxAttendees: event.maxAttendees?.toString() || "",
      ticketPrice: event.ticketPrice || "",
      tags: event.tags || [""],
      tagsAr: event.tagsAr || [""],
      status: event.status,
    });
    setSelectedImages(event.images || []);
    setIsCreateOpen(true);
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ""],
      tagsAr: [...prev.tagsAr, ""],
    }));
  };

  const updateTag = (index: number, value: string, isArabic: boolean) => {
    const field = isArabic ? 'tagsAr' : 'tags';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((t, i) => i === index ? value : t),
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
      tagsAr: prev.tagsAr.filter((_, i) => i !== index),
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
                {t("events.onlyForArtistsGalleries")}
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
            {t("events.manage")}
          </h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-navy hover:bg-brand-steel">
                <Plus className="h-4 w-4 mr-2" />
                {t("events.create")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? t("events.edit") : t("events.create")}
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
                      <Label htmlFor="title">{t("events.title")}</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">{t("events.description")}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="venue">{t("events.venue")}</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">{t("events.address")}</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>{t("events.tags")}</Label>
                      {formData.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value, false)}
                            placeholder={t("events.tagPlaceholder")}
                          />
                          {formData.tags.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeTag(index)}
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
                        onClick={addTag}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("events.addTag")}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ar" className="space-y-4">
                    <div>
                      <Label htmlFor="titleAr">{t("events.titleAr")}</Label>
                      <Input
                        id="titleAr"
                        value={formData.titleAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, titleAr: e.target.value }))}
                        dir="rtl"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="descriptionAr">{t("events.descriptionAr")}</Label>
                      <Textarea
                        id="descriptionAr"
                        value={formData.descriptionAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionAr: e.target.value }))}
                        rows={4}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venueAr">{t("events.venueAr")}</Label>
                      <Input
                        id="venueAr"
                        value={formData.venueAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, venueAr: e.target.value }))}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="addressAr">{t("events.addressAr")}</Label>
                      <Textarea
                        id="addressAr"
                        value={formData.addressAr}
                        onChange={(e) => setFormData(prev => ({ ...prev, addressAr: e.target.value }))}
                        rows={2}
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <Label>{t("events.tagsAr")}</Label>
                      {formData.tagsAr.map((tag, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value, true)}
                            placeholder={t("events.tagPlaceholderAr")}
                            dir="rtl"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">{t("events.category")}</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exhibition">{t("events.exhibition")}</SelectItem>
                        <SelectItem value="workshop">{t("events.workshop")}</SelectItem>
                        <SelectItem value="talk">{t("events.talk")}</SelectItem>
                        <SelectItem value="networking">{t("events.networking")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxAttendees">{t("events.maxAttendees")}</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: e.target.value }))}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ticketPrice">{t("events.ticketPrice")}</Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, ticketPrice: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">{t("events.startDate")}</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">{t("events.endDate")}</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">{t("events.status")}</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t("events.draft")}</SelectItem>
                        <SelectItem value="published">{t("events.published")}</SelectItem>
                        <SelectItem value="cancelled">{t("events.cancelled")}</SelectItem>
                        <SelectItem value="completed">{t("events.completed")}</SelectItem>
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
                    {t("events.isOnline")}
                  </Label>

                  {formData.isOnline && (
                    <div>
                      <Label htmlFor="meetingLink">{t("events.meetingLink")}</Label>
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
                  <Label>{t("events.images")}</Label>
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
                              alt={`Event ${index + 1}`}
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
                      setEditingEvent(null);
                      resetForm();
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-navy hover:bg-brand-steel"
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  >
                    {editingEvent ? t("common.update") : t("common.create")}
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
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="card-elevated overflow-hidden">
                {event.images && event.images[0] && (
                  <div className="h-48 bg-muted">
                    <img
                      src={event.images[0]}
                      alt={isRTL ? event.titleAr || event.title : event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {isRTL ? event.titleAr || event.title : event.title}
                    </CardTitle>
                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                      {t(`events.${event.status}`)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {isRTL ? event.descriptionAr || event.description : event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-brand-purple" />
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                    </div>
                    {event.maxAttendees && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-brand-purple" />
                        <span>{event.currentAttendees} / {event.maxAttendees} {t("events.attendees")}</span>
                      </div>
                    )}
                    {event.ticketPrice && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-brand-purple" />
                        <span>{formatPrice(event.ticketPrice, event.currency || 'SAR', i18n.language)}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-brand-purple" />
                        <span>{isRTL ? event.venueAr || event.venue : event.venue}</span>
                      </div>
                    )}
                    {event.isOnline && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-brand-purple" />
                        <span>{t("events.online")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm(t("events.deleteConfirm"))) {
                          deleteEventMutation.mutate(event.id);
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
              <p className="text-muted-foreground mb-4">{t("events.noEvents")}</p>
              <Button
                className="bg-brand-navy hover:bg-brand-steel"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("events.createFirst")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}
