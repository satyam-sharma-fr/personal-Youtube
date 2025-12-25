"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, Menu, Settings, LogOut, User as UserIcon, CreditCard, PanelLeftClose, PanelLeft } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { DashboardSidebarContent } from "./dashboard-sidebar";
import { useSidebar, useChannels, useCategories } from "./dashboard-shell";
import { NavTimer } from "@/components/watch-timer";
import { useHomeDestination } from "@/hooks/useHomeDestination";

interface DashboardNavProps {
  user: User;
  profile: Profile | null;
}

export function DashboardNav({ user, profile }: DashboardNavProps) {
  const router = useRouter();
  const supabase = createClient();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const channels = useChannels();
  const categories = useCategories();
  const { homeHref } = useHomeDestination();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Error signing out");
    }
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <DashboardSidebarContent channels={channels} categories={categories} />
            </SheetContent>
          </Sheet>

          {/* Desktop sidebar toggle */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  onClick={toggleSidebar}
                >
                  {isCollapsed ? (
                    <PanelLeft className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Play className="w-4 h-4 text-primary fill-primary" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">FocusTube</span>
          </Link>
        </div>

        {/* Right: Watch Timer + User menu */}
        <div className="flex items-center gap-3">
          {/* Watch Time Timer */}
          <NavTimer />

          {profile?.subscription_tier === "free" && (
            <Link href="/settings">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <CreditCard className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
