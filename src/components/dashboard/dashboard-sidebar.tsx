"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Tv, Settings, Plus, RefreshCw } from "lucide-react";

const navItems = [
  {
    title: "Feed",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Channels",
    href: "/channels",
    icon: Tv,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <Link href="/channels">
          <Button className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </Button>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary"
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.title}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Feed
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border/50 bg-sidebar hidden md:block">
      <DashboardSidebarContent />
    </aside>
  );
}

