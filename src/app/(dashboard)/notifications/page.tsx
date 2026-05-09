import type { Metadata } from "next";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground mt-1">
          Stay updated on your task deadlines and reminders.
        </p>
      </div>
      <NotificationPanel />
    </div>
  );
}
