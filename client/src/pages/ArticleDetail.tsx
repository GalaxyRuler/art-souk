import { useState } from "react";
import { useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Share2, Heart, Calendar, User, Eye, Tag, BookOpen, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ArticleDetail {
  id: number;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  excerpt?: string;
  excerptAr?: string;
  coverImage?: string;
  category: string;
  categoryAr?: string;
  tags?: string[];
  tagsAr?: string[];
  authorId: string;
  author?: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    bio?: string;
    bioAr?: string;
  };
  publishedAt: string;
  readTime?: number;
  viewCount?: number;
  likeCount?: number;
  featured?: boolean;
  status: 'draft' | 'published' | 'archived';
}

interface RelatedArticle {
  id: number;
  title: string;
  titleAr?: string;
  excerpt?: string;
  excerptAr?: string;
  coverImage?: string;
  category: string;
  categoryAr?: string;
  publishedAt: string;
  readTime?: number;
  author?: {
    firstName?: string;
    lastName?: string;
  };
}

export default function ArticleDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery<ArticleDetail>({
    queryKey: [`/api/articles/${id}`],
  });

  const { data: relatedArticles } = useQuery<RelatedArticle[]>({
    queryKey: [`/api/articles/${id}/related`],
    enabled: !!article,
  });

  const { data: isLiked } = useQuery<{ isLiked: boolean }>({
    queryKey: [`/api/articles/${id}/like-status`],
    enabled: isAuthenticated && !!id,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked?.isLiked) {
        await apiRequest(`/api/articles/${id}/unlike`, { method: 'POST' });
      } else {
        await apiRequest(`/api/articles/${id}/like`, { method: 'POST' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${id}/like-status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${id}`] });
      toast({
        title: isLiked?.isLiked ? "Removed like" : "Article liked",
        description: isLiked?.isLiked ? "Removed from your liked articles" : "Added to your liked articles",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Article not found</h1>
          <Link href="/editorial">
            <Button>Browse Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = isRTL && article.titleAr ? article.titleAr : article.title;
  const content = isRTL && article.contentAr ? article.contentAr : article.content;
  const excerpt = isRTL && article.excerptAr ? article.excerptAr : article.excerpt;
  const category = isRTL && article.categoryAr ? article.categoryAr : article.category;
  const tags = isRTL && article.tagsAr ? article.tagsAr : article.tags;
  const authorBio = isRTL && article.author?.bioAr ? article.author.bioAr : article.author?.bio;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: excerpt || title,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/editorial">
          <Button variant="ghost" className="mb-6 hover:bg-brand-light-gold">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editorial
          </Button>
        </Link>

        <article className="space-y-8">
          {/* Article Header */}
          <header className="space-y-6">
            {/* Category Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-brand-purple text-brand-purple">
                <Tag className="h-3 w-3 mr-1" />
                {category}
              </Badge>
              {article.featured && (
                <Badge className="bg-brand-gold text-brand-charcoal">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal leading-tight">
              {title}
            </h1>

            {/* Excerpt */}
            {excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={article.author?.profileImageUrl} />
                  <AvatarFallback>
                    {article.author?.firstName?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {article.author?.firstName} {article.author?.lastName}
                </span>
              </div>

              {/* Published Date */}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>

              {/* Read Time */}
              {article.readTime && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{formatReadTime(article.readTime)}</span>
                </div>
              )}

              {/* View Count */}
              {article.viewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.viewCount.toLocaleString()} views</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Button
                  variant={isLiked?.isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={isLiked?.isLiked ? "bg-brand-purple text-white" : "border-brand-purple text-brand-purple hover:bg-brand-light-gold"}
                >
                  <Heart className={cn(
                    "h-4 w-4 mr-2",
                    isLiked?.isLiked ? "fill-white" : ""
                  )} />
                  {isLiked?.isLiked ? "Liked" : "Like"}
                  {article.likeCount && article.likeCount > 0 && (
                    <span className="ml-1">({article.likeCount})</span>
                  )}
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={handleShare} className="border-brand-purple text-brand-purple hover:bg-brand-light-gold">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-brand">
              <img
                src={article.coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-muted-foreground leading-relaxed space-y-6"
              style={{ 
                fontSize: '18px',
                lineHeight: '1.8',
                direction: isRTL ? 'rtl' : 'ltr'
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-brand-charcoal mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Author Bio */}
          {article.author && (
            <div className="space-y-3">
              <Separator />
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={article.author.profileImageUrl} />
                      <AvatarFallback className="text-lg">
                        {article.author.firstName?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                        About {article.author.firstName} {article.author.lastName}
                      </h3>
                      {authorBio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {authorBio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </article>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-brand-purple" />
              <h2 className="text-2xl font-bold text-brand-charcoal">
                Related Articles
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 4).map((relatedArticle) => {
                const relatedTitle = isRTL && relatedArticle.titleAr ? relatedArticle.titleAr : relatedArticle.title;
                const relatedExcerpt = isRTL && relatedArticle.excerptAr ? relatedArticle.excerptAr : relatedArticle.excerpt;
                const relatedCategory = isRTL && relatedArticle.categoryAr ? relatedArticle.categoryAr : relatedArticle.category;

                return (
                  <Link key={relatedArticle.id} href={`/editorial/${relatedArticle.id}`}>
                    <Card className="card-elevated cursor-pointer transition-all duration-300 hover:shadow-lg group">
                      {relatedArticle.coverImage && (
                        <div className="relative h-48 overflow-hidden rounded-t-2xl">
                          <img
                            src={relatedArticle.coverImage}
                            alt={relatedTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-white/90 text-brand-charcoal">
                              {relatedCategory}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-brand-charcoal mb-2 line-clamp-2 group-hover:text-brand-purple transition-colors">
                          {relatedTitle}
                        </h3>
                        {relatedExcerpt && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {relatedExcerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              {relatedArticle.author?.firstName} {relatedArticle.author?.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(relatedArticle.publishedAt).toLocaleDateString()}</span>
                          </div>
                          {relatedArticle.readTime && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{formatReadTime(relatedArticle.readTime)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="text-center">
              <Link href="/editorial">
                <Button variant="outline" className="border-brand-purple text-brand-purple hover:bg-brand-light-gold">
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}