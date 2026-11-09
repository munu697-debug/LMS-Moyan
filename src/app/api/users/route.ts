import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { User, UserRole } from "@/lib/store";

const DEFAULT_USERS: User[] = [
  {
    id: "admin-master",
    name: "Super Admin",
    email: "moyanhub@gmail.com",
    role: "admin",
    status: "active",
    avatar: "",
    enrolledCourseIds: [],
    completedLessonIds: [],
    streakDays: 1,
    quizScores: {},
    certificates: [],
    joinedDate: "Nov 2026",
  },
  {
    id: "student-munavvir",
    name: "Munavvir",
    email: "munavvir@moyanai.com",
    role: "student",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    enrolledCourseIds: [],
    completedLessonIds: [],
    streakDays: 1,
    quizScores: {},
    certificates: [],
    joinedDate: "Nov 2026",
  },
  {
    id: "tutor-kutti",
    name: "Kutti Hacker",
    email: "kuttihacker@moyanai.com",
    role: "tutor",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    enrolledCourseIds: [],
    completedLessonIds: [],
    streakDays: 1,
    quizScores: {},
    certificates: [],
    earnings: 0,
    joinedDate: "Nov 2026",
  },
];

let inMemoryUsers: User[] = [...DEFAULT_USERS];

function getStoragePath(): string {
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

function loadSavedUsers(): User[] {
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure admin and key users exist
        const emailMap = new Map<string, User>();
        parsed.forEach((u: User) => {
          if (u && u.email) emailMap.set(u.email.toLowerCase().trim(), u);
        });

        // Ensure defaults are present
        DEFAULT_USERS.forEach((def) => {
          if (!emailMap.has(def.email.toLowerCase().trim())) {
            emailMap.set(def.email.toLowerCase().trim(), def);
          }
        });

        inMemoryUsers = Array.from(emailMap.values());
        return inMemoryUsers;
      }
    }
  } catch (err) {
    console.warn("Notice: Using memory user list:", err);
  }
  return inMemoryUsers;
}

function saveUsers(users: User[]): void {
  inMemoryUsers = users;
  try {
    const filePath = getStoragePath();
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.warn("Notice: Persisted users to memory only:", err);
  }
}

export async function GET() {
  const users = loadSavedUsers();
  return NextResponse.json(
    { users },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const currentUsers = loadSavedUsers();
    const normalizedEmail = body.email.trim().toLowerCase();
    const existingIndex = currentUsers.findIndex(
      (u) => u.email.toLowerCase() === normalizedEmail || (body.id && u.id === body.id)
    );

    let updatedUsers: User[];
    if (existingIndex >= 0) {
      // Update existing user record while preserving critical state
      const existing = currentUsers[existingIndex];
      const merged: User = {
        ...existing,
        ...body,
        id: existing.id,
        email: existing.email,
        name: body.name || existing.name,
        role: body.role || existing.role,
        status: body.status || existing.status,
        avatar: body.avatar || existing.avatar,
        enrolledCourseIds: body.enrolledCourseIds || existing.enrolledCourseIds || [],
        completedLessonIds: body.completedLessonIds || existing.completedLessonIds || [],
        streakDays: body.streakDays ?? existing.streakDays ?? 1,
        quizScores: body.quizScores || existing.quizScores || {},
        certificates: body.certificates || existing.certificates || [],
      };
      if (body.password) merged.password = body.password;
      updatedUsers = [...currentUsers];
      updatedUsers[existingIndex] = merged;
    } else {
      // Create new user record
      const newUser: User = {
        id: body.id || `user-${Date.now()}`,
        name: body.name ? body.name.trim() : normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: body.password,
        role: (body.role as UserRole) || "student",
        status: body.status || "active",
        avatar:
          body.avatar ||
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        enrolledCourseIds: body.enrolledCourseIds || [],
        completedLessonIds: body.completedLessonIds || [],
        streakDays: body.streakDays || 1,
        quizScores: body.quizScores || {},
        certificates: body.certificates || [],
        earnings: body.role === "tutor" ? 0 : undefined,
        joinedDate: body.joinedDate || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      };
      updatedUsers = [newUser, ...currentUsers];
    }

    saveUsers(updatedUsers);
    return NextResponse.json({ success: true, users: updatedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create/update user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body || !body.id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const currentUsers = loadSavedUsers();
    const updatedUsers = currentUsers.map((u) => {
      if (u.id !== body.id) return u;
      return {
        ...u,
        ...(body.role ? { role: body.role as UserRole } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.password ? { password: body.password } : {}),
        ...(body.name ? { name: body.name } : {}),
        ...(body.enrolledCourseIds ? { enrolledCourseIds: body.enrolledCourseIds } : {}),
      };
    });

    saveUsers(updatedUsers);
    return NextResponse.json({ success: true, users: updatedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to modify user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const currentUsers = loadSavedUsers();
    const target = currentUsers.find((u) => u.id === id);
    if (target && target.role === "admin") {
      return NextResponse.json({ error: "Cannot delete master administrator" }, { status: 403 });
    }

    const updatedUsers = currentUsers.filter((u) => u.id !== id);
    saveUsers(updatedUsers);
    return NextResponse.json({ success: true, users: updatedUsers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
