import { motion } from "framer-motion";
import { ShieldCheck, FileSearch, Handshake, Lock } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified Dealers",
    body: "Every dealership passes KRA, physical-yard and identity verification before a single listing goes live.",
  },
  {
    icon: FileSearch,
    title: "Documented History",
    body: "Import records, mileage evidence and inspection notes attached to the listing — not promised over the phone.",
  },
  {
    icon: Handshake,
    title: "Direct Negotiation",
    body: "You talk to the actual seller. No brokers stacking margin between you and the vehicle.",
  },
  {
    icon: Lock,
    title: "Protected Transfer",
    body: "Escrow-backed payment and logbook transfer tracking until the keys are legitimately yours.",
  },
];

export const TrustProof = () => {
  return (
    <section className="relative bg-background/75 text-foreground py-20 md:py-28 border-t border-border overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 15% 0%, hsl(var(--brand) / 0.07), transparent 65%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="text-[10px] tracking-editorial uppercase text-brand font-bold mb-3">
              Section 02 · Trust
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]">
              Proof,
              <br />
              <span className="text-stroke">Not Promises</span>
            </h2>
            <p className="mt-6 text-muted-foreground font-light leading-relaxed max-w-sm">
              Kenya's used-car market runs on reputation. Flux replaces hearsay
              with signals you can audit before you ever leave the house.
            </p>


          </div>

          <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-border border border-border">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative bg-background p-6 sm:p-8"
              >
                <span className="absolute top-0 left-0 h-px w-0 bg-brand group-hover:w-full transition-all duration-500" />
                <p.icon className="h-6 w-6 text-brand mb-5" />
                <h3 className="font-display text-lg font-black uppercase tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground font-light leading-relaxed">
                  {p.body}
                </p>
                <span className="mt-6 block text-[10px] tracking-editorial uppercase text-muted-foreground/60">
                  0{i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
