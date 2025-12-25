"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { getWatchTimeData, setWatchTime, updateUserTimezone } from "@/app/actions/watch-time";

interface WatchTimeContextValue {
  // State
  todayWatchedSeconds: number;
  dailyLimitMinutes: number;
  isLimitEnabled: boolean;
  isActivelyWatching: boolean;
  isVideoPlaying: boolean;
  snoozeUntil: number | null;
  isLimitReached: boolean;
  isLoading: boolean;
  
  // Actions
  startTracking: () => void;
  stopTracking: () => void;
  setVideoPlaying: (playing: boolean) => void;
  snooze: (minutes: number) => void;
  refreshSettings: () => Promise<void>;
  updateSettings: (settings: { dailyLimitMinutes?: number; isLimitEnabled?: boolean }) => void;
}

const WatchTimeContext = createContext<WatchTimeContextValue | null>(null);

export function useWatchTime() {
  const context = useContext(WatchTimeContext);
  if (!context) {
    throw new Error("useWatchTime must be used within a WatchTimeProvider");
  }
  return context;
}

// Safe hook that doesn't throw if used outside provider
export function useWatchTimeSafe() {
  return useContext(WatchTimeContext);
}

interface WatchTimeProviderProps {
  children: ReactNode;
  initialData?: {
    dailyLimitMinutes: number;
    isLimitEnabled: boolean;
    todayWatchedSeconds: number;
  };
}

const SYNC_INTERVAL_MS = 30000; // Sync to DB every 30 seconds

export function WatchTimeProvider({ children, initialData }: WatchTimeProviderProps) {
  // Core state
  const [todayWatchedSeconds, setTodayWatchedSeconds] = useState(
    initialData?.todayWatchedSeconds ?? 0
  );
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(
    initialData?.dailyLimitMinutes ?? 60
  );
  const [isLimitEnabled, setIsLimitEnabled] = useState(
    initialData?.isLimitEnabled ?? false
  );
  const [isActivelyWatching, setIsActivelyWatching] = useState(false);
  const [isVideoPlaying, setIsVideoPlayingState] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData);

  // Refs for intervals
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedSecondsRef = useRef(todayWatchedSeconds);
  const isVisibleRef = useRef(true);
  const isVideoPlayingRef = useRef(false);
  
  // Ref to always have access to current todayWatchedSeconds (fixes stale closure issue)
  const todayWatchedSecondsRef = useRef(todayWatchedSeconds);
  
  // Keep ref in sync with state
  useEffect(() => {
    todayWatchedSecondsRef.current = todayWatchedSeconds;
  }, [todayWatchedSeconds]);

  // Calculate if limit is reached (considering snooze)
  const isLimitReached = (() => {
    if (!isLimitEnabled) return false;
    
    const limitSeconds = dailyLimitMinutes * 60;
    
    // Check if we're in a snooze period
    if (snoozeUntil && Date.now() < snoozeUntil) {
      return false;
    }
    
    return todayWatchedSeconds >= limitSeconds;
  })();

  // Load initial data if not provided
  useEffect(() => {
    if (!initialData) {
      getWatchTimeData().then((data) => {
        if (!data.error && data.dailyLimitMinutes !== undefined && data.isLimitEnabled !== undefined && data.todayWatchedSeconds !== undefined) {
          setDailyLimitMinutes(data.dailyLimitMinutes);
          setIsLimitEnabled(data.isLimitEnabled);
          setTodayWatchedSeconds(data.todayWatchedSeconds);
          lastSyncedSecondsRef.current = data.todayWatchedSeconds;
        }
        setIsLoading(false);
      });
    }
  }, [initialData]);

  // Sync browser timezone to server on mount
  useEffect(() => {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimezone) {
      updateUserTimezone(browserTimezone).catch(() => {
        // Silently ignore timezone sync errors
      });
    }
  }, []);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Clear snooze when it expires
  useEffect(() => {
    if (snoozeUntil) {
      const timeUntilExpiry = snoozeUntil - Date.now();
      if (timeUntilExpiry > 0) {
        const timeout = setTimeout(() => {
          setSnoozeUntil(null);
        }, timeUntilExpiry);
        return () => clearTimeout(timeout);
      } else {
        setSnoozeUntil(null);
      }
    }
  }, [snoozeUntil]);

  // Sync to database (uses ref to avoid stale closure issues)
  const syncToDatabase = useCallback(async () => {
    const currentSeconds = todayWatchedSecondsRef.current;
    if (currentSeconds !== lastSyncedSecondsRef.current) {
      await setWatchTime(currentSeconds);
      lastSyncedSecondsRef.current = currentSeconds;
    }
  }, []);

  // Set video playing state
  const setVideoPlaying = useCallback((playing: boolean) => {
    setIsVideoPlayingState(playing);
    isVideoPlayingRef.current = playing;
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) return;
    
    setIsActivelyWatching(true);

    // Increment every second (only when visible AND video is playing)
    trackingIntervalRef.current = setInterval(() => {
      if (isVisibleRef.current && isVideoPlayingRef.current) {
        setTodayWatchedSeconds((prev) => prev + 1);
      }
    }, 1000);

    // Sync to DB periodically
    syncIntervalRef.current = setInterval(() => {
      syncToDatabase();
    }, SYNC_INTERVAL_MS);
  }, [syncToDatabase]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsActivelyWatching(false);
    setIsVideoPlayingState(false);
    isVideoPlayingRef.current = false;

    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }

    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    // Final sync
    syncToDatabase();
  }, [syncToDatabase]);

  // Snooze the limit
  const snooze = useCallback((minutes: number) => {
    const snoozeExpiry = Date.now() + minutes * 60 * 1000;
    setSnoozeUntil(snoozeExpiry);
  }, []);

  // Refresh settings from server
  const refreshSettings = useCallback(async () => {
    const data = await getWatchTimeData();
    if (!data.error && data.dailyLimitMinutes !== undefined && data.isLimitEnabled !== undefined && data.todayWatchedSeconds !== undefined) {
      setDailyLimitMinutes(data.dailyLimitMinutes);
      setIsLimitEnabled(data.isLimitEnabled);
      setTodayWatchedSeconds(data.todayWatchedSeconds);
      lastSyncedSecondsRef.current = data.todayWatchedSeconds;
    }
  }, []);

  // Update local settings (after server update)
  const updateSettings = useCallback((settings: { 
    dailyLimitMinutes?: number; 
    isLimitEnabled?: boolean;
  }) => {
    if (settings.dailyLimitMinutes !== undefined) {
      setDailyLimitMinutes(settings.dailyLimitMinutes);
    }
    if (settings.isLimitEnabled !== undefined) {
      setIsLimitEnabled(settings.isLimitEnabled);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  // Sync before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use ref to get latest value (avoids stale closure)
      const currentSeconds = todayWatchedSecondsRef.current;
      if (currentSeconds !== lastSyncedSecondsRef.current) {
        // Trigger sync - note: this won't complete the full async operation
        // but helps ensure data isn't lost
        syncToDatabase();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [syncToDatabase]);

  // Memoize context value to prevent unnecessary re-renders
  // This ensures the effect in watch page doesn't re-run on every state change
  const value: WatchTimeContextValue = useMemo(() => ({
    todayWatchedSeconds,
    dailyLimitMinutes,
    isLimitEnabled,
    isActivelyWatching,
    isVideoPlaying,
    snoozeUntil,
    isLimitReached,
    isLoading,
    startTracking,
    stopTracking,
    setVideoPlaying,
    snooze,
    refreshSettings,
    updateSettings,
  }), [
    todayWatchedSeconds,
    dailyLimitMinutes,
    isLimitEnabled,
    isActivelyWatching,
    isVideoPlaying,
    snoozeUntil,
    isLimitReached,
    isLoading,
    startTracking,
    stopTracking,
    setVideoPlaying,
    snooze,
    refreshSettings,
    updateSettings,
  ]);

  return (
    <WatchTimeContext.Provider value={value}>
      {children}
    </WatchTimeContext.Provider>
  );
}

// Utility function to format seconds as "Xh Ym" or "Xm Ys"
export function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

// Format minutes as readable duration
export function formatMinutesAsTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

