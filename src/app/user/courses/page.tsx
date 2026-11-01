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
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function UserCoursesPage() {
  const { currentUser, courses } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const enrolledCourseIds = currentUser?.enrolledCourseIds || [];
  const enrolledCourses = courses.filter((c) =>
    enrolledCourseIds.includes(c.id)
  );

  const filteredCourses = enrolledCourses.filter((c) => {
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
            My Enrolled Courses ({enrolledCourses.length})
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage your courses, track lesson completion, and access learning modules.
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-105"
        >
          <BookOpen className="h-3.5 w-3.5" /> Explore Catalog
        </Link>
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
                <div className="relative h-40 bg-gradient-primary p-4">
                  <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-[10px] font-bold text-primary backdrop-blur-md">
                    {c.level}
                  </span>
                  <BookOpen className="absolute bottom-3 right-3 h-12 w-12 text-primary-foreground/30" />
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
                </div>
              </div>

              <div className="border-t border-border/60 bg-muted/30 p-4">
                <Link
                  href={`/user/learn/${c.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  <PlayCircle className="h-3.5 w-3.5" /> Continue Course
                </Link>
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
