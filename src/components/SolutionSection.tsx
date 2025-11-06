import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Shield, Zap, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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

const roleCards = [
  { 
    label: "Importers", 
    role: "importer", 
    route: "/dashboard/importer",
    borderClass: "border-primary shadow-glow-primary",
    bgClass: "bg-primary/10",
    iconClass: "bg-primary/20 border-primary text-primary",
    textClass: "text-primary"
  },
  { 
    label: "Dealers", 
    role: "dealer", 
    route: "/dashboard/dealer",
    borderClass: "border-secondary shadow-glow-secondary",
    bgClass: "bg-secondary/10",
    iconClass: "bg-secondary/20 border-secondary text-secondary",
    textClass: "text-secondary"
  },
  { 
    label: "Buyers", 
    role: "buyer", 
    route: "/dashboard/buyer",
    borderClass: "border-primary shadow-glow-primary",
    bgClass: "bg-primary/10",
    iconClass: "bg-primary/20 border-primary text-primary",
    textClass: "text-primary"
  },
  { 
    label: "Admin", 
    role: "admin", 
    route: "/admin/dashboard",
    borderClass: "border-accent shadow-glow-primary",
    bgClass: "bg-accent/10",
    iconClass: "bg-accent/20 border-accent text-accent-foreground",
    textClass: "text-accent-foreground"
  },
];

export const SolutionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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

        {/* Role Cards with Dashboard Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Choose Your <span className="bg-gradient-primary bg-clip-text text-transparent">Role</span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {roleCards.map((card, index) => (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                onMouseEnter={() => setHoveredRole(card.role)}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => navigate(user ? card.route : "/auth")}
                className="relative cursor-pointer group"
              >
                <div className={`relative h-full p-6 bg-gradient-card rounded-2xl border transition-all duration-300 ${
                  hoveredRole === card.role
                    ? `${card.borderClass} scale-105`
                    : "border-border hover:border-primary/30"
                }`}>
                  {/* Background glow on hover */}
                  <div className={`absolute inset-0 ${card.bgClass} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 text-center">
                    {/* Icon/Initial */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${card.iconClass} border-2 mb-4 transition-all duration-300 group-hover:scale-110`}>
                      <span className="text-xl font-bold">
                        {card.label.charAt(0)}
                      </span>
                    </div>
                    
                    {/* Role label */}
                    <p className="text-sm font-semibold text-foreground mb-2">
                      {card.label}
                    </p>
                    
                    {/* Hover CTA */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={
                        hoveredRole === card.role
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 10 }
                      }
                      transition={{ duration: 0.2 }}
                      className={`flex items-center justify-center gap-2 text-xs font-medium ${card.textClass}`}
                    >
                      <span>{user ? "Go to Dashboard" : "Sign Up"}</span>
                      <ArrowRight className="w-3 h-3" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
