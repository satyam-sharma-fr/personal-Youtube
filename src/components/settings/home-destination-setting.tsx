"use client";

import { useHomeDestination, type HomeDestination } from "@/hooks/useHomeDestination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, ListVideo } from "lucide-react";

export function HomeDestinationSetting() {
  const { destination, setDestination, mounted } = useHomeDestination();

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home Button
          </CardTitle>
          <CardDescription>Choose what the Home button opens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg animate-pulse">
            <div className="flex-1 h-10 rounded-md bg-muted-foreground/10" />
            <div className="flex-1 h-10 rounded-md bg-muted-foreground/10" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const options: { value: HomeDestination; label: string; description: string; icon: React.ElementType }[] = [
    {
      value: "dashboard",
      label: "Dashboard",
      description: "Category picker",
      icon: Home,
    },
    {
      value: "feed",
      label: "Feed",
      description: "Video feed",
      icon: ListVideo,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Home Button
        </CardTitle>
        <CardDescription>Choose what the Home button opens when clicked</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          {options.map((option) => {
            const isSelected = destination === option.value;
            const Icon = option.icon;

            return (
              <Button
                key={option.value}
                variant="ghost"
                onClick={() => setDestination(option.value)}
                className={cn(
                  "flex-1 h-auto py-3 flex flex-col items-center gap-1 rounded-md transition-all",
                  isSelected
                    ? "bg-background shadow-sm border border-border/50"
                    : "hover:bg-background/50"
                )}
              >
                <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          This setting is saved on this device only.
        </p>
      </CardContent>
    </Card>
  );
}

