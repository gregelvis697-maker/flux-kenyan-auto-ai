import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Zap, Brain } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Ecosystem",
    description: "Every transaction happens in a transparent, AI-powered environment. Trust is built into every interaction.",
    gradient: "from-primary/20 to-secondary/20",
  },
  {
    icon: Zap,
    title: "AI Matching Engine",
    description: "Instantly connects buyers and dealers based on preferences and proximity. Smart recommendations powered by machine learning.",
    gradient: "from-secondary/20 to-primary/20",
  },
  {
    icon: Brain,
    title: "Automotive Intelligence",
    description: "Get real-time insights, pricing analysis, and fraud detection. Make informed decisions with comprehensive market data.",
    gradient: "from-primary/20 to-secondary/20",
  },
];

export const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solution" className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Building the </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Digital Backbone</span>
            <br />
            <span className="text-foreground">of Automotive Trade</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Flux leverages AI and blockchain-inspired trust systems to create a seamless marketplace.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative"
            >
              <div className="relative h-full p-8 bg-gradient-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-500 shadow-card hover:shadow-elevated overflow-hidden">
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-glow-primary group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-10 h-10 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual representation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative p-12 bg-gradient-card rounded-3xl border border-border shadow-elevated">
            {/* Pipeline visualization */}
            <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mb-4 shadow-glow-primary">
                  <span className="text-2xl font-bold text-primary">I</span>
                </div>
                <p className="text-sm font-medium text-foreground">Importers</p>
              </div>

              <div className="flex-shrink-0">
                <div className="h-1 w-16 bg-gradient-primary" />
              </div>

              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/20 border-2 border-secondary mb-4 shadow-glow-secondary">
                  <span className="text-2xl font-bold text-secondary">D</span>
                </div>
                <p className="text-sm font-medium text-foreground">Dealers</p>
              </div>

              <div className="flex-shrink-0">
                <div className="h-1 w-16 bg-gradient-primary" />
              </div>

              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary mb-4 shadow-glow-primary">
                  <span className="text-2xl font-bold text-primary">B</span>
                </div>
                <p className="text-sm font-medium text-foreground">Buyers</p>
              </div>
            </div>

            {/* Center AI label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-full border border-primary shadow-glow-primary">
              <p className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent">AI-Powered</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
