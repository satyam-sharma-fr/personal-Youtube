"use client";

import { useWatchTimeSafe, formatWatchTime, formatMinutesAsTime } from "./watch-time-context";
import { cn } from "@/lib/utils";
import { Clock, Timer, Zap } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NavTimer() {
  const watchTime = useWatchTimeSafe();

  // Don't render if context not available or limit not enabled
  if (!watchTime || !watchTime.isLimitEnabled) {
    return null;
  }

  const { todayWatchedSeconds, dailyLimitMinutes, isActivelyWatching, isVideoPlaying, snoozeUntil, isLoading } = watchTime;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-muted-foreground/20" />
        <div className="w-16 h-4 rounded bg-muted-foreground/20" />
      </div>
    );
  }

  const limitSeconds = dailyLimitMinutes * 60;
  const progress = Math.min((todayWatchedSeconds / limitSeconds) * 100, 100);
  const remainingSeconds = Math.max(limitSeconds - todayWatchedSeconds, 0);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= 100) return "text-red-500 bg-red-500/10 border-red-500/30";
    if (progress >= 80) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    if (progress >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
  };

  const getIconColor = () => {
    if (progress >= 100) return "text-red-500";
    if (progress >= 80) return "text-amber-500";
    if (progress >= 50) return "text-yellow-500";
    return "text-emerald-500";
  };

  // Check if currently snoozed
  const isSnoozed = snoozeUntil && Date.now() < snoozeUntil;
  const snoozeRemainingMs = isSnoozed ? snoozeUntil - Date.now() : 0;
  const snoozeRemainingMinutes = Math.ceil(snoozeRemainingMs / 60000);

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/settings">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer hover:scale-105",
                getProgressColor(),
                isVideoPlaying && "ring-2 ring-offset-2 ring-offset-background"
              )}
            >
              {/* Circular progress indicator */}
              <div className="relative w-5 h-5">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                  {/* Background circle */}
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="opacity-20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${progress * 0.5} 50`}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isVideoPlaying ? (
                    <Zap className={cn("w-2.5 h-2.5 fill-current", getIconColor())} />
                  ) : isSnoozed ? (
                    <Timer className={cn("w-2.5 h-2.5", getIconColor())} />
                  ) : isActivelyWatching ? (
                    <Clock className={cn("w-2.5 h-2.5 animate-pulse", getIconColor())} />
                  ) : (
                    <Clock className={cn("w-2.5 h-2.5", getIconColor())} />
                  )}
                </div>
              </div>

              {/* Time display */}
              <span className="text-xs font-medium tabular-nums whitespace-nowrap">
                {formatWatchTime(todayWatchedSeconds)} / {formatMinutesAsTime(dailyLimitMinutes)}
              </span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Daily Watch Time</p>
            <p className="text-xs text-muted-foreground">
              {remainingSeconds > 0
                ? `${formatWatchTime(remainingSeconds)} remaining today`
                : "Daily limit reached"}
            </p>
            {isVideoPlaying && (
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Video playing - tracking time
              </p>
            )}
            {isActivelyWatching && !isVideoPlaying && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Video paused
              </p>
            )}
            {isSnoozed && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                Snoozed for {snoozeRemainingMinutes}m
              </p>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              Click to adjust settings
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

