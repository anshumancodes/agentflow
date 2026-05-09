import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TaskFlow AI — AI-Powered Task Management",
    template: "%s | TaskFlow AI",
  },
  description:
    "Manage tasks, get AI insights, and boost your productivity with TaskFlow AI — the intelligent SaaS task manager.",
  keywords: ["task management", "AI productivity", "Gemini AI", "task manager", "SaaS"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
