import { Hero } from "@/components/Hero";
import { FeaturedInventory } from "@/components/FeaturedInventory";
import { Personas } from "@/components/Personas";
import { SolutionSection } from "@/components/SolutionSection";
import { BusinessModel } from "@/components/BusinessModel";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Hero />
      <FeaturedInventory />
      <Personas />
      <SolutionSection />
      <BusinessModel />
      <Footer />
    </div>
  );
};

export default Index;
