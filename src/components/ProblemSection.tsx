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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">The Automotive Market is </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Broken</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Traditional automotive trade in Kenya faces critical challenges that hinder growth and trust.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group"
            >
              <div className="relative p-8 bg-gradient-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated h-full">
                {/* Icon */}
                <div className="mb-6 inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
                  <problem.icon className="w-8 h-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
