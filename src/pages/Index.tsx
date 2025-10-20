import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { SolutionSection } from "@/components/SolutionSection";
import { BusinessModel } from "@/components/BusinessModel";
import { WaitlistSection } from "@/components/WaitlistSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <BusinessModel />
      <WaitlistSection />
      <Footer />
    </div>
  );
};

export default Index;
