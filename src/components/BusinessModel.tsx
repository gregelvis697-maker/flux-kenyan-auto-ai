import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Handshake } from "lucide-react";

export const BusinessModel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Sustainable </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Business Model</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for scale, powered by trust. Our dual revenue streams ensure long-term growth.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* B2C - Dealer Subscriptions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group"
          >
            <div className="relative h-full p-10 bg-gradient-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-500 shadow-card hover:shadow-elevated overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 inline-flex p-5 rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-glow-primary transition-all duration-300">
                  <Building2 className="w-12 h-12 text-primary" />
                </div>

                {/* Label */}
                <div className="inline-block px-4 py-1 rounded-full bg-primary/20 border border-primary/30 mb-6">
                  <span className="text-sm font-semibold text-primary">B2C Revenue</span>
                </div>

                {/* Content */}
                <h3 className="text-3xl font-bold mb-4 text-foreground">
                  Dealer Subscriptions
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Monthly subscription plans for verified dealers to access our platform, connect with buyers, and leverage AI-powered insights.
                </p>

                {/* Features list */}
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Premium dealer profiles</span>
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Priority customer matching</span>
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Advanced analytics dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* B2B - Importer Commissions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group"
          >
            <div className="relative h-full p-10 bg-gradient-card rounded-2xl border border-border hover:border-secondary/50 transition-all duration-500 shadow-card hover:shadow-elevated overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-6 inline-flex p-5 rounded-xl bg-secondary/10 border border-secondary/20 group-hover:shadow-glow-secondary transition-all duration-300">
                  <Handshake className="w-12 h-12 text-secondary" />
                </div>

                {/* Label */}
                <div className="inline-block px-4 py-1 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
                  <span className="text-sm font-semibold text-secondary">B2B Revenue</span>
                </div>

                {/* Content */}
                <h3 className="text-3xl font-bold mb-4 text-foreground">
                  Importer–Dealer Commissions
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Transaction-based commissions on successful importer-to-dealer connections, creating value for all parties involved.
                </p>

                {/* Features list */}
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Verified transaction tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Transparent pricing model</span>
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Automated payment processing</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Our business model scales with the market, ensuring sustainable growth while maintaining affordability for dealers and competitive pricing for buyers.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
