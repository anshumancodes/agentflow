"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionState } from "@/types";

export default function LoginPage() {
  const [state, action, isPending] = useActionState<ActionState | undefined, FormData>(
    loginAction,
    undefined
  );

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader className="text-center pb-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
          <Zap className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your TaskFlow AI account</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
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
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
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

          <Button
            id="login-submit"
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
