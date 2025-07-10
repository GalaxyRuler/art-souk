import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowRight } from "lucide-react";

interface Collection {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  coverImage: string;
  featured: boolean;
}

export function FeaturedCollectionsRedesigned() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  const { data: collections = [] } = useQuery<Collection[]>({
    queryKey: ["/api/collections/featured"],
  });

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Dark background with subtle pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-900 to-black"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`,
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className={`mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-wide uppercase">
            {t("collections.featured.title")}
          </h2>
          <div className="w-24 h-1 bg-orange-500 mb-6"></div>
          <p className="text-xl text-gray-300 max-w-2xl font-light">
            {t("collections.featured.description")}
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => {
            const name = isRTL && collection.nameAr ? collection.nameAr : collection.name;
            const description = isRTL && collection.descriptionAr ? collection.descriptionAr : collection.description;

            return (
              <div 
                key={collection.id} 
                className="group relative overflow-hidden cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Card Container */}
                <div className="relative h-[450px] bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-500 group-hover:border-orange-500">
                  {/* Image Container */}
                  <div className="absolute inset-0">
                    <img
                      src={collection.coverImage}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 group-hover:translate-y-[-10px]">
                    {/* Collection Number */}
                    <div className="text-orange-500 font-bold text-sm mb-3 tracking-wider">
                      COLLECTION {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white text-2xl font-bold mb-3 uppercase tracking-wide">
                      {name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-6 line-clamp-2 font-light">
                      {description}
                    </p>
                    
                    {/* CTA */}
                    <div className="flex items-center text-orange-500 font-bold text-sm uppercase tracking-wider group-hover:text-orange-400 transition-colors">
                      <span className="mr-2">Explore Collection</span>
                      <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-2" />
                    </div>
                  </div>
                  
                  {/* Top Border Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}