import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";

const Waitlist = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    role: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone_number || !formData.role) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || "Failed to submit");
      }

      toast.success("Welcome to the future! Check your email for confirmation.");
      setFormData({ name: "", email: "", phone_number: "", role: "" });
    } catch (error: any) {
      console.error("Waitlist submission error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex items-center justify-center py-12 px-4 pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] animate-glow-pulse" />
        </div>

        <div className="container mx-auto max-w-2xl relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Limited Early Access</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-foreground">Join the </span>
              <span className="bg-gradient-primary bg-clip-text text-transparent">Waitlist</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Be among the first to experience Flux and transform Kenya's automotive market.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-10 bg-gradient-card rounded-3xl border border-border shadow-elevated">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/50 border-border focus:border-primary h-12"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background/50 border-border focus:border-primary h-12"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="bg-background/50 border-border focus:border-primary h-12"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  I am a... *
                </label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="bg-background/50 border-border focus:border-primary h-12">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="importer">Importer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 h-14 text-lg font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Join the Waitlist"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              By joining, you'll get exclusive early access and special launch offers.
            </p>
          </form>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
