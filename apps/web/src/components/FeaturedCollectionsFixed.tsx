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
    <section style={{ 
      paddingTop: '64px', 
      paddingBottom: '64px', 
      backgroundColor: '#ffffff' 
    }}>
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 16px' 
      }}>
        <div style={{ 
          textAlign: isRTL ? 'right' : 'center', 
          marginBottom: '48px' 
        }}>
          <h2 style={{ 
            fontSize: '30px', 
            fontWeight: 'bold', 
            color: '#000000 !important', 
            marginBottom: '16px' 
          }}>
            {t("collections.featured.title")}
          </h2>
          <p style={{ 
            maxWidth: '672px', 
            margin: '0 auto', 
            color: '#000000 !important', 
            fontWeight: '500', 
            fontSize: '16px' 
          }}>
            {t("collections.featured.description")}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '32px' 
        }}>
          {collections.map((collection) => {
            const name = isRTL && collection.nameAr ? collection.nameAr : collection.name;
            const description = isRTL && collection.descriptionAr ? collection.descriptionAr : collection.description;

            return (
              <div key={collection.id} style={{ 
                borderRadius: '8px', 
                overflow: 'hidden', 
                backgroundColor: '#ffffff', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                cursor: 'pointer' 
              }}>
                <img
                  src={collection.coverImage}
                  alt={name}
                  style={{ 
                    width: '100%', 
                    height: '256px', 
                    objectFit: 'cover' 
                  }}
                />
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: '#ffffff' 
                }}>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#000000 !important', 
                    margin: '0 0 8px 0' 
                  }}>{name}</h3>
                  <p style={{ 
                    color: '#000000 !important', 
                    fontWeight: '600', 
                    fontSize: '14px', 
                    lineHeight: '1.4', 
                    margin: '0' 
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