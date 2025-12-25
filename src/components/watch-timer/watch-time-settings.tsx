"use client";

import { useState, useTransition } from "react";
import { useWatchTimeSafe, formatWatchTime, formatMinutesAsTime } from "./watch-time-context";
import { updateWatchLimitSettings } from "@/app/actions/watch-time";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Timer, Zap, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

interface WatchTimeSettingsProps {
  initialEnabled: boolean;
  initialLimitMinutes: number;
  todayWatchedSeconds: number;
}

export function WatchTimeSettings({
  initialEnabled,
  initialLimitMinutes,
  todayWatchedSeconds,
}: WatchTimeSettingsProps) {
  const watchTime = useWatchTimeSafe();
  const [isPending, startTransition] = useTransition();
  
  // Use context values if available, otherwise fallback to props
  const isEnabled = watchTime?.isLimitEnabled ?? initialEnabled;
  const limitMinutes = watchTime?.dailyLimitMinutes ?? initialLimitMinutes;
  const watchedSeconds = watchTime?.todayWatchedSeconds ?? todayWatchedSeconds;

  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [localLimit, setLocalLimit] = useState(limitMinutes);

  const hasChanges = localEnabled !== isEnabled || localLimit !== limitMinutes;

  const handleToggle = () => {
    setLocalEnabled(!localEnabled);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateWatchLimitSettings({
        isLimitEnabled: localEnabled,
        dailyLimitMinutes: localLimit,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Watch time settings saved");
        // Update context with new settings
        watchTime?.updateSettings({
          isLimitEnabled: localEnabled,
          dailyLimitMinutes: localLimit,
        });
      }
    });
  };

  const progress = limitMinutes > 0 ? Math.min((watchedSeconds / (limitMinutes * 60)) * 100, 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Watch Time Limits
        </CardTitle>
        <CardDescription>
          Set a daily limit to help you stay focused and avoid endless scrolling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
              localEnabled ? "bg-emerald-500/10" : "bg-muted"
            )}>
              <Clock className={cn(
                "w-6 h-6 transition-colors",
                localEnabled ? "text-emerald-500" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-medium">Daily Watch Limit</p>
              <p className="text-sm text-muted-foreground">
                {localEnabled ? "Tracking your watch time" : "Disabled - no time limits"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={cn(
              "relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
              localEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform",
                localEnabled && "translate-x-6"
              )}
            />
          </button>
        </div>

        {/* Duration selector */}
        {localEnabled && (
          <div className="space-y-3">
            <Label>Daily Limit Duration</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {DURATION_OPTIONS.find((d) => d.value === localLimit)?.label || `${localLimit} minutes`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full min-w-[200px]">
                {DURATION_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setLocalLimit(option.value)}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    {localLimit === option.value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Today's progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today's watch time</span>
            <span className="font-medium flex items-center gap-1">
              {watchTime?.isActivelyWatching && (
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              )}
              {formatWatchTime(watchedSeconds)}
              {localEnabled && (
                <span className="text-muted-foreground">
                  {" "}/ {formatMinutesAsTime(localLimit)}
                </span>
              )}
            </span>
          </div>
          
          {localEnabled && (
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                  progress >= 100
                    ? "bg-red-500"
                    : progress >= 80
                    ? "bg-amber-500"
                    : progress >= 50
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {localEnabled && (
            <p className="text-xs text-muted-foreground">
              {progress >= 100
                ? "Daily limit reached! Take a break or snooze to continue."
                : progress >= 80
                ? "Almost at your limit. Consider wrapping up soon."
                : `${formatWatchTime(Math.max((localLimit * 60) - watchedSeconds, 0))} remaining today`}
            </p>
          )}
        </div>

        {/* Save button */}
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        )}

        {/* Info text */}
        <p className="text-xs text-muted-foreground text-center">
          Watch time is tracked only when you're on a video page. 
          The timer pauses when you switch tabs.
        </p>
      </CardContent>
    </Card>
  );
}

