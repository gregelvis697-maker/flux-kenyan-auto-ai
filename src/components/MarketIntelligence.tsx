import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Activity, Timer, BarChart3 } from "lucide-react";

const SIGNALS = [
  {
    label: "Price vs Market",
    note: "Compares a listing against comparable Kenyan sales",
    icon: TrendingUp,
  },
  {
    label: "Demand Index",
    note: "Tracks buyer interest by make, model and region",
    icon: Activity,
  },
  {
    label: "Days to Sell",
    note: "Estimates how fast a segment is moving",
    icon: Timer,
  },
];

export const MarketIntelligence = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background/75 text-foreground py-20 md:py-28 border-t border-border overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            <div className="text-[10px] tracking-editorial uppercase text-brand font-bold mb-3">
              Section 03 · Intelligence
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
              Marketplace
              <br />
              Intelligence
            </h2>
            <p className="mt-6 text-muted-foreground font-light leading-relaxed max-w-md">
              Every listing carries live market context — pricing spread, demand
              pressure and time-to-sell — pulled from real Kenyan transactions,
              not guesswork.
            </p>

            <div className="mt-10 space-y-px bg-border border border-border">
              {SIGNALS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.45, delay: i * 0.1 }}
                  className="group flex items-center justify-between gap-4 bg-background p-5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <s.icon className="h-5 w-5 text-brand shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div className="min-w-0">
                      <div className="font-display font-bold uppercase text-sm tracking-tight truncate">
                        {s.label}
                      </div>
                      <div className="text-[10px] uppercase tracking-editorial text-muted-foreground">
                        {s.note}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate("/products/ai-intelligence")}
              className="mt-8 px-8 py-4 border border-border font-bold uppercase tracking-widest text-xs hover:border-brand hover:text-brand transition-colors"
            >
              Explore AI Intelligence →
            </button>
          </div>

          {/* Animated chart panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative border border-border bg-card p-6 sm:p-8 shadow-card"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 80% 0%, hsl(var(--brand) / 0.12), transparent 65%)",
              }}
            />
            <div className="relative flex items-center justify-between mb-8">
              <div>
                <div className="text-[10px] tracking-editorial uppercase text-muted-foreground">
                  Segment Price Index
                </div>
                <div className="font-display text-2xl font-black mt-1">
                  SUV · Nairobi
                </div>
              </div>
              <BarChart3 className="h-5 w-5 text-brand" />
            </div>

            <div className="relative flex items-end gap-1.5 sm:gap-2 h-40 sm:h-52">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0, opacity: 0 }}
                  whileInView={{ height: `${h}%`, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex-1 ${
                    i === BARS.length - 3 ? "bg-brand" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-px bg-border border border-border">
              {[
                { k: "Listings", v: "1,204" },
                { k: "Median", v: "KES 4.2M" },
                { k: "Spread", v: "±11%" },
              ].map((s) => (
                <div key={s.k} className="bg-card p-3 sm:p-4">
                  <div className="text-[9px] uppercase tracking-editorial text-muted-foreground">
                    {s.k}
                  </div>
                  <div className="mt-1 font-display font-black text-sm sm:text-base">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
