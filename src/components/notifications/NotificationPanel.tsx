"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, CheckCheck, Clock, Info, AlertTriangle } from "lucide-react";
import { useNotifications, useMarkNotificationsRead } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import type { INotification } from "@/types";

function NotificationIcon({ type }: { type: INotification["type"] }) {
  if (type === "deadline") return <AlertTriangle className="w-4 h-4 text-destructive" />;
  if (type === "reminder") return <Clock className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-blue-500" />;
}

export function NotificationPanel() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const unread = notifications?.filter((n) => !n.read) ?? [];

  function handleMarkAll() {
    markRead.mutate(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Notifications</h3>
          {unread.length > 0 && (
            <Badge variant="destructive">{unread.length} unread</Badge>
          )}
        </div>
        {unread.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !notifications?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BellOff className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;ll be notified about deadlines and reminders here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`transition-colors ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <NotificationIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.read ? "font-medium" : "text-muted-foreground"}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markRead.mutate([n._id])}
                          className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
