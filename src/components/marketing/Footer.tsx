"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Github, Twitter, Play } from "lucide-react";
import { fadeUp } from "./motion";

export function Footer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer className="relative py-12 border-t border-zinc-200 bg-white">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent" />

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
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md shadow-red-500/20"
            >
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </motion.div>
            <div>
              <span className="font-display text-lg font-semibold text-zinc-900">FocusTube</span>
              <span className="block text-xs text-zinc-500">
                Watch with intention.
              </span>
            </div>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link
              href="/login"
              className="hover:text-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hover:text-red-600 transition-colors"
            >
              Get Started
            </Link>
            <div className="w-px h-4 bg-zinc-200" />
            <a
              href="#"
              className="hover:text-zinc-900 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:text-zinc-900 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} FocusTube. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
