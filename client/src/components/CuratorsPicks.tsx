import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/ArtworkCard";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { Artwork } from "@/types";

export function CuratorsPicks() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const { data: artworks = [], isLoading } = useQuery<Artwork[]>({
    queryKey: ["/api/artworks/curators-picks"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Mock data for curators' picks
  const mockArtworks = [
    {
      id: 1,
      title: "Desert Reflection",
      titleAr: "انعكاس الصحراء",
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
      artist: {
        name: "Fatima Al-Zahra",
        nameAr: "فاطمة الزهراء"
      },
      gallery: {
        name: "Riyadh Contemporary Gallery",
        nameAr: "معرض الرياض المعاصر"
      },
      year: 2024,
      medium: "Oil on canvas",
      mediumAr: "زيت على القماش",
      price: "12,000–18,000",
      currency: "SAR",
      category: "Contemporary",
      categoryAr: "معاصر",
      availability: "available"
    },
    {
      id: 2,
      title: "Sacred Geometry III",
      titleAr: "الهندسة المقدسة الثالثة",
      images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
      artist: {
        name: "Omar Al-Mutairi",
        nameAr: "عمر المطيري"
      },
      gallery: {
        name: "Kuwait Modern Art Gallery",
        nameAr: "معرض الكويت للفن الحديث"
      },
      year: 2024,
      medium: "Mixed media",
      mediumAr: "وسائط متعددة",
      price: "8,500–12,000",
      currency: "SAR",
      category: "Islamic Art",
      categoryAr: "فن إسلامي",
      availability: "available"
    },
    {
      id: 3,
      title: "Urban Transformation",
      titleAr: "التحول الحضري",
      images: ["https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
      artist: {
        name: "Layla Al-Rashid",
        nameAr: "ليلى الراشد"
      },
      gallery: {
        name: "Dubai Art Space",
        nameAr: "دبي آرت سبيس"
      },
      year: 2024,
      medium: "Digital art",
      mediumAr: "فن رقمي",
      price: "15,000–22,000",
      currency: "SAR",
      category: "Digital",
      categoryAr: "رقمي",
      availability: "available"
    },
    {
      id: 4,
      title: "Evening Prayer",
      titleAr: "صلاة المساء",
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"],
      artist: {
        name: "Khalid Al-Dosari",
        nameAr: "خالد الدوسري"
      },
      gallery: {
        name: "Jeddah Fine Arts Gallery",
        nameAr: "معرض جدة للفنون الجميلة"
      },
      year: 2024,
      medium: "Watercolor",
      mediumAr: "ألوان مائية",
      price: "25,000–35,000",
      currency: "SAR",
      category: "Traditional",
      categoryAr: "تقليدي",
      availability: "available"
    }
  ];

  const displayArtworks = artworks.length > 0 ? artworks : mockArtworks as Artwork[];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("flex justify-between items-center mb-12", isRTL && "flex-row-reverse")}>
          <div className={cn(isRTL && "text-right")}>
            <h2 className="text-3xl font-bold text-primary mb-4">
              {t("curators.title")}
            </h2>
            <p className="text-gray-600">{t("curators.description")}</p>
          </div>
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-white"
          >
            {t("curators.viewAll")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayArtworks.map((artwork: Artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </div>
    </section>
  );
}
