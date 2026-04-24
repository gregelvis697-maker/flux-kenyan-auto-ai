import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, LogIn, UserPlus, Car, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileDropdown } from "@/components/navbar/ProfileDropdown";
import { NotificationBell } from "@/components/navbar/NotificationBell";
import { productMenuItems } from "@/components/products/productData";

export const Navigation = ({ children }: { children?: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const productsRef = useRef<HTMLDivElement>(null);
  const productsTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProductsOpen(false);
    setMobileProductsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;
  const isProductsActive = location.pathname.startsWith("/products");

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Marketplace", path: "/marketplace", icon: Car },
  ];

  const handleProductsEnter = () => {
    clearTimeout(productsTimeout.current);
    setProductsOpen(true);
  };
  const handleProductsLeave = () => {
    productsTimeout.current = setTimeout(() => setProductsOpen(false), 150);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/80 backdrop-blur-xl shadow-lg border-b border-border/50"
          : "bg-card/40 backdrop-blur-md border-b border-border/30"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Flux
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 relative py-2 ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-gradient-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* Products Dropdown */}
            <div
              ref={productsRef}
              className="relative"
              onMouseEnter={handleProductsEnter}
              onMouseLeave={handleProductsLeave}
            >
              <button
                className={`text-sm font-medium transition-all duration-200 relative py-2 flex items-center gap-1 ${
                  isProductsActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Products
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`} />
                {isProductsActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-gradient-primary"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[380px] bg-popover/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="py-2">
                      {productMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-start gap-3 px-5 py-3.5 transition-all hover:bg-primary/5 hover:border-l-4 hover:border-l-primary hover:pl-4 ${
                              isActive(item.href) ? "bg-primary/10 border-l-4 border-l-primary pl-4" : "border-l-4 border-l-transparent"
                            }`}
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Icon className="w-4.5 h-4.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-foreground">{item.title}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Waitlist link */}
            <Link
              to="/waitlist"
              className={`text-sm font-medium transition-all duration-200 relative py-2 ${
                isActive("/waitlist")
                  ? "text-primary font-semibold"
                  : "text-primary hover:text-primary/80"
              }`}
            >
              Join Waitlist
              {isActive("/waitlist") && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-gradient-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {/* WhatsApp / Quick contact CTA — hidden on dashboard/auth routes */}
            {!location.pathname.startsWith("/dashboard") && !location.pathname.startsWith("/auth") && (
              <a
                href="https://wa.me/254700000000?text=Hi%20Flux%2C%20I%27m%20interested%20in%20a%20vehicle"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 transition-all"
                aria-label="Contact on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </a>
            )}
            {user ? (
              <>
                {children || <NotificationBell />}
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-foreground hover:text-primary hover:bg-accent/50 transition-all">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")} className="bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all">
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2.5 rounded-xl hover:bg-accent/50 transition-colors active:bg-accent/70"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-14 sm:top-16 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed top-14 sm:top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl z-50 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-2">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all active:scale-[0.98] ${
                        isActive(link.path)
                          ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                          : "text-foreground hover:bg-accent/50 active:bg-accent/70"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      {link.name}
                    </Link>
                  );
                })}

                {/* Mobile Products Accordion */}
                <div>
                  <button
                    onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      isProductsActive
                        ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                        : "text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`} />
                      Products
                    </span>
                  </button>
                  <AnimatePresence>
                    {mobileProductsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-6 pr-2 py-2 space-y-1">
                          {productMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${
                                  isActive(item.href)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                                }`}
                              >
                                <Icon className="h-4 w-4 text-primary" />
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Waitlist */}
                <Link
                  to="/waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all active:scale-[0.98] ${
                    isActive("/waitlist")
                      ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                      : "text-primary hover:bg-accent/50 active:bg-accent/70"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  Join Waitlist
                </Link>

                <div className="h-px bg-border my-3" />

                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-3 rounded-xl bg-accent/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-0.5">Signed in as</p>
                      <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      {children || <NotificationBell />}
                      <div className="flex-1"><ProfileDropdown /></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Button variant="outline" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="w-full h-12 text-base justify-start gap-3 px-4">
                      <LogIn className="h-5 w-5" /> Sign In
                    </Button>
                    <Button onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="w-full h-12 text-base justify-start gap-3 px-4 bg-gradient-primary text-primary-foreground hover:shadow-glow-primary">
                      <UserPlus className="h-5 w-5" /> Create Account
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
