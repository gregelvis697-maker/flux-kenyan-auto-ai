import { ShieldCheck, FileSearch, Handshake, Lock } from "lucide-react";

const PILLARS = [
  { icon: ShieldCheck, label: "Verified dealers" },
  { icon: FileSearch, label: "Documented history" },
  { icon: Handshake, label: "Direct negotiation" },
  { icon: Lock, label: "Protected transfer" },
];

/** Compact trust strip — one line, no essay. */
export const TrustProof = () => (
  <section className="border-t border-border py-10">
    <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {PILLARS.map((p) => (
        <div key={p.label} className="flex items-center gap-2">
          <p.icon className="h-4 w-4 text-primary" />
          <span className="text-xs uppercase tracking-editorial text-muted-foreground">
            {p.label}
          </span>
        </div>
      ))}
    </div>
  </section>
);
