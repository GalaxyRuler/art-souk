import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface Collection {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  coverImage?: string;
  featured: boolean;
}

export function FeaturedCollections() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const { data: collections = [], isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/collections/featured"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-64 bg-gray-200 rounded-xl"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Mock data for featured collections
  const mockCollections = [
    {
      id: 1,
      name: "Contemporary Calligraphy",
      nameAr: "الخط العربي المعاصر",
      description: "Modern interpretations of traditional Arabic calligraphy",
      descriptionAr: "تفسيرات حديثة للخط العربي التقليدي",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      featured: true
    },
    {
      id: 2,
      name: "Desert Visions",
      nameAr: "رؤى الصحراء",
      description: "Landscapes and abstractions inspired by the Arabian desert",
      descriptionAr: "مناظر طبيعية ومجردة مستوحاة من الصحراء العربية",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      featured: true
    },
    {
      id: 3,
      name: "Urban Contemporary",
      nameAr: "الفن المعاصر الحضري",
      description: "Modern city life and cultural transformation",
      descriptionAr: "الحياة الحضرية الحديثة والتحول الثقافي",
      coverImage: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
      featured: true
    }
  ];

  const displayCollections = collections.length > 0 ? collections : mockCollections;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("text-center mb-12", isRTL && "text-right")}>
          <h2 className="text-3xl font-bold text-primary mb-4">
            {t("collections.featured.title")}
          </h2>
          <p className="max-w-2xl mx-auto" style={{ 
            color: '#000000',
            fontWeight: '500',
            fontSize: '16px',
            opacity: 1,
            textShadow: 'none',
            filter: 'none'
          }}>
            {t("collections.featured.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayCollections.map((collection) => {
            const name = isRTL && collection.nameAr ? collection.nameAr : collection.name;
            const description = isRTL && collection.descriptionAr ? collection.descriptionAr : collection.description;

            return (
              <div key={collection.id} className="group cursor-pointer overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="relative">
                  <img
                    src={collection.coverImage}
                    alt={name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-semibold text-primary mb-2">{name}</h3>
                  <p style={{ 
                    color: '#000000',
                    fontWeight: '600',
                    fontSize: '14px',
                    opacity: 1,
                    textShadow: 'none',
                    filter: 'none'
                  }}>{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
