import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Plus, Search, Filter, Pin, Lock, Eye, ThumbsUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Community() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "",
  });

  const isRTL = language === "ar";

  const { data: discussions, isLoading } = useQuery({
    queryKey: ['/api/discussions'],
    retry: false,
  });

  const handleCreateDiscussion = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create discussions",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!newDiscussion.title || !newDiscussion.content || !newDiscussion.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("/api/discussions", {
        method: "POST",
        body: JSON.stringify(newDiscussion),
        headers: { "Content-Type": "application/json" },
      });
      
      toast({
        title: "Discussion Created",
        description: "Your discussion has been created successfully",
      });
      
      setNewDiscussion({ title: "", content: "", category: "" });
      setShowNewDiscussion(false);
    } catch (error) {
      if (isUnauthorizedError(error)) {
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
        title: "Creation Failed",
        description: "Unable to create discussion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredDiscussions = discussions?.filter((discussion: any) => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "general":
        return "bg-blue-100 text-blue-800";
      case "technique":
        return "bg-green-100 text-green-800";
      case "critique":
        return "bg-yellow-100 text-yellow-800";
      case "showcase":
        return "bg-purple-100 text-purple-800";
      case "market":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading community discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("community.title", "Art Community")}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t("community.subtitle", "Connect with fellow artists, share techniques, and discuss art")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("community.search", "Search discussions...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("community.category", "Category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="technique">Technique</SelectItem>
                <SelectItem value="critique">Critique</SelectItem>
                <SelectItem value="showcase">Showcase</SelectItem>
                <SelectItem value="market">Market</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
              <Filter className="h-4 w-4 mr-2" />
              {t("community.filter", "Filter")}
            </Button>
            <Button
              onClick={() => setShowNewDiscussion(!showNewDiscussion)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("community.new", "New Discussion")}
            </Button>
          </div>
        </div>

        {/* New Discussion Form */}
        {showNewDiscussion && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                {t("community.newDiscussion", "Create New Discussion")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder={t("community.titlePlaceholder", "Discussion title...")}
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                <Select
                  value={newDiscussion.category}
                  onValueChange={(value) => setNewDiscussion({ ...newDiscussion, category: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder={t("community.selectCategory", "Select category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                    <SelectItem value="showcase">Showcase</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder={t("community.contentPlaceholder", "Share your thoughts...")}
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateDiscussion}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {t("community.create", "Create Discussion")}
                  </Button>
                  <Button
                    onClick={() => setShowNewDiscussion(false)}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    {t("community.cancel", "Cancel")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discussions List */}
        <div className="space-y-4">
          {filteredDiscussions?.map((discussion: any) => (
            <Card key={discussion.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {discussion.isPinned && (
                        <Pin className="h-4 w-4 text-yellow-400" />
                      )}
                      {discussion.isLocked && (
                        <Lock className="h-4 w-4 text-red-400" />
                      )}
                      <CardTitle className="text-white">
                        {language === "ar" && discussion.titleAr ? discussion.titleAr : discussion.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-300">
                      {language === "ar" && discussion.contentAr ? discussion.contentAr : discussion.content}
                    </CardDescription>
                  </div>
                  <Badge className={getCategoryColor(discussion.category)}>
                    {discussion.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{discussion.replyCount} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{discussion.viewCount} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>by {discussion.authorId}</span>
                    <span>{formatDate(discussion.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    {t("community.reply", "Reply")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {t("community.like", "Like")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDiscussions?.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">
              {t("community.empty", "No discussions found. Start the conversation!")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}