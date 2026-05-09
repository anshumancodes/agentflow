"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import type { INotification } from "@/types";

export function useNotifications() {
  const setUnreadCount = useAppStore((s) => s.setUnreadCount);

  return useQuery<INotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      const unread = json.data.filter((n: INotification) => !n.read).length;
      setUnreadCount(unread);
      return json.data;
    },
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to update notifications");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
