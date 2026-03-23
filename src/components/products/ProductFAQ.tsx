import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductFAQItem } from "./productData";

interface ProductFAQProps {
  items: ProductFAQItem[];
}

const ProductFAQ: React.FC<ProductFAQProps> = ({ items }) => {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Frequently Asked <span className="text-primary">Questions</span>
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border border-border/50 rounded-xl bg-card/60 backdrop-blur-sm px-1 overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-5 text-left text-base font-semibold text-foreground hover:text-primary hover:no-underline transition-colors">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default ProductFAQ;
