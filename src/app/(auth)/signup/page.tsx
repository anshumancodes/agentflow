"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { signupAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionState } from "@/types";

export default function SignupPage() {
  const [state, action, isPending] = useActionState<ActionState | undefined, FormData>(
    signupAction,
    undefined
  );

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
          <Zap className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>Start managing tasks smarter with AI</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Full Name</Label>
            <Input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              required
            />
            {state?.errors?.name && (
              <p className="text-xs text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {state?.errors?.email && (
              <p className="text-xs text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Min. 8 characters with letters & numbers"
              autoComplete="new-password"
              required
            />
            {state?.errors?.password && (
              <p className="text-xs text-destructive">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && !state.success && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {state.message}
            </p>
          )}

          <Button id="signup-submit" type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account..." : "Create Free Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
