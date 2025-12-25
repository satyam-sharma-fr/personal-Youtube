import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusTube - Distraction-Free YouTube",
  description: "Watch videos only from channels you love. No distractions, no recommendations, just pure content.",
  keywords: ["youtube", "distraction-free", "focus", "productivity", "video"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        >
          <ConvexClientProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
