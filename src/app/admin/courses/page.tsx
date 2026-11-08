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
  UserCheck,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { useAppStore, Course } from "@/lib/store";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

export default function AdminCoursesPage() {
  const {
    courses,
    categories,
    addCategory,
    users,
    currentUser,
    approveCourse,
    rejectCourse,
    createCourse,
    deleteCourse,
    updateCourse,
    enrollmentRequests,
    approveEnrollmentRequest,
    rejectEnrollmentRequest,
  } = useAppStore();
  const [filter, setFilter] = useState<"all" | "pending_approval" | "published" | "draft" | "enrollments">(
    "all"
  );

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // New Category State
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // New Course Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Generative AI");
  const [newLevel, setNewLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [newPrice, setNewPrice] = useState(2999);
  const [newDuration, setNewDuration] = useState("4h 30m");
  const [newCoverImage, setNewCoverImage] = useState("");
  const [newInstructorId, setNewInstructorId] = useState<string>(
    users.find((u) => u.role === "tutor")?.id || currentUser?.id || ""
  );
  // Dynamic Modules & Lessons State
  const [courseModules, setCourseModules] = useState<
    {
      id: string;
      title: string;
      lessons: { id: string; title: string; videoUrl: string }[];
    }[]
  >([
    {
      id: "m-1",
      title: "Module 1: Foundations & Core Architecture",
      lessons: [
        {
          id: "l-1",
          title: "Introduction & Environment Setup",
          videoUrl: "https://www.youtube.com/embed/jC4v5AS4RIM",
        },
      ],
    },
  ]);

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

  const handleApproveEnrollment = (reqId: string, studentName: string, courseTitle: string) => {
    approveEnrollmentRequest(reqId);
    toast.success(`Approved enrollment for ${studentName} in "${courseTitle}"! Classroom access unlocked. 🎉`);
  };

  const handleRejectEnrollment = (reqId: string, studentName: string, courseTitle: string) => {
    rejectEnrollmentRequest(reqId);
    toast.info(`Enrollment request for ${studentName} in "${courseTitle}" was rejected.`);
  };

  const handleAddNewCategory = () => {
    if (!customCategoryInput.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const cat = customCategoryInput.trim();
    addCategory(cat);
    setNewCategory(cat);
    setCustomCategoryInput("");
    setIsAddingCustomCategory(false);
    toast.success(`Category "${cat}" added successfully! ✨`);
  };

  // Module & Lesson Handlers
  const handleAddModule = () => {
    const nextIdx = courseModules.length + 1;
    setCourseModules((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${nextIdx}`,
        title: `Module ${nextIdx}: Advanced Implementation`,
        lessons: [
          {
            id: `l-${Date.now()}-1`,
            title: `Key Principles & Practical Walkthrough`,
            videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
          },
        ],
      },
    ]);
  };

  const handleRemoveModule = (modIdx: number) => {
    if (courseModules.length <= 1) {
      toast.error("A course must have at least one module.");
      return;
    }
    setCourseModules((prev) => prev.filter((_, idx) => idx !== modIdx));
  };

  const handleUpdateModuleTitle = (modIdx: number, title: string) => {
    setCourseModules((prev) =>
      prev.map((m, idx) => (idx === modIdx ? { ...m, title } : m))
    );
  };

  const handleAddLesson = (modIdx: number) => {
    setCourseModules((prev) =>
      prev.map((m, idx) => {
        if (idx === modIdx) {
          const nextLessonNum = m.lessons.length + 1;
          return {
            ...m,
            lessons: [
              ...m.lessons,
              {
                id: `l-${Date.now()}-${nextLessonNum}`,
                title: `Lesson ${nextLessonNum}: Hands-on Deep Dive`,
                videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
              },
            ],
          };
        }
        return m;
      })
    );
  };

  const handleRemoveLesson = (modIdx: number, lessonIdx: number) => {
    setCourseModules((prev) =>
      prev.map((m, idx) => {
        if (idx === modIdx) {
          if (m.lessons.length <= 1) {
            toast.error("Each module must have at least one lesson.");
            return m;
          }
          return {
            ...m,
            lessons: m.lessons.filter((_, lIdx) => lIdx !== lessonIdx),
          };
        }
        return m;
      })
    );
  };

  const handleUpdateLesson = (
    modIdx: number,
    lessonIdx: number,
    field: "title" | "videoUrl",
    val: string
  ) => {
    setCourseModules((prev) =>
      prev.map((m, idx) => {
        if (idx === modIdx) {
          return {
            ...m,
            lessons: m.lessons.map((l, lIdx) =>
              lIdx === lessonIdx ? { ...l, [field]: val } : l
            ),
          };
        }
        return m;
      })
    );
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
    const targetTitle = courseToDelete.title;
    const targetId = courseToDelete.id;
    deleteCourse(targetId);
    setCourseToDelete(null);
    toast.success(`"${targetTitle}" has been permanently deleted from catalog.`);
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
      name: selectedInstructorUser?.name || "Super Admin",
      title: selectedInstructorUser?.title || (selectedInstructorUser?.role === "admin" ? "Platform Administrator" : "Verified Instructor"),
      avatar: selectedInstructorUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };

    const formattedModules = courseModules.map((m, mIdx) => ({
      id: m.id || `mod-${Date.now()}-${mIdx}`,
      title: m.title.trim() || `Module ${mIdx + 1}`,
      lessons: m.lessons.map((l, lIdx) => ({
        id: l.id || `l-${Date.now()}-${mIdx}-${lIdx}`,
        title: l.title.trim() || `Lesson ${lIdx + 1}`,
        duration: "18:20",
        videoUrl: l.videoUrl.trim() || "https://www.youtube.com/embed/jC4v5AS4RIM",
        summary: `Practical lesson on ${l.title}`,
        content: `Welcome to this course module. Review the video instructions and explore the real-time AI tutor dock on the right.`,
      })),
    }));

    createCourse({
      title: newTitle.trim(),
      tagline: newTagline.trim() || "Master high-impact skills with adaptive AI tutoring.",
      description: newDescription.trim() || newTagline.trim() || "Comprehensive interactive curriculum designed for practical application.",
      category: newCategory,
      level: newLevel,
      price: Number(newPrice) || 0,
      duration: newDuration,
      coverImage: newCoverImage.trim() || undefined,
      status: "published",
      instructor: instructorObj,
      modules: formattedModules,
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

    toast.success(`Course "${newTitle}" with ${formattedModules.length} module(s) created & published! 🚀`);
    setIsCreateModalOpen(false);
    // Reset fields
    setNewTitle("");
    setNewTagline("");
    setNewDescription("");
    setNewPrice(2999);
    setNewCoverImage("");
    setCourseModules([
      {
        id: "m-1",
        title: "Module 1: Foundations & Core Architecture",
        lessons: [
          {
            id: "l-1",
            title: "Introduction & Environment Setup",
            videoUrl: "https://www.youtube.com/embed/jC4v5AS4RIM",
          },
        ],
      },
    ]);
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
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3 text-xs font-semibold">
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

        <button
          onClick={() => setFilter("enrollments")}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
            filter === "enrollments"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>Student Enrollment Requests</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              filter === "enrollments"
                ? "bg-white/20 text-white"
                : "bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold"
            }`}
          >
            {enrollmentRequests.filter((r) => r.status === "pending").length}
          </span>
        </button>
      </div>

      {filter === "enrollments" ? (
        <div className="space-y-4">
          {enrollmentRequests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-3 text-base font-bold">No enrollment requests yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                When students request enrollment in courses that require approval, they will appear here.
              </p>
            </div>
          ) : (
            enrollmentRequests.map((req) => (
              <div
                key={req.id}
                className={`rounded-3xl border bg-card p-6 shadow-sm transition-all ${
                  req.status === "pending"
                    ? "border-amber-500/50 bg-amber-500/[0.02]"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          req.status === "pending"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : req.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {req.status === "pending"
                          ? "Pending Admin Approval"
                          : req.status === "approved"
                          ? "Approved"
                          : "Rejected"}
                      </span>
                      <span className="text-xs text-muted-foreground">• Requested {req.requestedAt}</span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {req.courseTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        Student: {req.studentName} ({req.studentEmail})
                      </span>
                      <span className="font-semibold text-primary">
                        ₹{req.coursePrice} • {req.courseCategory}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() =>
                            handleApproveEnrollment(req.id, req.studentName, req.courseTitle)
                          }
                          className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 hover:scale-105 transition-all cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Student
                        </button>
                        <button
                          onClick={() =>
                            handleRejectEnrollment(req.id, req.studentName, req.courseTitle)
                          }
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        Status: {req.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Courses List */
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
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="h-20 w-32 shrink-0 rounded-2xl object-cover border border-border shadow-xs"
                      />
                    ) : (
                      <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        <BookOpen className="h-7 w-7 opacity-50" />
                      </div>
                    )}
                    <div className="space-y-1.5">
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
                        <span className="text-xs font-bold text-foreground">• ₹{course.price}</span>
                      </div>

                      <h3 className="text-base font-bold text-foreground leading-snug">{course.title}</h3>
                      <p className="max-w-2xl text-xs text-muted-foreground leading-relaxed">
                        {course.description || course.tagline}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                        <img
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          loading="lazy"
                          decoding="async"
                          className="h-5 w-5 rounded-full border border-border object-cover"
                        />
                        <span>Instructor: <strong className="text-foreground">{course.instructor.name}</strong></span>
                        <span>• {course.modules.length} Modules ({course.modules.flatMap((m) => m.lessons).length} Lessons)</span>
                      </div>
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
          <div className="rounded-3xl border border-dashed border-border p-16 text-center space-y-3">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="text-base font-bold text-foreground">
              {courses.length === 0 ? "No courses in catalog yet" : "No courses match the selected status filter"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {courses.length === 0
                ? "All demo courses have been cleared. Click below to create and publish your first live course."
                : "Try selecting a different filter tab above to view other courses."}
            </p>
            {courses.length === 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create First Course
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )}

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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                      className="text-[10px] font-bold text-purple-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> {isAddingCustomCategory ? "Choose Existing" : "+ New Category"}
                    </button>
                  </div>

                  {isAddingCustomCategory ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewCategory();
                          }
                        }}
                        placeholder="e.g. Cybersecurity"
                        className="w-full rounded-2xl border border-purple-600 bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-purple-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="rounded-2xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => {
                        if (e.target.value === "__add_new__") {
                          setIsAddingCustomCategory(true);
                        } else {
                          setNewCategory(e.target.value);
                        }
                      }}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__add_new__">+ Add New Category...</option>
                    </select>
                  )}
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
                  <label className="text-xs font-bold text-foreground">Price (₹ INR)</label>
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

              {/* Course Preview / Cover Image Section */}
              <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-purple-600" />
                    <label className="text-xs font-bold text-foreground">
                      Course Preview Image (Cover Photo)
                    </label>
                  </div>
                  {newCoverImage && (
                    <button
                      type="button"
                      onClick={() => setNewCoverImage("")}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* File Upload with Cloudinary */}
                <ImageUpload
                  label=""
                  currentImageUrl={newCoverImage}
                  onImageUploaded={(url) => setNewCoverImage(url)}
                />

                {/* Direct URL input with preset chips */}
                <div className="space-y-1.5 pt-1">
                  <input
                    type="url"
                    value={newCoverImage}
                    onChange={(e) => setNewCoverImage(e.target.value)}
                    placeholder="Or enter direct image URL (e.g. https://images.unsplash.com/...)"
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-semibold text-foreground outline-none focus:border-purple-600"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Suggested Presets:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewCoverImage(
                          "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80"
                        )
                      }
                      className="rounded-lg border border-border bg-background px-2 py-0.5 hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      🤖 AI & LLMs
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewCoverImage(
                          "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80"
                        )
                      }
                      className="rounded-lg border border-border bg-background px-2 py-0.5 hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      📊 Data Science
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewCoverImage(
                          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                        )
                      }
                      className="rounded-lg border border-border bg-background px-2 py-0.5 hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      💻 Full-Stack
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewCoverImage(
                          "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80"
                        )
                      }
                      className="rounded-lg border border-border bg-background px-2 py-0.5 hover:bg-purple-500/10 hover:border-purple-500/40 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      🔒 Security
                    </button>
                  </div>
                </div>
              </div>

              {/* Curriculum Modules & Lessons Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-purple-600" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Curriculum Modules ({courseModules.length}) & Lessons ({courseModules.flatMap((m) => m.lessons).length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="inline-flex items-center gap-1 rounded-xl bg-purple-600/10 border border-purple-500/30 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Add Another Module
                  </button>
                </div>

                {courseModules.map((module, modIdx) => (
                  <div key={module.id} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                    {/* Module Header Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-1 items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-[10px] font-extrabold text-white">
                          {modIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => handleUpdateModuleTitle(modIdx, e.target.value)}
                          placeholder={`Module ${modIdx + 1} Title...`}
                          className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-purple-600"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddLesson(modIdx)}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-600 hover:bg-purple-500/20"
                          title="Add lesson to this module"
                        >
                          <Plus className="h-3 w-3" /> Lesson
                        </button>
                        {courseModules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(modIdx)}
                            className="rounded-lg border border-rose-500/30 p-1 text-rose-600 hover:bg-rose-500/10"
                            title="Remove module"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    <div className="space-y-2.5 pl-2 sm:pl-4 border-l-2 border-purple-500/30">
                      {module.lessons.map((lesson, lessonIdx) => (
                        <div
                          key={lesson.id}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-12 items-center rounded-xl bg-background/90 p-2.5 border border-border/60"
                        >
                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                              Lesson {lessonIdx + 1} Title
                            </label>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "title", e.target.value)
                              }
                              placeholder="e.g. Core Architecture Setup"
                              className="w-full rounded-lg border border-input bg-background p-1.5 text-xs outline-none focus:border-purple-600"
                            />
                          </div>

                          <div className="sm:col-span-6">
                            <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">
                              Video Embed URL (YouTube/Vimeo)
                            </label>
                            <input
                              type="text"
                              value={lesson.videoUrl}
                              onChange={(e) =>
                                handleUpdateLesson(modIdx, lessonIdx, "videoUrl", e.target.value)
                              }
                              placeholder="https://www.youtube.com/embed/..."
                              className="w-full rounded-lg border border-input bg-background p-1.5 text-xs font-mono outline-none focus:border-purple-600"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end pt-2 sm:pt-0">
                            {module.lessons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLesson(modIdx, lessonIdx)}
                                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md"
                                title="Remove lesson"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Big Prominent Add Another Module Button */}
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-500/50 bg-purple-500/5 py-3.5 text-xs font-bold text-purple-600 hover:bg-purple-500/10 hover:border-purple-600 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" /> + Add Another Module (Module {courseModules.length + 1})
                </button>
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
