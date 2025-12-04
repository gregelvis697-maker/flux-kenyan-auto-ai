import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, Users, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: Users,
    title: "Heavy Broker Influence",
    description: "Opaque middlemen increase costs and reduce trust in every transaction.",
  },
  {
    icon: AlertTriangle,
    title: "Lack of Centralized Trust Systems",
    description: "No unified platform to verify dealers, pricing, or vehicle authenticity.",
  },
  {
    icon: TrendingDown,
    title: "Limited Market Intelligence",
    description: "Buyers and dealers lack access to real-time data and market insights.",
  },
];

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden" ref={ref}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-foreground">The Automotive Market is </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Broken</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Traditional automotive trade in Kenya faces critical challenges that hinder growth and trust.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="relative p-5 sm:p-6 lg:p-8 bg-gradient-card rounded-xl sm:rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated h-full">
                {/* Icon */}
                <div className="mb-4 sm:mb-6 inline-flex p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
                  <problem.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4 text-foreground">
                  {problem.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};