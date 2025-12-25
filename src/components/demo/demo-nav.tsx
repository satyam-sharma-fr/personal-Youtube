"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft, Home, Tv, ListVideo, Settings, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const demoNavItems = [
  { href: "/demo", label: "Feed", icon: ListVideo },
  { href: "/demo/channels", label: "Channels", icon: Tv },
  { href: "/demo/settings", label: "Settings", icon: Settings },
];

export function DemoNav() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="fixed top-10 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Back */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center"
            >
              <Play className="w-4 h-4 text-primary fill-primary" />
            </motion.div>
            <span className="font-bold hidden sm:inline">FocusTube</span>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Back to site</span>
            </Button>
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {demoNavItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === "/demo" && pathname.startsWith("/demo/watch"));
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    isActive && "bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right: Sign up CTA */}
        <div className="flex items-center gap-2">
          <Link href="/signup">
            <Button size="sm" className="gap-1">
              Sign Up
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

