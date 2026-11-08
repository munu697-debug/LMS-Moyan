"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  FileCheck,
  PlusCircle,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAppStore } from "@/lib/store";

export default function TutorDashboard() {
  const { currentUser, courses, reviews } = useAppStore();

  const myCourses = currentUser
    ? courses.filter(
        (c) =>
          c.instructor.id === currentUser.id ||
          c.instructor.name === currentUser.name
      )
    : [];

  const totalStudents = myCourses.reduce((sum, c) => sum + (c.enrolledCount || 0), 0);
  const totalGross = myCourses.reduce((sum, c) => sum + (c.enrolledCount || 0) * (c.price || 0), 0);
  const tutorEarnings = Math.round(totalGross * 0.85);

  const ratedCourses = myCourses.filter((c) => c.rating > 0);
  const avgRating = ratedCourses.length > 0
    ? (ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1)
    : "0.0";
  const totalReviewsCount = myCourses.reduce((sum, c) => sum + (c.reviewCount || 0), 0);

  const myCourseIds = myCourses.map((c) => c.id);
  const myPendingReviews = reviews.filter(
    (r) => r.status === "pending" && (currentUser?.role === "admin" || myCourseIds.includes(r.courseId))
  );

  const monthNames = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  const currentMonth = new Date().toLocaleString("en-US", { month: "short" });
  const dynamicRevenueData = monthNames.map((m) => ({
    month: m,
    revenue: m === currentMonth ? tutorEarnings : 0,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
            Instructor Studio • Live Analytics
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            Tutor Studio Overview
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Monitor course enrollment velocity, student performance, and pending assignment reviews.
          </p>
        </div>

        <Link
          href="/tutor/courses/new"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          <PlusCircle className="h-4 w-4" /> Create New Course
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Revenue</span>
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">₹{tutorEarnings.toLocaleString("en-IN")}</p>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            {tutorEarnings > 0 ? "85% verified instructor royalty" : "No course sales yet"}
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Students</span>
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{totalStudents}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {totalStudents === 1 ? "1 enrolled student" : `${totalStudents} enrolled students`}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Average Rating</span>
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{avgRating} ★</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {totalReviewsCount > 0 ? `From ${totalReviewsCount} verified review${totalReviewsCount === 1 ? "" : "s"}` : "No ratings yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Reviews</span>
            <span className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
              <FileCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{myPendingReviews.length}</p>
          <Link
            href="/tutor/reviews"
            className="mt-1 block text-[11px] font-semibold text-blue-600 hover:underline"
          >
            {myPendingReviews.length > 0 ? "Review submissions →" : "All graded →"}
          </Link>
        </div>
      </div>

      {/* Main Grid: Revenue Analytics & Pending Reviews */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-border/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Monthly Instructor Revenue</h2>
                <p className="text-xs text-muted-foreground">Real-time payout analytics</p>
              </div>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
                85% Platform Royalty
              </span>
            </div>

            <div className="mt-6 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicRevenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [`₹${val}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Courses List */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <h2 className="text-base font-bold text-foreground">Active Curriculum Management</h2>
              <Link href="/tutor/courses" className="text-xs font-bold text-blue-600 hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="mt-4 divide-y divide-border/60">
              {myCourses.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <p className="font-bold text-foreground">No courses created yet</p>
                  <p>Click "Create New Course" above to publish your first curriculum.</p>
                </div>
              ) : (
                myCourses.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{c.title}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            c.status === "published"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {c.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {c.enrolledCount.toLocaleString()} students • ₹{c.price} • {c.level}
                      </p>
                    </div>

                    <Link
                      href={`/user/learn/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview Course
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Student Submissions Column (1 col) */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">Submissions to Grade</h2>
                <p className="text-xs text-muted-foreground">{myPendingReviews.length} pending</p>
              </div>
              <Link
                href="/tutor/reviews"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                All reviews &rarr;
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {myPendingReviews.map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-border/80 bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{rev.studentName}</span>
                    <span className="text-[10px] text-muted-foreground">{rev.submittedAt}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-primary">{rev.courseTitle}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground italic">
                    "{rev.submissionText}"
                  </p>
                  <Link
                    href="/tutor/reviews"
                    className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    <FileCheck className="h-3.5 w-3.5" /> Grade Submission
                  </Link>
                </div>
              ))}

              {myPendingReviews.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/60" />
                  <p className="mt-2 font-bold text-foreground">All caught up!</p>
                  <p className="text-[11px]">No student assignments pending grading.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
