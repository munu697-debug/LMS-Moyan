"use client";

import React, { useState } from "react";
import {
  FileCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Send,
  User,
  Award,
} from "lucide-react";
import { useAppStore, SubmissionReview, DEMO_COURSE_IDS } from "@/lib/store";
import { toast } from "sonner";

export default function TutorReviewsPage() {
  const { reviews, reviewSubmission, currentUser, courses } = useAppStore();
  const [filter, setFilter] = useState<"all" | "pending" | "graded">("all");

  const myCourses = currentUser
    ? courses.filter(
        (c) =>
          c.instructor.id === currentUser.id ||
          c.instructor.name === currentUser.name
      )
    : [];
  const myCourseIds = myCourses.map((c) => c.id);

  const myReviews = reviews.filter((r) => {
    if (DEMO_COURSE_IDS.includes(r.courseId)) return false;
    if (r.studentName === "Alex Chen") return false;
    if (r.courseTitle?.toLowerCase().includes("prompt engineering")) return false;
    if (currentUser?.role === "admin") return true;
    return myCourseIds.includes(r.courseId);
  });

  const filtered = myReviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const [activeReviewId, setActiveReviewId] = useState<string | null>(
    filtered[0]?.id || null
  );

  const [gradeInput, setGradeInput] = useState<number>(95);
  const [feedbackInput, setFeedbackInput] = useState<string>("");

  const activeReview = filtered.find((r) => r.id === activeReviewId) || filtered[0] || null;

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewId) return;

    reviewSubmission(
      activeReviewId,
      Number(gradeInput),
      feedbackInput || "Solid work. Excellent understanding of core constraints."
    );
    toast.success("Submission graded and feedback delivered to student! 🎯");
    setFeedbackInput("");
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Evaluation Studio
        </span>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
          Assignment Reviews & Grading
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Review student project work, assign grades, and provide contextual feedback.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border/60 pb-3 text-xs font-semibold">
        {(["all", "pending", "graded"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-3 py-1.5 capitalize transition-all ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Submissions List */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Submissions ({filtered.length})</h2>
          {filtered.map((rev) => {
            const isSelected = rev.id === activeReviewId;
            return (
              <button
                key={rev.id}
                onClick={() => {
                  setActiveReviewId(rev.id);
                  if (rev.grade) setGradeInput(rev.grade);
                  if (rev.feedback) setFeedbackInput(rev.feedback);
                }}
                className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-500/10 shadow-sm"
                    : "border-border bg-card hover:border-blue-500/30 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">{rev.studentName}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      rev.status === "graded"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {rev.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-600 truncate">{rev.courseTitle}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{rev.taskTitle}</p>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              No submissions match this filter.
            </div>
          )}
        </div>

        {/* Right Active Grading Panel */}
        {activeReview ? (
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                  {activeReview.courseTitle}
                </span>
                <h2 className="mt-1 text-base font-bold text-foreground sm:text-lg">
                  {activeReview.taskTitle}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Submitted by <strong className="text-foreground">{activeReview.studentName}</strong> • {activeReview.submittedAt}
                </p>
              </div>

              {activeReview.grade && (
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">{activeReview.grade}%</span>
                  <p className="text-[10px] font-semibold text-muted-foreground">Recorded Score</p>
                </div>
              )}
            </div>

            {/* Student's Submission Content */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Student's Submitted Solution
              </label>
              <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {activeReview.submissionText || "No submission text provided."}
              </div>
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSubmitGrade} className="space-y-4 border-t border-border/60 pt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="w-40 space-y-1">
                  <label className="text-xs font-bold text-foreground">Grade (0 - 100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-sm font-bold text-foreground outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Feedback to Student</span>
                    <span className="text-[10px] text-muted-foreground">Constructive & detailed</span>
                  </label>
                  <input
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Provide praise and clear improvement points..."
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-transform hover:scale-105"
                >
                  <FileCheck className="h-4 w-4" /> Save Grade & Notify Student
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground lg:col-span-2 space-y-2">
            <FileCheck className="h-8 w-8 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No Assignment Selected</p>
            <p>Select a student submission from the left list to review and assign grades.</p>
          </div>
        )}
      </div>
    </div>
  );
}
