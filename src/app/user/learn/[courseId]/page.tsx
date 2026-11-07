"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Zap,
  Trophy,
  Share2,
  Clock,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import ModernVideoPlayer from "@/components/ModernVideoPlayer";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function LearnCoursePage({ params }: PageProps) {
  const { courseId } = use(params);
  const {
    courses,
    currentUser,
    toggleLessonCompletion,
    enrollInCourse,
    enrollmentRequests,
    requestEnrollment,
  } = useAppStore();

  const course = courses.find((c) => c.id === courseId);

  // If course doesn't exist, handle gracefully
  if (!course) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Course not found</h2>
        <Link href="/courses" className="mt-4 inline-block text-primary underline">
          Browse Courses
        </Link>
      </div>
    );
  }

  // Enrollment checks
  const isEnrolled = currentUser?.enrolledCourseIds?.includes(course.id) || false;
  const isPending =
    (currentUser?.pendingCourseIds?.includes(course.id) ?? false) ||
    enrollmentRequests.some(
      (r) => r.studentId === currentUser?.id && r.courseId === course.id && r.status === "pending"
    );

  // Active lesson state
  const firstLesson = course.modules[0]?.lessons[0];
  const [activeLessonId, setActiveLessonId] = useState<string>(
    firstLesson?.id || "l1-1"
  );

  // Find active lesson object
  const activeLesson =
    course.modules.flatMap((m) => m.lessons).find((l) => l.id === activeLessonId) ||
    firstLesson;

  const isCompleted = currentUser?.completedLessonIds?.includes(activeLessonId) || false;

  // AI Tutor Chat State
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string; time: string }[]
  >([
    {
      role: "assistant",
      content: `Hello ${currentUser?.name || "Learner"}! I'm your Gemini AI Tutor for "${course.title}". Ask me any questions about "${activeLesson?.title || 'this lesson'}", request code snippets, or ask for a simple breakdown!`,
      time: "Just now",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      role: "user" as const,
      content: text,
      time: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    // Simulated dynamic Gemini tutor responses
    setTimeout(() => {
      let reply = `Great question regarding **${activeLesson?.title}**! Here is an intuitive breakdown:\n\n`;
      if (text.toLowerCase().includes("code") || text.toLowerCase().includes("example")) {
        reply += `\`\`\`typescript\n// Example implementation for ${activeLesson?.title}\nconst config = {\n  model: "gemini-2.0-flash",\n  temperature: 0.2,\n  systemInstruction: "You are an adaptive expert assistant.",\n};\n\nasync function run() {\n  const response = await generateContent(config);\n  console.log(response.text);\n}\n\`\`\`\nTry experimenting with the temperature parameter to control output randomness!`;
      } else if (text.toLowerCase().includes("explain") || text.toLowerCase().includes("simple")) {
        reply += `Think of this concept like building blocks: every token output relies on the previous sequence's contextual embedding. By shaping your input with clear delimiters and intermediate reasoning steps, you guide the model directly along the optimal probability path!`;
      } else if (text.toLowerCase().includes("quiz") || text.toLowerCase().includes("question")) {
        reply += `Here is a practice question:\n*What is the key advantage of providing clear system instructions?*\n\n**Hint:** It anchors the baseline behavior and tone before any user prompts are parsed.`;
      } else {
        reply += `In ${course.title}, this principle ensures predictable, robust outcomes. Let me know if you would like me to test your understanding with a short 1-minute quiz!`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, time: "Just now" },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleToggleCompletion = () => {
    if (!isEnrolled) {
      toast.warning("Classroom is in preview mode. Lesson progress tracking unlocks once approved by administrator.");
      return;
    }
    toggleLessonCompletion(course.id, activeLessonId);
    if (!isCompleted) {
      toast.success("Lesson marked as completed! 🎉 +25 XP added.");
    } else {
      toast.info("Lesson marked as incomplete.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "5s" }} /> Pending Admin Approval
            </span>
          ) : !isEnrolled ? (
            <button
              onClick={() => {
                const res = requestEnrollment(course.id);
                if (res.success) {
                  toast.info(`Enrollment request submitted for "${course.title}". Awaiting admin approval.`);
                } else {
                  toast.warning(res.message || "Could not submit enrollment request.");
                }
              }}
              className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
            >
              Request Enrollment
            </button>
          ) : null}
          <Link
            href="/user/quizzes"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-primary shadow-sm hover:border-primary/40"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Take Course Quiz
          </Link>
        </div>
      </div>

      {/* Main Grid: Player on Left, Curriculum & AI Tutor on Right */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Video & Lesson Content (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Modern LMS Video Player */}
          {activeLesson?.videoUrl ? (
            <ModernVideoPlayer
              key={activeLesson.id}
              videoUrl={activeLesson.videoUrl}
              title={activeLesson.title}
              courseTitle={course.title}
              duration={activeLesson.duration}
              onEnded={() => {
                if (!isCompleted) handleToggleCompletion();
              }}
            />
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-black shadow-lg">
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-card to-secondary p-8 text-center">
                <PlayCircle className="h-16 w-16 text-primary" />
                <p className="mt-3 text-sm font-bold text-foreground">
                  Interactive Video Module Ready
                </p>
                <p className="text-xs text-muted-foreground">Click play to begin lesson stream</p>
              </div>
            </div>
          )}

          {/* Lesson Header & Mark Complete */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  {course.title}
                </span>
                <h1 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
                  {activeLesson?.title}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Duration: {activeLesson?.duration} • Instructor: {course.instructor.name}
                </p>
              </div>

              <button
                onClick={handleToggleCompletion}
                className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    : "bg-primary text-primary-foreground shadow-elegant hover:scale-105"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                {isCompleted ? "Completed ✓" : "Mark as Complete"}
              </button>
            </div>

            {/* Lesson Text Content */}
            <div className="mt-6 border-t border-border/60 pt-5">
              <h3 className="text-sm font-bold text-foreground">Lesson Overview & Key Takeaways</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {activeLesson?.content}
              </p>

              <div className="mt-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Summary Note:</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{activeLesson?.summary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum & Live Gemini Tutor Chat (1 col) */}
        <div className="space-y-6">
          {/* Curriculum Drawer */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center justify-between">
              <span>Course Curriculum</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {course.modules.length} Modules
              </span>
            </h2>

            <div className="mt-4 space-y-3">
              {course.modules.map((mod, mIdx) => (
                <div key={mod.id} className="space-y-2">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {mod.title}
                  </p>
                  <div className="space-y-1.5">
                    {mod.lessons.map((les) => {
                      const isCurrent = les.id === activeLessonId;
                      const isDone = currentUser?.completedLessonIds.includes(les.id) ?? false;
                      return (
                        <button
                          key={les.id}
                          onClick={() => setActiveLessonId(les.id)}
                          className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs font-semibold transition-all ${
                            isCurrent
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/40 hover:bg-muted text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                isDone ? "bg-emerald-500" : isCurrent ? "bg-primary-foreground" : "bg-muted-foreground/40"
                              }`}
                            />
                            <span className="truncate">{les.title}</span>
                          </div>
                          <span className="shrink-0 text-[10px] opacity-80">{les.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini AI Tutor Chat Dock */}
          <div className="flex flex-col h-[460px] rounded-3xl border border-primary/30 bg-card p-4 shadow-elegant">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Gemini AI Tutor</h3>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online 24/7
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                Gemini 2.0 Flash
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto py-3 pr-1 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                      <Bot className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-card-foreground rounded-bl-sm border border-border/50"
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/20 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex gap-1 rounded-2xl bg-muted p-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 pt-1">
              {["Explain simply", "Code example", "Give practice quiz"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 border-t border-border/60 pt-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Gemini tutor anything..."
                className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
