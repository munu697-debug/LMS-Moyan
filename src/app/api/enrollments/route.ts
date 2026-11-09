import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { EnrollmentRequest, User } from "@/lib/store";

let inMemoryEnrollments: EnrollmentRequest[] = [];

function getEnrollmentsPath(): string {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, "enrollments.json");
  } catch {
    return path.join("/tmp", "enrollments.json");
  }
}

function getUsersPath(): string {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, "users.json");
  } catch {
    return path.join("/tmp", "users.json");
  }
}

function loadSavedEnrollments(): EnrollmentRequest[] {
  try {
    const filePath = getEnrollmentsPath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        inMemoryEnrollments = parsed;
        return inMemoryEnrollments;
      }
    }
  } catch (err) {
    console.warn("Notice reading enrollments:", err);
  }
  return inMemoryEnrollments;
}

function saveEnrollments(list: EnrollmentRequest[]): void {
  inMemoryEnrollments = list;
  try {
    const filePath = getEnrollmentsPath();
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice saving enrollments:", err);
  }
}

function updateUserCourseAccess(req: EnrollmentRequest) {
  try {
    const usersPath = getUsersPath();
    if (!fs.existsSync(usersPath)) return;
    const content = fs.readFileSync(usersPath, "utf-8");
    const users: User[] = JSON.parse(content);
    if (!Array.isArray(users)) return;

    let modified = false;
    const updatedUsers = users.map((u) => {
      const matches =
        (req.studentId && u.id === req.studentId) ||
        (req.studentEmail && u.email && u.email.toLowerCase().trim() === req.studentEmail.toLowerCase().trim());

      if (matches) {
        modified = true;
        const currentEnrolled = u.enrolledCourseIds || [];
        const currentPending = u.pendingCourseIds || [];

        if (req.status === "approved") {
          return {
            ...u,
            enrolledCourseIds: Array.from(new Set([...currentEnrolled, req.courseId])),
            pendingCourseIds: currentPending.filter((id) => id !== req.courseId),
          };
        } else if (req.status === "rejected") {
          return {
            ...u,
            pendingCourseIds: currentPending.filter((id) => id !== req.courseId),
          };
        } else if (req.status === "pending") {
          return {
            ...u,
            pendingCourseIds: Array.from(new Set([...currentPending, req.courseId])),
          };
        }
      }
      return u;
    });

    if (modified) {
      fs.writeFileSync(usersPath, JSON.stringify(updatedUsers, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Notice syncing user course access:", err);
  }
}

export async function GET() {
  try {
    const list = loadSavedEnrollments();
    return NextResponse.json(list, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load enrollments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = loadSavedEnrollments();

    // Check if incoming is array or single request
    let incomingRequests: EnrollmentRequest[] = [];
    if (Array.isArray(body)) {
      incomingRequests = body;
    } else if (body.requests && Array.isArray(body.requests)) {
      incomingRequests = body.requests;
    } else if (body.id && body.courseId) {
      incomingRequests = [body as EnrollmentRequest];
    } else if (body.request) {
      incomingRequests = [body.request];
    }

    if (incomingRequests.length === 0) {
      return NextResponse.json({ success: true, requests: current });
    }

    const map = new Map<string, EnrollmentRequest>();
    // First put existing
    current.forEach((r) => {
      if (r && r.id) map.set(r.id, r);
    });

    // Update with incoming
    incomingRequests.forEach((req) => {
      if (req && req.id) {
        const existing = map.get(req.id);
        const merged = { ...existing, ...req };
        map.set(req.id, merged);
        updateUserCourseAccess(merged);
      }
    });

    const updated = Array.from(map.values()).sort((a, b) => {
      // Pending first, then by requestedAt
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return 0;
    });

    saveEnrollments(updated);

    return NextResponse.json({ success: true, requests: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update enrollments" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const current = loadSavedEnrollments();
    const filtered = current.filter((r) => r.id !== id);
    saveEnrollments(filtered);

    return NextResponse.json({ success: true, requests: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete enrollment" }, { status: 500 });
  }
}
