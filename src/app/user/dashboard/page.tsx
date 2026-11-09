"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Trophy,
  Flame,
  Zap,
  ArrowRight,
  PlayCircle,
  Clock,
  Sparkles,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAppStore } from "@/lib/store";

export default function UserDashboard() {
  const { currentUser, courses, enrollmentRequests } = useAppStore();

  if (!currentUser) return null;

  const studentEmail = currentUser?.email?.toLowerCase();
  const isStudentEnrolledInCourse = (course: (typeof courses)[0]): boolean => {
    if (currentUser?.enrolledCourseIds?.includes(course.id)) return true;
    const isApproved = enrollmentRequests.some((r) => {
      const emailMatches = Boolean(studentEmail && r.studentEmail?.toLowerCase() === studentEmail);
      const idMatches = r.studentId === currentUser.id;
      const userMatches = idMatches || emailMatches;
      if (!userMatches || r.status !== "approved") return false;

      const courseIdMatches =
        r.courseId === course.id ||
        (course.id.includes("1794196371812") && r.courseId.includes("lovable-vibe-coding")) ||
        (course.id.includes("lovable-vibe-coding") && r.courseId.includes("1794196371812"));
      const titleMatches = Boolean(
        r.courseTitle && course.title && r.courseTitle.toLowerCase().trim() === course.title.toLowerCase().trim()
      );
      return courseIdMatches || titleMatches;
    });
    return isApproved;
  };

  const enrolledCourses = courses.filter((c) => isStudentEnrolledInCourse(c));

  const pendingRequests = enrollmentRequests.filter(
    (r) =>
      (r.studentId === currentUser?.id || (studentEmail && r.studentEmail?.toLowerCase() === studentEmail)) &&
      r.status === "pending"
  );
  const pendingCourseIdList = Array.from(
    new Set([...(currentUser?.pendingCourseIds || []), ...pendingRequests.map((r) => r.courseId)])
  );
  const pendingCourses = courses.filter(
    (c) => pendingCourseIdList.includes(c.id) && !isStudentEnrolledInCourse(c)
  );

  const completedLessonCount = currentUser?.completedLessonIds?.length || 0;
  const totalMinutes = completedLessonCount * 25;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const formattedStudyTime = totalMinutes > 0
    ? `${hours > 0 ? `${hours}h ` : ""}${remainingMins}m`
    : "0m";

  const dynamicStudyData = [
    { day: "Mon", minutes: Math.round(totalMinutes * 0.15) },
    { day: "Tue", minutes: Math.round(totalMinutes * 0.20) },
    { day: "Wed", minutes: Math.round(totalMinutes * 0.10) },
    { day: "Thu", minutes: Math.round(totalMinutes * 0.25) },
    { day: "Fri", minutes: Math.round(totalMinutes * 0.15) },
    { day: "Sat", minutes: Math.round(totalMinutes * 0.10) },
    { day: "Sun", minutes: Math.round(totalMinutes * 0.05) },
  ];

  // Calculate overall average quiz score
  const quizScores = currentUser?.quizScores || {};
  const quizScoreValues = Object.values(quizScores);
  const hasQuizScores = quizScoreValues.length > 0;
  const avgQuizScore = hasQuizScores
    ? Math.round(
        quizScoreValues.reduce((a, b) => a + b, 0) / quizScoreValues.length
      )
    : 0;

  const activeCourse = enrolledCourses[0] || null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-elegant sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Student Workspace
            </span>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="max-w-xl text-xs sm:text-sm opacity-90">
              You are on a <span className="font-bold underline">{currentUser.streakDays}-day learning streak</span>. Keep going to unlock your next verified certificate!
            </p>
          </div>

          {activeCourse ? (
            <Link
              href={`/user/learn/${activeCourse.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-card px-5 py-3 text-xs font-bold text-primary shadow-lg transition-transform hover:scale-105"
            >
              <PlayCircle className="h-4 w-4" /> Resume {activeCourse.title.slice(0, 18)}…
            </Link>
          ) : (
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-2xl bg-card px-5 py-3 text-xs font-bold text-primary shadow-lg transition-transform hover:scale-105"
            >
              <BookOpen className="h-4 w-4" /> Explore Courses
            </Link>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Enrolled Courses</span>
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{enrolledCourses.length}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active learning paths</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Completed Lessons</span>
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{completedLessonCount}</p>
          <p className="mt-1 text-[11px] text-muted-foreground font-medium">
            {completedLessonCount > 0 ? `${completedLessonCount} completed` : "No lessons finished yet"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Current Streak</span>
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <Flame className="h-4 w-4 fill-amber-500" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{currentUser.streakDays || 1} Days</p>
          <p className="mt-1 text-[11px] text-amber-600 font-medium">Keep it going tomorrow!</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Avg Quiz Score</span>
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">{hasQuizScores ? `${avgQuizScore}%` : "—"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground font-medium">
            {hasQuizScores ? "Across completed quizzes" : "No quizzes taken yet"}
          </p>
        </div>
      </div>

      {/* Pending Course Approvals Section */}
      {pendingCourses.length > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/[0.04] p-6 shadow-sm space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    Enrollment Pending Admin Approval
                  </h2>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    {pendingCourses.length} Pending
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your enrollment request has been submitted. Platform admin approval is required before classroom access unlocks.
                </p>
              </div>
            </div>
            <Link
              href="/courses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Browse Catalog &rarr;
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pendingCourses.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-amber-500/20 bg-card p-4 flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {c.coverImage ? (
                    <img
                      src={c.coverImage}
                      alt={c.title}
                      className="h-16 w-16 rounded-xl object-cover border border-border shrink-0 shadow-sm"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-bold text-primary uppercase text-[10px]">{c.category}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: "4s" }} /> In Review
                      </span>
                    </div>
                    <h4 className="mt-1 font-bold text-foreground text-sm line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <span className="text-[11px] text-muted-foreground">Instructor: {c.instructor.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    <Clock className="h-3 w-3" /> Awaiting Admin
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Enrolled Courses & Study Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrolled Courses (2 cols) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">In Progress Courses</h2>
              <p className="text-xs text-muted-foreground">Pick up right where you left off</p>
            </div>
            <Link
              href="/user/courses"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all ({enrolledCourses.length}) &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {enrolledCourses.map((c, i) => {
              // Calculate lesson count & completed lessons for this course
              const allLessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
              const finishedInCourse = allLessonIds.filter((id) =>
                currentUser.completedLessonIds.includes(id)
              ).length;
              const progressPct =
                allLessonIds.length > 0
                  ? Math.round((finishedInCourse / allLessonIds.length) * 100)
                  : 30;

              return (
                <div
                  key={c.id}
                  className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start sm:items-center gap-3.5">
                      {c.coverImage ? (
                        <img
                          src={c.coverImage}
                          alt={c.title}
                          className="h-14 w-20 shrink-0 rounded-2xl object-cover border border-border shadow-xs"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                            {c.category}
                          </span>
                          <span className="text-xs text-muted-foreground">• {c.level}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground leading-snug">{c.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.tagline}</p>
                      </div>
                    </div>

                    <Link
                      href={`/user/learn/${c.id}`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105"
                    >
                      <PlayCircle className="h-4 w-4" /> Continue
                    </Link>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Course Completion</span>
                      <span className="text-primary">{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-primary transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {enrolledCourses.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <h3 className="mt-2 text-sm font-bold">No active courses yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Browse our library to enroll in your first AI-adaptive course.
                </p>
                <Link
                  href="/courses"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  Explore Catalog <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Activity Chart (1 col) */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Weekly Study Time</h2>
            <p className="text-xs text-muted-foreground">Minutes learned this week</p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <p className="text-xl font-extrabold text-foreground">{formattedStudyTime}</p>
                <p className="text-[11px] text-muted-foreground">Total study time</p>
              </div>
              {totalMinutes > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" /> Active Learner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  Start lessons to log hours
                </span>
              )}
            </div>

            <div className="mt-4 h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicStudyData}>
                  <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="minutes" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Practice Quiz CTA */}
            <div className="mt-4 rounded-2xl bg-muted/60 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Daily Quiz Ready
                </span>
                <Link
                  href="/user/quizzes"
                  className="font-bold text-primary hover:underline"
                >
                  Take Quiz &rarr;
                </Link>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Earn 50 XP & maintain your {currentUser.streakDays}-day streak with a 2-minute quick check.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
