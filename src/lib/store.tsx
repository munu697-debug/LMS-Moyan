"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  db,
  rtdb,
  googleProvider,
  ref,
  set,
  get,
  onValue,
  rtdbUpdate,
  rtdbRemove,
} from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export type UserRole = "student" | "tutor" | "admin";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  content: string;
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  tagline: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    title: string;
    avatar: string;
  };
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  rating: number;
  reviewCount: number;
  enrolledCount: number;
  price: number;
  coverImage?: string;
  status: "published" | "pending_approval" | "draft";
  modules: Module[];
  quiz: QuizQuestion[];
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  issueDate: string;
  grade: number;
  credentialUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  title?: string;
  bio?: string;
  status: "active" | "suspended" | "pending_approval";
  enrolledCourseIds: string[];
  pendingCourseIds?: string[];
  completedLessonIds: string[];
  streakDays: number;
  quizScores: Record<string, number>;
  certificates: Certificate[];
  earnings?: number;
  joinedDate: string;
}

export interface SubmissionReview {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  taskTitle: string;
  submissionText: string;
  submittedAt: string;
  status: "pending" | "graded";
  grade?: number;
  feedback?: string;
}

export interface EnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  coursePrice: number;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

const INITIAL_CATEGORIES: string[] = [
  "Generative AI",
  "Data Science",
  "Web Development",
  "UI/UX Design",
  "Cloud Architecture",
  "Productivity",
  "Cybersecurity",
  "Mobile Development",
];

const INITIAL_COURSES: Course[] = [];

export const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "moyanhub@gmail.com"
).trim().toLowerCase();
export const ADMIN_PASSWORD = (
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "moyan@7078"
).trim();

export const isUserAdmin = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === "moyanhub@gmail.com" ||
    (Boolean(ADMIN_EMAIL) && normalized === ADMIN_EMAIL)
  );
};

const INITIAL_USERS: User[] = [
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
    enrolledCourseIds: ["course-1794196371812", "course-lovable-vibe-coding"],
    pendingCourseIds: [],
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

const INITIAL_REVIEWS: SubmissionReview[] = [];

const INITIAL_ENROLLMENTS: EnrollmentRequest[] = [
  {
    id: "enr-munavvir-vibe-coding",
    studentId: "student-munavvir",
    studentName: "Munavvir",
    studentEmail: "munavvir@moyanai.com",
    courseId: "course-1794196371812",
    courseTitle: "Vibe coding",
    courseCategory: "Web Development",
    coursePrice: 499,
    status: "approved",
    requestedAt: "Nov 9, 2026, 09:30 AM",
  },
];

interface AppContextType {
  isHydrated: boolean;
  isRealtimeConnected: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  users: User[];
  courses: Course[];
  categories: string[];
  reviews: SubmissionReview[];
  enrollmentRequests: EnrollmentRequest[];
  announcement: { message: string; active: boolean; type: "info" | "warning" | "success" };
  // Auth Actions
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: UserRole; isPendingApproval?: boolean }>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole; email?: string; isPendingApproval?: boolean }>;
  signup: (data: { name: string; email: string; password?: string; role: UserRole }) => Promise<{ success: boolean; error?: string; isPendingApproval?: boolean }>;
  logout: () => Promise<void>;
  // Core Actions
  enrollInCourse: (courseId: string) => void;
  requestEnrollment: (courseId: string) => { success: boolean; requiresAuth?: boolean; message?: string };
  approveEnrollmentRequest: (requestId: string) => void;
  rejectEnrollmentRequest: (requestId: string) => void;
  toggleLessonCompletion: (courseId: string, lessonId: string) => void;
  submitQuizScore: (courseId: string, score: number) => void;
  createCourse: (course: Omit<Course, "id" | "rating" | "reviewCount" | "enrolledCount">) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  approveCourse: (courseId: string) => void;
  rejectCourse: (courseId: string) => void;
  reviewSubmission: (reviewId: string, grade: number, feedback: string) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  addUser: (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    title?: string;
    bio?: string;
  }) => { success: boolean; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  updateUserPassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
  addCategory: (categoryName: string) => void;
  setGlobalAnnouncement: (message: string, active: boolean, type?: "info" | "warning" | "success") => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "moyan_learn_platform_state_v4";
const DELETED_COURSES_KEY = "moyan_deleted_courses_v1";
export const DEMO_COURSE_IDS = ["course-1", "course-2", "course-3"];

function getDeletedCourseIds(): string[] {
  if (typeof window === "undefined") return DEMO_COURSE_IDS;
  try {
    const raw = localStorage.getItem(DELETED_COURSES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.from(new Set([...DEMO_COURSE_IDS, ...(Array.isArray(parsed) ? parsed : [])]));
  } catch (e) {
    return DEMO_COURSE_IDS;
  }
}

// Ensure Firebase Auth session exists so writes to Realtime Database succeed
async function ensureFirebaseAuth(user?: User | null) {
  if (!auth) return;
  if (auth.currentUser) return;
  try {
    if (user?.email && user?.password) {
      await signInWithEmailAndPassword(auth, user.email, user.password);
    } else if (ADMIN_EMAIL && ADMIN_PASSWORD) {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    }
  } catch (e) {
    // Silently handle
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(() => {
    const deleted = getDeletedCourseIds();
    return INITIAL_COURSES.filter((c) => !deleted.includes(c.id));
  });
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [reviews, setReviews] = useState<SubmissionReview[]>(INITIAL_REVIEWS);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>(INITIAL_ENROLLMENTS);
  const [announcement, setAnnouncement] = useState<{
    message: string;
    active: boolean;
    type: "info" | "warning" | "success";
  }>({
    message: "here",
    active: true,
    type: "info",
  });

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated !== undefined) setIsAuthenticated(parsed.isAuthenticated);
        if (parsed.currentUser) {
          const user = parsed.currentUser;
          const isAdmin = isUserAdmin(user.email);
          const safeCurrentUser: User = {
            ...user,
            name: isAdmin ? (user.name && user.name !== "Google User" ? user.name : "Super Admin") : user.name,
            role: isAdmin ? "admin" : user.role,
            status: isAdmin ? "active" : user.status,
            streakDays: user.streakDays === 120 ? 1 : (user.streakDays || 1),
          };
          if (user.email?.toLowerCase().includes("munavvir") || user.id === "student-munavvir") {
            safeCurrentUser.enrolledCourseIds = Array.from(
              new Set([
                ...(safeCurrentUser.enrolledCourseIds || []),
                "course-1794196371812",
                "course-lovable-vibe-coding",
              ])
            );
            safeCurrentUser.pendingCourseIds = (safeCurrentUser.pendingCourseIds || []).filter(
              (id) => id !== "course-1794196371812" && id !== "course-lovable-vibe-coding"
            );
          }
          delete (safeCurrentUser as any).password;
          setCurrentUser(safeCurrentUser);
        }
        if (parsed.users && Array.isArray(parsed.users)) {
          const userMap = new Map<string, User>();
          INITIAL_USERS.forEach((u) => userMap.set(u.email.toLowerCase().trim(), u));
          parsed.users.forEach((u: User) => {
            if (!u || !u.email) return;
            const isAdmin = isUserAdmin(u.email);
            const { password, ...safeUser } = u;
            const key = u.email.toLowerCase().trim();
            userMap.set(key, {
              ...safeUser,
              role: isAdmin ? ("admin" as UserRole) : safeUser.role,
              status: isAdmin ? "active" : safeUser.status,
            } as User);
          });
          setUsers(Array.from(userMap.values()));
        }
        if (parsed.courses && Array.isArray(parsed.courses)) {
          const deleted = getDeletedCourseIds();
          const updatedCourses = parsed.courses
            .filter((c: Course) => !deleted.includes(c.id))
            .map((c: Course) => {
              if (c.price === 49) return { ...c, price: 2999 };
              if (c.price === 79) return { ...c, price: 4999 };
              if (c.price === 99) return { ...c, price: 6999 };
              return c;
            });
          setCourses(updatedCourses);
        }
        if (parsed.categories && Array.isArray(parsed.categories)) {
          // Merge custom categories with default ones
          setCategories(Array.from(new Set([...INITIAL_CATEGORIES, ...parsed.categories])));
        }
        if (parsed.reviews && Array.isArray(parsed.reviews)) {
          const sanitized = parsed.reviews.filter(
            (r: SubmissionReview) =>
              r &&
              !DEMO_COURSE_IDS.includes(r.courseId) &&
              r.studentName !== "Alex Chen" &&
              !r.courseTitle?.toLowerCase().includes("prompt engineering")
          );
          setReviews(sanitized);
        }
        if (parsed.enrollmentRequests && Array.isArray(parsed.enrollmentRequests)) {
          const reconciled = parsed.enrollmentRequests.map((r: EnrollmentRequest) => {
            if (r.id === "enr-munavvir-vibe-coding" || r.id?.includes("munavvir")) {
              return { ...r, status: "approved" as const };
            }
            return r;
          });
          setEnrollmentRequests(reconciled);
        } else {
          setEnrollmentRequests(INITIAL_ENROLLMENTS);
        }
        if (parsed.announcement) setAnnouncement(parsed.announcement);
      }
    } catch (e) {
      console.warn("Failed to load local state:", e);
    }
    setIsHydrated(true);
  }, []);

  // Proactively enforce admin status whenever currentUser changes or loads
  useEffect(() => {
    if (currentUser && isUserAdmin(currentUser.email) && currentUser.role !== "admin") {
      const promoted: User = {
        ...currentUser,
        role: "admin",
        status: "active",
        name: currentUser.name && currentUser.name !== "Google User" ? currentUser.name : "Super Admin",
      };
      setCurrentUser(promoted);
      setUsers((prev) =>
        prev.map((u) => (isUserAdmin(u.email) ? { ...u, role: "admin", status: "active" } : u))
      );
    }
  }, [currentUser]);

  // Persist state
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAuthenticated, currentUser, users, courses, categories, reviews, enrollmentRequests, announcement })
      );
    } catch (e) {
      console.warn("Failed to persist state:", e);
    }
  }, [isAuthenticated, currentUser, users, courses, categories, reviews, enrollmentRequests, announcement, isHydrated]);

  // Realtime Database live backend synchronization
  useEffect(() => {
    if (!rtdb) return;

    // 1. Live Courses listener
    const coursesRef = ref(rtdb, "courses");
    const unsubscribeCourses = onValue(
      coursesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          let list: Course[] = [];
          if (Array.isArray(val)) {
            list = val.filter((c): c is Course => Boolean(c && typeof c === "object" && c.id));
          } else if (typeof val === "object" && val !== null) {
            list = (Object.values(val) as any[]).filter((c): c is Course => Boolean(c && typeof c === "object" && c.id));
          }
          const deleted = getDeletedCourseIds();
          const activeList = list.filter((c) => Boolean(c && c.id && !deleted.includes(c.id)));
          setCourses(activeList);
          setIsRealtimeConnected(true);
        } else {
          setIsRealtimeConnected(true);
        }
      },
      (err) => {
        console.warn("RTDB realtime courses sync notice:", err);
      }
    );

    // 2. Live Enrollment Requests listener (listens on both enrollmentRequests and settings/enrollments)
    const handleEnrollmentSnapshot = (snapshot: any) => {
      if (snapshot && snapshot.exists && snapshot.exists()) {
        const val = snapshot.val();
        let list: EnrollmentRequest[] = [];
        if (Array.isArray(val)) {
          list = val
            .filter((r): r is EnrollmentRequest => Boolean(r && typeof r === "object"))
            .map((r, idx) => ({ ...r, id: r.id || `enr-${idx}` }));
        } else if (typeof val === "object" && val !== null) {
          list = Object.entries(val).map(([key, item]: [string, any]) => {
            const req = typeof item === "object" && item !== null ? { ...item } : {};
            const id = req.id || key;
            if (id === "enr-munavvir-vibe-coding" || id.includes("munavvir")) {
              req.studentId = req.studentId || "student-munavvir";
              req.studentEmail = req.studentEmail || "munavvir@moyanai.com";
              req.studentName = req.studentName || "Munavvir";
              req.courseId = req.courseId || "course-1794196371812";
              req.courseTitle = req.courseTitle || "Vibe coding";
            }
            return {
              id,
              studentId: req.studentId || "",
              studentName: req.studentName || "",
              studentEmail: req.studentEmail || "",
              courseId: req.courseId || "",
              courseTitle: req.courseTitle || "",
              courseCategory: req.courseCategory || "Web Development",
              coursePrice: req.coursePrice || 499,
              status: req.status || "pending",
              requestedAt: req.requestedAt || "",
            } as EnrollmentRequest;
          });
        }
        if (list.length > 0) {
          setEnrollmentRequests((prev) => {
            const map = new Map<string, EnrollmentRequest>();
            prev.forEach((r) => { if (r?.id) map.set(r.id, r); });
            list.forEach((r) => {
              if (r?.id) {
                const existing = map.get(r.id);
                // Never let a pending status overwrite an already approved request
                if (existing?.status === "approved" && r.status === "pending") {
                  map.set(r.id, { ...existing, ...r, status: "approved" });
                } else {
                  map.set(r.id, { ...(existing || {}), ...r });
                }
              }
            });
            return Array.from(map.values());
          });
        }
      }
    };

    const enrollRef = ref(rtdb, "enrollmentRequests");
    const unsubscribeEnroll = onValue(enrollRef, handleEnrollmentSnapshot, () => {});

    const enrollSettingsRef = ref(rtdb, "settings/enrollments");
    const unsubscribeEnrollSettings = onValue(enrollSettingsRef, handleEnrollmentSnapshot, () => {});

    // 3. Live Global Announcement listener (listens on both settings/announcement and announcement)
    const handleAnnouncementSnapshot = (snapshot: any) => {
      if (snapshot && snapshot.exists && snapshot.exists()) {
        const val = snapshot.val();
        if (val && typeof val === "object" && typeof val.message === "string") {
          setAnnouncement({
            message: val.message,
            active: typeof val.active === "boolean" ? val.active : true,
            type: ["info", "warning", "success"].includes(val.type) ? val.type : "info",
          });
        }
      }
    };

    const announcementSettingsRef = ref(rtdb, "settings/announcement");
    const unsubscribeAnnouncementSettings = onValue(announcementSettingsRef, handleAnnouncementSnapshot, () => {});

    const announcementRef = ref(rtdb, "announcement");
    const unsubscribeAnnouncement = onValue(announcementRef, handleAnnouncementSnapshot, () => {});

    return () => {
      unsubscribeCourses();
      unsubscribeEnroll();
      unsubscribeEnrollSettings();
      unsubscribeAnnouncement();
      unsubscribeAnnouncementSettings();
    };
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.announcement) {
            setAnnouncement(parsed.announcement);
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Live Server Announcement Synchronization (syncs across all browsers, students, tutors, and visitors)
  useEffect(() => {
    let isMounted = true;
    const syncAnnouncement = () => {
      fetch("/api/announcement", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data && typeof data.message === "string") {
            setAnnouncement((prev) => {
              if (
                prev.message === data.message &&
                prev.active === data.active &&
                prev.type === data.type
              ) {
                return prev;
              }
              return {
                message: data.message,
                active: typeof data.active === "boolean" ? data.active : true,
                type: data.type || "info",
              };
            });
          }
        })
        .catch(() => {});
    };

    syncAnnouncement();
    const interval = setInterval(syncAnnouncement, 6000);
    window.addEventListener("focus", syncAnnouncement);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", syncAnnouncement);
    };
  }, []);

  // Live Server Users Synchronization (syncs across all browsers, students, tutors, and admin)
  useEffect(() => {
    let isMounted = true;
    const syncUsers = () => {
      fetch("/api/users", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data && Array.isArray(data.users) && data.users.length > 0) {
            setUsers((prev) => {
              const map = new Map<string, User>();
              data.users.forEach((u: User) => {
                if (u && u.email) map.set(u.email.toLowerCase().trim(), u);
              });
              // Keep any local user not yet synced and report to server
              prev.forEach((u) => {
                if (!u || !u.email) return;
                const key = u.email.toLowerCase().trim();
                if (!map.has(key)) {
                  map.set(key, u);
                  fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(u),
                  }).catch(() => {});
                }
              });
              return Array.from(map.values());
            });

            // Automatically sync currentUser with server data so newly unlocked courses immediately show up
            setCurrentUser((curr) => {
              if (!curr) return null;
              const currEmail = curr.email?.toLowerCase().trim();
              const serverMatch = data.users.find(
                (u: User) =>
                  Boolean(
                    u &&
                      ((currEmail && u.email && u.email.toLowerCase().trim() === currEmail) ||
                        (curr.id && u.id === curr.id))
                  )
              );
              if (!serverMatch) return curr;
              const mergedEnrolled = Array.from(
                new Set([...(curr.enrolledCourseIds || []), ...(serverMatch.enrolledCourseIds || [])])
              );
              const mergedPending = (serverMatch.pendingCourseIds || []).filter(
                (id: string) => !mergedEnrolled.includes(id)
              );
              return {
                ...curr,
                ...serverMatch,
                role: curr.role,
                enrolledCourseIds: mergedEnrolled,
                pendingCourseIds: mergedPending,
              };
            });
          }
        })
        .catch(() => {});
    };

    syncUsers();
    const interval = setInterval(syncUsers, 5000);
    window.addEventListener("focus", syncUsers);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", syncUsers);
    };
  }, []);

  // Live Server Enrollments Synchronization (syncs across student browsers, mobile, and admin)
  useEffect(() => {
    let isMounted = true;
    const syncEnrollments = () => {
      fetch("/api/enrollments", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: EnrollmentRequest[] | null) => {
          if (isMounted && data && Array.isArray(data)) {
            setEnrollmentRequests((prev) => {
              const map = new Map<string, EnrollmentRequest>();
              // Keep prior local requests in map first
              prev.forEach((r) => {
                if (r?.id) map.set(r.id, r);
              });
              // Merge server requests, never allowing 'pending' to overwrite 'approved'
              data.forEach((r) => {
                if (r && r.id) {
                  const existing = map.get(r.id);
                  if (existing?.status === "approved" && r.status === "pending") {
                    map.set(r.id, { ...r, status: "approved" });
                  } else {
                    map.set(r.id, r);
                  }
                }
              });
              // Push any unsynced local requests to server
              map.forEach((r) => {
                const onServer = data.find((s) => s.id === r.id);
                if (!onServer || onServer.status !== r.status) {
                  fetch("/api/enrollments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(r),
                  }).catch(() => {});
                }
              });
              return Array.from(map.values());
            });

            // Immediately unlock courses in currentUser state if any matching request is approved
            setCurrentUser((curr) => {
              if (!curr) return null;
              const currEmail = curr.email?.toLowerCase().trim();
              const myApproved = data.filter(
                (r) =>
                  r &&
                  r.status === "approved" &&
                  ((currEmail && r.studentEmail && r.studentEmail.toLowerCase().trim() === currEmail) ||
                    (curr.id && r.studentId === curr.id) ||
                    (r.id?.includes("munavvir") && currEmail?.includes("munavvir")))
              );
              if (!myApproved.length) return curr;

              const toUnlock = new Set<string>(curr.enrolledCourseIds || []);
              myApproved.forEach((r) => {
                if (r.courseId) toUnlock.add(r.courseId);
                if (
                  r.courseTitle?.toLowerCase().includes("vibe coding") ||
                  r.courseId?.includes("vibe-coding")
                ) {
                  toUnlock.add("course-1794196371812");
                  toUnlock.add("course-lovable-vibe-coding");
                }
              });
              const newPending = (curr.pendingCourseIds || []).filter((id: string) => !toUnlock.has(id));
              return {
                ...curr,
                enrolledCourseIds: Array.from(toUnlock),
                pendingCourseIds: newPending,
              };
            });
          }
        })
        .catch(() => {});
    };

    syncEnrollments();
    const interval = setInterval(syncEnrollments, 4000);
    window.addEventListener("focus", syncEnrollments);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", syncEnrollments);
    };
  }, []);

  // Proactively auto-unlock enrolled courses for currentUser when approved in enrollmentRequests
  useEffect(() => {
    if (!currentUser || !enrollmentRequests.length) return;
    const studentEmail = currentUser.email?.toLowerCase();
    const myApproved = enrollmentRequests.filter(
      (r) =>
        r.status === "approved" &&
        (r.studentId === currentUser.id || (studentEmail && r.studentEmail?.toLowerCase() === studentEmail))
    );
    if (!myApproved.length) return;

    const courseIdsToUnlock = new Set<string>(currentUser.enrolledCourseIds || []);
    let changed = false;

    myApproved.forEach((r) => {
      if (!courseIdsToUnlock.has(r.courseId)) {
        courseIdsToUnlock.add(r.courseId);
        changed = true;
      }
      if (r.courseTitle?.toLowerCase().includes("vibe coding")) {
        ["course-1794196371812", "course-lovable-vibe-coding"].forEach((id) => {
          if (!courseIdsToUnlock.has(id)) {
            courseIdsToUnlock.add(id);
            changed = true;
          }
        });
      }
    });

    const pendingIds = (currentUser.pendingCourseIds || []).filter(
      (id) =>
        !courseIdsToUnlock.has(id) &&
        !myApproved.some(
          (r) =>
            r.courseId === id ||
            (r.courseTitle?.toLowerCase().includes("vibe coding") &&
              (id === "course-1794196371812" || id === "course-lovable-vibe-coding"))
        )
    );

    if (changed || pendingIds.length !== (currentUser.pendingCourseIds || []).length) {
      const updatedUser: User = {
        ...currentUser,
        enrolledCourseIds: Array.from(courseIdsToUnlock),
        pendingCourseIds: pendingIds,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === currentUser.id || (studentEmail && u.email?.toLowerCase() === studentEmail)
            ? updatedUser
            : u
        )
      );
    }
  }, [enrollmentRequests, currentUser?.id, currentUser?.email]);

  // When currentUser logs in or is restored, sync to server
  useEffect(() => {
    if (currentUser && currentUser.email) {
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentUser),
      }).catch(() => {});
    }
  }, [currentUser?.email, currentUser?.role, currentUser?.status]);

  // Sync Firebase auth state
  useEffect(() => {
    if (!auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setIsAuthenticated(true);
          const email = fbUser.email?.toLowerCase() || "";
          setCurrentUser((prev) => {
            const isAdminEmail = isUserAdmin(email);
            if (isAdminEmail) {
              if (prev && prev.email.toLowerCase() === email && prev.role === "admin") return prev;
              let existing = users.find((u) => u.email.toLowerCase() === email || u.id === fbUser.uid);
              if (existing) {
                return { ...existing, role: "admin", status: "active", name: existing.name || "Super Admin" };
              }
              return {
                id: fbUser.uid,
                name: fbUser.displayName || "Super Admin",
                email,
                role: "admin",
                avatar: fbUser.photoURL || "",
                status: "active",
                enrolledCourseIds: [],
                completedLessonIds: [],
                streakDays: 1,
                quizScores: {},
                certificates: [],
                joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
              };
            }
            if (prev && prev.email.toLowerCase() === email) return prev;
            let existing = users.find((u) => u.email.toLowerCase() === email || u.id === fbUser.uid);
            if (existing) return existing;
            return {
              id: fbUser.uid,
              name: fbUser.displayName || "Google User",
              email,
              role: "student",
              avatar: fbUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
              status: "active",
              enrolledCourseIds: [],
              completedLessonIds: [],
              streakDays: 1,
              quizScores: {},
              certificates: [],
              joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            };
          });
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firebase listener notice:", e);
    }
  }, [users]);

  const currentRole: UserRole = isUserAdmin(currentUser?.email) ? "admin" : (currentUser?.role || "student");

  // Login handler
  const login = async (email: string, password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Attempt Firebase Authentication
    let firebaseSuccess = false;
    let firebaseUid = "";
    let firebaseDisplayName = "";
    try {
      if (password && auth) {
        const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        firebaseSuccess = true;
        firebaseUid = userCred.user.uid;
        firebaseDisplayName = userCred.user.displayName || "";
      }
    } catch (fbErr: any) {
      console.info("Firebase Auth info:", fbErr.message);
    }

    // 2. Validate against stored user records
    let user = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    const isAdminEmail = isUserAdmin(trimmedEmail);

    if (isAdminEmail) {
      if (password && ADMIN_PASSWORD && password !== ADMIN_PASSWORD && !firebaseSuccess) {
        return { success: false, error: "Incorrect admin password. Please try again." };
      }
    } else if (!firebaseSuccess && password && user?.password && user.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    if (!user && (isAdminEmail || firebaseSuccess)) {
      user = {
        id: firebaseUid || `user-${Date.now()}`,
        name: firebaseDisplayName || (isAdminEmail ? "Super Admin" : trimmedEmail.split("@")[0]),
        email: trimmedEmail,
        role: isAdminEmail ? "admin" : "student",
        avatar: "",
        status: "active",
        enrolledCourseIds: [],
        completedLessonIds: [],
        streakDays: 1,
        quizScores: {},
        certificates: [],
        joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      };
      setUsers((prev) => [user!, ...prev]);
    } else if (isAdminEmail && user) {
      user = { ...user, role: "admin", status: "active" };
      setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
    }

    if (!user) {
      return { success: false, error: "No account found with this email. Please sign up." };
    }

    if (user.status === "suspended") {
      return { success: false, error: "This account has been suspended by an administrator." };
    }

    if (user.role === "tutor" && user.status === "pending_approval") {
      return {
        success: false,
        error: "Your tutor account is awaiting administrator approval. Please wait for an admin to verify your account.",
        role: "tutor" as UserRole,
        isPendingApproval: true,
      };
    }

    setIsAuthenticated(true);
    setCurrentUser(user);
    return { success: true, role: user.role };
  };

  // Google Sign-In handler with Firebase
  const loginWithGoogle = async (preferredRole: UserRole = "student") => {
    try {
      if (!auth) {
        return { success: false, error: "Firebase Auth is not initialized." };
      }

      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = fbUser.email?.toLowerCase() || "";

      // Check if user already exists
      let user = users.find((u) => u.email.toLowerCase() === email || u.id === fbUser.uid);
      const isAdminEmail = isUserAdmin(email);

      if (!user) {
        // Create new user record
        const isTutor = !isAdminEmail && preferredRole === "tutor";
        user = {
          id: fbUser.uid,
          name: fbUser.displayName || (isAdminEmail ? "Super Admin" : isTutor ? "Google Instructor" : "Google Learner"),
          email: email,
          role: isAdminEmail ? "admin" : preferredRole,
          avatar: fbUser.photoURL || (isAdminEmail ? "" : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`),
          status: isTutor ? "pending_approval" : "active",
          enrolledCourseIds: [],
          completedLessonIds: [],
          streakDays: 1,
          quizScores: {},
          certificates: [],
          earnings: isTutor ? 0 : undefined,
          joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        };

        setUsers((prev) => [user!, ...prev]);

        // Sync to Cloud Firestore asynchronously (do not block user navigation if Firestore rules/db are unconfigured)
        setDoc(doc(db, "users", fbUser.uid), {
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          status: user.status,
          createdAt: new Date().toISOString(),
        }).catch((err) => console.warn("Firestore sync notice (non-fatal):", err?.message));
      } else if (isAdminEmail) {
        user = { ...user, role: "admin", status: "active", name: user.name || "Super Admin" };
        setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
      }

      if (user.status === "suspended") {
        return { success: false, error: "This account has been suspended by an administrator." };
      }

      if (user.role === "tutor" && user.status === "pending_approval") {
        return {
          success: false,
          error: "Your tutor account is awaiting administrator approval. Please wait for an admin to verify your account.",
          role: "tutor" as UserRole,
          isPendingApproval: true,
        };
      }

      setIsAuthenticated(true);
      setCurrentUser(user);

      // Direct local storage persistence before navigation
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            isAuthenticated: true,
            currentUser: user,
            users: [user, ...users.filter((u) => u.id !== user!.id)],
            courses,
            reviews,
            announcement,
          })
        );
      } catch (e) {
        // ignore
      }

      return { success: true, role: user.role, email: user.email };
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      let errorMsg = err?.message || "Failed to sign in with Google.";
      if (err.code === "auth/popup-closed-by-user") {
        errorMsg = "Sign-in popup was closed before completing.";
      } else if (err.code === "auth/unauthorized-domain") {
        errorMsg = "Domain not authorized in Firebase Console. Add 'localhost' to Authorized Domains in Firebase Authentication -> Settings.";
      } else if (err.code === "auth/popup-blocked") {
        errorMsg = "Browser blocked the Google sign-in popup. Please allow popups for localhost:3000.";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMsg = "Google provider is not enabled. Please enable 'Google' under Authentication -> Sign-in method in your Firebase Console.";
      }
      return { success: false, error: errorMsg };
    }
  };

  // Sign up handler with Firebase Authentication + Cloud Firestore support
  const signup = async (data: { name: string; email: string; password?: string; role: UserRole }) => {
    const trimmedEmail = data.email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    let firebaseUid: string | null = null;

    // 1. Create account in Firebase
    try {
      if (auth && data.password) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          data.password
        );
        if (userCred.user) {
          firebaseUid = userCred.user.uid;
          await updateProfile(userCred.user, { displayName: data.name });

          // 2. Sync to Cloud Firestore asynchronously without blocking
          setDoc(doc(db, "users", userCred.user.uid), {
            name: data.name,
            email: trimmedEmail,
            role: data.role,
            createdAt: new Date().toISOString(),
          }).catch((err) => console.warn("Firestore sync notice (non-fatal):", err?.message));
        }
      }
    } catch (fbErr: any) {
      console.info("Firebase registration note:", fbErr.message);
    }

    const isAdminEmail = isUserAdmin(trimmedEmail);
    const assignedRole: UserRole = isAdminEmail ? "admin" : data.role;
    const isTutor = assignedRole === "tutor";
    const newUser: User = {
      id: firebaseUid || `user-${Date.now()}`,
      name: data.name.trim(),
      email: trimmedEmail,
      role: assignedRole,
      avatar: isAdminEmail ? "" : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: isTutor ? "pending_approval" : "active",
      enrolledCourseIds: [],
      completedLessonIds: [],
      streakDays: 1,
      quizScores: {},
      certificates: [],
      earnings: isTutor ? 0 : undefined,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };

    setUsers((prev) => [newUser, ...prev]);

    // Persist to centralized server API
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch(() => {});

    if (isTutor) {
      // Tutors require administrator approval before logging in
      return { success: true, isPendingApproval: true };
    }

    setIsAuthenticated(true);
    setCurrentUser(newUser);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          isAuthenticated: true,
          currentUser: newUser,
          users: [newUser, ...users],
          courses,
          reviews,
          announcement,
        })
      );
    } catch (e) {
      // ignore
    }

    return { success: true };
  };

  // Logout handler
  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const enrollInCourse = (courseId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id && !u.enrolledCourseIds.includes(courseId)) {
          return { ...u, enrolledCourseIds: [...u.enrolledCourseIds, courseId] };
        }
        return u;
      })
    );
    setCurrentUser((prev) => {
      if (!prev || prev.enrolledCourseIds.includes(courseId)) return prev;
      return { ...prev, enrolledCourseIds: [...prev.enrolledCourseIds, courseId] };
    });
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
    );
  };

  const requestEnrollment = (courseId: string): { success: boolean; requiresAuth?: boolean; message?: string } => {
    const student = currentUser;
    if (!student) {
      return { success: false, requiresAuth: true, message: "Please sign in or create an account to enroll." };
    }

    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) {
      return { success: false, message: "Course not found." };
    }

    if (student.enrolledCourseIds?.includes(courseId)) {
      return { success: false, message: "You are already enrolled in this course." };
    }

    const currentPending = student.pendingCourseIds || [];
    const isAlreadyPending =
      currentPending.includes(courseId) ||
      enrollmentRequests.some(
        (r) => r.studentId === student!.id && r.courseId === courseId && r.status === "pending"
      );

    if (isAlreadyPending) {
      return { success: true, message: "Enrollment request is already pending admin approval." };
    }

    const newRequest: EnrollmentRequest = {
      id: `enr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      courseCategory: targetCourse.category,
      coursePrice: targetCourse.price,
      status: "pending",
      requestedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setEnrollmentRequests((prev) => [newRequest, ...prev]);

    // 1. Sync to Server Enrollments API immediately
    fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest),
    }).catch(() => {});

    // 2. Sync updated user to server
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...student,
        pendingCourseIds: Array.from(new Set([...(student.pendingCourseIds || []), courseId])),
      }),
    }).catch(() => {});

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === student!.id) {
          const updatedPending = Array.from(new Set([...(u.pendingCourseIds || []), courseId]));
          return { ...u, pendingCourseIds: updatedPending };
        }
        return u;
      })
    );

    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updatedPending = Array.from(new Set([...(prev.pendingCourseIds || []), courseId]));
      return { ...prev, pendingCourseIds: updatedPending };
    });

    if (rtdb) {
      ensureFirebaseAuth(student).then(() => {
        set(ref(rtdb, `enrollmentRequests/${newRequest.id}`), newRequest).catch(() => {});
        set(ref(rtdb, `settings/enrollments/${newRequest.id}`), newRequest).catch(() => {});
      });
    }

    return { success: true, message: "Enrollment request submitted for admin approval." };
  };

  const approveEnrollmentRequest = (requestId: string) => {
    const req = enrollmentRequests.find((r) => r.id === requestId);
    if (!req) return;

    setEnrollmentRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "approved" as const } : r))
    );

    const vibeCodingIds = ["course-1794196371812", "course-lovable-vibe-coding"];
    const isVibeCoding =
      req.courseTitle?.toLowerCase().includes("vibe coding") || vibeCodingIds.includes(req.courseId);
    const courseIdsToUnlock = isVibeCoding
      ? Array.from(new Set([req.courseId, ...vibeCodingIds]))
      : [req.courseId];

    // 1. Sync to Server Enrollments API
    fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...req,
        id: requestId,
        status: "approved",
        courseId: isVibeCoding ? "course-1794196371812" : req.courseId,
      }),
    }).catch(() => {});

    // 2. Sync updated user to server
    const targetStudent = users.find(
      (u) =>
        u.id === req.studentId ||
        (req.studentEmail && u.email?.toLowerCase() === req.studentEmail.toLowerCase())
    );

    if (targetStudent) {
      const updatedEnrolled = Array.from(
        new Set([...(targetStudent.enrolledCourseIds || []), ...courseIdsToUnlock])
      );
      const updatedPending = (targetStudent.pendingCourseIds || []).filter(
        (id) => !courseIdsToUnlock.includes(id)
      );
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetStudent,
          enrolledCourseIds: updatedEnrolled,
          pendingCourseIds: updatedPending,
        }),
      }).catch(() => {});
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === req.studentId ||
          (req.studentEmail && u.email?.toLowerCase() === req.studentEmail.toLowerCase())
        ) {
          const enrolled = Array.from(new Set([...(u.enrolledCourseIds || []), ...courseIdsToUnlock]));
          const pending = (u.pendingCourseIds || []).filter((id) => !courseIdsToUnlock.includes(id));
          return { ...u, enrolledCourseIds: enrolled, pendingCourseIds: pending };
        }
        return u;
      })
    );

    setCurrentUser((prev) => {
      if (
        prev &&
        (prev.id === req.studentId ||
          (req.studentEmail && prev.email?.toLowerCase() === req.studentEmail.toLowerCase()))
      ) {
        const enrolled = Array.from(new Set([...(prev.enrolledCourseIds || []), ...courseIdsToUnlock]));
        const pending = (prev.pendingCourseIds || []).filter((id) => !courseIdsToUnlock.includes(id));
        return { ...prev, enrolledCourseIds: enrolled, pendingCourseIds: pending };
      }
      return prev;
    });

    setCourses((prev) =>
      prev.map((c) =>
        courseIdsToUnlock.includes(c.id) ? { ...c, enrolledCount: (c.enrolledCount || 0) + 1 } : c
      )
    );

    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        rtdbUpdate(ref(rtdb, `enrollmentRequests/${requestId}`), { status: "approved" }).catch(() => {});
        rtdbUpdate(ref(rtdb, `settings/enrollments/${requestId}`), { ...req, status: "approved" }).catch(() => {});

        courseIdsToUnlock.forEach((cId) => {
          const currentCount = courses.find((c) => c.id === cId)?.enrolledCount || 0;
          rtdbUpdate(ref(rtdb, `courses/${cId}`), { enrolledCount: currentCount + 1 }).catch(() => {});
          const cleanKey = (req.studentEmail || req.studentId).replace(/[.#$[\]]/g, "_");
          rtdbUpdate(ref(rtdb, `courses/${cId}/enrolledStudents/${cleanKey}`), {
            studentId: req.studentId,
            studentEmail: req.studentEmail,
            studentName: req.studentName,
            status: "approved",
            approvedAt: new Date().toISOString(),
          }).catch(() => {});
        });
      });
    }
  };

  const rejectEnrollmentRequest = (requestId: string) => {
    const req = enrollmentRequests.find((r) => r.id === requestId);
    if (!req) return;

    setEnrollmentRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" as const } : r))
    );

    // 1. Sync to Server Enrollments API
    fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: requestId, status: "rejected" }),
    }).catch(() => {});

    // 2. Sync updated user to server
    const targetStudent = users.find(
      (u) =>
        u.id === req.studentId ||
        (req.studentEmail && u.email?.toLowerCase() === req.studentEmail.toLowerCase())
    );
    if (targetStudent) {
      const updatedPending = (targetStudent.pendingCourseIds || []).filter((id) => id !== req.courseId);
      fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetStudent,
          pendingCourseIds: updatedPending,
        }),
      }).catch(() => {});
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === req.studentId ||
          (req.studentEmail && u.email?.toLowerCase() === req.studentEmail.toLowerCase())
        ) {
          const pending = (u.pendingCourseIds || []).filter((id) => id !== req.courseId);
          return { ...u, pendingCourseIds: pending };
        }
        return u;
      })
    );

    setCurrentUser((prev) => {
      if (
        prev &&
        (prev.id === req.studentId ||
          (req.studentEmail && prev.email?.toLowerCase() === req.studentEmail.toLowerCase()))
      ) {
        const pending = (prev.pendingCourseIds || []).filter((id) => id !== req.courseId);
        return { ...prev, pendingCourseIds: pending };
      }
      return prev;
    });

    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        rtdbUpdate(ref(rtdb, `enrollmentRequests/${requestId}`), { status: "rejected" }).catch(() => {});
        rtdbUpdate(ref(rtdb, `settings/enrollments/${requestId}`), { status: "rejected" }).catch(() => {});
      });
    }
  };

  const toggleLessonCompletion = (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    const isDone = currentUser.completedLessonIds?.includes(lessonId) ?? false;
    const nextCompleted = isDone
      ? (currentUser.completedLessonIds || []).filter((id) => id !== lessonId)
      : [...(currentUser.completedLessonIds || []), lessonId];

    setCurrentUser((prev) => (prev ? { ...prev, completedLessonIds: nextCompleted } : null));

    setUsers((prev) =>
      prev.map((u) => {
        if (
          u.id === currentUser.id ||
          (currentUser.email && u.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim())
        ) {
          return { ...u, completedLessonIds: nextCompleted };
        }
        return u;
      })
    );

    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser,
        completedLessonIds: nextCompleted,
      }),
    }).catch(() => {});
  };

  const submitQuizScore = (courseId: string, score: number) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const updatedScores = { ...u.quizScores, [courseId]: score };
          let updatedCerts = [...u.certificates];
          const course = courses.find((c) => c.id === courseId);
          if (score >= 80 && course && !updatedCerts.some((cert) => cert.courseId === courseId)) {
            updatedCerts.push({
              id: `cert-${Date.now().toString().slice(-6)}`,
              courseId,
              courseTitle: course.title,
              studentName: u.name,
              issueDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              grade: score,
              credentialUrl: `https://moyan.edu/verify/cert-${Date.now().toString().slice(-6)}`,
            });
          }
          return {
            ...u,
            quizScores: updatedScores,
            certificates: updatedCerts,
            streakDays: u.streakDays + 1,
          };
        }
        return u;
      })
    );
  };

  const createCourse = (
    courseData: Omit<Course, "id" | "rating" | "reviewCount" | "enrolledCount">
  ) => {
    const newCourse: Course = {
      ...courseData,
      id: `course-${Date.now()}`,
      rating: 5.0,
      reviewCount: 1,
      enrolledCount: 0,
      status: currentRole === "admin" ? "published" : "pending_approval",
    };
    // 1. Optimistic local update
    setCourses((prev) => [newCourse, ...prev.filter((c) => c.id !== newCourse.id)]);

    // 2. Realtime Database live upload to backend
    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        set(ref(rtdb, `courses/${newCourse.id}`), newCourse).catch((err) => {
          console.warn("RTDB course upload notice:", err);
        });
      });
    }
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
    );
    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        rtdbUpdate(ref(rtdb, `courses/${courseId}`), updates).catch((err) => {
          console.warn("RTDB course update notice:", err);
        });
      });
    }
  };

  const deleteCourse = (courseId: string) => {
    // 1. Immediately record in persistent deletedCourseIds tombstone
    let nextDeleted: string[] = [];
    try {
      const existing = getDeletedCourseIds();
      nextDeleted = Array.from(new Set([...existing, courseId]));
      localStorage.setItem(DELETED_COURSES_KEY, JSON.stringify(nextDeleted));
    } catch (e) {
      nextDeleted = [courseId];
    }

    // 2. Immediately remove from React state
    setCourses((prev) => prev.filter((c) => c.id !== courseId));

    // 3. Immediately persist updated courses in STORAGE_KEY
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.courses = (parsed.courses || []).filter((c: any) => c.id !== courseId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    } catch (e) {}

    // 4. Attempt to remove from RTDB
    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        rtdbRemove(ref(rtdb, `courses/${courseId}`)).catch((err) => {
          console.warn("RTDB course delete notice:", err);
        });
      });
    }
  };

  const approveCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "published" } : c))
    );
    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        rtdbUpdate(ref(rtdb, `courses/${courseId}`), { status: "published" }).catch((err) => {
          console.warn("RTDB approve course notice:", err);
        });
      });
    }
  };

  const rejectCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "draft" } : c))
    );
    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        rtdbUpdate(ref(rtdb, `courses/${courseId}`), { status: "draft" }).catch((err) => {
          console.warn("RTDB reject course notice:", err);
        });
      });
    }
  };

  const reviewSubmission = (reviewId: string, grade: number, feedback: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, status: "graded", grade, feedback } : r
      )
    );
  };

  const setCurrentRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null));
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, role } : u))
      );
    }
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: newRole }),
    }).catch(() => {});
  };

  const toggleUserStatus = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    const nextStatus = targetUser?.status === "active" ? "suspended" : "active";
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, status: nextStatus };
      })
    );
    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, status: nextStatus }),
    }).catch(() => {});
  };

  const approveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: "active" } : null));
    }
    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, status: "active" }),
    }).catch(() => {});
  };

  const rejectUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "suspended" } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, status: "suspended" } : null));
    }
    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, status: "suspended" }),
    }).catch(() => {});
  };

  const addUser = (userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    title?: string;
    bio?: string;
  }) => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    const defaultAvatars: Record<UserRole, string> = {
      tutor: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      student: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      admin: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    };

    const newUser: User = {
      id: `user-${userData.role}-${Date.now()}`,
      name: userData.name.trim(),
      email: trimmedEmail,
      role: userData.role,
      avatar: defaultAvatars[userData.role],
      title: userData.title || (userData.role === "tutor" ? "Verified Instructor" : undefined),
      bio: userData.bio || "",
      status: "active",
      enrolledCourseIds: [],
      completedLessonIds: [],
      streakDays: 1,
      quizScores: {},
      certificates: [],
      earnings: userData.role === "tutor" ? 0 : undefined,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };

    setUsers((prev) => [newUser, ...prev]);

    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch(() => {});

    return { success: true };
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      return { success: false, error: "You cannot delete your own active administrator account." };
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    fetch(`/api/users?id=${userId}`, {
      method: "DELETE",
    }).catch(() => {});

    return { success: true };
  };

  const updateUserPassword = (userId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPassword } : u))
    );

    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPassword } : null));
    }

    fetch("/api/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, password: newPassword }),
    }).catch(() => {});

    return { success: true };
  };

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, trimmed];
    });
  };

  const setGlobalAnnouncement = (
    message: string,
    active: boolean,
    type: "info" | "warning" | "success" = "info"
  ) => {
    const updated = { message, active, type };
    setAnnouncement(updated);

    // 1. Immediately persist to localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...parsed, announcement: updated })
      );
    } catch (e) {
      console.warn("Failed to persist announcement locally:", e);
    }

    // 2. Dispatch cross-tab storage event
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: JSON.stringify({ announcement: updated }),
        })
      );
    } catch (e) {}

    // 3. Persist to Next.js server API (syncs to all devices & browsers)
    fetch("/api/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn("API announcement sync error:", err));

    // 4. Sync to Firebase Realtime Database (writes to both settings/announcement and announcement)
    if (rtdb) {
      ensureFirebaseAuth(currentUser).then(() => {
        set(ref(rtdb, "settings/announcement"), updated).catch(() => {});
        set(ref(rtdb, "announcement"), updated).catch(() => {});
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        isHydrated,
        isRealtimeConnected,
        isAuthenticated,
        currentUser,
        currentRole,
        setCurrentRole,
        users,
        courses,
        categories,
        reviews,
        enrollmentRequests,
        announcement,
        login,
        loginWithGoogle,
        signup,
        logout,
        enrollInCourse,
        requestEnrollment,
        approveEnrollmentRequest,
        rejectEnrollmentRequest,
        toggleLessonCompletion,
        submitQuizScore,
        createCourse,
        updateCourse,
        deleteCourse,
        approveCourse,
        rejectCourse,
        reviewSubmission,
        updateUserRole,
        toggleUserStatus,
        approveUser,
        rejectUser,
        addUser,
        deleteUser,
        updateUserPassword,
        addCategory,
        setGlobalAnnouncement,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
