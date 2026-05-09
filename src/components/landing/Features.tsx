"use client";

import { motion } from "framer-motion";
import {
  CheckSquare, Calendar, BarChart3, Sparkles, Mail, Bell,
  Shield, Zap, Clock,
} from "lucide-react";

const features = [
  {
    icon: CheckSquare,
    title: "Smart Task Management",
    description: "Create, organize, and track tasks with priorities, due dates, and status tracking. Powerful filters and search included.",
    color: "bg-blue-500",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Ask Gemini AI questions about your tasks — get scheduling suggestions, prioritization advice, and productivity insights.",
    color: "bg-violet-500",
  },
  {
    icon: Calendar,
    title: "Calendar View",
    description: "Visualize all your task deadlines on a beautiful monthly or weekly calendar. Color-coded by priority.",
    color: "bg-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Productivity Analytics",
    description: "Track completion rates, weekly progress, and overdue stats with interactive charts. Understand your work patterns.",
    color: "bg-amber-500",
  },
  {
    icon: Mail,
    title: "AI Email Generator",
    description: "Generate professional status update emails from your task context. Choose your tone: professional, friendly, or concise.",
    color: "bg-rose-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Never miss a deadline with real-time notification system. Get reminded about upcoming and overdue tasks.",
    color: "bg-cyan-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data stays yours. Secure JWT authentication, hashed passwords, and rate-limited APIs.",
    color: "bg-slate-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built with Next.js 16 App Router and server components for sub-second page loads and optimal performance.",
    color: "bg-primary",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Optimistic UI updates and automatic cache invalidation keep your task list always in sync.",
    color: "bg-orange-500",
  },
];

export function LandingFeatures() {
  return (
    <section className="py-24 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Everything you need to be productive
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete productivity suite with AI at its core — built for individuals and teams who want to accomplish more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
