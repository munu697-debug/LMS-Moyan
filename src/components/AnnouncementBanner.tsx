"use client";

import React, { useState, useEffect } from "react";
import { X, Megaphone, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function AnnouncementBanner() {
  const { announcement } = useAppStore();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal whenever announcement message or active status changes
  useEffect(() => {
    setDismissed(false);
  }, [announcement?.message, announcement?.active, announcement?.type]);

  if (!announcement || !announcement.active || dismissed || !announcement.message) return null;

  const styleConfig = {
    info: {
      bar: "border-blue-500/20 bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-indigo-500/15 text-blue-900 dark:text-blue-100",
      iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      Icon: Megaphone,
      closeBtn: "text-blue-700/70 hover:bg-blue-500/10 hover:text-blue-900 dark:text-blue-300",
    },
    warning: {
      bar: "border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-orange-500/15 text-amber-900 dark:text-amber-100",
      iconBg: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
      Icon: AlertTriangle,
      closeBtn: "text-amber-800/70 hover:bg-amber-500/10 hover:text-amber-950 dark:text-amber-300",
    },
    success: {
      bar: "border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-teal-500/15 text-emerald-950 dark:text-emerald-100",
      iconBg: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
      Icon: CheckCircle2,
      closeBtn: "text-emerald-800/70 hover:bg-emerald-500/10 hover:text-emerald-950 dark:text-emerald-300",
    },
  };

  const currentType = (announcement.type && announcement.type in styleConfig) ? announcement.type : "info";
  const selectedConfig = styleConfig[currentType as keyof typeof styleConfig] || styleConfig.info;
  const BannerIcon = selectedConfig.Icon;

  return (
    <div className={`relative border-b px-4 py-2 text-xs font-semibold transition-all ${selectedConfig.bar}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden truncate">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${selectedConfig.iconBg}`}>
            <BannerIcon className="h-3 w-3" />
          </span>
          <span className="truncate">{announcement.message}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className={`rounded-full p-1 transition-colors ${selectedConfig.closeBtn}`}
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
