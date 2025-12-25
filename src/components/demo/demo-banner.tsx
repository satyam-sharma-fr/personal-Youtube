"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-accent/90 via-primary/90 to-accent/90 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-white">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">
            You're viewing a <strong>demo</strong> of FocusTube with curated channels.
          </span>
          <span className="sm:hidden">
            <strong>Demo mode</strong> - Browse only
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/signup">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Create Your Own
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 rounded-md hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

