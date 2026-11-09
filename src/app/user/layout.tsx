"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Zap,
  Sparkles,
  LayoutDashboard,
  Compass,
  ArrowLeft,
  Flame,
  LogIn,
} from "lucide-react";
import { useAppStore, isUserAdmin } from "@/lib/store";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isHydrated } = useAppStore();

  const isLearnPage = pathname.startsWith("/user/learn");

  useEffect(() => {
    if (currentUser && (currentUser.role === "admin" || isUserAdmin(currentUser.email)) && !isLearnPage) {
      router.replace("/admin/dashboard");
    }
  }, [currentUser, router, isLearnPage]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-muted-foreground">Loading your Student Portal...</p>
      </div>
    );
  }

  if (currentUser && (currentUser.role === "admin" || isUserAdmin(currentUser.email)) && !isLearnPage) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-muted-foreground">Redirecting to Admin Portal...</p>
      </div>
    );
  }

  if (!currentUser) {
    if (isLearnPage) {
      return (
        <div className="min-h-[calc(100vh-65px)] bg-muted/20">
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      );
    }

    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <GraduationCap className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Please sign in to access the Student Portal</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Sign in or create an account to view your enrolled courses, lesson player, and AI tutor.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
          >
            <LogIn className="h-4 w-4" /> Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const enrolledCount = currentUser.enrolledCourseIds.length;
  const certCount = currentUser.certificates.length;

  const navItems = [
    { label: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { label: "My Enrolled Courses", href: "/user/courses", icon: BookOpen, badge: enrolledCount },
    { label: "AI Practice Quizzes", href: "/user/quizzes", icon: Zap },
    { label: "Certificates", href: "/user/certificates", icon: Trophy, badge: certCount },
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col md:flex-row bg-muted/20">
      {/* Mobile Sticky Sub-Nav Bar */}
      <div className="sticky top-[61px] z-30 flex items-center gap-2 overflow-x-auto border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-md md:hidden no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-bold"
                  : "border border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                    isActive ? "bg-primary-foreground/25 text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Desktop Student Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/70 bg-card/70 p-5 backdrop-blur-md md:flex">
        {/* User Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            loading="lazy"
            decoding="async"
            className="h-10 w-10 rounded-full border border-primary/40 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{currentUser.name}</p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>{currentUser.streakDays} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex-1 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Student Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Classroom Shortcut */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/15 p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI Tutor Active</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Get instant hints and conceptual breakdowns inside any lesson player.
          </p>
          <Link
            href="/courses"
            className="mt-3 inline-flex items-center gap-1 font-bold text-primary hover:underline"
          >
            <Compass className="h-3 w-3" /> Explore new topics &rarr;
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
