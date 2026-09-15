import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ClosingCta = () => (
  <section className="border-t border-border py-20 md:py-24">
    <div className="max-w-3xl mx-auto px-6 text-center">
      <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        Ready when you are
      </h2>
      <p className="mt-4 text-muted-foreground">
        Browse verified stock today, or tell us what you are looking for and we
        will bring it to you.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button asChild size="lg" className="min-h-12 px-7">
          <Link to="/marketplace">Browse marketplace</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="min-h-12 px-7">
          <Link to="/describe">Describe your perfect vehicle</Link>
        </Button>
      </div>
    </div>
  </section>
);
