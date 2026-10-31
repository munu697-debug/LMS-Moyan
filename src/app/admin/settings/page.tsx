"use client";

import React, { useState } from "react";
import {
  Sliders,
  Megaphone,
  Save,
  Cpu,
  Percent,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { announcement, setGlobalAnnouncement } = useAppStore();

  const [message, setMessage] = useState(announcement.message);
  const [isActive, setIsActive] = useState(announcement.active);
  const [bannerType, setBannerType] = useState<"info" | "warning" | "success">(
    announcement.type
  );

  const [royaltyFee, setRoyaltyFee] = useState(85);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalAnnouncement(message, isActive, bannerType);
    toast.success("Platform announcement broadcast updated in real-time! 📢");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Global Parameters
        </span>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
          System & Broadcast Configuration
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Broadcast site-wide announcements, calibrate platform royalty splits, and manage Gemini AI endpoints.
        </p>
      </div>

      {/* Broadcast Announcement Form */}
      <form
        onSubmit={handleSaveAnnouncement}
        className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-purple-600" />
            <span>Site-Wide Header Announcement</span>
          </h2>
          <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-purple-600 focus:ring-purple-600"
            />
            <span>Broadcast Active</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Announcement Message</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. 🚀 Gemini 2.0 AI Tutor features are now live! Enjoy adaptive course pathways."
            className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs sm:text-sm outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-xs font-bold text-foreground">Alert Style:</label>
          <div className="flex gap-2 text-xs font-semibold">
            {(["info", "warning", "success"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setBannerType(t)}
                className={`rounded-xl px-3 py-1.5 capitalize transition-all ${
                  bannerType === t
                    ? "bg-purple-600 text-white"
                    : "border border-border bg-muted/40 hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-transform hover:scale-105"
          >
            <Save className="h-4 w-4" /> Publish Broadcast
          </button>
        </div>
      </form>

      {/* AI Gateway & Economics */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Economics */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Percent className="h-4 w-4 text-purple-600" />
            <span>Instructor Royalty Split</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Current tutor payout rate: <strong className="text-foreground">{royaltyFee}%</strong> (Platform fee: {100 - royaltyFee}%)
          </p>
          <input
            type="range"
            min="60"
            max="95"
            value={royaltyFee}
            onChange={(e) => setRoyaltyFee(Number(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
            <span>60% Tutor</span>
            <span>Default: 85%</span>
            <span>95% Tutor</span>
          </div>
        </div>

        {/* AI Gateway Model */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-600" />
            <span>Active Gemini AI Model Gateway</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Select the inference engine powering real-time student tutoring sessions.
          </p>
          <select
            value={aiModel}
            onChange={(e) => setAiModel(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background p-3 text-xs font-bold text-foreground outline-none focus:border-purple-600"
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended: Ultra-low latency, 1M context)</option>
            <option value="gemini-2.0-pro">Gemini 2.0 Pro Experimental (Complex math & code reasoning)</option>
          </select>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" /> API Gateway Health: Normal (0.01% error rate)
          </div>
        </div>
      </div>
    </div>
  );
}
