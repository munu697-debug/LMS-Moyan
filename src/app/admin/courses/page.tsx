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
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Clock,
  DollarSign,
  Film,
} from "lucide-react";
import { useAppStore, Course } from "@/lib/store";
import { toast } from "sonner";

export default function AdminCoursesPage() {
  const { courses, users, currentUser, approveCourse, rejectCourse, createCourse, deleteCourse, updateCourse } = useAppStore();
  const [filter, setFilter] = useState<"all" | "pending_approval" | "published" | "draft">(
    "all"
  );

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // New Course Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Generative AI");
  const [newLevel, setNewLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [newPrice, setNewPrice] = useState(49);
  const [newDuration, setNewDuration] = useState("4h 30m");
  const [newInstructorId, setNewInstructorId] = useState<string>(
    users.find((u) => u.role === "tutor")?.id || currentUser?.id || ""
  );
  const [newLessonTitle, setNewLessonTitle] = useState("Foundations & Core Architecture");
  const [newVideoUrl, setNewVideoUrl] = useState("https://www.youtube.com/embed/jC4v5AS4RIM");

  const instructors = users.filter((u) => u.role === "tutor" || u.role === "admin");

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

  const handleTogglePublish = (course: Course) => {
    const nextStatus = course.status === "published" ? "draft" : "published";
    updateCourse(course.id, { status: nextStatus });
    if (nextStatus === "published") {
      toast.success(`"${course.title}" is now published and visible to students.`);
    } else {
      toast.info(`"${course.title}" moved to draft status.`);
    }
  };

  const handleDeleteCourse = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id);
    toast.success(`"${courseToDelete.title}" has been permanently deleted from catalog.`);
    setCourseToDelete(null);
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    const selectedInstructorUser = users.find((u) => u.id === newInstructorId) || currentUser;
    const instructorObj = {
      id: selectedInstructorUser?.id || "admin-system",
      name: selectedInstructorUser?.name || "Marcus Vance",
      title: selectedInstructorUser?.title || (selectedInstructorUser?.role === "admin" ? "Platform Administrator" : "Verified Instructor"),
      avatar: selectedInstructorUser?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    };

    createCourse({
      title: newTitle.trim(),
      tagline: newTagline.trim() || "Master high-impact skills with adaptive AI tutoring.",
      description: newDescription.trim() || newTagline.trim() || "Comprehensive interactive curriculum designed for practical application.",
      category: newCategory,
      level: newLevel,
      price: Number(newPrice) || 0,
      duration: newDuration,
      status: "published",
      instructor: instructorObj,
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: "Module 1: Core Principles & Setup",
          lessons: [
            {
              id: `l-${Date.now()}-1`,
              title: newLessonTitle || "Introduction & Setup",
              duration: "18:20",
              videoUrl: newVideoUrl || "https://www.youtube.com/embed/jC4v5AS4RIM",
              summary: "Foundational concepts, essential setup, and workflow overview.",
              content: "Welcome to this course module. Review the video instructions and explore the real-time AI tutor dock on the right.",
            },
          ],
        },
      ],
      quiz: [
        {
          id: `q-${Date.now()}-1`,
          question: `What is the primary objective of ${newTitle.trim()}?`,
          options: [
            "Explore foundational principles and real-world implementation",
            "Memorize syntactical definitions only",
            "Run unverified scripts in production",
            "Bypass error diagnostics",
          ],
          correctIndex: 0,
          explanation: "Mastery requires combining conceptual understanding with hands-on application.",
        },
      ],
    });

    toast.success(`Course "${newTitle}" created and published to the live catalog! 🚀`);
    setIsCreateModalOpen(false);
    // Reset fields
    setNewTitle("");
    setNewTagline("");
    setNewDescription("");
    setNewPrice(49);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Marketplace Quality Control
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            Course Approval & Catalog Oversight
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Inspect instructor submissions, review syllabus modules, add new courses, and manage the live catalog.
          </p>
        </div>

        {/* Action Button: Add Course */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Course</span>
        </button>
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
              className={`rounded-3xl border bg-card p-6 shadow-sm transition-all hover:border-purple-500/40 ${
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

                {/* Management Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  <Link
                    href={`/user/learn/${course.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview Syllabus
                  </Link>

                  {/* Toggle publish / unpublish */}
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className={`inline-flex items-center gap-1 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                      course.status === "published"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    }`}
                  >
                    {course.status === "published" ? "Unpublish" : "Publish"}
                  </button>

                  {/* Pending Approval specific buttons */}
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleReject(course.id, course.title)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => handleApprove(course.id, course.title)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </button>
                    </>
                  )}

                  {/* Delete Course Button */}
                  <button
                    onClick={() => setCourseToDelete(course)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-500/20 transition-colors"
                    title="Delete course from platform"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
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

      {/* MODAL: Create New Course */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-600/10 text-purple-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Create & Publish Course</h2>
                  <p className="text-xs text-muted-foreground">Instantly add a course to the live student catalog</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Course Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Next.js 15 Full-Stack Masterclass"
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs sm:text-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Tagline / Brief Hook</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Build real-world production apps with modern server components"
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs sm:text-sm outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                  >
                    <option value="Generative AI">Generative AI</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Web Development">Web Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Difficulty Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Price ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Assigned Instructor</label>
                  <select
                    value={newInstructorId}
                    onChange={(e) => setNewInstructorId(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Total Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 5h 45m"
                    className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Film className="h-4 w-4 text-purple-600" />
                  <span>Module 1 & Initial Video Lesson</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Lesson Title</label>
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background p-2 text-xs outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">Video Embed URL (YouTube/Vimeo)</label>
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background p-2 text-xs outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-2xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Publish Course Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Delete Course */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Delete Course</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-foreground">"{courseToDelete.title}"</strong>? It will be removed immediately from the public course catalog, student enrollments, and syllabus directories.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCourseToDelete(null)}
                className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCourse}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-transform active:scale-95 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
