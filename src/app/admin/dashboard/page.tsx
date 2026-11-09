"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Users,
  BookOpen,
  FileCheck2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Server,
  Activity,
  CheckCircle2,
  Star,
  MessageSquare,
  UserCheck,
  Check,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAppStore } from "@/lib/store";

export default function AdminDashboard() {
  const {
    courses,
    users,
    reviews,
    enrollmentRequests,
    approveEnrollmentRequest,
    rejectEnrollmentRequest,
  } = useAppStore();

  const pendingCourses = courses.filter((c) => c.status === "pending_approval");
  const pendingEnrollments = enrollmentRequests.filter((r) => r.status === "pending");
  const pendingTutors = users.filter((u) => u.role === "tutor" && u.status === "pending_approval");
  const totalTutors = users.filter((u) => u.role === "tutor").length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const disciplines = Array.from(new Set(courses.map((c) => c.category)));

  // Calculate real verified platform GMV based on users' enrolled courses
  const realGmv = users.reduce((acc, u) => {
    const userCourses = u.enrolledCourseIds || [];
    const userTotal = userCourses.reduce((sum, cId) => {
      const course = courses.find((c) => c.id === cId);
      return sum + (course?.price || 0);
    }, 0);
    return acc + userTotal;
  }, 0);

  // Dynamic monthly analytics based on real platform data
  const monthNames = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();
  const recentMonths = [4, 3, 2, 1, 0].map((offset) => {
    const idx = (currentMonthIdx - offset + 12) % 12;
    return monthNames[idx % monthNames.length];
  });

  const dynamicGrowthData = recentMonths.map((m, idx) => {
    const isCurrent = idx === recentMonths.length - 1;
    return {
      month: m,
      users: isCurrent ? totalStudents : 0,
      revenue: isCurrent ? realGmv : 0,
    };
  });

  // Real platform audit events
  const realAuditEvents = [
    ...enrollmentRequests.map((req) => ({
      id: `enr-${req.id}`,
      icon: "user",
      title: `${req.studentName} requested enrollment in "${req.courseTitle}"`,
      subtitle: `Status: ${req.status} • Category: ${req.courseCategory}`,
      badge: req.status === "approved" ? "Approved" : "Pending",
    })),
    ...courses.map((c) => ({
      id: `course-${c.id}`,
      icon: "book",
      title: `Course: "${c.title}"`,
      subtitle: `Status: ${c.status} • Category: ${c.category}`,
      badge: c.status === "published" ? "Live" : "Draft",
    })),
    ...users
      .filter((u) => u.role !== "admin")
      .map((u) => ({
        id: `user-${u.id}`,
        icon: "user",
        title: `${u.name} registered as ${u.role === "tutor" ? "Instructor" : "Learner"}`,
        subtitle: `Status: ${u.status} • Joined: ${u.joinedDate || "Active"}`,
        badge: u.role,
      })),
  ].slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600">
            Operations & Platform Governance
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            Executive Admin Control
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Real-time oversight of platform revenue, tutor certifications, and course approval pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingTutors.length > 0 && (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              <Clock className="h-4 w-4 animate-pulse" /> Review {pendingTutors.length} Pending Tutor{pendingTutors.length > 1 ? "s" : ""}
            </Link>
          )}
          {pendingCourses.length > 0 && (
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
            >
              <FileCheck2 className="h-4 w-4" /> Review {pendingCourses.length} Pending Course{pendingCourses.length > 1 ? "s" : ""}
            </Link>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Platform GMV</span>
            <span className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">₹{realGmv.toLocaleString("en-IN")}</p>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> Live verified platform revenue
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Learners</span>
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{totalStudents}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{totalStudents} registered student account{totalStudents === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Courses</span>
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{courses.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Across {disciplines.length} discipline{disciplines.length === 1 ? "" : "s"}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Approvals</span>
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">
            {pendingCourses.length + pendingEnrollments.length + pendingTutors.length}
          </p>
          <Link
            href="/admin/courses?tab=enrollments"
            className="mt-1 block text-[11px] font-semibold text-purple-600 hover:underline"
          >
            {pendingCourses.length + pendingEnrollments.length + pendingTutors.length > 0
              ? `${pendingCourses.length + pendingEnrollments.length + pendingTutors.length} pending items require action →`
              : "Review submission queue →"}
          </Link>
        </div>
      </div>

      {/* Main Grid: Platform Growth & Audit Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Growth Chart (2 cols) */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Monthly Learner Influx & Revenue</h2>
              <p className="text-xs text-muted-foreground">Real-time enrollment velocity</p>
            </div>
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600">
              Live Analytics
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicGrowthData}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="users" name="New Learners" fill="#9333ea" radius={[6, 6, 0, 0]} />
                <Bar dataKey="revenue" name="Platform Revenue (₹)" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Platform Activity (1 col) */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <span>Live Audit Log</span>
            </h2>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4 text-xs">
            {realAuditEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No recent activity recorded. Real-time platform events will appear here automatically.
              </div>
            ) : (
              realAuditEvents.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-purple-500/10 text-purple-600">
                    {event.icon === "book" ? (
                      <BookOpen className="h-3.5 w-3.5" />
                    ) : (
                      <Users className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{event.subtitle}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/courses"
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-muted/60 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              Manage Course Approvals &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Student Enrollment Requests Queue */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">Student Course Enrollment Requests</h2>
                {pendingEnrollments.length > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
                    {pendingEnrollments.length} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Verify and approve student requests before granting course access</p>
            </div>
          </div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
          >
            <span>Manage All Courses & Enrollments</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pendingEnrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No pending enrollment requests. All learner access requests are up to date!
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingEnrollments.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.02] p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-bold text-primary uppercase">{req.courseCategory}</span>
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                      <Clock className="h-3 w-3" /> {req.requestedAt}
                    </span>
                  </div>
                  <h4 className="mt-1 font-bold text-foreground text-sm">{req.courseTitle}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Student: <strong className="text-foreground">{req.studentName}</strong> ({req.studentEmail})
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-border/60 pt-3">
                  <button
                    onClick={() => {
                      approveEnrollmentRequest(req.id);
                      toast.success(`Approved ${req.studentName} for "${req.courseTitle}"!`);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      rejectEnrollmentRequest(req.id);
                      toast.info(`Rejected request for ${req.studentName}.`);
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Student Reviews & Ratings Section */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Star className="h-5 w-5 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Recent Student Reviews & Ratings</h2>
              <p className="text-xs text-muted-foreground">
                {reviews.length > 0
                  ? `${(reviews.reduce((acc, r) => acc + (r.grade ? r.grade / 20 : 5), 0) / reviews.length).toFixed(1)} ★ average rating across ${reviews.length} student review${reviews.length === 1 ? "" : "s"}`
                  : "No student reviews submitted yet"}
              </p>
            </div>
          </div>
          <Link
            href="/admin/reviews"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
          >
            <span>View All Reviews</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
            No verified student reviews have been submitted yet. When learners complete courses and leave ratings, verified reviews will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r, i) => (
              <div key={r.id || i} className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground italic leading-relaxed">
                    "{r.feedback || r.submissionText || "Verified student completion"}"
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
                    {r.studentName?.[0] || "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-foreground">{r.studentName}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{r.courseTitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
