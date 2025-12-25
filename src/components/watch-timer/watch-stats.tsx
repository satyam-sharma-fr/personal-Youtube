"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWatchStats, type WatchStats } from "@/app/actions/watch-time";
import { formatWatchTime } from "./watch-time-context";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Clock, Trophy, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchStatsCardProps {
  initialStats?: WatchStats | null;
}

export function WatchStatsCard({ initialStats }: WatchStatsCardProps) {
  const [stats, setStats] = useState<WatchStats | null>(initialStats ?? null);
  const [isLoading, startTransition] = useTransition();
  const [period, setPeriod] = useState<7 | 30>(7);

  // Fetch stats when period changes
  useEffect(() => {
    startTransition(async () => {
      const result = await getWatchStats(period);
      if (result.stats) {
        setStats(result.stats);
      }
    });
  }, [period]);

  // Format date for display (e.g., "Dec 25")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (!stats) return null;
    
    const { deltaSeconds, deltaPercent } = stats;
    
    if (deltaSeconds === 0) {
      return {
        icon: Minus,
        color: "text-muted-foreground",
        bgColor: "bg-muted/50",
        text: "No change",
      };
    }
    
    if (deltaSeconds > 0) {
      return {
        icon: TrendingUp,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        text: deltaPercent !== null ? `+${deltaPercent}%` : `+${formatWatchTime(deltaSeconds)}`,
      };
    }
    
    return {
      icon: TrendingDown,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      text: deltaPercent !== null ? `${deltaPercent}%` : formatWatchTime(Math.abs(deltaSeconds)),
    };
  };

  const trend = getTrendDisplay();

  // Calculate max for sparkline scaling
  const maxSeconds = stats ? Math.max(...stats.dailySeries.map(d => d.watchedSeconds), 1) : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Watch Stats
            </CardTitle>
            <CardDescription>
              Your viewing habits over time
            </CardDescription>
          </div>
          
          {/* Period Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setPeriod(7)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                period === 7
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              7 days
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                period === 30
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              30 days
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading && !stats ? (
          <div className="space-y-4">
            <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
            <div className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Watch Time */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {formatWatchTime(stats.totalSeconds)}
                </p>
              </div>
              
              {/* Average per Day */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Avg/day</span>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {formatWatchTime(stats.avgSecondsPerDay)}
                </p>
              </div>
              
              {/* Best Day */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-medium">Best day</span>
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {stats.bestDay ? formatWatchTime(stats.bestDaySeconds) : "—"}
                </p>
                {stats.bestDay && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(stats.bestDay)}
                  </p>
                )}
              </div>
              
              {/* Trend vs Previous Period */}
              <div className={cn(
                "p-4 rounded-xl border border-border/50",
                trend?.bgColor || "bg-muted/50"
              )}>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  {trend && <trend.icon className={cn("w-4 h-4", trend.color)} />}
                  <span className="text-xs font-medium">vs prev {period}d</span>
                </div>
                <p className={cn("text-xl font-bold tabular-nums", trend?.color)}>
                  {trend?.text || "—"}
                </p>
              </div>
            </div>

            {/* Sparkline / Mini Bar Chart */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Daily activity</p>
              <div className="flex items-end gap-1 h-16">
                {stats.dailySeries.map((day, i) => {
                  const height = maxSeconds > 0 ? (day.watchedSeconds / maxSeconds) * 100 : 0;
                  const isToday = i === stats.dailySeries.length - 1;
                  
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <div
                        className={cn(
                          "w-full rounded-t transition-all",
                          isToday ? "bg-primary" : "bg-primary/40 group-hover:bg-primary/60",
                          height === 0 && "bg-muted min-h-[2px]"
                        )}
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${formatDate(day.date)}: ${formatWatchTime(day.watchedSeconds)}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.dailySeries.length > 0 ? formatDate(stats.dailySeries[0].date) : ""}</span>
                <span>Today</span>
              </div>
            </div>

            {/* Days with activity */}
            <p className="text-xs text-muted-foreground text-center">
              Watched videos on {stats.daysWithData} of {period} days
            </p>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No watch data yet</p>
            <p className="text-sm mt-1">Start watching videos to see your stats</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

