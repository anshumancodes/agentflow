"use client";

import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, Search, Menu } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import Link from "next/link";
import { cn } from "@/lib/utils";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  "/ai-assistant": "AI Assistant",
  "/notifications": "Notifications",
};

interface NavbarProps {
  userName?: string;
  userEmail?: string;
}

export function Navbar({ userName, userEmail }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme, unreadCount, toggleSidebar } = useAppStore();
  const pageName = Object.entries(pageNames).find(([k]) => pathname.startsWith(k))?.[1] || "Dashboard";
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="text-muted-foreground hover:text-foreground transition-colors md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{pageName}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <Link
          href="/notifications"
          className={cn(
            "relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          )}
        </Link>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold cursor-default"
          title={userEmail}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
