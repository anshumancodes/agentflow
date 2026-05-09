import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">⚡</span>
            </div>
            <span className="font-bold">TaskFlow AI</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskFlow AI. Built with Next.js & Gemini.
          </p>
        </div>
      </div>
    </footer>
  );
}
