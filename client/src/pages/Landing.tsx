import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedCollectionsRedesigned } from "@/components/FeaturedCollectionsRedesigned";
import { CuratorsPicks } from "@/components/CuratorsPicks";
import { EditorialSection } from "@/components/EditorialSection";
import { AuctionSection } from "@/components/AuctionSection";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-mesh-gradient">
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />
          <FeaturedCollectionsRedesigned />
        </div>
        <CuratorsPicks />
        <EditorialSection />
        <AuctionSection />
      </main>
      <Footer />
    </div>
  );
}
