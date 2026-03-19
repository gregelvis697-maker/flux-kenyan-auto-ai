import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  ShieldCheck,
  Brain,
  Network,
  BarChart3,
  Zap,
  Lock,
  ArrowRight,
  Ship,
  Store,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    icon: ShieldCheck,
    title: "Blockchain Trust",
    description:
      "Immutable verification of dealers, vehicles, and transaction histories.",
    bullets: ["Verified Records", "Tamper-Proof", "Full Transparency"],
  },
  {
    icon: Brain,
    title: "AI Intelligence",
    description:
      "Smart recommendations, pricing insights, and fraud detection.",
    bullets: ["Smart Matching", "Price Analysis", "Risk Detection"],
  },
  {
    icon: Network,
    title: "Direct Connect",
    description:
      "Remove middlemen and connect buyers directly with verified dealers.",
    bullets: ["No Brokers", "Direct Contact", "Fair Prices"],
  },
  {
    icon: BarChart3,
    title: "Market Analytics",
    description:
      "Comprehensive data insights empower better decisions for all stakeholders.",
    bullets: ["Live Pricing", "Demand Forecasting", "Market Reports"],
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description:
      "Real-time authentication of documents, vehicles, and dealer credentials.",
    bullets: ["Document Scanning", "Photo Verification", "Instant Approval"],
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Escrow services and encrypted transactions protect every party involved.",
    bullets: ["Escrow System", "Multiple Gateways", "Refund Protection"],
  },
];

const stakeholders = [
  {
    label: "WHOLESALE POWER",
    title: "Importers",
    icon: Ship,
    description:
      "Connect with verified dealers across Kenya. Track shipments, manage inventory, and scale your import business.",
    features: [
      "Direct Dealer Access",
      "Shipping Tracker",
      "Inventory Management",
      "Bulk Pricing Tools",
    ],
    route: "/dashboard/importer",
    showCta: true,
  },
  {
    label: "MARKET LEADERS",
    title: "Dealers",
    icon: Store,
    description:
      "Premium tools to grow your dealership. AI-powered customer matching, analytics, and trusted buyer connections.",
    features: [
      "AI Customer Matching",
      "Advanced Analytics",
      "Marketing Tools",
      "Premium Listing",
    ],
    route: "/dashboard/dealer",
    showCta: true,
  },
  {
    label: "SMART SHOPPERS",
    title: "Buyers",
    icon: ShoppingCart,
    description:
      "Find your perfect vehicle from verified dealers. Get AI recommendations, fair prices, and complete transparency.",
    features: [
      "Verified Listings",
      "Price Comparison",
      "AI Recommendations",
      "Secure Payments",
    ],
    route: "/dashboard/buyer",
    showCta: true,
  },
  {
    label: "PLATFORM CONTROL",
    title: "Admin",
    icon: Settings,
    description:
      "Comprehensive oversight of the entire ecosystem. Manage verifications, resolve disputes, and ensure quality.",
    features: [
      "User Management",
      "Dispute Resolution",
      "Platform Analytics",
      "Quality Control",
    ],
    route: "/admin/dashboard",
    showCta: false,
  },
];

export const SolutionSection = () => {
  const ref = useRef(null);
  const stakeholderRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const isStakeholderInView = useInView(stakeholderRef, {
    once: true,
    margin: "-50px",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section id="solution" className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/3 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary/10 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px]" />
      </div>

      {/* Part A: The FLUX Solution */}
      <div className="py-16 sm:py-20 lg:py-24 relative z-10" ref={ref}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              <span className="text-foreground">The </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                FLUX Solution
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Six revolutionary pillars transforming Kenya's automotive
              infrastructure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7 max-w-7xl mx-auto">
            {solutions.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full p-5 sm:p-6 lg:p-8 bg-gradient-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated">
                  {/* Icon */}
                  <div className="mb-4 sm:mb-5 inline-flex p-3 sm:p-4 rounded-xl bg-primary/15 border border-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Bullet points */}
                  <ul className="space-y-1.5">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Part B: Built for Every Stakeholder */}
      <div
        className="py-16 sm:py-20 lg:py-24 relative z-10"
        ref={stakeholderRef}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isStakeholderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
              <span className="text-foreground">Built for </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Every Stakeholder
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Tailored solutions for importers, dealers, buyers, and
              administrators.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-7 max-w-6xl mx-auto">
            {stakeholders.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isStakeholderInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full p-6 sm:p-7 lg:p-8 bg-gradient-card rounded-xl border border-border hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-elevated overflow-hidden">
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/15 border border-primary/20">
                      <card.icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Label */}
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                      {card.label}
                    </p>

                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                      {card.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {card.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {card.showCta && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(user ? card.route : "/auth")
                        }
                        className="border-primary/30 text-foreground hover:border-primary hover:bg-primary/10 transition-all group/btn"
                      >
                        Get Started
                        <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
