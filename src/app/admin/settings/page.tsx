"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Megaphone,
  Save,
  Cpu,
  Percent,
  Sparkles,
  CheckCircle,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { announcement, setGlobalAnnouncement, currentUser, updateUserPassword } = useAppStore();

  // Announcement State
  const [message, setMessage] = useState(announcement.message);
  const [isActive, setIsActive] = useState(announcement.active);
  const [bannerType, setBannerType] = useState<"info" | "warning" | "success">(
    announcement.type
  );

  // Sync inputs with global announcement store
  useEffect(() => {
    setMessage(announcement.message);
    setIsActive(announcement.active);
    setBannerType(announcement.type);
  }, [announcement.message, announcement.active, announcement.type]);

  // Platform State
  const [royaltyFee, setRoyaltyFee] = useState(85);
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");

  // Admin Password Change State
  const [currentAdminPassword, setCurrentAdminPassword] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalAnnouncement(message, isActive, bannerType);
    toast.success("Platform announcement broadcast updated in real-time! 📢");
  };

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newAdminPassword || newAdminPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newAdminPassword !== confirmAdminPassword) {
      toast.error("New passwords do not match. Please verify.");
      return;
    }

    const result = updateUserPassword(currentUser.id, newAdminPassword);
    if (!result.success) {
      toast.error(result.error || "Failed to update admin password.");
      return;
    }

    toast.success("Admin password successfully updated! Keep your new credentials safe. 🔑");
    setCurrentAdminPassword("");
    setNewAdminPassword("");
    setConfirmAdminPassword("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Global Parameters
        </span>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
          System & Security Configuration
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Update admin security passwords, broadcast announcements, calibrate platform royalty splits, and manage Gemini AI endpoints.
        </p>
      </div>

      {/* Admin Password & Credentials Section */}
      <div className="rounded-3xl border border-purple-500/30 bg-card p-6 shadow-sm sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-600/10 text-purple-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Admin Account Credentials & Password</h2>
              <p className="text-xs text-muted-foreground">Change the master administrator login password</p>
            </div>
          </div>
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-600">
            {currentUser?.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "Administrator"}
          </span>
        </div>

        <form onSubmit={handleUpdateAdminPassword} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">New Admin Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Min. 6 characters..."
                  className="w-full rounded-2xl border border-input bg-background pl-10 pr-10 py-2.5 text-xs font-mono outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Confirm New Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Repeat new password..."
                  className="w-full rounded-2xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs font-mono outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-muted-foreground">
              Passwords are securely encrypted and must be at least 6 characters long.
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" /> Update Admin Password
            </button>
          </div>
        </form>
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
            placeholder="e.g. 🚀 Moyan AI Tutor features are now live! Enjoy adaptive course pathways."
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

        {/* Live Header Preview Box */}
        <div className="rounded-2xl border border-dashed border-border/80 p-3.5 bg-muted/20 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Header Live Preview</span>
            <span className={isActive ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
              {isActive ? "● Broadcasting to all visitors" : "○ Inactive (hidden)"}
            </span>
          </div>
          {isActive ? (
            <div
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold ${
                bannerType === "success"
                  ? "bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 border border-emerald-500/30"
                  : bannerType === "warning"
                  ? "bg-amber-500/15 text-amber-950 dark:text-amber-100 border border-amber-500/30"
                  : "bg-blue-500/15 text-blue-900 dark:text-blue-100 border border-blue-500/20"
              }`}
            >
              <Megaphone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{message || "No announcement message entered"}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-0.5">
              Banner is currently inactive and will not display in the website header.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-transform hover:scale-105 cursor-pointer"
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
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep complex problem solving)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
