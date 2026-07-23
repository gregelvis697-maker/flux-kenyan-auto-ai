import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Car } from "lucide-react";
import heroImage from "@/assets/hero-automotive-ai.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) blur(2px)",
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary/20 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-glow-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary/20 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] animate-glow-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Badge */}

          {/* Main headline */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span className="text-foreground">Drive Into</span>
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              The Future
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Revolutionary automotive marketplace powered by AI. Connect verified
            dealers, importers, and buyers in Kenya's most trusted vehicle
            platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 group w-full sm:w-auto"
              asChild
            >
              <a href="/marketplace">
                <Car className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Browse Marketplace
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto"
              asChild
            >
              <a href="/auth">List Your Cars</a>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
