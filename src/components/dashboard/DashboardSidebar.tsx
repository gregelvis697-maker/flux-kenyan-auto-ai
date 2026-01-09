import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  section?: string;
}

export interface MenuSection {
  id: string;
  label: string;
}

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  menuItems: MenuItem[];
  sections?: MenuSection[];
  title: string;
  subtitle?: string;
}

function SidebarContent({ 
  activeTab, 
  onTabChange, 
  collapsed,
  menuItems,
  sections,
  onItemClick 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void; 
  collapsed: boolean;
  menuItems: MenuItem[];
  sections?: MenuSection[];
  onItemClick?: () => void;
}) {
  // Group items by section if sections are provided
  const renderItems = () => {
    if (sections && sections.length > 0) {
      return sections.map((section) => {
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
                    'w-full justify-start gap-3 transition-all h-11',
                    collapsed ? 'px-3' : 'px-3',
                    activeTab === item.id && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                  onClick={() => {
                    onTabChange(item.id);
                    onItemClick?.();
                  }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Button>
              ))}
            </div>
          </div>
        );
      });
    }

    // No sections - render flat list
    return (
      <div className="space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 transition-all h-11',
              collapsed ? 'px-3' : 'px-3',
              activeTab === item.id && 'bg-primary/10 text-primary border border-primary/20'
            )}
            onClick={() => {
              onTabChange(item.id);
              onItemClick?.();
            }}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 py-4">
      <div className="space-y-6 px-2">
        {renderItems()}
      </div>
    </ScrollArea>
  );
}

export function DashboardSidebar({ 
  activeTab, 
  onTabChange, 
  collapsed, 
  onCollapsedChange,
  menuItems,
  sections,
  title,
  subtitle
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Sidebar - Sheet */}
      <div className="lg:hidden fixed top-16 left-0 z-40 p-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10 bg-background/80 backdrop-blur-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 pt-4">
            <div className="px-4 pb-4 border-b border-border/50">
              <h2 className="font-semibold text-lg">{title}</h2>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <SidebarContent 
              activeTab={activeTab} 
              onTabChange={onTabChange} 
              collapsed={false}
              menuItems={menuItems}
              sections={sections}
              onItemClick={() => {
                const closeButton = document.querySelector('[data-radix-collection-item]');
                if (closeButton instanceof HTMLElement) {
                  closeButton.click();
                }
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          'hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/50 bg-card/50 backdrop-blur-lg transition-all duration-300 z-40',
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

          <SidebarContent 
            activeTab={activeTab} 
            onTabChange={onTabChange} 
            collapsed={collapsed}
            menuItems={menuItems}
            sections={sections}
          />
        </div>
      </aside>
    </>
  );
}
