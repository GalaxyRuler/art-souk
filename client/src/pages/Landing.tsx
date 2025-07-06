import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { CuratorsPicks } from "@/components/CuratorsPicks";
import { EditorialSection } from "@/components/EditorialSection";
import { AuctionSection } from "@/components/AuctionSection";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedCollections />
        <CuratorsPicks />
        <EditorialSection />
        <AuctionSection />
      </main>
      <Footer />
    </div>
  );
}
