"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Sparkles,
  Save,
  BookOpen,
  Video,
  HelpCircle,
} from "lucide-react";
import { useAppStore, Course, Module, Lesson, QuizQuestion } from "@/lib/store";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";

export default function NewCoursePage() {
  const router = useRouter();
  const { createCourse, currentUser } = useAppStore();

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Generative AI");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [price, setPrice] = useState(49);
  const [duration, setDuration] = useState("3h 30m");
  const [coverImage, setCoverImage] = useState<string>("");

  // Modules and lessons
  const [modules, setModules] = useState<Module[]>([
    {
      id: "mod-1",
      title: "Module 1: Introduction & Fundamentals",
      lessons: [
        {
          id: `l-${Date.now()}-1`,
          title: "Core Concepts & Setup",
          duration: "15:00",
          videoUrl: "https://www.youtube.com/embed/jC4v5AS4RIM",
          summary: "Overview of fundamental architectures and environment installation.",
          content: "Welcome to this introductory session where we establish baseline mental models...",
        },
      ],
    },
  ]);

  // Quiz questions
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: "q-1",
      question: "What is the primary objective of this module?",
      options: [
        "Learn basic syntax",
        "Master foundational architecture and token mechanics",
        "Configure GPU drivers manually",
        "Deploy to production without testing",
      ],
      correctIndex: 1,
      explanation: "Foundational understanding of architecture and token dynamics is required before advanced prompt engineering.",
    },
  ]);

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        title: `Module ${prev.length + 1}: Advanced Implementation`,
        lessons: [
          {
            id: `l-${Date.now()}`,
            title: "Hands-on Deep Dive",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
            summary: "Practical code walk-through.",
            content: "In this lesson, we build out the production implementation step-by-step...",
          },
        ],
      },
    ]);
  };

  const addLesson = (moduleIdx: number) => {
    setModules((prev) =>
      prev.map((m, idx) => {
        if (idx === moduleIdx) {
          return {
            ...m,
            lessons: [
              ...m.lessons,
              {
                id: `l-${Date.now()}`,
                title: `Lesson ${m.lessons.length + 1}: Practical Application`,
                duration: "18:00",
                videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
                summary: "Deepening your practical mastery.",
                content: "Detailed instructional guide with full commentary...",
              },
            ],
          };
        }
        return m;
      })
    );
  };

  const removeModule = (moduleIdx: number) => {
    setModules((prev) => prev.filter((_, idx) => idx !== moduleIdx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a course title.");
      return;
    }

    createCourse({
      title,
      tagline: tagline || "Comprehensive masterclass designed for curious developers.",
      description: description || "In-depth curriculum crafted by industry practitioners.",
      instructor: {
        id: currentUser.id,
        name: currentUser.name,
        title: currentUser.title || "Senior Instructor",
        avatar: currentUser.avatar,
      },
      category,
      level,
      duration,
      price: Number(price) || 49,
      coverImage,
      status: currentUser.role === "admin" ? "published" : "pending_approval",
      modules,
      quiz: quizQuestions,
    });

    toast.success("Course created and submitted for Admin verification! 🚀");
    router.push("/tutor/courses");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/tutor/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Courses
        </Link>
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
          Course Builder v2.0
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
          Create New Course
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Design your curriculum, embed video lessons, generate quizzes, and submit for marketplace listing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Basic Information */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>1. Course Essentials</span>
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Course Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Multimodal AI Agents with Gemini 2.0"
                required
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Tagline / Short Hook</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Master autonomous reasoning workflows and streaming APIs"
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              >
                <option value="Generative AI">Generative AI</option>
                <option value="Data Science">Data Science</option>
                <option value="Web Dev & AI">Web Dev & AI</option>
                <option value="UI Design">UI Design</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Skill Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600"
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
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Estimated Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 4h 30m"
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Full Course Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the objectives, prerequisites, and real-world outcomes..."
                className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <ImageUpload
                label="Course Cover Image (Cloudinary Storage)"
                currentImageUrl={coverImage}
                onImageUploaded={(url) => setCoverImage(url)}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Modules & Lessons */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-600" />
              <span>2. Curriculum & Lessons ({modules.length} Modules)</span>
            </h2>
            <button
              type="button"
              onClick={addModule}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add Module
            </button>
          </div>

          <div className="space-y-6">
            {modules.map((mod, mIdx) => (
              <div
                key={mod.id}
                className="rounded-2xl border border-border/80 bg-muted/30 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModules((prev) =>
                        prev.map((m, idx) => (idx === mIdx ? { ...m, title: val } : m))
                      );
                    }}
                    className="font-bold text-sm bg-transparent border-0 outline-none text-foreground w-full mr-2"
                  />
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(mIdx)}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 pl-3 border-l-2 border-blue-500/30">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      className="rounded-xl border border-border bg-card p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">Lesson {lIdx + 1}</span>
                        <span className="text-muted-foreground">{lesson.duration}</span>
                      </div>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModules((prev) =>
                            prev.map((m, idx) =>
                              idx === mIdx
                                ? {
                                    ...m,
                                    lessons: m.lessons.map((l, lI) =>
                                      lI === lIdx ? { ...l, title: val } : l
                                    ),
                                  }
                                : m
                            )
                          );
                        }}
                        placeholder="Lesson title"
                        className="w-full rounded-lg border border-input bg-background p-2 text-xs outline-none focus:border-blue-600"
                      />
                      <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModules((prev) =>
                            prev.map((m, idx) =>
                              idx === mIdx
                                ? {
                                    ...m,
                                    lessons: m.lessons.map((l, lI) =>
                                      lI === lIdx ? { ...l, videoUrl: val } : l
                                    ),
                                  }
                                : m
                            )
                          );
                        }}
                        placeholder="Video embed URL (YouTube / Loom / Vimeo)"
                        className="w-full rounded-lg border border-input bg-background p-2 text-xs font-mono text-muted-foreground outline-none focus:border-blue-600"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(mIdx)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline pt-1"
                  >
                    <PlusCircle className="h-3 w-3" /> Add Lesson to this Module
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/tutor/courses"
            className="rounded-full border border-border px-6 py-3 text-xs font-semibold hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            <Save className="h-4 w-4" /> Save & Submit Course
          </button>
        </div>
      </form>
    </div>
  );
}
