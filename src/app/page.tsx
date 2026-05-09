import Link from "next/link";
import { Metadata } from "next";
import { LandingHero } from "@/components/landing/Hero";
import { LandingFeatures } from "@/components/landing/Features";
import { LandingFooter } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "TaskFlow AI — AI-Powered Task Management for Modern Teams",
  description:
    "Manage tasks, get AI insights, visualize your calendar, and generate professional emails — all in one intelligent productivity platform.",
};

export default function LandingPage() {
  return (
    <div className="min-h-full flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">⚡</span>
            </div>
            <span className="font-bold text-lg">TaskFlow AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        <LandingHero />
        <LandingFeatures />

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-violet-500/10">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Ready to supercharge your productivity?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of professionals who manage smarter with TaskFlow AI.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity text-lg shadow-lg"
            >
              Start for Free — No credit card needed
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
