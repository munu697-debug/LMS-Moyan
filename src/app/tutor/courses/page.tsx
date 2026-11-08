"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Eye,
  Trash2,
  Edit3,
  Users,
  Star,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function TutorCoursesPage() {
  const { courses, deleteCourse, currentUser } = useAppStore();
  const [filter, setFilter] = useState("all");

  const myCourses = currentUser
    ? courses.filter(
        (c) =>
          c.instructor.id === currentUser.id ||
          c.instructor.name === currentUser.name
      )
    : [];

  const filtered = myCourses.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteCourse(id);
      toast.success("Course deleted successfully.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Curriculum Studio
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            My Created Courses ({myCourses.length})
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage course content, preview student experience, and track approvals.
          </p>
        </div>

        <Link
          href="/tutor/courses/new"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
        >
          <PlusCircle className="h-4 w-4" /> Create New Course
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-3 text-xs font-semibold">
        {["all", "published", "pending_approval", "draft"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-3 py-1.5 capitalize transition-all ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Courses Table / Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md"
          >
            <div>
              <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-md ${
                    course.status === "published"
                      ? "bg-emerald-500/90 text-white"
                      : "bg-amber-500/90 text-white"
                  }`}
                >
                  {course.status.replace("_", " ").toUpperCase()}
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-bold">
                  ₹{course.price}
                </span>
                <BookOpen className="absolute bottom-3 right-3 h-12 w-12 text-white/20" />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-blue-600">{course.category}</span>
                  <span>{course.level}</span>
                </div>

                <h3 className="mt-2 text-base font-bold text-foreground leading-snug">
                  {course.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.tagline}</p>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    {course.enrolledCount.toLocaleString()} Students
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {course.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 p-4 text-xs">
              <Link
                href={`/user/learn/${course.id}`}
                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
              >
                <Eye className="h-3.5 w-3.5" /> Preview
              </Link>
              <button
                onClick={() => handleDelete(course.id, course.title)}
                className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-2 text-sm font-bold">No courses found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first course to share your expertise on Moyan Learn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
