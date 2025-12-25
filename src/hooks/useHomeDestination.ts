"use client";

import { useState, useEffect, useCallback } from "react";

const HOME_DESTINATION_KEY = "focustube-home-destination";

export type HomeDestination = "dashboard" | "feed";

export function useHomeDestination() {
  const [destination, setDestination] = useState<HomeDestination>("dashboard");
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(HOME_DESTINATION_KEY);
    if (stored === "dashboard" || stored === "feed") {
      setDestination(stored);
    }
    setMounted(true);
  }, []);

  // Update localStorage when destination changes
  const updateDestination = useCallback((newDestination: HomeDestination) => {
    setDestination(newDestination);
    localStorage.setItem(HOME_DESTINATION_KEY, newDestination);
  }, []);

  // Computed home href based on setting
  const homeHref = destination === "dashboard" ? "/home" : "/dashboard";

  return {
    destination,
    setDestination: updateDestination,
    homeHref,
    mounted,
  };
}

