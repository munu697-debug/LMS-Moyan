"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  Clock,
  Star,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function UserCoursesPage() {
  const { currentUser, courses, enrollmentRequests } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"enrolled" | "pending">("enrolled");

  const isStudentEnrolledInCourse = (course: (typeof courses)[0]): boolean => {
    if (!currentUser) return false;
    if (currentUser.enrolledCourseIds?.includes(course.id)) return true;
    const studentEmail = currentUser.email?.toLowerCase();
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

  const isStudentPendingForCourse = (course: (typeof courses)[0]): boolean => {
    if (!currentUser) return false;
    if (isStudentEnrolledInCourse(course)) return false;
    const studentEmail = currentUser.email?.toLowerCase();
    const hasPendingRequest = enrollmentRequests.some((r) => {
      const emailMatches = Boolean(studentEmail && r.studentEmail?.toLowerCase() === studentEmail);
      const idMatches = r.studentId === currentUser.id;
      const userMatches = idMatches || emailMatches;
      if (!userMatches || r.status !== "pending") return false;

      const courseIdMatches =
        r.courseId === course.id ||
        (course.id.includes("1794196371812") && r.courseId.includes("lovable-vibe-coding")) ||
        (course.id.includes("lovable-vibe-coding") && r.courseId.includes("1794196371812"));
      const titleMatches = Boolean(
        r.courseTitle && course.title && r.courseTitle.toLowerCase().trim() === course.title.toLowerCase().trim()
      );
      return courseIdMatches || titleMatches;
    });
    const inPendingList = (currentUser.pendingCourseIds || []).includes(course.id);
    return hasPendingRequest || inPendingList;
  };

  const enrolledCourses = courses.filter((c) => isStudentEnrolledInCourse(c));
  const pendingCourses = courses.filter((c) => isStudentPendingForCourse(c));

  const displayList = activeTab === "enrolled" ? enrolledCourses : pendingCourses;

  const filteredCourses = displayList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || c.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Learning Portfolio
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            My Courses
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage your courses, track lesson completion, and review admin approval status.
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105"
        >
          <BookOpen className="h-3.5 w-3.5" /> Explore Catalog
        </Link>
      </div>

      {/* Tabs: Enrolled vs Pending */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("enrolled")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
            activeTab === "enrolled"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>Enrolled Courses</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "enrolled" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
            }`}
          >
            {enrolledCourses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all ${
            activeTab === "pending"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Pending Admin Approval</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "pending"
                ? "bg-white/20 text-white"
                : "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold"
            }`}
          >
            {pendingCourses.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search enrolled courses..."
            className="w-full rounded-xl border-0 bg-transparent pl-9 pr-3 text-xs outline-none focus:ring-0 sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-2 sm:border-t-0 sm:pt-0">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground outline-none"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((c) => {
          const allLessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
          const finishedInCourse = currentUser
            ? allLessonIds.filter((id) =>
                currentUser.completedLessonIds.includes(id)
              ).length
            : 0;
          const progressPct =
            allLessonIds.length > 0
              ? Math.round((finishedInCourse / allLessonIds.length) * 100)
              : 25;

          return (
            <div
              key={c.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-gradient-primary">
                  {c.coverImage ? (
                    <img
                      src={c.coverImage}
                      alt={c.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-grid opacity-60" />
                  )}
                  {c.coverImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                  )}
                  <div className="relative z-10 flex h-full flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-[10px] font-bold text-primary backdrop-blur-md">
                        {c.level}
                      </span>
                      <span className="rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        ₹{c.price}
                      </span>
                    </div>
                    {!c.coverImage && (
                      <BookOpen className="self-end h-12 w-12 text-primary-foreground/30" />
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">{c.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {c.duration}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-foreground leading-snug">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.tagline}</p>

                  {activeTab === "enrolled" ? (
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary">{progressPct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-primary"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 animate-pulse text-amber-500" />
                      <span className="text-[11px] font-medium">Awaiting administrator verification & approval</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border/60 bg-muted/30 p-4">
                {activeTab === "enrolled" ? (
                  <Link
                    href={`/user/learn/${c.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                  >
                    <PlayCircle className="h-3.5 w-3.5" /> Continue Course
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "5s" }} />
                      <span>Pending Approval</span>
                    </div>
                    <Link
                      href={`/user/learn/${c.id}`}
                      className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      Preview Syllabus
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-2 text-sm font-bold">No courses match your filter</h3>
            <p className="mt-1 text-xs text-muted-foreground">Try clearing search terms or check our catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
