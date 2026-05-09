import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In | TaskFlow AI" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-violet-500/5 p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
