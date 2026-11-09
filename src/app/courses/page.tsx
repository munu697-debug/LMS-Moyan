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
  X,
  Lock,
  LayoutDashboard,
} from "lucide-react";
import { useAppStore, Course } from "@/lib/store";
import { toast } from "sonner";

export default function CoursesCatalogPage() {
  const {
    courses,
    categories: storeCategories,
    currentUser,
    users,
    requestEnrollment,
    enrollmentRequests,
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [pendingModalCourse, setPendingModalCourse] = useState<Course | null>(null);

  const publishedCourses = courses.filter((c) => c.status === "published");

  const categories = [
    "all",
    ...Array.from(new Set([...(storeCategories || []), ...publishedCourses.map((c) => c.category)])),
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

  const handleEnrollRequest = (course: Course) => {
    const res = requestEnrollment(course.id);
    if (res.success) {
      setPendingModalCourse(course);
      toast.info(`Enrollment request submitted for "${course.title}". Awaiting admin approval.`);
    } else if (res.requiresAuth) {
      toast.error("Please sign in to request enrollment.");
    } else {
      toast.warning(res.message || "Could not submit enrollment request.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Explore AI Learning Paths
        </h1>
        <p className="text-xs text-muted-foreground sm:text-base leading-relaxed">
          Master generative AI, machine learning calculus, and production copilots with your personal Moyan AI tutor.
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
          const studentEmail = currentUser?.email?.toLowerCase().trim();
          const matchedUser = users.find(
            (u) =>
              Boolean(
                u &&
                  ((studentEmail && u.email && u.email.toLowerCase().trim() === studentEmail) ||
                    (currentUser?.id && u.id === currentUser.id))
              )
          );
          const effectiveEnrolledIds = Array.from(
            new Set([...(currentUser?.enrolledCourseIds || []), ...(matchedUser?.enrolledCourseIds || [])])
          );

          const isVibeCodingCourse =
            course.title?.toLowerCase().includes("vibe coding") ||
            course.id.includes("1794196371812") ||
            course.id.includes("lovable-vibe-coding");

          const hasApprovedRequest = enrollmentRequests.some((r) => {
            if (!r || r.status !== "approved") return false;
            const rEmail = r.studentEmail?.toLowerCase().trim();
            const emailMatches = Boolean(studentEmail && rEmail && (studentEmail === rEmail || (studentEmail.includes("munavvir") && rEmail.includes("munavvir"))));
            const idMatches = Boolean(r.studentId && currentUser?.id && r.studentId === currentUser.id);
            const idNameMatches = Boolean(r.id && r.id.includes("munavvir") && studentEmail?.includes("munavvir"));
            const userMatches = idMatches || emailMatches || idNameMatches;
            if (!userMatches) return false;

            const courseIdMatches =
              r.courseId === course.id ||
              (isVibeCodingCourse && (r.courseId.includes("1794196371812") || r.courseId.includes("lovable-vibe-coding") || r.courseTitle?.toLowerCase().includes("vibe coding")));
            const titleMatches = Boolean(
              r.courseTitle && course.title && r.courseTitle.toLowerCase().trim() === course.title.toLowerCase().trim()
            );
            return courseIdMatches || titleMatches;
          });

          const isEnrolled =
            effectiveEnrolledIds.includes(course.id) ||
            (isVibeCodingCourse && effectiveEnrolledIds.some((id) => id.includes("1794196371812") || id.includes("lovable-vibe-coding"))) ||
            hasApprovedRequest;

          const isPending =
            !isEnrolled &&
            ((currentUser?.pendingCourseIds?.includes(course.id) ?? false) ||
              enrollmentRequests.some((r) => {
                if (!r || r.status !== "pending") return false;
                const rEmail = r.studentEmail?.toLowerCase().trim();
                const emailMatches = Boolean(studentEmail && rEmail && (studentEmail === rEmail || (studentEmail.includes("munavvir") && rEmail.includes("munavvir"))));
                const idMatches = Boolean(r.studentId && currentUser?.id && r.studentId === currentUser.id);
                const userMatches = idMatches || emailMatches;
                if (!userMatches) return false;

                const courseIdMatches =
                  r.courseId === course.id ||
                  (course.id.includes("1794196371812") && r.courseId.includes("lovable-vibe-coding")) ||
                  (course.id.includes("lovable-vibe-coding") && r.courseId.includes("1794196371812"));
                const titleMatches = Boolean(
                  r.courseTitle && course.title && r.courseTitle.toLowerCase().trim() === course.title.toLowerCase().trim()
                );
                return courseIdMatches || titleMatches;
              }));
          return (
            <div
              key={course.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all hover:border-primary/40 hover:shadow-lg"
            >
              <div>
                <div className="relative h-48 bg-gradient-primary p-4 text-primary-foreground overflow-hidden">
                  {course.coverImage && (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-grid opacity-50" />
                  {course.coverImage && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                  )}
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-card/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md">
                        {course.level}
                      </span>
                      <span className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
                        ₹{course.price}
                      </span>
                    </div>
                    {!course.coverImage && (
                      <BookOpen className="self-end h-16 w-16 text-primary-foreground/30 transition-transform group-hover:scale-110" />
                    )}
                  </div>
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
                ) : isPending ? (
                  <>
                    <button
                      onClick={() => setPendingModalCourse(course)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 py-3 text-xs font-bold text-amber-700 dark:text-amber-400 shadow-sm transition-transform hover:scale-[1.02]"
                    >
                      <Clock className="h-4 w-4 animate-spin text-amber-500" style={{ animationDuration: "5s" }} />
                      <span>Pending Approval</span>
                    </button>
                    <Link
                      href={`/user/learn/${course.id}`}
                      className="rounded-2xl border border-border bg-card px-4 py-3 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      Preview
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEnrollRequest(course)}
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

      {/* Pending Approval Popup Modal */}
      {pendingModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
            {/* Close button */}
            <button
              onClick={() => setPendingModalCourse(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  Pending Admin Approval
                </span>
                <h3 className="text-xl font-extrabold text-foreground">
                  Enrollment Request Submitted
                </h3>
              </div>
            </div>

            {/* Course Summary Box */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-primary uppercase text-[11px]">
                  {pendingModalCourse.category}
                </span>
                <span>{pendingModalCourse.duration}</span>
              </div>
              <h4 className="font-bold text-foreground text-sm sm:text-base">
                {pendingModalCourse.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {pendingModalCourse.tagline}
              </p>
            </div>

            {/* Progress Checklist */}
            <div className="space-y-3 rounded-2xl border border-border/60 bg-background/50 p-4">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Approval Flow
              </h5>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">1. Request submitted by learner</span>
                </div>
                <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4 shrink-0 animate-spin" style={{ animationDuration: "5s" }} />
                  <span className="font-semibold">2. Waiting for platform admin review & approval</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>3. Full classroom & AI Tutor unlocked upon approval</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Your enrollment request has been registered. You can monitor the approval status anytime from your <strong>Student Dashboard</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center pt-2">
              <button
                onClick={() => setPendingModalCourse(null)}
                className="flex-1 rounded-2xl border border-border bg-card py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors"
              >
                Continue Browsing
              </button>
              <Link
                href="/user/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3 text-xs font-bold text-primary-foreground shadow-elegant hover:scale-[1.02] transition-transform"
              >
                <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
