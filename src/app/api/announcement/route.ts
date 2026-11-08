import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface AnnouncementPayload {
  message: string;
  active: boolean;
  type: "info" | "warning" | "success";
}

let inMemoryAnnouncement: AnnouncementPayload = {
  message: "🚀 Gemini 2.0 AI Tutor features are now live! Enjoy adaptive course pathways and real-time guidance.",
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
