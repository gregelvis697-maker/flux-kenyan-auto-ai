import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Handshake } from "lucide-react";

const dealerDetails = [
  { label: "Premium Profiles", value: "Verified Badge" },
  { label: "Monthly Plans", value: "From KES 32,000" },
  { label: "AI Insights", value: "Included" },
  { label: "Support", value: "24/7 Priority" },
];

const commissionDetails = [
  { label: "Commission Rate", value: "2.5% – 5%" },
  { label: "Processing", value: "Automated" },
  { label: "Tracking", value: "Real-time" },
  { label: "Settlement", value: "48 Hours" },
];

export const BusinessModel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            <span className="text-foreground">Sustainable </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Revenue Model</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Dual revenue streams powering growth and innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Dealer Subscriptions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group"
          >
            <div className="relative h-full p-6 sm:p-8 bg-gradient-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-elevated overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-4 sm:mb-5 inline-flex p-4 rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-4">
                  <span className="text-xs font-semibold text-primary">B2C Revenue</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Dealer Subscriptions</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                  Monthly subscription plans for verified dealers to access our platform, connect with buyers, and leverage AI-powered insights.
                </p>
                <div className="space-y-3">
                  {dealerDetails.map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-semibold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transaction Commissions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group"
          >
            <div className="relative h-full p-6 sm:p-8 bg-gradient-card rounded-xl border border-border hover:border-secondary/50 transition-all duration-300 shadow-card hover:shadow-elevated overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-4 sm:mb-5 inline-flex p-4 rounded-xl bg-secondary/10 border border-secondary/20 group-hover:shadow-glow-secondary transition-all duration-300">
                  <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 mb-4">
                  <span className="text-xs font-semibold text-secondary">B2B Revenue</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">Transaction Commissions</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                  Transaction-based commissions on successful importer-to-dealer connections, creating value for all parties involved.
                </p>
                <div className="space-y-3">
                  {commissionDetails.map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-semibold text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
