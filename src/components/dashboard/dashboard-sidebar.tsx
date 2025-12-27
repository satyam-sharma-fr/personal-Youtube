"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSettingsStore, type Tier } from "@/stores/settingsStore";
import {
  Home,
  Play,
  Tv,
  History,
  Clock,
  Settings,
  LogOut,
  Crown,
  CreditCard,
  ChevronUp,
  Sparkles,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Plus,
  LayoutGrid,
  Inbox,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./dashboard-shell";
import type { SubscribedChannel, SidebarCategory } from "./dashboard-shell";
import { AddChannelDialog } from "@/components/channels/add-channel-dialog";

const navigation = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Feed", href: "/dashboard", icon: LayoutGrid },
  { name: "Channels", href: "/channels", icon: Tv },
  { name: "Watch Later", href: "/watch-later", icon: Clock },
  { name: "History", href: "/history", icon: History },
];

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

const tierInfo: Record<Tier, { label: string; color: string; bg: string }> = {
  free: { label: "Free", color: "text-zinc-500", bg: "bg-zinc-100" },
  pro: { label: "Pro", color: "text-red-600", bg: "bg-red-50" },
  unlimited: { label: "Unlimited", color: "text-teal-600", bg: "bg-teal-50" },
};

interface DashboardSidebarProps {
  channels?: SubscribedChannel[];
  categories?: SidebarCategory[];
}

export function DashboardSidebarContent({ channels = [], categories = [] }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tier = useSettingsStore((s) => s.tier);
  const tierData = tierInfo[tier];
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, [supabase.auth]);

  // Auto-expand category if it's active in the URL
  useEffect(() => {
    const match = pathname.match(/category=([^&]+)/);
    if (match && match[1] && match[1] !== "uncategorized") {
      setExpandedCategories((prev) => new Set([...prev, match[1]]));
    }
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleCategoryClick = (categoryId: string) => {
    // Toggle the dropdown
    toggleCategory(categoryId);
    // Navigate to the category feed
    router.push(`/dashboard?category=${categoryId}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/30 transition-shadow">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-semibold text-zinc-900 tracking-tight">
              FocusTube
            </span>
            <span className={cn("text-xs font-medium", tierData.color)}>
              {tierData.label} Plan
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-1">
          <p className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Main
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-red-50 text-red-600 shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "text-red-600")} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}

          {/* Add Channel Button */}
          <AddChannelDialog>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 mt-2 border border-dashed border-zinc-300 hover:border-zinc-400"
            >
              <Plus className="w-5 h-5" />
              <span>Add Channel</span>
            </button>
          </AddChannelDialog>
        </nav>

        {/* Categories */}
        <nav className="mt-6 space-y-1">
          <p className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Categories
          </p>
          {categories.slice(0, 8).map((category) => {
            const isActive = pathname.includes(`category=${category.id}`);
            const isExpanded = expandedCategories.has(category.id);
            const categoryChannels = category.channels || [];
            const hasChannels = categoryChannels.length > 0;

            return (
              <div key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-teal-50 text-teal-600 shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                >
                  <FolderOpen className={cn("w-5 h-5 flex-shrink-0", isActive && "text-teal-600")} />
                  <span className="truncate flex-1 text-left">{category.name}</span>
                  {hasChannels && (
                    <span className="text-xs text-zinc-400 mr-1">{categoryChannels.length}</span>
                  )}
                  {hasChannels && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                    )
                  )}
                </button>
                
                {/* Channel dropdown */}
                {isExpanded && hasChannels && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-zinc-200 pl-2">
                    {categoryChannels.map((channel) => {
                      const isChannelActive = pathname.includes(`channel=${channel.channel_id}`);
                      return (
                        <Link
                          key={channel.channel_id}
                          href={`/dashboard?channel=${channel.channel_id}`}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                            isChannelActive
                              ? "bg-zinc-100 text-zinc-900"
                              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                          )}
                        >
                          {channel.thumbnail_url ? (
                            <Image
                              src={channel.thumbnail_url}
                              alt={channel.title}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[8px] font-bold text-zinc-500">
                                {channel.title[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="truncate">{channel.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {/* Uncategorized */}
          {(() => {
            const isActive = pathname.includes("category=uncategorized");
            // Get uncategorized channels (channels not in any category)
            const categorizedChannelIds = new Set(
              categories.flatMap((cat) => (cat.channels || []).map((ch) => ch.channel_id))
            );
            const uncategorizedChannels = channels.filter(
              (ch) => !categorizedChannelIds.has(ch.channel_id)
            );
            const isExpanded = expandedCategories.has("uncategorized");
            const hasChannels = uncategorizedChannels.length > 0;

            return (
              <div>
                <button
                  onClick={() => {
                    toggleCategory("uncategorized");
                    router.push("/dashboard?category=uncategorized");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-zinc-200 text-zinc-800 shadow-sm"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                  )}
                >
                  <Inbox className={cn("w-5 h-5 flex-shrink-0", isActive && "text-zinc-600")} />
                  <span className="truncate flex-1 text-left">Uncategorized</span>
                  {hasChannels && (
                    <span className="text-xs text-zinc-400 mr-1">{uncategorizedChannels.length}</span>
                  )}
                  {hasChannels && (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                    )
                  )}
                </button>

                {/* Uncategorized channel dropdown */}
                {isExpanded && hasChannels && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-zinc-200 pl-2">
                    {uncategorizedChannels.map((channel) => {
                      const isChannelActive = pathname.includes(`channel=${channel.channel_id}`);
                      return (
                        <Link
                          key={channel.channel_id}
                          href={`/dashboard?channel=${channel.channel_id}`}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                            isChannelActive
                              ? "bg-zinc-100 text-zinc-900"
                              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                          )}
                        >
                          {channel.thumbnail_url ? (
                            <Image
                              src={channel.thumbnail_url}
                              alt={channel.title}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-[8px] font-bold text-zinc-500">
                                {channel.title[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="truncate">{channel.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </nav>

        {/* Upgrade Card */}
        {tier === "free" && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-zinc-900">
                Upgrade to Pro
              </span>
            </div>
            <p className="text-xs text-zinc-600 mb-3">
              Unlock unlimited channels, watch limits & more.
            </p>
            <Link href="/settings#billing">
              <Button
                size="sm"
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs h-8 shadow-lg shadow-red-500/20"
              >
                <Crown className="w-3 h-3 mr-1.5" />
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}

        {/* Settings */}
        <nav className="mt-6 space-y-1">
          <p className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Settings
          </p>
          {bottomNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer - User Menu */}
      <div className="p-3 border-t border-zinc-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <span className="text-sm font-semibold text-red-600">
                  {userEmail?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className="text-sm font-medium text-zinc-900 block truncate">
                  {userEmail ?? "Loading..."}
                </span>
                <span className={cn("text-xs", tierData.color)}>
                  {tierData.label} plan
                </span>
              </div>
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56 bg-white border-zinc-200"
          >
            <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50">
              <Link href="/settings#billing">
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-200" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 hover:bg-red-50 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function DashboardSidebar({ channels = [], categories = [] }: DashboardSidebarProps) {
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-zinc-200 transition-all duration-200 hidden md:block",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {isCollapsed ? (
        <CollapsedSidebar categories={categories} channels={channels} />
      ) : (
        <DashboardSidebarContent channels={channels} categories={categories} />
      )}
    </aside>
  );
}

// Collapsed sidebar with just icons
function CollapsedSidebar({ categories = [], channels = [] }: { categories?: SidebarCategory[]; channels?: SubscribedChannel[] }) {
  const pathname = usePathname();
  const tier = useSettingsStore((s) => s.tier);
  const tierData = tierInfo[tier];

  // Get uncategorized channels
  const categorizedChannelIds = new Set(
    categories.flatMap((cat) => (cat.channels || []).map((ch) => ch.channel_id))
  );
  const uncategorizedChannels = channels.filter(
    (ch) => !categorizedChannelIds.has(ch.channel_id)
  );

  return (
    <div className="flex flex-col h-full items-center py-4">
      {/* Logo */}
      <Link href="/dashboard" className="mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isActive
                  ? "bg-red-50 text-red-600"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}

        {/* Add Channel Button */}
        <AddChannelDialog>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border border-dashed border-zinc-300 hover:border-zinc-400"
            title="Add Channel"
          >
            <Plus className="w-5 h-5" />
          </button>
        </AddChannelDialog>

        {/* Categories divider */}
        <div className="w-6 h-px bg-zinc-200 my-2" />

        {/* Categories with dropdowns */}
        {categories.slice(0, 5).map((category) => {
          const isActive = pathname.includes(`category=${category.id}`);
          const categoryChannels = category.channels || [];
          const hasChannels = categoryChannels.length > 0;

          if (!hasChannels) {
            return (
              <Link
                key={category.id}
                href={`/dashboard?category=${category.id}`}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-teal-50 text-teal-600"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
                title={category.name}
              >
                <FolderOpen className="w-5 h-5" />
              </Link>
            );
          }

          return (
            <DropdownMenu key={category.id}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    isActive
                      ? "bg-teal-50 text-teal-600"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                  title={category.name}
                >
                  <FolderOpen className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56 bg-white border-zinc-200">
                <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 font-medium">
                  <Link href={`/dashboard?category=${category.id}`}>
                    <FolderOpen className="mr-2 h-4 w-4 text-teal-600" />
                    All in {category.name}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200" />
                {categoryChannels.slice(0, 8).map((channel) => (
                  <DropdownMenuItem key={channel.channel_id} asChild className="text-zinc-600 hover:bg-zinc-50 focus:bg-zinc-50">
                    <Link href={`/dashboard?channel=${channel.channel_id}`} className="flex items-center">
                      {channel.thumbnail_url ? (
                        <Image
                          src={channel.thumbnail_url}
                          alt={channel.title}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center mr-2">
                          <span className="text-[8px] font-bold text-zinc-500">
                            {channel.title[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="truncate">{channel.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}

        {/* Uncategorized with dropdown */}
        {(() => {
          const isActive = pathname.includes("category=uncategorized");
          const hasChannels = uncategorizedChannels.length > 0;

          if (!hasChannels) {
            return (
              <Link
                href="/dashboard?category=uncategorized"
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive
                    ? "bg-zinc-200 text-zinc-700"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
                title="Uncategorized"
              >
                <Inbox className="w-5 h-5" />
              </Link>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    isActive
                      ? "bg-zinc-200 text-zinc-700"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  )}
                  title="Uncategorized"
                >
                  <Inbox className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-56 bg-white border-zinc-200">
                <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 font-medium">
                  <Link href="/dashboard?category=uncategorized">
                    <Inbox className="mr-2 h-4 w-4 text-zinc-600" />
                    All Uncategorized
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-200" />
                {uncategorizedChannels.slice(0, 8).map((channel) => (
                  <DropdownMenuItem key={channel.channel_id} asChild className="text-zinc-600 hover:bg-zinc-50 focus:bg-zinc-50">
                    <Link href={`/dashboard?channel=${channel.channel_id}`} className="flex items-center">
                      {channel.thumbnail_url ? (
                        <Image
                          src={channel.thumbnail_url}
                          alt={channel.title}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center mr-2">
                          <span className="text-[8px] font-bold text-zinc-500">
                            {channel.title[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="truncate">{channel.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })()}

        <div className="w-6 h-px bg-zinc-200 my-2" />

        {bottomNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}
              title={item.name}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", tierData.bg)}>
        <span className={cn("text-sm font-semibold", tierData.color)}>?</span>
      </div>
    </div>
  );
}
