"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, LogOut, User, Settings, Plus, Search, Menu, X } from "lucide-react";
import { AddChannelDialog } from "./add-channel-dialog";

export function Navbar() {
  const { signOut } = useAuthActions();
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
              >
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </motion.div>
              <span className="text-xl font-bold hidden sm:block">FocusTube</span>
            </Link>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                onClick={() => setIsAddChannelOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Channel
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="bg-primary/10">
                        <User className="w-5 h-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/channels" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Channels
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <Button
                onClick={() => {
                  setIsAddChannelOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Channel
              </Button>
              <Link href="/dashboard/channels">
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="w-4 h-4" />
                  Manage Channels
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      <AddChannelDialog 
        open={isAddChannelOpen} 
        onOpenChange={setIsAddChannelOpen} 
      />
    </>
  );
}

