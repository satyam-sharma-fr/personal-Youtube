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
import { Play, Menu, Settings, LogOut, User as UserIcon, CreditCard, PanelLeftClose, PanelLeft, Crown } from "lucide-react";
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
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white">
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
                  className="hidden md:flex text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  onClick={toggleSidebar}
                >
                  {isCollapsed ? (
                    <PanelLeft className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-zinc-900 text-white">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Logo */}
          <Link href={homeHref} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md shadow-red-500/20">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <span className="font-display font-semibold text-lg text-zinc-900 hidden sm:inline tracking-tight">
              FocusTube
            </span>
          </Link>
        </div>

        {/* Right: Watch Timer + User menu */}
        <div className="flex items-center gap-3">
          {/* Watch Time Timer */}
          <NavTimer />

          {profile?.subscription_tier === "free" && (
            <Link href="/dashboard/settings">
              <Button 
                size="sm" 
                className="hidden sm:flex bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md shadow-red-500/20"
              >
                <Crown className="w-4 h-4 mr-1.5" />
                Upgrade
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-zinc-100">
                <Avatar className="h-9 w-9 border-2 border-zinc-200">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-red-100 to-red-200 text-red-600 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-zinc-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-zinc-900">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-zinc-500">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200" />
              <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 cursor-pointer">
                <Link href="/dashboard/settings">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 cursor-pointer">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-zinc-700 hover:bg-zinc-50 focus:bg-zinc-50 cursor-pointer">
                <Link href="/dashboard/settings">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200" />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
              >
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
