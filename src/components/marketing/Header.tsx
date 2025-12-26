"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Play, ArrowRight } from "lucide-react";

// Modern FocusTube Logo
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
      </div>
      <div className="flex flex-col">
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          FocusTube
        </span>
        <span className="text-[9px] text-muted-foreground tracking-wider uppercase hidden sm:block">
          Watch with intention
        </span>
      </div>
    </div>
  );
}

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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : 0.6, 
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/80 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 md:h-18 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Logo />
            </motion.div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="#features">
              <Button 
                variant="ghost" 
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors"
              >
                Features
              </Button>
            </Link>
            <Link href="#pricing">
              <Button 
                variant="ghost" 
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors"
              >
                Pricing
              </Button>
            </Link>
            <Link href="/demo">
              <Button 
                variant="ghost" 
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-colors"
              >
                Demo
              </Button>
            </Link>
            
            <div className="w-px h-6 bg-zinc-200 mx-3" />
            
            <Link href="/login">
              <Button 
                variant="ghost"
                className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100/80"
              >
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <motion.div
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              >
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-xl"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </motion.div>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -mr-2 text-zinc-700"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 z-40 bg-white/98 backdrop-blur-xl border-b border-zinc-200 md:hidden"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {[
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: "/demo", label: "Try Demo", accent: true },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block py-3 text-lg font-medium transition-colors ${
                      item.accent 
                        ? "text-teal-600 hover:text-teal-700" 
                        : "text-zinc-700 hover:text-red-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="h-px bg-zinc-200 my-3"
              />
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    className="w-full border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  >
                    Sign in
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
