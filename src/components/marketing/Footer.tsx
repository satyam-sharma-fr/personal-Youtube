"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Github, Twitter } from "lucide-react";
import { fadeUp } from "./motion";

export function Footer() {
  return (
    <footer className="relative py-12 border-t border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-primary fill-primary" />
            </div>
            <div>
              <span className="font-bold text-lg">FocusTube</span>
              <span className="block text-xs text-muted-foreground">
                YouTube, minus the algorithm.
              </span>
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hover:text-foreground transition-colors"
            >
              Get Started
            </Link>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FocusTube. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

