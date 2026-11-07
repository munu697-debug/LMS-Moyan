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

const platformGrowthData = [
  { month: "Jun", users: 18000, revenue: 54000 },
  { month: "Jul", users: 24000, revenue: 72000 },
  { month: "Aug", users: 31000, revenue: 98000 },
  { month: "Sep", users: 42000, revenue: 135000 },
  { month: "Oct", users: 56000, revenue: 178000 },
];

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
          <p className="mt-3 text-2xl font-extrabold text-foreground">₹3,42,85,000</p>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> +22.8% YOY
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Learners</span>
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">120,400+</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{totalStudents} active session accounts</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Courses</span>
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{courses.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Across 8 disciplines</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Approvals</span>
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <FileCheck2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{pendingCourses.length}</p>
          <Link
            href="/admin/courses"
            className="mt-1 block text-[11px] font-semibold text-purple-600 hover:underline"
          >
            Review submission queue &rarr;
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
              <p className="text-xs text-muted-foreground">Adaptive enrollment velocity</p>
            </div>
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600">
              Q4 Forecast: +35%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformGrowthData}>
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
            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Alex Chen certified in Prompt Engineering</p>
                <p className="text-[11px] text-muted-foreground">Scored 100% • 15m ago</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-500/10 text-blue-600">
                <BookOpen className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Dr. Elena Vance submitted course update</p>
                <p className="text-[11px] text-muted-foreground">Gemini API modules • 45m ago</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-purple-500/10 text-purple-600">
                <Users className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Marcus Vance updated platform announcement</p>
                <p className="text-[11px] text-muted-foreground">Gemini 2.0 release notice • 2h ago</p>
              </div>
            </div>
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
              <p className="text-xs text-muted-foreground">4.9 ★ average rating across 1,480+ enrolled learners</p>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              name: "Alex Chen",
              role: "Prompt Engineering Mastery",
              quote: "The Gemini AI tutor dock is unmatched. The assistant broke down token probability distributions in seconds!",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            },
            {
              name: "Aisha Khan",
              role: "Machine Learning Foundations",
              quote: "Loss surfaces and momentum optimizers made concepts click that 3 textbooks couldn't explain. Verified cert is on my LinkedIn!",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            },
            {
              name: "Rahul Mehta",
              role: "Gemini API Production Apps",
              quote: "Lessons on multi-turn function calling and structured outputs gave our team the blueprint for our production AI agent.",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            },
          ].map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-foreground italic leading-relaxed">
                  "{r.quote}"
                </p>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-border/60">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="h-8 w-8 rounded-full border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">{r.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
