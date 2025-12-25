"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchTimeSafe, formatWatchTime, formatMinutesAsTime } from "./watch-time-context";
import { Button } from "@/components/ui/button";
import { Clock, Settings, Timer, Coffee, Sparkles } from "lucide-react";
import Link from "next/link";

const SNOOZE_OPTIONS = [
  { minutes: 5, label: "5 min", icon: Timer },
  { minutes: 10, label: "10 min", icon: Coffee },
  { minutes: 15, label: "15 min", icon: Clock },
];

export function LimitReachedModal() {
  const watchTime = useWatchTimeSafe();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !watchTime) return null;

  const { isLimitReached, isLimitEnabled, todayWatchedSeconds, dailyLimitMinutes, snooze, snoozeUntil } = watchTime;

  // Don't show if limit not enabled or not reached
  if (!isLimitEnabled || !isLimitReached) return null;

  // Check if we're still in snooze period (shouldn't show modal)
  const isSnoozed = snoozeUntil && Date.now() < snoozeUntil;
  if (isSnoozed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        />

        {/* Animated background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-amber-500/5" />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-red-500/10"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0,
              }}
              animate={{
                y: [null, Math.random() * -200 - 100],
                scale: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 max-w-lg w-full mx-4"
        >
          <div className="bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header with animated gradient */}
            <div className="relative h-32 bg-gradient-to-br from-red-500/20 via-amber-500/10 to-orange-500/20 flex items-center justify-center overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-red-500" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </motion.div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Time for a Break!</h2>
                <p className="text-muted-foreground">
                  You've reached your daily watch limit of{" "}
                  <span className="font-semibold text-foreground">
                    {formatMinutesAsTime(dailyLimitMinutes)}
                  </span>
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-4">
                <div className="px-4 py-3 rounded-2xl bg-muted/50">
                  <p className="text-2xl font-bold text-red-500">
                    {formatWatchTime(todayWatchedSeconds)}
                  </p>
                  <p className="text-xs text-muted-foreground">watched today</p>
                </div>
              </div>

              {/* Message */}
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Taking breaks helps you stay focused and productive. 
                Come back tomorrow refreshed, or snooze for a few more minutes.
              </p>

              {/* Snooze options */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  Need a bit more time?
                </p>
                <div className="flex items-center justify-center gap-2">
                  {SNOOZE_OPTIONS.map((option) => (
                    <motion.div
                      key={option.minutes}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => snooze(option.minutes)}
                        className="gap-2 rounded-xl"
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Settings link */}
              <div className="pt-2">
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    Adjust your daily limit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

