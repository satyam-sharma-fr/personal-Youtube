"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Tv, Settings, Tag, ListVideo, Eye } from "lucide-react";
import type { SubscribedChannel, SidebarCategory } from "@/components/dashboard/dashboard-shell";

interface DemoSidebarProps {
  channels: SubscribedChannel[];
  categories?: SidebarCategory[];
}

export function DemoSidebar({ channels, categories = [] }: DemoSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedChannelId = searchParams.get("channel");
  const selectedCategoryId = searchParams.get("category");

  const navItems = [
    { title: "Feed", href: "/demo", icon: ListVideo },
    { title: "Channels", href: "/demo/channels", icon: Tv },
    { title: "Settings", href: "/demo/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-24 bottom-0 w-64 border-r border-border/50 bg-sidebar hidden md:block">
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-col h-full">
          {/* Demo indicator */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 text-accent text-sm">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Demo Mode</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = 
                    item.href === "/demo" 
                      ? pathname === "/demo" && !selectedChannelId && !selectedCategoryId
                      : pathname === item.href;

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

              {/* Categories Section */}
              {categories.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-2 px-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Categories
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {categories.map((category) => {
                      const isActive = selectedCategoryId === category.id;
                      const categoryUrl = `/demo?category=${category.id}`;

                      return (
                        <Link key={category.id} href={categoryUrl}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-auto py-2",
                              isActive && "bg-secondary"
                            )}
                          >
                            <Tag className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate text-sm">{category.name}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </>
              )}

              {/* Channels Section */}
              {channels.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="mb-2 px-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Demo Channels
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {channels.map((channel) => {
                      const isActive = selectedChannelId === channel.channel_id;
                      const channelUrl = `/demo?channel=${channel.channel_id}`;

                      return (
                        <Link key={channel.channel_id} href={channelUrl}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-auto py-2",
                              isActive && "bg-secondary"
                            )}
                          >
                            <Avatar className="h-7 w-7 flex-shrink-0">
                              <AvatarImage src={channel.thumbnail_url || undefined} alt={channel.title} />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {channel.title[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">{channel.title}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </nav>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border/50">
            <Link href="/signup">
              <Button className="w-full" variant="outline" size="sm">
                Create Your Account
              </Button>
            </Link>
          </div>
        </div>
      </TooltipProvider>
    </aside>
  );
}

