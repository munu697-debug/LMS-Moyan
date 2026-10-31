"use client";

import React, { useState } from "react";
import { Sparkles, X, Megaphone } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function AnnouncementBanner() {
  const { announcement } = useAppStore();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.active || dismissed) return null;

  return (
    <div className="relative border-b border-primary/20 bg-gradient-to-r from-primary/15 via-primary/10 to-accent/20 px-4 py-2 text-xs font-medium text-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Megaphone className="h-3 w-3" />
          </span>
          <span className="truncate">{announcement.message}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
