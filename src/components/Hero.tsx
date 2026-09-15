import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShieldCheck, Route, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVehicle from "@/assets/hero-vehicle.jpg";

const POPULAR_MAKES = ["Toyota", "Mazda", "Subaru", "Nissan", "Mercedes-Benz"];

const FEATURES = [
  { icon: ShieldCheck, title: "Verified sellers", body: "Checked before listing" },
  { icon: LineChart, title: "Fair price signal", body: "Compared to the market" },
  { icon: Route, title: "Import tracking", body: "Order to delivery" },
];

export const Hero = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const search = (term?: string) => {
    const q = (term ?? query).trim();
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : "/marketplace");
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] uppercase tracking-editorial text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Kenya's verified car marketplace
          </span>

          <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.02] text-foreground">
            Find, buy and import
            <br />
            cars with <span className="text-primary">confidence</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
            Verified dealers, documented history and honest pricing — from first
            search to the day the keys are yours.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
            className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-card/70 p-2 max-w-lg backdrop-blur-sm"
          >
            <Search className="ml-2 h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by make, model or year"
              aria-label="Search cars"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none min-h-12"
            />
            <Button type="submit" className="min-h-11 px-5 shrink-0">
              Search cars
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Popular:</span>
            {POPULAR_MAKES.map((make) => (
              <button
                key={make}
                type="button"
                onClick={() => navigate(`/marketplace?make=${encodeURIComponent(make)}`)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                {make}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate("/describe")}
            className="mt-6 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Not sure yet? Describe your perfect vehicle →
          </button>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img
              src={heroVehicle}
              alt="Modern SUV listed on Flux"
              width={1280}
              height={1024}
              className="w-full h-full object-cover aspect-[5/4]"
            />
          </div>

          <div className="mt-4 lg:mt-0 lg:absolute lg:-bottom-8 lg:-left-8 w-full lg:w-64 rounded-xl border border-border bg-card/95 backdrop-blur-md divide-y divide-border shadow-elevated">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-4">
                <f.icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
