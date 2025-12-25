"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const SIDEBAR_COLLAPSED_KEY = "dashboard-sidebar-collapsed";
const EXPANDED_WIDTH = "16rem"; // w-64
const COLLAPSED_WIDTH = "5rem"; // w-20

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a DashboardShell");
  }
  return context;
}

export interface SubscribedChannel {
  channel_id: string;
  title: string;
  thumbnail_url: string | null;
}

export interface SidebarCategory {
  id: string;
  name: string;
  image_url?: string | null;
}

interface DashboardShellProps {
  children: React.ReactNode;
  channels: SubscribedChannel[];
  categories?: SidebarCategory[];
}

export function DashboardShell({ children, channels, categories = [] }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read initial state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    }
    setMounted(true);
  }, []);

  // Update CSS variable when collapsed state changes
  useEffect(() => {
    if (mounted) {
      const width = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
      document.documentElement.style.setProperty("--sidebar-width", width);
    }
  }, [isCollapsed, mounted]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, []);

  // Set initial CSS variable (expanded by default before hydration)
  useEffect(() => {
    if (!mounted) {
      document.documentElement.style.setProperty("--sidebar-width", EXPANDED_WIDTH);
    }
  }, [mounted]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      <div 
        className="dashboard-shell"
        data-channels={JSON.stringify(channels)}
        data-categories={JSON.stringify(categories)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// Export channels context for sidebar to consume
const ChannelsContext = createContext<SubscribedChannel[]>([]);

export function useChannels() {
  return useContext(ChannelsContext);
}

export function ChannelsProvider({ 
  children, 
  channels 
}: { 
  children: React.ReactNode; 
  channels: SubscribedChannel[];
}) {
  return (
    <ChannelsContext.Provider value={channels}>
      {children}
    </ChannelsContext.Provider>
  );
}

// Export categories context for sidebar to consume
const CategoriesContext = createContext<SidebarCategory[]>([]);

export function useCategories() {
  return useContext(CategoriesContext);
}

export function CategoriesProvider({ 
  children, 
  categories 
}: { 
  children: React.ReactNode; 
  categories: SidebarCategory[];
}) {
  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  );
}

