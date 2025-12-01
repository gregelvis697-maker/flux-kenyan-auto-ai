import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  Activity,
  Car,
  Truck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Mail,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const menuItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    section: 'main',
  },
  {
    id: 'pending-dealers',
    label: 'Pending Dealers',
    icon: Clock,
    section: 'verification',
  },
  {
    id: 'pending-importers',
    label: 'Pending Importers',
    icon: Clock,
    section: 'verification',
  },
  {
    id: 'verified',
    label: 'Verified Users',
    icon: UserCheck,
    section: 'verification',
  },
  {
    id: 'rejected',
    label: 'Rejected Users',
    icon: UserX,
    section: 'verification',
  },
  {
    id: 'insights',
    label: 'Analytics',
    icon: BarChart3,
    section: 'analytics',
  },
  {
    id: 'activity',
    label: 'Activity Log',
    icon: Activity,
    section: 'analytics',
  },
  {
    id: 'email-logs',
    label: 'Email Logs',
    icon: Mail,
    section: 'system',
  },
];

const sections = [
  { id: 'main', label: 'Dashboard' },
  { id: 'verification', label: 'Verification' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'system', label: 'System' },
];

export function AdminSidebar({ activeTab, onTabChange, collapsed, onCollapsedChange }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/50 bg-card/50 backdrop-blur-lg transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-end p-2 border-b border-border/30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6 px-2">
            {sections.map((section) => {
              const sectionItems = menuItems.filter((item) => item.section === section.id);
              if (sectionItems.length === 0) return null;

              return (
                <div key={section.id}>
                  {!collapsed && (
                    <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {sectionItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 transition-all',
                          collapsed ? 'px-3' : 'px-3',
                          activeTab === item.id && 'bg-primary/10 text-primary border border-primary/20'
                        )}
                        onClick={() => onTabChange(item.id)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}