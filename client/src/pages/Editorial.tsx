import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { Search, Filter, Calendar, User, ExternalLink } from "lucide-react";

export default function Editorial() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["/api/articles", { search: searchQuery, category, sort: sortBy }],
  });

  const { data: featuredArticles = [] } = useQuery({
    queryKey: ["/api/articles/featured"],
  });

  const filteredArticles = articles.filter((article: any) => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.titleAr && article.titleAr.includes(searchQuery));
    
    const matchesCategory = category === "all" || article.category === category;
    
    return matchesSearch && matchesCategory;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {t("errors.loadingArticles")}
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

  const ArticleCard = ({ article, featured = false }: { article: any; featured?: boolean }) => {
    const title = isRTL && article.titleAr ? article.titleAr : article.title;
    const excerpt = isRTL && article.excerptAr ? article.excerptAr : article.excerpt;
    const category = isRTL && article.categoryAr ? article.categoryAr : article.category;

    return (
      <article className={cn("group cursor-pointer", featured && "md:col-span-2")}>
        <Link href={`/editorial/${article.id}`}>
          <div className="relative overflow-hidden rounded-xl mb-4">
            <img
              src={article.coverImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"}
              alt={title}
              className={cn(
                "w-full object-cover group-hover:scale-105 transition-transform duration-300",
                featured ? "h-64" : "h-48"
              )}
            />
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            </div>
            {featured && (
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="text-xs">
                  {t("editorial.featured")}
                </Badge>
              </div>
            )}
          </div>
          <div className={cn("space-y-3", isRTL && "text-right")}>
            <h3 className={cn(
              "font-semibold text-primary group-hover:text-accent transition-colors",
              featured ? "text-2xl" : "text-xl"
            )}>
              {title}
            </h3>
            {excerpt && (
              <p className={cn(
                "text-gray-600 line-clamp-3",
                featured ? "text-base" : "text-sm"
              )}>
                {excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{t("editorial.author")}</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
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
                {t("editorial.title")}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("editorial.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="py-16 bg-accent/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className={cn("text-2xl font-bold text-primary mb-8", isRTL && "text-right")}>
                {t("editorial.featured")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredArticles.slice(0, 3).map((article: any, index: number) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    featured={index === 0}
                  />
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
                  placeholder={t("editorial.search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-full", isRTL ? "pr-10" : "pl-10")}
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t("editorial.filters.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("editorial.filters.allCategories")}</SelectItem>
                    <SelectItem value="art">{t("editorial.categories.art")}</SelectItem>
                    <SelectItem value="interview">{t("editorial.categories.interview")}</SelectItem>
                    <SelectItem value="guide">{t("editorial.categories.guide")}</SelectItem>
                    <SelectItem value="news">{t("editorial.categories.news")}</SelectItem>
                    <SelectItem value="market">{t("editorial.categories.market")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("common.sortBy")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t("editorial.sort.latest")}</SelectItem>
                    <SelectItem value="popular">{t("editorial.sort.popular")}</SelectItem>
                    <SelectItem value="featured">{t("editorial.sort.featured")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredArticles.length > 0 ? (
              <>
                <div className={cn("mb-6 text-sm text-gray-600", isRTL && "text-right")}>
                  {t("editorial.results", { count: filteredArticles.length })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArticles.map((article: any) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("editorial.noResults.title")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("editorial.noResults.description")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setCategory("all");
                    setSortBy("latest");
                  }}
                >
                  {t("editorial.noResults.clearFilters")}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("editorial.newsletter.title")}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t("editorial.newsletter.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("editorial.newsletter.placeholder")}
                className="flex-1 bg-white text-gray-900"
              />
              <Button variant="secondary" className="bg-accent hover:bg-accent/90">
                {t("editorial.newsletter.subscribe")}
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
