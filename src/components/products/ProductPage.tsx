import React from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import ProductFAQ from "./ProductFAQ";
import type { ProductData } from "./productData";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Section: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = "", id }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeUp}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

interface ProductPageProps {
  data: ProductData;
}

const ProductPage: React.FC<ProductPageProps> = ({ data }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              {data.hero.title}{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">{data.hero.titleAccent}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              {data.hero.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:shadow-glow-primary text-base px-8">
                <Link to={data.hero.ctaPrimary.href}>{data.hero.ctaPrimary.label}</Link>
              </Button>
              {data.hero.ctaSecondary && (
                <Button asChild variant="outline" size="lg" className="border-primary/50 text-foreground hover:bg-primary/10 text-base px-8">
                  <Link to={data.hero.ctaSecondary.href}>{data.hero.ctaSecondary.label}</Link>
                </Button>
              )}
            </motion.div>
          </div>
        </section>

        {/* Overview */}
        <Section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              {data.overview.heading}
            </h2>
            <p className="text-muted-foreground text-center text-lg max-w-3xl mx-auto mb-12 leading-relaxed">
              {data.overview.content}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {data.overview.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-xl bg-card/60 border border-border/50"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Features */}
        <Section className="py-16 md:py-24 px-4 bg-card/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Key <span className="text-primary">Features</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Everything you need, built into one powerful platform.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    transition={{ delay: i * 0.08 }}
                    className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* How It Works */}
        <Section id="how-it-works" className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12">Simple steps to get started.</p>
            <div className="space-y-6">
              {data.howItWorks.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 items-start p-6 rounded-xl bg-card/60 border border-border/50"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* Pricing */}
        {data.pricing && (
          <Section className="py-16 md:py-24 px-4">
            <div className="container mx-auto max-w-5xl">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                {data.pricing.heading.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-primary">{data.pricing.heading.split(" ").slice(-1)}</span>
              </h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                {data.pricing.subtitle}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.pricing.plans.map((plan, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-xl bg-card border border-border/50 hover:border-primary/40 hover:scale-[1.02] transition-all duration-300 flex flex-col"
                  >
                    <h3 className="text-2xl font-bold text-foreground mb-4">{plan.name}</h3>
                    <div className="mb-3">
                      <span className="text-4xl md:text-5xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground text-lg ml-1">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mb-8">{plan.subtitle}</p>
                    <ul className="space-y-3 flex-1 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j}>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-foreground text-sm">{feature.text}</span>
                          </div>
                          {feature.subItems && (
                            <ul className="ml-8 mt-1.5 space-y-1">
                              {feature.subItems.map((sub, k) => (
                                <li key={k} className="text-muted-foreground text-xs leading-relaxed">• {sub}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      size="lg"
                      className={
                        plan.highlighted
                          ? "w-full bg-gradient-primary text-primary-foreground hover:shadow-glow-primary text-base"
                          : "w-full border-primary/50 text-primary hover:bg-primary/10 text-base"
                      }
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      <Link to={plan.ctaHref}>{plan.ctaLabel}</Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Benefits */}
        <Section className="py-16 md:py-24 px-4 bg-card/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose <span className="text-primary">Flux</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-xl bg-card border border-border/50 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <ProductFAQ items={data.faq} />

        {/* Final CTA */}
        <Section className="py-16 md:py-24 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{data.finalCta.heading}</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:shadow-glow-primary text-base px-8">
                <Link to={data.finalCta.ctaPrimary.href}>{data.finalCta.ctaPrimary.label}</Link>
              </Button>
              {data.finalCta.ctaSecondary && (
                <Button asChild variant="outline" size="lg" className="border-primary/50 text-foreground hover:bg-primary/10 text-base px-8">
                  <Link to={data.finalCta.ctaSecondary.href}>{data.finalCta.ctaSecondary.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </Section>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;
