import { Hero } from "@/components/Hero";
import { FeaturedInventory } from "@/components/FeaturedInventory";
import { TrustProof } from "@/components/TrustProof";
import { MarketIntelligence } from "@/components/MarketIntelligence";
import { Personas } from "@/components/Personas";
import { SolutionSection } from "@/components/SolutionSection";
import { BusinessModel } from "@/components/BusinessModel";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background/80 text-foreground">
      <Navigation />
      <Hero />
      <FeaturedInventory />
      <TrustProof />
      <MarketIntelligence />
      <Personas />
      <SolutionSection />
      <BusinessModel />
      <CtaBanner />
      <Footer />
    </div>
  );
};

export default Index;
