import React, { useState } from "react";
import { Bell, Car, TrendingDown, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";

const timeAgo = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const iconFor = (type: string) => {
  if (type === "price_drop") return TrendingDown;
  if (type === "tracked_update") return Truck;
  return Car;
};

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markClicked } = useNotifications();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unreadCount > 0) {
      // give the user a moment to see what is new
      setTimeout(() => markAllRead(), 1500);
    }
  };

  const handleClick = (n: AppNotification) => {
    markClicked(n.id);
    setOpen(false);
    if (n.action_url) navigate(n.action_url);
    else if (n.vehicle_id) navigate(`/vehicles/${n.vehicle_id}`);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative hover:bg-accent/50"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 bg-card/95 backdrop-blur-lg border-border/50 shadow-lg"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const Icon = iconFor(n.notification_type);
                return (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => handleClick(n)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full text-left p-3 rounded-lg flex gap-3 transition-colors ${
                      !n.read_at
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{n.title}</span>
                      <span className="block text-xs text-muted-foreground">{n.body}</span>
                      <span className="block text-[11px] text-muted-foreground/70 mt-1">
                        {timeAgo(n.created_at)}
                      </span>
                    </span>
                  </motion.button>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                {user
                  ? "No alerts yet. Save a vehicle profile to start getting matches."
                  : "Sign in to see your alerts"}
              </p>
            )}
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/buyer");
              }}
            >
              Notification settings
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
