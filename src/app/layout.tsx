import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Inter - Clean, professional body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Sora - Modern geometric for headings
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FocusTube - Watch with Intention",
  description: "Reclaim your attention. Watch only the channels you choose. No algorithm, no distractions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased min-h-screen font-body`}
      >
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
