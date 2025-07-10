import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "wouter";

interface Article {
  id: number;
  title: string;
  titleAr?: string;
  excerpt: string;
  excerptAr?: string;
  coverImage?: string;
  category: string;
  categoryAr?: string;
  authorId: string;
  createdAt: string;
}

export function EditorialSection() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/featured"],
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-zinc-800 rounded w-64"></div>
                <div className="h-4 bg-zinc-800 rounded w-96"></div>
              </div>
              <div className="h-10 bg-zinc-800 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-zinc-800 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-4 bg-zinc-800 rounded"></div>
                    <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Mock data for editorial articles
  const mockArticles = [
    {
      id: 1,
      title: "The Rise of Contemporary Saudi Art in Global Markets",
      titleAr: "صعود الفن السعودي المعاصر في الأسواق العالمية",
      excerpt: "Exploring how Saudi artists are gaining international recognition and reshaping perceptions of Middle Eastern contemporary art.",
      excerptAr: "استكشاف كيف يكتسب الفنانون السعوديون اعترافاً دولياً ويعيدون تشكيل تصورات الفن المعاصر في الشرق الأوسط.",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "Art",
      categoryAr: "فن",
      authorId: "1",
      createdAt: "2025-01-15T00:00:00Z"
    },
    {
      id: 2,
      title: "5 GCC Artists Redefining Traditional Calligraphy",
      titleAr: "5 فنانين من دول مجلس التعاون يعيدون تعريف الخط التقليدي",
      excerpt: "Meet the innovative artists who are pushing the boundaries of Arabic calligraphy in contemporary art.",
      excerptAr: "تعرف على الفنانين المبتكرين الذين يوسعون حدود الخط العربي في الفن المعاصر.",
      coverImage: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "Interview",
      categoryAr: "مقابلة",
      authorId: "2",
      createdAt: "2025-01-12T00:00:00Z"
    },
    {
      id: 3,
      title: "Young Collectors' Guide to GCC Art Investment",
      titleAr: "دليل جامعي الفن الشباب للاستثمار في فن دول مجلس التعاون",
      excerpt: "Essential tips for new collectors looking to invest in the growing Gulf contemporary art market.",
      excerptAr: "نصائح أساسية للجامعين الجدد الذين يسعون للاستثمار في السوق المتنامي للفن المعاصر في الخليج.",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      category: "Guide",
      categoryAr: "دليل",
      authorId: "3",
      createdAt: "2025-01-10T00:00:00Z"
    }
  ];

  const displayArticles = articles.length > 0 ? articles : mockArticles;

  return (
    <section className="py-24 bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className={cn("flex justify-between items-center mb-12", isRTL && "flex-row-reverse")}>
          <div className={cn(isRTL && "text-right")}>
            <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
              {t("editorial.title")}
            </h2>
            <div className="w-24 h-1 bg-orange-500 mb-4"></div>
            <p className="text-gray-400 text-lg">{t("editorial.description")}</p>
          </div>
          <Link href="/editorial">
            <Button
              className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black font-bold uppercase tracking-wider"
            >
              {t("editorial.viewAll")}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayArticles.map((article) => {
            const title = isRTL && article.titleAr ? article.titleAr : article.title;
            const excerpt = isRTL && article.excerptAr ? article.excerptAr : article.excerpt;
            const category = isRTL && article.categoryAr ? article.categoryAr : article.category;

            return (
              <article key={article.id} className="group cursor-pointer bg-zinc-800 border border-zinc-700 hover:border-orange-500 transition-colors p-6">
                <div className="relative overflow-hidden mb-4">
                  <img
                    src={article.coverImage}
                    alt={title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-xs">
                      {category}
                    </Badge>
                  </div>
                </div>
                <div className={cn("space-y-3", isRTL && "text-right")}>
                  <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-wider">
                    {title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {excerpt}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
