import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface AnnouncementPayload {
  message: string;
  active: boolean;
  type: "info" | "warning" | "success";
}

const RTDB_ANNOUNCEMENT_URL =
  "https://moyan-classroom-default-rtdb.asia-southeast1.firebasedatabase.app/settings/announcement.json";

let inMemoryAnnouncement: AnnouncementPayload = {
  message: "here",
  active: true,
  type: "info",
};

function getStoragePath(): string {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, "announcement.json");
  } catch {
    return path.join("/tmp", "announcement.json");
  }
}

function loadSavedAnnouncement(): AnnouncementPayload {
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.message === "string") {
        inMemoryAnnouncement = {
          message: parsed.message,
          active: typeof parsed.active === "boolean" ? parsed.active : true,
          type: parsed.type || "info",
        };
      }
    }
  } catch (err) {
    console.warn("Notice: Using in-memory announcement state:", err);
  }
  return inMemoryAnnouncement;
}

function saveAnnouncement(announcement: AnnouncementPayload): void {
  inMemoryAnnouncement = announcement;
  try {
    const filePath = getStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(announcement, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: Persisted announcement to memory only:", err);
  }
}

export async function GET() {
  // First attempt to read live announcement from Firebase RTDB (accessible globally across all roles & devices)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const rtdbRes = await fetch(RTDB_ANNOUNCEMENT_URL, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (rtdbRes.ok) {
      const rtdbData = await rtdbRes.json();
      if (rtdbData && typeof rtdbData === "object" && typeof rtdbData.message === "string") {
        const fromRtdb: AnnouncementPayload = {
          message: rtdbData.message,
          active: typeof rtdbData.active === "boolean" ? rtdbData.active : true,
          type: ["info", "warning", "success"].includes(rtdbData.type) ? rtdbData.type : "info",
        };
        inMemoryAnnouncement = fromRtdb;
        saveAnnouncement(fromRtdb);
        return NextResponse.json(fromRtdb, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        });
      }
    }
  } catch {}

  const current = loadSavedAnnouncement();
  return NextResponse.json(current, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Invalid payload: 'message' string is required" },
        { status: 400 }
      );
    }

    const updated: AnnouncementPayload = {
      message: body.message.trim(),
      active: typeof body.active === "boolean" ? body.active : true,
      type: ["info", "warning", "success"].includes(body.type) ? body.type : "info",
    };

    saveAnnouncement(updated);

    // Also attempt write to Firebase RTDB settings
    try {
      await fetch(RTDB_ANNOUNCEMENT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      announcement: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process announcement update" },
      { status: 500 }
    );
  }
}
