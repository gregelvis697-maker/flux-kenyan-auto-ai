import { motion } from "framer-motion";

const personas = [
  {
    id: "01",
    title: "Buyers",
    body: "Hyper-personalized discovery engine that learns your driving DNA and surfaces AI-matched inventory.",
  },
  {
    id: "02",
    title: "Dealers",
    body: "Proprietary CRM with predictive inventory analytics, price guidance, and buyer risk profiling.",
  },
  {
    id: "03",
    title: "Importers",
    body: "End-to-end supply chain visibility from Japan and UK ports through Mombasa to the showroom floor.",
  },
];

export const Personas = () => {
  return (
    <section className="bg-background text-foreground py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="text-[10px] tracking-editorial uppercase text-[#00d4ff] font-bold mb-3">
              Section 02 · The Ecosystem
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter max-w-2xl">
              Built for every player in the market
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm md:text-base">
            One unified operating system for automotive commerce in Kenya — from
            single-unit buyers to fleet importers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
          {personas.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`p-8 md:p-10 border-b md:border-b-0 border-border ${
                i < personas.length - 1 ? "md:border-r" : ""
              } hover:bg-muted/50 transition-colors group cursor-pointer`}
            >
              <span className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-editorial">
                User Type {p.id}
              </span>
              <h4 className="mt-6 font-display text-2xl md:text-3xl font-black uppercase group-hover:translate-x-1 transition-transform">
                {p.title}
              </h4>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
