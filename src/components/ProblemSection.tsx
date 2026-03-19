import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, ShieldX, TrendingDown, DollarSign } from "lucide-react";

const problems = [
  {
    icon: Users,
    title: "Broker Dominance",
    description:
      "Excessive middlemen inflate prices and reduce transparency in every transaction.",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
  },
  {
    icon: ShieldX,
    title: "Zero Verification",
    description:
      "No standardized system to verify dealers, leading to widespread fraud.",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
  {
    icon: TrendingDown,
    title: "Data Blackout",
    description:
      "Buyers navigate blindly without access to market data or vehicle history.",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
  },
  {
    icon: DollarSign,
    title: "Hidden Costs",
    description:
      "Opaque pricing structures lead to inflated and unpredictable final costs.",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-400",
  },
];

export const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
      ref={ref}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-foreground">The </span>
            <span className="bg-gradient-to-r from-destructive to-orange-400 bg-clip-text text-transparent">
              Broken System
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Kenya's automotive market is plagued by systemic issues that cost
            consumers billions annually.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-7 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-6 sm:p-7 lg:p-8 bg-gradient-card rounded-xl border border-border hover:border-destructive/40 transition-all duration-300 shadow-card hover:shadow-elevated hover:scale-[1.02] h-full">
                {/* Icon */}
                <div
                  className={`mb-4 sm:mb-5 inline-flex p-3 sm:p-4 rounded-xl ${problem.iconBg} border border-border/50`}
                >
                  <problem.icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${problem.iconColor}`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-foreground">
                  {problem.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
