"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Home, Tv, Settings, Plus, RefreshCw, ChevronLeft, ChevronRight, Tag, ChevronDown, Check, ListVideo, Sparkles, History, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useSidebar, type SubscribedChannel, type SidebarCategory } from "./dashboard-shell";
import { useHomeDestination } from "@/hooks/useHomeDestination";

// Separate component for categories section to handle collapsed dropdown
function CategoriesSection({ 
  categories, 
  selectedCategoryId, 
  isCollapsed 
}: { 
  categories: SidebarCategory[]; 
  selectedCategoryId: string | null;
  isCollapsed: boolean;
}) {
  const router = useRouter();
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  if (isCollapsed) {
    // Collapsed view: Single dropdown button
    return (
      <>
        <Separator className="my-4" />
        <div className="px-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full",
                  selectedCategoryId && "bg-secondary ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
              >
                <div className="flex items-center gap-0.5">
                  <Tag className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-48">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => router.push(`/dashboard?category=${category.id}`)}
                  className="cursor-pointer"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  <span className="flex-1">{category.name}</span>
                  {selectedCategoryId === category.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              {selectedCategoryId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="cursor-pointer text-muted-foreground"
                  >
                    Clear filter
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }

  // Expanded view: Full list
  return (
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
          const categoryUrl = `/dashboard?category=${category.id}`;

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
  );
}

interface DashboardSidebarContentProps {
  channels: SubscribedChannel[];
  categories?: SidebarCategory[];
  isCollapsed?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
}

export function DashboardSidebarContent({ 
  channels, 
  categories = [],
  isCollapsed = false, 
  onToggle,
  showToggle = false,
}: DashboardSidebarContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedChannelId = searchParams.get("channel");
  const selectedCategoryId = searchParams.get("category");
  const { homeHref, destination } = useHomeDestination();

  // Build nav items dynamically based on home destination setting
  const navItems = [
    {
      title: "Home",
      href: homeHref,
      icon: destination === "dashboard" ? Sparkles : Home,
    },
    {
      title: "Feed",
      href: "/dashboard",
      icon: ListVideo,
    },
    {
      title: "History",
      href: "/history",
      icon: History,
    },
    {
      title: "Channels",
      href: "/channels",
      icon: Tv,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full">
        {/* Add Channel Button */}
        <div className={cn("p-4 border-b border-border/50", isCollapsed && "px-2")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/channels">
                  <Button className="w-full" size="icon" variant="default">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Add Channel</TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/channels">
              <Button className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Channel
              </Button>
            </Link>
          )}
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className={cn("p-2", isCollapsed && "px-2")}>
            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                // Determine if this item is active
                let isActive = false;
                if (item.title === "Home") {
                  // Home is active when on /home or when homeHref matches current path
                  isActive = pathname === "/home";
                } else if (item.title === "Feed") {
                  // Feed is active when on /dashboard without filters
                  isActive = pathname === "/dashboard" && !selectedChannelId && !selectedCategoryId;
                } else {
                  isActive = pathname === item.href;
                }

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                              "w-full",
                              isActive && "bg-secondary"
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  );
                }

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
              <CategoriesSection 
                categories={categories} 
                selectedCategoryId={selectedCategoryId}
                isCollapsed={isCollapsed}
              />
            )}

            {/* Channels Section */}
            {channels.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className={cn("mb-2", !isCollapsed && "px-2")}>
                  {!isCollapsed && (
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Subscriptions
                    </span>
                  )}
                </div>
                <nav className="space-y-1">
                  {channels.map((channel) => {
                    const isActive = selectedChannelId === channel.channel_id;
                    const channelUrl = `/dashboard?channel=${channel.channel_id}`;

                    if (isCollapsed) {
                      return (
                        <Tooltip key={channel.channel_id}>
                          <TooltipTrigger asChild>
                            <Link href={channelUrl}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "w-full relative",
                                  isActive && "bg-secondary ring-2 ring-primary ring-offset-2 ring-offset-background"
                                )}
                              >
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={channel.thumbnail_url || undefined} alt={channel.title} />
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {channel.title[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{channel.title}</TooltipContent>
                        </Tooltip>
                      );
                    }

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

        {/* Footer with Refresh & Toggle */}
        <div className={cn("p-4 border-t border-border/50 space-y-2", isCollapsed && "px-2")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full text-muted-foreground">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Refresh Feed</TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          )}

          {/* Desktop collapse toggle */}
          {showToggle && onToggle && (
            isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-full text-muted-foreground"
                    onClick={onToggle}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground" 
                size="sm"
                onClick={onToggle}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Collapse
              </Button>
            )
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface DashboardSidebarProps {
  channels: SubscribedChannel[];
  categories?: SidebarCategory[];
}

export function DashboardSidebar({ channels, categories = [] }: DashboardSidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 bottom-0 border-r border-border/50 bg-sidebar hidden md:block transition-[width] duration-200",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <DashboardSidebarContent 
        channels={channels} 
        categories={categories}
        isCollapsed={isCollapsed}
        onToggle={toggleSidebar}
        showToggle={true}
      />
    </aside>
  );
}
