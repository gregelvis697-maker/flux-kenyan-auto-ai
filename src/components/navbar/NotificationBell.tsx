import React, { useState } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const NotificationBell = () => {
  const [notifications] = useState([
    { id: 1, message: "Welcome to Flux!", time: "Just now", unread: true },
    { id: 2, message: "Your profile is ready", time: "5m ago", unread: true },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/50"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount}
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
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.unread
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.time}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notifications
              </p>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
