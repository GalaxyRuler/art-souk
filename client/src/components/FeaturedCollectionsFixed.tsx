import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";

interface Collection {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  coverImage: string;
  featured: boolean;
}

export function FeaturedCollectionsFixed() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections/featured"],
  });

  return (
    <section className="py-16" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className={`mb-12 ${isRTL ? 'text-right' : 'text-center'}`}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'rgb(0, 0, 0)' }}>
            {t("collections.featured.title")}
          </h2>
          <p className="max-w-2xl mx-auto font-medium" style={{ color: 'rgb(0, 0, 0)' }}>
            {t("collections.featured.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => {
            const name = isRTL && collection.nameAr ? collection.nameAr : collection.name;
            const description = isRTL && collection.descriptionAr ? collection.descriptionAr : collection.description;

            return (
              <div key={collection.id} className="rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer" style={{ backgroundColor: '#ffffff' }}>
                <img
                  src={collection.coverImage}
                  alt={name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'rgb(0, 0, 0)' }}>{name}</h3>
                  <p className="font-medium text-sm leading-relaxed" style={{ color: 'rgb(0, 0, 0)' }}>{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}