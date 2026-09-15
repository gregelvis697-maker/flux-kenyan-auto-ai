import { ShieldCheck, Route, LineChart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const TILES = [
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    body: "Dealers pass identity, yard and document checks before a listing goes live.",
  },
  {
    icon: LineChart,
    title: "Honest pricing",
    body: "Every listing is compared against live market data, so you know what is fair.",
  },
  {
    icon: Route,
    title: "Import tracking",
    body: "Follow an imported vehicle from order to delivery, stage by stage.",
  },
  {
    icon: Sparkles,
    title: "Matched to you",
    body: "Describe the car you want once and we surface the ones that fit.",
  },
];

export const CapabilityTiles = () => (
  <section className="py-20 md:py-28 border-t border-border">
    <div className="max-w-7xl mx-auto px-6 sm:px-10 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      <div className="lg:col-span-4">
        <p className="text-[10px] uppercase tracking-editorial text-primary font-semibold">
          The platform
        </p>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight leading-[1.05] text-foreground">
          Everything you need,
          <br />
          <span className="text-primary">in one place</span>
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed max-w-sm">
          Buying a car in Kenya usually means guesswork. Flux replaces it with
          checks you can see and numbers you can compare.
        </p>
        <Link
          to="/describe"
          className="mt-7 inline-flex text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Describe your perfect vehicle →
        </Link>
      </div>

      <div className="lg:col-span-8 grid sm:grid-cols-2 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {TILES.map((t) => (
          <div key={t.title} className="bg-background p-7 sm:p-8">
            <t.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
              {t.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
