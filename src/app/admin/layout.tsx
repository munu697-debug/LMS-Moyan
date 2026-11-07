"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Users,
  Sliders,
  LogIn,
  Activity,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isHydrated, courses, users } = useAppStore();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-muted-foreground">Loading Admin Console...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-purple-500/10 text-purple-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Please sign in to access Admin Console</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Sign in with an administrator account to manage platform governance, course approvals, and system settings.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
          >
            <LogIn className="h-4 w-4" /> Sign In as Admin
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-500/10 text-amber-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Admin Privileges Required</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          You are signed in as <span className="font-semibold text-foreground">{currentUser.name}</span> ({currentUser.role}). Your account does not have administrator access.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const pendingCoursesCount = courses.filter((c) => c.status === "pending_approval").length;

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
      label: "Course Approvals",
      href: "/admin/courses",
      icon: BookOpen,
      badge: pendingCoursesCount,
    },
    { label: "User Management", href: "/admin/users", icon: Users, badge: users.length },
    { label: "System Settings", href: "/admin/settings", icon: Sliders },
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-muted/20">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/70 bg-card/70 p-5 backdrop-blur-md md:flex">
        {/* Admin Profile Header */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 font-extrabold text-white text-xs tracking-wider shadow-sm border border-purple-400/30">
            SA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">Super Admin</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {currentUser.title || "Platform Administrator"}
            </p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600">
              <ShieldCheck className="h-2.5 w-2.5" /> Verified Admin
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex-1 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Administration
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
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-purple-500/10 text-purple-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* System Health Quick Card */}
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-indigo-500/15 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">System Health</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Optimal
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {pendingCoursesCount > 0
              ? `${pendingCoursesCount} course(s) waiting for review.`
              : "All systems operating normally."}
          </p>
          <Link
            href="/admin/courses"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
          >
            Review Courses
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
