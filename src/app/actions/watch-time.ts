"use server";

import { createClient } from "@/lib/supabase/server";

// Get today's date in YYYY-MM-DD format for a given timezone
function getLocalDate(timezone: string = "UTC"): string {
  try {
    // Use Intl.DateTimeFormat to get the local date in the user's timezone
    // 'en-CA' locale gives us YYYY-MM-DD format
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    // Fall back to UTC if timezone is invalid
    return new Date().toISOString().split("T")[0];
  }
}

// Helper to get user's timezone from profile
async function getUserTimezoneFromProfile(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("time_zone")
    .eq("id", userId)
    .single();
  
  return profile?.time_zone || "UTC";
}

// Get user's watch time settings and today's session
export async function getWatchTimeData() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get profile with watch settings including timezone
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("daily_watch_limit_minutes, watch_limit_enabled, time_zone")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { error: "Failed to fetch profile" };
  }

  // Get today's watch session using user's local timezone
  const userTimezone = profile?.time_zone || "UTC";
  const today = getLocalDate(userTimezone);
  const { data: session } = await supabase
    .from("daily_watch_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  return {
    dailyLimitMinutes: profile?.daily_watch_limit_minutes ?? 60,
    isLimitEnabled: profile?.watch_limit_enabled ?? false,
    todayWatchedSeconds: session?.watched_seconds ?? 0,
    sessionId: session?.id ?? null,
  };
}

// Update today's watch time
export async function updateWatchTime(additionalSeconds: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's timezone for local date calculation
  const userTimezone = await getUserTimezoneFromProfile(supabase, user.id);
  const today = getLocalDate(userTimezone);

  // Try to get existing session
  const { data: existingSession } = await supabase
    .from("daily_watch_sessions")
    .select("id, watched_seconds")
    .eq("user_id", user.id)
    .eq("date", today)
    .single();

  if (existingSession) {
    // Update existing session
    const newTotal = (existingSession.watched_seconds || 0) + additionalSeconds;
    const { error } = await supabase
      .from("daily_watch_sessions")
      .update({ watched_seconds: newTotal })
      .eq("id", existingSession.id);

    if (error) {
      return { error: "Failed to update watch time" };
    }

    return { watchedSeconds: newTotal };
  } else {
    // Create new session
    const { data: newSession, error } = await supabase
      .from("daily_watch_sessions")
      .insert({
        user_id: user.id,
        date: today,
        watched_seconds: additionalSeconds,
      })
      .select()
      .single();

    if (error) {
      return { error: "Failed to create watch session" };
    }

    return { watchedSeconds: newSession.watched_seconds };
  }
}

// Set today's watch time to a specific value (used for syncing)
export async function setWatchTime(totalSeconds: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's timezone for local date calculation
  const userTimezone = await getUserTimezoneFromProfile(supabase, user.id);
  const today = getLocalDate(userTimezone);

  // Upsert the session
  const { data, error } = await supabase
    .from("daily_watch_sessions")
    .upsert(
      {
        user_id: user.id,
        date: today,
        watched_seconds: totalSeconds,
      },
      {
        onConflict: "user_id,date",
      }
    )
    .select()
    .single();

  if (error) {
    return { error: "Failed to set watch time" };
  }

  return { watchedSeconds: data.watched_seconds };
}

// Update user's watch limit settings
export async function updateWatchLimitSettings(settings: {
  dailyLimitMinutes?: number;
  isLimitEnabled?: boolean;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const updateData: Record<string, unknown> = {};
  
  if (settings.dailyLimitMinutes !== undefined) {
    updateData.daily_watch_limit_minutes = settings.dailyLimitMinutes;
  }
  
  if (settings.isLimitEnabled !== undefined) {
    updateData.watch_limit_enabled = settings.isLimitEnabled;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update settings" };
  }

  return { success: true };
}

// Helper to get a date N days ago in a specific timezone (returns YYYY-MM-DD)
function getLocalDateDaysAgo(timezone: string, daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

// Get watch history for a date range
export async function getWatchHistory(days: number = 7) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's timezone for local date calculation
  const userTimezone = await getUserTimezoneFromProfile(supabase, user.id);
  
  // Calculate start date in user's timezone
  const startDateStr = getLocalDateDaysAgo(userTimezone, days);

  const { data, error } = await supabase
    .from("daily_watch_sessions")
    .select("date, watched_seconds")
    .eq("user_id", user.id)
    .gte("date", startDateStr)
    .order("date", { ascending: false });

  if (error) {
    return { error: "Failed to fetch watch history" };
  }

  return { history: data };
}

// Update user's timezone (called from client to sync browser timezone)
export async function updateUserTimezone(timezone: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate timezone string (basic check)
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    return { error: "Invalid timezone" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ time_zone: timezone })
    .eq("id", user.id);

  if (error) {
    return { error: "Failed to update timezone" };
  }

  return { success: true };
}

// Get user's timezone from profile
export async function getUserTimezone() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", timezone: "UTC" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("time_zone")
    .eq("id", user.id)
    .single();

  return { timezone: profile?.time_zone || "UTC" };
}

// Watch stats result type
export interface WatchStats {
  // Current period stats
  totalSeconds: number;
  avgSecondsPerDay: number;
  bestDay: string | null;
  bestDaySeconds: number;
  daysWithData: number;
  
  // Trend vs previous period
  previousPeriodTotalSeconds: number;
  deltaSeconds: number;
  deltaPercent: number | null; // null if previous period was 0
  
  // Daily breakdown for sparkline/chart
  dailySeries: Array<{ date: string; watchedSeconds: number }>;
}

// Get watch stats for a given period with trend comparison
export async function getWatchStats(days: number = 7): Promise<{ error?: string; stats?: WatchStats }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get user's timezone
  const userTimezone = await getUserTimezoneFromProfile(supabase, user.id);
  
  // Get today's local date
  const today = getLocalDate(userTimezone);
  
  // Calculate date ranges for current and previous periods
  // We need to fetch 2x the days to compare current vs previous
  const startDateStr = getLocalDateDaysAgo(userTimezone, days * 2);
  const currentPeriodStartStr = getLocalDateDaysAgo(userTimezone, days - 1); // -1 because today counts

  // Fetch all sessions in the range
  const { data, error } = await supabase
    .from("daily_watch_sessions")
    .select("date, watched_seconds")
    .eq("user_id", user.id)
    .gte("date", startDateStr)
    .lte("date", today)
    .order("date", { ascending: true });

  if (error) {
    return { error: "Failed to fetch watch stats" };
  }

  // Create a map of date -> watched_seconds
  const sessionMap = new Map<string, number>();
  for (const session of data || []) {
    sessionMap.set(session.date, session.watched_seconds || 0);
  }

  // Generate all dates in the current period (for accurate average)
  const currentPeriodDates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    currentPeriodDates.push(getLocalDateDaysAgo(userTimezone, i));
  }

  // Generate all dates in the previous period
  const previousPeriodDates: string[] = [];
  for (let i = days * 2 - 1; i >= days; i--) {
    previousPeriodDates.push(getLocalDateDaysAgo(userTimezone, i));
  }

  // Calculate current period stats
  let totalSeconds = 0;
  let bestDay: string | null = null;
  let bestDaySeconds = 0;
  let daysWithData = 0;
  const dailySeries: Array<{ date: string; watchedSeconds: number }> = [];

  for (const date of currentPeriodDates) {
    const seconds = sessionMap.get(date) || 0;
    dailySeries.push({ date, watchedSeconds: seconds });
    totalSeconds += seconds;
    
    if (seconds > 0) {
      daysWithData++;
    }
    
    if (seconds > bestDaySeconds) {
      bestDaySeconds = seconds;
      bestDay = date;
    }
  }

  // Calculate average (over full period including days with 0)
  const avgSecondsPerDay = days > 0 ? Math.round(totalSeconds / days) : 0;

  // Calculate previous period total
  let previousPeriodTotalSeconds = 0;
  for (const date of previousPeriodDates) {
    previousPeriodTotalSeconds += sessionMap.get(date) || 0;
  }

  // Calculate trend
  const deltaSeconds = totalSeconds - previousPeriodTotalSeconds;
  const deltaPercent = previousPeriodTotalSeconds > 0
    ? Math.round(((totalSeconds - previousPeriodTotalSeconds) / previousPeriodTotalSeconds) * 100)
    : null;

  return {
    stats: {
      totalSeconds,
      avgSecondsPerDay,
      bestDay,
      bestDaySeconds,
      daysWithData,
      previousPeriodTotalSeconds,
      deltaSeconds,
      deltaPercent,
      dailySeries,
    },
  };
}

