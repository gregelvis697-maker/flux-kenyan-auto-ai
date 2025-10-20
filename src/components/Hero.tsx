import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-automotive-ai.jpg";

export const Hero = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      toast.error("Please fill in both email and phone number");
      return;
    }

    setIsSubmitting(true);
    // TODO: Connect to backend
    toast.success("You're on the waitlist! We'll be in touch soon.");
    setEmail("");
    setPhone("");
    setIsSubmitting(false);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4) blur(2px)",
          }}
        />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Revolutionizing Automotive Infrastructure</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Redefining Automotive
            </span>
            <br />
            <span className="text-foreground">Infrastructure in Kenya</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Flux connects importers, verified dealers, and buyers through trust, AI, and transparency.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 group"
              onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Waitlist form */}
          <motion.div
            id="waitlist-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border shadow-card">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/50 border-border focus:border-primary"
              />
              <Input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-background/50 border-border focus:border-primary"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
              >
                {isSubmitting ? "Submitting..." : "Join Now"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
