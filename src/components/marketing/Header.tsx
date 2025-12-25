"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Menu, X } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center"
            >
              <Play className="w-4 h-4 text-primary fill-primary" />
            </motion.div>
            <span className="font-bold text-lg">FocusTube</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link href="#features">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Features
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Demo
              </Button>
            </Link>
            <div className="w-px h-6 bg-border/50 mx-2" />
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button className="relative overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 md:hidden"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-lg font-medium hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-lg font-medium hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-lg font-medium hover:text-accent transition-colors"
              >
                Try Demo
              </Link>
              <div className="h-px bg-border/50 my-2" />
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

