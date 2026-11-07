"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FileCheck,
  Users,
  DollarSign,
  ArrowLeft,
  GraduationCap,
  LogIn,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isHydrated, reviews, courses, logout } = useAppStore();

  if (!isHydrated) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-xs font-semibold text-muted-foreground">Loading your Tutor Studio...</p>
      </div>
    );
  }

  if (currentUser?.role === "tutor" && currentUser?.status === "pending_approval") {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Clock className="h-10 w-10 animate-pulse" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-foreground">
          Tutor Application Pending Admin Approval
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md">
          Welcome, <strong>{currentUser.name}</strong>. Your instructor application has been submitted and is currently awaiting review and approval by the platform administrator.
        </p>

        {/* Verification Progress */}
        <div className="mt-6 w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 text-left shadow-sm space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Verification Steps
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 text-emerald-600 font-semibold">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-xs font-bold">✓</span>
              <span>1. Application registered</span>
            </div>
            <div className="flex items-center gap-3 text-amber-600 font-semibold">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold">●</span>
              <span>2. Administrator verification in progress</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">3</span>
              <span>3. Tutor Studio & Course Authoring unlocked upon approval</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Home
          </Link>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-500/10 text-blue-600">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Please sign in to access the Tutor Studio</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Sign in with an instructor account to manage courses, grade submissions, and track earnings.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" /> Sign In as Tutor
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
          >
            Create Instructor Account
          </Link>
        </div>
      </div>
    );
  }

  const pendingReviewsCount = reviews.filter((r) => r.status === "pending").length;
  const myCoursesCount = courses.filter((c) => c.instructor.id === currentUser.id || c.instructor.name === currentUser.name).length;

  const navItems = [
    { label: "Studio Dashboard", href: "/tutor/dashboard", icon: LayoutDashboard },
    { label: "My Courses", href: "/tutor/courses", icon: BookOpen, badge: myCoursesCount || 2 },
    { label: "Create New Course", href: "/tutor/courses/new", icon: PlusCircle },
    { label: "Assignment Reviews", href: "/tutor/reviews", icon: FileCheck, badge: pendingReviewsCount },
    { label: "Enrolled Students", href: "/tutor/students", icon: Users },
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)] bg-muted/20">
      {/* Desktop Tutor Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/70 bg-card/70 p-5 backdrop-blur-md md:flex">
        {/* Tutor Profile Header */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            loading="lazy"
            decoding="async"
            className="h-10 w-10 rounded-full border border-blue-500/40 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{currentUser.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{currentUser.title || "Tutor"}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
              <Sparkles className="h-2.5 w-2.5" /> Verified Instructor
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex-1 space-y-1.5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Instructor Studio
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
                    ? "bg-blue-600 text-white shadow-sm"
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
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Earnings Quick Box */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/15 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Monthly Earnings</span>
            <span className="font-extrabold text-blue-600">₹1,25,000</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Next direct payout on Nov 1st.
          </p>
          <Link
            href="/tutor/courses/new"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <PlusCircle className="h-3.5 w-3.5" /> New Course
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
