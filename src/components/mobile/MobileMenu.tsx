import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Home, Car, Users, LayoutDashboard, Package, Truck, Shield, LogOut, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const roleBadgeStyles: Record<string, string> = {
  buyer: "bg-green-500/20 text-green-400 border-green-500/30",
  dealer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  importer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
};

const roleDashboardPaths: Record<string, string> = {
  buyer: "/buyer/dashboard",
  dealer: "/dealer/dashboard",
  importer: "/importer/dashboard",
  admin: "/admin/dashboard",
};

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, currentPath, onNavigate }) => {
  const { user, userRole, signOut } = useAuth();

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const isActive = (path: string) => currentPath === path;

  const handleLinkClick = (path: string) => {
    onClose();
    onNavigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
    onNavigate("/");
  };

  const baseLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Marketplace", path: "/marketplace", icon: Car },
    { name: "Waitlist", path: "/waitlist", icon: Users },
  ];

  const roleLinks: { name: string; path: string; icon: React.ElementType }[] = [];
  if (user && userRole) {
    roleLinks.push({ name: "Dashboard", path: roleDashboardPaths[userRole] || "/dashboard", icon: LayoutDashboard });
    if (userRole === "dealer") roleLinks.push({ name: "My Inventory", path: "/dealer/dashboard", icon: Package });
    if (userRole === "importer") roleLinks.push({ name: "My Shipments", path: "/importer/dashboard", icon: Truck });
    if (userRole === "admin") roleLinks.push({ name: "Admin Panel", path: "/admin/dashboard", icon: Shield });
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="md:hidden fixed inset-0 top-14 sm:top-16 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden fixed top-14 sm:top-16 right-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border shadow-2xl z-50 flex flex-col"
      >
        {/* Header with logo & close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Flux</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-accent/50 transition-colors"
          >
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-5 py-4 border-b border-border/50">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            {userRole && (
              <Badge className={`mt-1.5 capitalize ${roleBadgeStyles[userRole] || ""}`}>
                {userRole}
              </Badge>
            )}
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          {baseLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`w-full flex items-center gap-3 px-4 min-h-12 rounded-xl text-base font-medium transition-all active:scale-[0.98] ${
                  isActive(link.path)
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.name}
              </button>
            );
          })}

          {roleLinks.length > 0 && (
            <>
              <div className="h-px bg-border my-3" />
              {roleLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.path + link.name}
                    onClick={() => handleLinkClick(link.path)}
                    className={`w-full flex items-center gap-3 px-4 min-h-12 rounded-xl text-base font-medium transition-all active:scale-[0.98] ${
                      isActive(link.path)
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {link.name}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom auth section */}
        <div className="px-4 py-4 border-t border-border/50 space-y-2">
          {user ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full h-12 text-base justify-start gap-3 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => handleLinkClick("/auth")}
                className="w-full h-12 text-base justify-start gap-3 px-4"
              >
                <LogIn className="h-5 w-5" />
                Login
              </Button>
              <Button
                onClick={() => handleLinkClick("/auth")}
                className="w-full h-12 text-base justify-start gap-3 px-4 bg-gradient-primary text-primary-foreground hover:shadow-glow-primary"
              >
                <UserPlus className="h-5 w-5" />
                Create Account
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};
