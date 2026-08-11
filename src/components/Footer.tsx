import { motion } from "framer-motion";
import { Twitter, Instagram, Facebook, MapPin, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const platformLinks = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "For Dealers", href: "/auth" },
  { label: "For Importers", href: "/auth" },
  { label: "For Buyers", href: "/auth" },
];


export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const LinkList = ({
    title,
    links,
  }: {
    title: string;
    links: { label: string; href: string }[];
  }) => (
    <div>
      <h4 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-foreground uppercase tracking-wider">
        {title}
      </h4>
      <ul className="space-y-1.5 sm:space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith("/") ? (
              <Link
                to={link.href}
                className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm inline-block py-1"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors text-xs sm:text-sm inline-block py-1"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative py-10 sm:py-12 lg:py-16 border-t border-border bg-card/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mb-8 sm:mb-10">
          {/* Brand + Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="col-span-1 sm:col-span-1"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Flux
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-xs mb-4">
              Kenya's first AI-powered automotive platform. Connecting verified
              dealers, importers, and buyers through trust and transparency.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                Nairobi, Kenya
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                hello@flux.co.ke
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                +254 700 000 000
              </li>
            </ul>
          </motion.div>

          {/* Link Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            viewport={{ once: true }}
          >
            <LinkList title="Platform" links={platformLinks} />
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
            <span>© {currentYear} FLUX Automotive. All rights reserved.</span>
          </div>


          {/* Social Icons */}
          <div className="flex gap-2 sm:gap-3">
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:shadow-glow-primary transition-all duration-300 active:scale-95"
              aria-label="TikTok"
            >
              <svg
                className="w-4 h-4 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:shadow-glow-primary transition-all duration-300 active:scale-95"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-primary" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:shadow-glow-primary transition-all duration-300 active:scale-95"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 text-primary" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:shadow-glow-primary transition-all duration-300 active:scale-95"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4 text-primary" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
