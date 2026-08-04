import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Phone, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
    <div className="min-h-screen bg-background/80">
      <Navigation />
      
      <div className="flex items-center justify-center py-8 sm:py-12 px-4 pt-20 sm:pt-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] bg-primary/20 rounded-full blur-[100px] sm:blur-[150px] animate-glow-pulse" />
        </div>

        <div className="container mx-auto max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8 sm:mb-12">

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
                <span className="text-foreground">Join the </span>
                <span className="bg-gradient-primary bg-clip-text text-transparent">Waitlist</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-4">
                Be among the first to experience Flux and transform Kenya's automotive market.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-8 md:p-10 bg-gradient-card rounded-2xl sm:rounded-3xl border border-border shadow-elevated">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50 border-border focus:border-primary h-11 sm:h-12 pl-10 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background/50 border-border focus:border-primary h-11 sm:h-12 pl-10 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="+254 712 345 678"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="bg-background/50 border-border focus:border-primary h-11 sm:h-12 pl-10 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-foreground">
                    I am a... *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="bg-background/50 border-border focus:border-primary h-11 sm:h-12 pl-10 text-base">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border z-50">
                        <SelectItem value="dealer" className="text-base py-2.5">Dealer</SelectItem>
                        <SelectItem value="buyer" className="text-base py-2.5">Buyer</SelectItem>
                        <SelectItem value="importer" className="text-base py-2.5">Importer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 h-12 sm:h-14 text-base sm:text-lg font-semibold mt-2"
                >
                  {isSubmitting ? "Submitting..." : "Join the Waitlist"}
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 sm:mt-6">
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