"use client";

import { useQuery } from "@tanstack/react-query";
import type { AnalyticsData } from "@/types";

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      return json.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
