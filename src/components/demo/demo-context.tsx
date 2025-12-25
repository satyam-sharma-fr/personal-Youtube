"use client";

import { createContext, useContext, ReactNode } from "react";

interface DemoContextValue {
  /** Whether we're in demo mode */
  isDemo: true;
  /** Demo user ID */
  demoUserId: string;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function useDemoContext() {
  return useContext(DemoContext);
}

/**
 * Hook to check if we're in demo mode.
 * Returns true if in demo mode, false otherwise.
 */
export function useIsDemo(): boolean {
  const ctx = useContext(DemoContext);
  return ctx !== null;
}

interface DemoProviderProps {
  children: ReactNode;
  demoUserId: string;
}

export function DemoProvider({ children, demoUserId }: DemoProviderProps) {
  return (
    <DemoContext.Provider value={{ isDemo: true, demoUserId }}>
      {children}
    </DemoContext.Provider>
  );
}

