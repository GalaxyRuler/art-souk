import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
// Removed CSS import to avoid conflicts

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
    <section style={{ paddingTop: '64px', paddingBottom: '64px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ textAlign: isRTL ? 'right' : 'center', marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '30px', 
            fontWeight: 'bold', 
            color: '#000000 !important', 
            marginBottom: '16px',
            WebkitTextFillColor: '#000000 !important'
          }}>
            {t("collections.featured.title")}
          </h2>
          <p style={{ 
            maxWidth: '672px',
            margin: '0 auto',
            color: '#000000 !important',
            fontWeight: '500',
            fontSize: '16px',
            WebkitTextFillColor: '#000000 !important'
          }}>
            {t("collections.featured.description")}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {displayCollections.map((collection) => {
            const name = isRTL && collection.nameAr ? collection.nameAr : collection.name;
            const description = isRTL && collection.descriptionAr ? collection.descriptionAr : collection.description;

            return (
              <div key={collection.id} style={{
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={collection.coverImage}
                    alt={name}
                    style={{
                      width: '100%',
                      height: '256px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ 
                  padding: '24px',
                  backgroundColor: '#ffffff'
                }}>
                  <h3 style={{ 
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#000000',
                    margin: '0 0 8px 0',
                    opacity: 1
                  }}>{name}</h3>
                  <p style={{ 
                    color: '#000000',
                    fontWeight: '600',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    margin: '0',
                    opacity: 1
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
