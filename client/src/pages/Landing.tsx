import { useTranslation } from "react-i18next";
import { NavbarRedesigned } from "@/components/NavbarRedesigned";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FeaturedCollectionsRedesigned } from "@/components/FeaturedCollectionsRedesigned";
import { CuratorsPicks } from "@/components/CuratorsPicks";
import { EditorialSection } from "@/components/EditorialSection";
import { AuctionSection } from "@/components/AuctionSection";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-black">
      <NavbarRedesigned />
      <main className="overflow-hidden pt-20">
        <HeroSection />
        <div className="relative bg-zinc-900">
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
