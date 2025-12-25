"use client";

import { Navbar } from "@/components/navbar";
import { VideoFeed } from "@/components/video-feed";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoFeed />
      </main>
    </div>
  );
}

