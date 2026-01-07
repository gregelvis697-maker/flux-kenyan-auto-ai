import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export const ProfileDropdown = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getRoleDashboard = () => {
    if (!userRole) return "/marketplace";
    if (userRole === 'admin') return "/admin/dashboard";
    if (userRole === 'buyer') return "/marketplace";
    return `/dashboard/${userRole}`;
  };

  const getRoleLabel = () => {
    if (!userRole) return "User";
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="focus:outline-none"
        >
          <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <AvatarImage src="" alt={user?.email} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-card/95 backdrop-blur-lg border-border/50 shadow-lg"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getRoleLabel()}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(getRoleDashboard())}
          className="cursor-pointer hover:bg-accent/50"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/settings")}
          className="cursor-pointer hover:bg-accent/50"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
