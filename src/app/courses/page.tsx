"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function CoursesCatalogPage() {
  const { courses, currentUser, enrollInCourse } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const publishedCourses = courses.filter((c) => c.status === "published");

  const categories = [
    "all",
    "Generative AI",
    "Data Science",
    "Web Dev & AI",
    "UI Design",
  ];

  const filtered = publishedCourses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || c.level === selectedLevel;
    return matchesSearch && matchesCat && matchesLevel;
  });

  const handleEnroll = (courseId: string, courseTitle: string) => {
    enrollInCourse(courseId);
    toast.success(`Enrolled in "${courseTitle}"! Welcome to the classroom. 🎉`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Adaptive Curriculum Marketplace
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Explore AI Learning Paths
        </h1>
        <p className="text-xs text-muted-foreground sm:text-base leading-relaxed">
          Master generative AI, machine learning calculus, and production copilots with your personal Gemini AI tutor.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses, skills, or frameworks..."
              className="w-full rounded-2xl border-0 bg-transparent pl-10 pr-4 text-xs sm:text-sm outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 border-t border-border pt-3 sm:border-t-0 sm:pt-0">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-2xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground outline-none"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Topics" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => {
          const isEnrolled = currentUser?.enrolledCourseIds?.includes(course.id) ?? false;
          return (
            <div
              key={course.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div>
                <div className="relative h-48 bg-gradient-primary p-4 text-primary-foreground">
                  <div className="absolute inset-0 bg-grid opacity-60" />
                  <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md">
                    {course.level}
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold">
                    ${course.price}
                  </span>
                  <BookOpen className="absolute bottom-4 right-4 h-16 w-16 text-primary-foreground/30 transition-transform group-hover:scale-110" />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
                      {course.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {course.duration}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-bold text-foreground leading-snug">
                    {course.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {course.tagline}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        loading="lazy"
                        decoding="async"
                        className="h-7 w-7 rounded-full border border-border object-cover"
                      />
                      <span className="font-medium text-foreground">{course.instructor.name}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {course.rating}
                      <span className="text-muted-foreground">({course.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 bg-muted/30 p-5 flex items-center gap-2">
                {isEnrolled ? (
                  <Link
                    href={`/user/learn/${course.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
                  >
                    <PlayCircle className="h-4 w-4" /> Go to Classroom
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleEnroll(course.id, course.title)}
                      className="flex-1 rounded-2xl bg-gradient-primary py-3 text-xs font-bold text-primary-foreground shadow-elegant transition-transform hover:scale-[1.02]"
                    >
                      Enroll in Course
                    </button>
                    <Link
                      href={`/user/learn/${course.id}`}
                      className="rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      Preview
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 text-base font-bold">No courses found matching your query</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your category filter or search keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
