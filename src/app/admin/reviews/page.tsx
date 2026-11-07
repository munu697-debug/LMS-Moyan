"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Search,
  CheckCircle2,
  ThumbsUp,
  Award,
  Filter,
  Trash2,
  Reply,
  Sparkles,
  TrendingUp,
  X,
  Send,
  User as UserIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

interface UserReviewItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  courseTitle: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  featured?: boolean;
  adminReply?: string;
}

const INITIAL_USER_REVIEWS: UserReviewItem[] = [
  {
    id: "rev-1",
    studentName: "Alex Chen",
    studentAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    courseTitle: "Prompt Engineering Mastery",
    rating: 5,
    date: "2 hours ago",
    comment:
      "The Gemini AI tutor dock is unmatched. Every time I ran into an ambiguity while constructing strict JSON schema prompts, the assistant broke down token probability distributions in seconds. Finished the course with 100% on the quiz!",
    verified: true,
    featured: true,
  },
  {
    id: "rev-2",
    studentName: "Aisha Khan",
    studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    courseTitle: "Machine Learning Foundations",
    rating: 5,
    date: "Yesterday",
    comment:
      "The visualization of loss surfaces and Adam momentum optimizers made concepts click that 3 textbooks couldn't explain. The verifiable certificate is already linked to my LinkedIn profile.",
    verified: true,
    featured: true,
  },
  {
    id: "rev-3",
    studentName: "Rahul Mehta",
    studentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    courseTitle: "Build Production Apps with Gemini API",
    rating: 5,
    date: "2 days ago",
    comment:
      "Dr. Elena's lessons on multi-turn function calling and structured outputs gave our engineering team the blueprint for our production AI agent. Outstanding curriculum!",
    verified: true,
    featured: false,
  },
  {
    id: "rev-4",
    studentName: "Maya Lin",
    studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    courseTitle: "Prompt Engineering Mastery",
    rating: 5,
    date: "3 days ago",
    comment:
      "Calm, responsive, and adaptive. I love the streak tracker and real-time confetti when you pass the practice tests. Highly recommended for any serious builder.",
    verified: true,
    featured: true,
  },
  {
    id: "rev-5",
    studentName: "David Kim",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    courseTitle: "Machine Learning Foundations",
    rating: 4,
    date: "5 days ago",
    comment:
      "Extremely solid mathematical foundations. Would love to see an additional optional lesson on distributed PyTorch training in a future module update!",
    verified: true,
    featured: false,
    adminReply: "Thanks David! We are currently assembling a dedicated Module on Distributed GPU Training scheduled for next month. — Super Admin",
  },
];

export default function AdminReviewsPage() {
  const { courses } = useAppStore();
  const [reviewsList, setReviewsList] = useState<UserReviewItem[]>(INITIAL_USER_REVIEWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Reply Modal
  const [replyReview, setReplyReview] = useState<UserReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = reviewsList.filter((rev) => {
    const matchesSearch =
      rev.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === "all" || rev.rating === Number(ratingFilter);
    const matchesCourse =
      courseFilter === "all" || rev.courseTitle === courseFilter;
    return matchesSearch && matchesRating && matchesCourse;
  });

  const handleToggleFeature = (id: string, current: boolean) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, featured: !current } : r))
    );
    toast.success(
      current
        ? "Review removed from featured spotlight."
        : "Review featured on public marketplace! ⭐"
    );
  };

  const handleDeleteReview = (id: string) => {
    setReviewsList((prev) => prev.filter((r) => r.id !== id));
    toast.info("Review removed.");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReview || !replyText.trim()) return;

    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === replyReview.id ? { ...r, adminReply: replyText.trim() } : r
      )
    );
    toast.success(`Official reply sent to ${replyReview.studentName}! 📨`);
    setReplyReview(null);
    setReplyText("");
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Learner Community & Feedback
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            User Reviews & Course Ratings
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Inspect student satisfaction scores, analyze course ratings, and manage reviews across all curriculums.
          </p>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Platform Rating</span>
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">4.9 ★</p>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3 w-3" /> Top 1% in LMS Category
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Reviews</span>
            <span className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
              <MessageSquare className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">1,480+</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Verified enrolled students</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">5-Star Ratio</span>
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <ThumbsUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">94.6%</p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Positive sentiment</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Admin Response</span>
            <span className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-foreground">100%</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Within &lt; 2 hours</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student or review text..."
              className="w-full rounded-2xl border border-input bg-card pl-9 pr-3 py-2 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground outline-none"
          >
            <option value="all">All Ratings (★★★★★)</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars & Below</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong> student reviews
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4 transition-all hover:border-purple-500/30"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              {/* Student Info */}
              <div className="flex items-center gap-3">
                <img
                  src={rev.studentAvatar}
                  alt={rev.studentName}
                  className="h-10 w-10 rounded-full border border-border object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground text-sm">{rev.studentName}</p>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Verified Student
                      </span>
                    )}
                    {rev.featured && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600">
                        <Sparkles className="h-3 w-3" /> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Reviewed on <strong className="text-foreground">{rev.courseTitle}</strong> • {rev.date}
                  </p>
                </div>
              </div>

              {/* Stars & Quick Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${
                        idx < rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleFeature(rev.id, !!rev.featured)}
                    className={`rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all ${
                      rev.featured
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-600"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {rev.featured ? "Featured" : "Feature"}
                  </button>

                  <button
                    onClick={() => {
                      setReplyReview(rev);
                      setReplyText(rev.adminReply || "");
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-600 hover:bg-purple-500/20"
                  >
                    <Reply className="h-3 w-3" /> Reply
                  </button>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-600 hover:bg-rose-500/20"
                    title="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Text */}
            <p className="text-xs sm:text-sm text-foreground leading-relaxed pl-1 sm:pl-13">
              "{rev.comment}"
            </p>

            {/* Super Admin Official Reply (if any) */}
            {rev.adminReply && (
              <div className="ml-1 sm:ml-13 rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] p-3.5 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-[8px] font-extrabold text-white">
                    SA
                  </div>
                  <span className="text-xs font-extrabold text-purple-600">Official Super Admin Reply</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-7">
                  {rev.adminReply}
                </p>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
            No reviews match the selected filter criteria.
          </div>
        )}
      </div>

      {/* MODAL: Reply to Review as Super Admin */}
      {replyReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-xs font-extrabold text-white">
                  SA
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground">Reply as Super Admin</h2>
                  <p className="text-xs text-muted-foreground">To {replyReview.studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setReplyReview(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-3 text-xs italic text-muted-foreground">
              "{replyReview.comment}"
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Your Official Response</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an encouraging message, roadmap update, or resolution..."
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setReplyReview(null)}
                  className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" /> Publish Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
