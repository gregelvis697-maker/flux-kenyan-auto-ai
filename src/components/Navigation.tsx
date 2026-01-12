import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, LogIn, UserPlus, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileDropdown } from "@/components/navbar/ProfileDropdown";
import { NotificationBell } from "@/components/navbar/NotificationBell";

export const Navigation = ({ children }: { children?: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Marketplace", path: "/marketplace", icon: Car },
    { name: "Waitlist", path: "/waitlist", icon: Users },
  ];

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
          <Link
            to="/"
            className="flex items-center space-x-2 group"
            onClick={() => setMobileMenuOpen(false)}
          >
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
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
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
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            {user ? (
              <>
                {children || <NotificationBell />}
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="text-foreground hover:text-primary hover:bg-accent/50 transition-all"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all"
                >
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
            {mobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 top-14 sm:top-16 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed top-14 sm:top-16 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border shadow-2xl z-50 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Navigation Links */}
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

                {/* Divider */}
                <div className="h-px bg-border my-3" />

                {/* Auth Section */}
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-3 rounded-xl bg-accent/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-0.5">Signed in as</p>
                      <p className="text-sm font-medium truncate text-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      {children || <NotificationBell />}
                      <div className="flex-1">
                        <ProfileDropdown />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-12 text-base justify-start gap-3 px-4"
                    >
                      <LogIn className="h-5 w-5" />
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-12 text-base justify-start gap-3 px-4 bg-gradient-primary text-primary-foreground hover:shadow-glow-primary"
                    >
                      <UserPlus className="h-5 w-5" />
                      Create Account
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