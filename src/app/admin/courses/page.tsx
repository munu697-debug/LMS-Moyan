"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen,
  Users,
  Star,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminCoursesPage() {
  const { courses, approveCourse, rejectCourse } = useAppStore();
  const [filter, setFilter] = useState<"all" | "pending_approval" | "published" | "draft">(
    "all"
  );

  const filtered = courses.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const handleApprove = (id: string, title: string) => {
    approveCourse(id);
    toast.success(`"${title}" approved! It is now live on the public course marketplace. 🎉`);
  };

  const handleReject = (id: string, title: string) => {
    rejectCourse(id);
    toast.info(`"${title}" returned to draft status for instructor revision.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Marketplace Quality Control
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            Course Approval & Catalog Oversight
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Inspect instructor submissions, review syllabus modules, and publish to the live catalog.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-3 text-xs font-semibold">
        {(["all", "pending_approval", "published", "draft"] as const).map((tab) => {
          const count =
            tab === "all"
              ? courses.length
              : courses.filter((c) => c.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 capitalize transition-all ${
                filter === tab
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.replace("_", " ")}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  filter === tab ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filtered.map((course) => {
          const isPending = course.status === "pending_approval";
          return (
            <div
              key={course.id}
              className={`rounded-3xl border bg-card p-6 shadow-sm transition-all ${
                isPending ? "border-purple-500/50 bg-purple-500/[0.02]" : "border-border"
              }`}
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        course.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : course.status === "pending_approval"
                          ? "bg-amber-500/10 text-amber-600 animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {course.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-purple-600">{course.category}</span>
                    <span className="text-xs text-muted-foreground">• {course.level}</span>
                    <span className="text-xs font-bold text-foreground">• ${course.price}</span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                  <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">
                    {course.description || course.tagline}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      loading="lazy"
                      decoding="async"
                      className="h-6 w-6 rounded-full border border-border object-cover"
                    />
                    <span>Instructor: <strong className="text-foreground">{course.instructor.name}</strong></span>
                    <span>• {course.modules.length} Modules ({course.modules.flatMap((m) => m.lessons).length} Lessons)</span>
                  </div>
                </div>

                {/* Approval Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  <Link
                    href={`/user/learn/${course.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview Syllabus
                  </Link>

                  {isPending && (
                    <>
                      <button
                        onClick={() => handleReject(course.id, course.title)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-500/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject / Return
                      </button>

                      <button
                        onClick={() => handleApprove(course.id, course.title)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-transform hover:scale-105"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve for Marketplace
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
            No courses match the selected status filter.
          </div>
        )}
      </div>
    </div>
  );
}
