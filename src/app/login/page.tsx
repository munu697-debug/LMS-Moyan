"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || "Failed to sign in. Please check your credentials.");
      return;
    }

    const dest =
      result.role === "admin"
        ? "/admin/dashboard"
        : result.role === "tutor"
        ? "/tutor/dashboard"
        : "/user/dashboard";

    toast.success("Welcome back! 👋");
    window.location.href = dest;
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);
    const result = await loginWithGoogle("student");
    setIsLoading(false);

    if (!result.success) {
      if (result.error && !result.error.toLowerCase().includes("closed")) {
        setErrorMsg(result.error);
      } else if (result.error) {
        toast.info(result.error);
      }
      return;
    }

    const dest =
      result.role === "admin"
        ? "/admin/dashboard"
        : result.role === "tutor"
        ? "/tutor/dashboard"
        : "/user/dashboard";

    toast.success("Signed in with Google! 👋");
    window.location.href = dest;
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-xl">Moyan Learn</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">Sign in to your account</h1>
          <p className="text-xs text-muted-foreground">
            Access your adaptive courses, teaching studio, or admin center.
          </p>
        </div>

        {/* Sign In Container */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5 sm:p-8">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border/80" />
            <span className="bg-card px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-2xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => toast.info("Password reset link will be sent to your email.")}
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-xs font-bold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? "Signing in..." : "Sign in"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-2">
          <p>
            Don't have an account yet?{" "}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            <Link href="/courses" className="hover:text-foreground">
              Browse public courses catalog &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
