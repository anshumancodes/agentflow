"use client";

import { motion } from "framer-motion";
import { CheckSquare, Clock, TrendingUp, Trash2, AlertTriangle, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsData } from "@/types";

import type { Variants } from "framer-motion";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  index: number;
  subtitle?: string;
  progress?: number;
}

function StatCard({ title, value, icon, color, index: _index, subtitle, progress }: StatCardProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
              {icon}
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {typeof progress === "number" && (
            <Progress value={progress} className="mt-3 h-1.5" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DashboardStats({ analytics }: { analytics: AnalyticsData }) {
  const stats = [
    {
      title: "Total Tasks",
      value: analytics.total,
      icon: <Target className="w-4.5 h-4.5 text-white" />,
      color: "bg-primary",
      subtitle: "All time",
    },
    {
      title: "Completed",
      value: analytics.completed,
      icon: <CheckSquare className="w-4.5 h-4.5 text-white" />,
      color: "bg-emerald-500",
      subtitle: `${analytics.completionRate}% completion rate`,
      progress: analytics.completionRate,
    },
    {
      title: "Pending",
      value: analytics.pending + analytics.inProgress,
      icon: <Clock className="w-4.5 h-4.5 text-white" />,
      color: "bg-amber-500",
      subtitle: `${analytics.inProgress} in progress`,
    },
    {
      title: "Overdue",
      value: analytics.overdueCount,
      icon: <AlertTriangle className="w-4.5 h-4.5 text-white" />,
      color: analytics.overdueCount > 0 ? "bg-destructive" : "bg-slate-400",
      subtitle: analytics.overdueCount > 0 ? "Needs attention" : "All on time",
    },
    {
      title: "Discarded",
      value: analytics.discarded,
      icon: <Trash2 className="w-4.5 h-4.5 text-white" />,
      color: "bg-slate-500",
      subtitle: "Cancelled tasks",
    },
    {
      title: "Productivity",
      value: `${analytics.completionRate}%`,
      icon: <TrendingUp className="w-4.5 h-4.5 text-white" />,
      color: "bg-violet-500",
      subtitle: "Completion rate",
      progress: analytics.completionRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((s, i) => (
        <StatCard key={s.title} {...s} index={i} />
      ))}
    </div>
  );
}
