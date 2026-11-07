"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "./firebase";
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
  status: "active" | "suspended";
  enrolledCourseIds: string[];
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

const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Prompt Engineering Mastery",
    tagline: "Master LLM orchestration, structured outputs, and chain-of-thought prompting",
    description:
      "Deep dive into crafting high-performance system instructions, few-shot prompting, schema-constrained outputs, and autonomous reasoning agents using modern frontier LLMs.",
    instructor: {
      id: "user-tutor-1",
      name: "Dr. Elena Vance",
      title: "Staff AI Researcher at DeepMind Labs",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    category: "Generative AI",
    level: "Beginner",
    duration: "4h 30m",
    rating: 4.9,
    reviewCount: 428,
    enrolledCount: 3820,
    price: 49,
    status: "published",
    modules: [
      {
        id: "m1",
        title: "Module 1: Foundations of Prompt Architecture",
        lessons: [
          {
            id: "l1-1",
            title: "Zero-Shot vs Few-Shot Prompting Mechanics",
            duration: "14:20",
            videoUrl: "https://www.youtube.com/embed/jC4v5AS4RIM",
            summary: "Learn how token probabilities shape generative reasoning and when few-shot examples boost accuracy.",
            content:
              "In this lesson, we break down the underlying token prediction pipeline. You will explore how setting system roles, providing exemplars with consistent delimiters, and crafting edge-case reasoning anchors transform vague LLM completions into structured, deterministic outputs.",
          },
          {
            id: "l1-2",
            title: "Chain of Thought (CoT) & Step-by-Step Reasoning",
            duration: "18:45",
            videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
            summary: "Implement zero-shot CoT and least-to-most prompting for complex multi-step arithmetic and reasoning.",
            content:
              "Chain of Thought prompting enables models to decompose complex queries into intermediate reasoning steps. We examine why 'think step-by-step' works mathematically and how to prevent hallucinations during intermediate calculations.",
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Structured Outputs & Function Calling",
        lessons: [
          {
            id: "l2-1",
            title: "JSON Schema Constraints & Type Enforcement",
            duration: "21:10",
            videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A",
            summary: "Guarantee structured JSON output with Zod schemas and API tool definitions.",
            content:
              "Learn how frontier inference engines constrain grammar generation at decoding time to guarantee syntactically valid JSON responses that strictly adhere to your data models.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q1",
        question: "Which prompting technique forces an LLM to generate intermediate reasoning tokens before arriving at a final conclusion?",
        options: [
          "Zero-shot classification",
          "Chain of Thought (CoT) prompting",
          "Temperature sampling reduction",
          "Embedding quantization",
        ],
        correctIndex: 1,
        explanation: "Chain of Thought (CoT) prompts the model to articulate explicit reasoning steps before outputting the final answer, significantly reducing logical errors.",
      },
      {
        id: "q2",
        question: "What is the primary benefit of few-shot prompting compared to fine-tuning?",
        options: [
          "It modifies the model weights permanently",
          "It allows rapid contextual adaptation without expensive weight recalculation",
          "It eliminates the need for context window memory",
          "It guarantees 100% deterministic outputs every time",
        ],
        correctIndex: 1,
        explanation: "Few-shot prompting adapts the model inside in-context memory instantly without the cost, compute, and latency of retraining or fine-tuning weights.",
      },
    ],
  },
  {
    id: "course-2",
    title: "Machine Learning Foundations",
    tagline: "From linear algebra and gradient descent to neural network architectures",
    description:
      "A rigorous, visual exploration of modern machine learning algorithms, loss surfaces, backpropagation calculus, and deep learning architectures.",
    instructor: {
      id: "user-tutor-2",
      name: "Marcus Aurelius Vance",
      title: "Principal ML Systems Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    category: "Data Science",
    level: "Intermediate",
    duration: "7h 15m",
    rating: 4.8,
    reviewCount: 312,
    enrolledCount: 2190,
    price: 79,
    status: "published",
    modules: [
      {
        id: "m2-1",
        title: "Module 1: The Mathematics of Optimization",
        lessons: [
          {
            id: "l2-1-1",
            title: "Gradient Descent & Loss Functions in Practice",
            duration: "24:10",
            videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w",
            summary: "Explore convex vs non-convex optimization, learning rates, and momentum optimizers.",
            content:
              "Understand stochastic gradient descent (SGD), Adam, and RMSprop. We visualize high-dimensional loss landscapes and dissect why adaptive moment estimation prevents saddle-point stagnation.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q2-1",
        question: "What problem does the Adam optimizer mitigate through momentum and second-moment scaling?",
        options: [
          "Vanishing activation functions",
          "Oscillations in steep ravines and slow progress along flat plateaus",
          "Overfitting on unlabelled training data",
          "GPU memory bottlenecking",
        ],
        correctIndex: 1,
        explanation: "Adam combines momentum (first moment) with adaptive learning rates per parameter (second moment), stabilizing optimization through valleys and accelerating across plateaus.",
      },
    ],
  },
  {
    id: "course-3",
    title: "Build Production Apps with Gemini API",
    tagline: "Multimodal AI applications with Next.js, Gemini 2.0 Flash, and Vector Search",
    description:
      "Build production-grade generative AI applications from scratch using Google Gemini API, streaming responses, multimodal image/audio processing, and RAG pipelines.",
    instructor: {
      id: "user-tutor-1",
      name: "Dr. Elena Vance",
      title: "Staff AI Researcher at DeepMind Labs",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    category: "Web Dev & AI",
    level: "Advanced",
    duration: "6h 40m",
    rating: 4.95,
    reviewCount: 189,
    enrolledCount: 1640,
    price: 99,
    status: "published",
    modules: [
      {
        id: "m3-1",
        title: "Module 1: Gemini 2.0 Architecture & Multimodality",
        lessons: [
          {
            id: "l3-1-1",
            title: "Streaming Tokens & Realtime Audio/Vision Input",
            duration: "19:30",
            videoUrl: "https://www.youtube.com/embed/jC4v5AS4RIM",
            summary: "Connect to the Gemini API with HTTP server-sent events for ultra-low latency interactive apps.",
            content:
              "Learn how to stream chunks over HTTP, handle interrupted generations gracefully, and feed real-time image buffers into Gemini's vision encoder for instant perceptual reasoning.",
          },
        ],
      },
    ],
    quiz: [
      {
        id: "q3-1",
        question: "Which protocol is typically used to deliver streaming LLM responses to a modern web client?",
        options: ["FTP", "Server-Sent Events (SSE)", "SOAP XML", "WebRTC Datachannel only"],
        correctIndex: 1,
        explanation: "Server-Sent Events (SSE) provide a lightweight, standard unidirectional streaming protocol over HTTP perfectly suited for token-by-token generation.",
      },
    ],
  },
];

const INITIAL_USERS: User[] = [
  {
    id: "user-student-1",
    name: "Alex Chen",
    email: "alex.chen@student.moyan.edu",
    password: "password123",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    title: "Curious Learner & Software Engineer",
    bio: "Passionate about generative models, full-stack architectures, and AI-assisted workflows.",
    status: "active",
    enrolledCourseIds: ["course-1", "course-2"],
    completedLessonIds: ["l1-1"],
    streakDays: 7,
    quizScores: {
      "course-1": 100,
    },
    certificates: [
      {
        id: "cert-moyan-883",
        courseId: "course-1",
        courseTitle: "Prompt Engineering Mastery",
        studentName: "Alex Chen",
        issueDate: "October 20, 2026",
        grade: 100,
        credentialUrl: "https://moyan.edu/verify/cert-moyan-883",
      },
    ],
    joinedDate: "Sept 2026",
  },
  {
    id: "user-tutor-1",
    name: "Dr. Elena Vance",
    email: "elena.vance@tutor.moyan.edu",
    password: "password123",
    role: "tutor",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Staff AI Researcher at DeepMind Labs",
    bio: "PhD in Machine Learning. Author of 'Frontier Prompting'. Helping 5,000+ students master next-generation AI.",
    status: "active",
    enrolledCourseIds: [],
    completedLessonIds: [],
    streakDays: 42,
    quizScores: {},
    certificates: [],
    earnings: 14850,
    joinedDate: "Jan 2026",
  },
  {
    id: "user-admin-1",
    name: "Super Admin",
    email: "marcus.admin@moyan.edu",
    password: "password123",
    role: "admin",
    avatar: "",
    title: "Platform Administrator & Head of Ops",
    bio: "Overseeing learning quality, curriculum approvals, platform security, and tutor verification at Moyan Learn.",
    status: "active",
    enrolledCourseIds: [],
    completedLessonIds: [],
    streakDays: 120,
    quizScores: {},
    certificates: [],
    joinedDate: "Dec 2025",
  },
];

const INITIAL_REVIEWS: SubmissionReview[] = [
  {
    id: "sub-1",
    studentId: "user-student-1",
    studentName: "Alex Chen",
    courseId: "course-1",
    courseTitle: "Prompt Engineering Mastery",
    taskTitle: "Design a Zero-Shot Prompt with Strict JSON Output for Financial Sentiment",
    submissionText:
      "System prompt: You are a financial analyst. Analyze the sentiment of the provided earning call excerpt. Output ONLY valid JSON matching this schema: { sentiment: 'bullish'|'bearish'|'neutral', confidence: float(0..1), keyDrivers: string[] }.",
    submittedAt: "2 hours ago",
    status: "pending",
  },
  {
    id: "sub-2",
    studentId: "user-student-2",
    studentName: "Maya Lin",
    courseId: "course-1",
    courseTitle: "Prompt Engineering Mastery",
    taskTitle: "Implement Least-to-Most Decomposition Prompt",
    submissionText: "Decomposed the problem into 3 sub-questions with sequential reasoning checks before final answer generation.",
    submittedAt: "Yesterday",
    status: "graded",
    grade: 98,
    feedback: "Exceptional breakdown! The constraints on intermediate hallucinations were particularly well-defined.",
  },
];

interface AppContextType {
  isHydrated: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  users: User[];
  courses: Course[];
  reviews: SubmissionReview[];
  announcement: { message: string; active: boolean; type: "info" | "warning" | "success" };
  // Auth Actions
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (data: { name: string; email: string; password?: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Core Actions
  enrollInCourse: (courseId: string) => void;
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
  setGlobalAnnouncement: (message: string, active: boolean, type?: "info" | "warning" | "success") => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = "moyan_learn_platform_state_v4";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [reviews, setReviews] = useState<SubmissionReview[]>(INITIAL_REVIEWS);
  const [announcement, setAnnouncement] = useState<{
    message: string;
    active: boolean;
    type: "info" | "warning" | "success";
  }>({
    message: "🚀 Gemini 2.0 AI Tutor features are now live! Enjoy adaptive course pathways and real-time guidance.",
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
          if (user.role === "admin") {
            user.name = "Super Admin";
            user.avatar = "";
          }
          setCurrentUser(user);
        }
        if (parsed.users) {
          const updatedUsers = parsed.users.map((u: User) =>
            u.role === "admin" ? { ...u, name: "Super Admin", avatar: "" } : u
          );
          setUsers(updatedUsers);
        }
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.reviews) setReviews(parsed.reviews);
        if (parsed.announcement) setAnnouncement(parsed.announcement);
      }
    } catch (e) {
      console.warn("Failed to load local state:", e);
    }
    setIsHydrated(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isAuthenticated, currentUser, users, courses, reviews, announcement })
      );
    } catch (e) {
      console.warn("Failed to persist state:", e);
    }
  }, [isAuthenticated, currentUser, users, courses, reviews, announcement, isHydrated]);

  // Sync Firebase auth state
  useEffect(() => {
    if (!auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setIsAuthenticated(true);
          const email = fbUser.email?.toLowerCase() || "";
          setCurrentUser((prev) => {
            if (prev && prev.email.toLowerCase() === email) return prev;
            const existing = users.find((u) => u.email.toLowerCase() === email || u.id === fbUser.uid);
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

  const currentRole: UserRole = currentUser?.role || "student";

  // Login handler
  const login = async (email: string, password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Attempt Firebase Authentication
    try {
      if (password && auth) {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
    } catch (fbErr: any) {
      console.info("Firebase Auth info:", fbErr.message);
    }

    // 2. Validate against stored user records
    let user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return { success: false, error: "No account found with this email. Please sign up." };
    }

    if (user.status === "suspended") {
      return { success: false, error: "This account has been suspended by an administrator." };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
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

      if (!user) {
        // Create new user record
        user = {
          id: fbUser.uid,
          name: fbUser.displayName || "Google Learner",
          email: email,
          role: preferredRole,
          avatar: fbUser.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
          status: "active",
          enrolledCourseIds: [],
          completedLessonIds: [],
          streakDays: 1,
          quizScores: {},
          certificates: [],
          joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        };

        setUsers((prev) => [user!, ...prev]);

        // Sync to Cloud Firestore asynchronously (do not block user navigation if Firestore rules/db are unconfigured)
        setDoc(doc(db, "users", fbUser.uid), {
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: new Date().toISOString(),
        }).catch((err) => console.warn("Firestore sync notice (non-fatal):", err?.message));
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

      return { success: true, role: user.role };
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
      if (auth) {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          trimmedEmail,
          data.password || "password123"
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

    const newUser: User = {
      id: firebaseUid || `user-${Date.now()}`,
      name: data.name.trim(),
      email: trimmedEmail,
      password: data.password || "password123",
      role: data.role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: "active",
      enrolledCourseIds: [],
      completedLessonIds: [],
      streakDays: 1,
      quizScores: {},
      certificates: [],
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    };

    setUsers((prev) => [newUser, ...prev]);
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
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, enrolledCount: c.enrolledCount + 1 } : c))
    );
  };

  const toggleLessonCompletion = (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const completed = u.completedLessonIds.includes(lessonId)
            ? u.completedLessonIds.filter((id) => id !== lessonId)
            : [...u.completedLessonIds, lessonId];
          return { ...u, completedLessonIds: completed };
        }
        return u;
      })
    );
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
    setCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updates } : c))
    );
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const approveCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "published" } : c))
    );
  };

  const rejectCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "draft" } : c))
    );
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
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u
      )
    );
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
      password: userData.password || "password123",
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
    return { success: true };
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      return { success: false, error: "You cannot delete your own active administrator account." };
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
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

    return { success: true };
  };

  const setGlobalAnnouncement = (
    message: string,
    active: boolean,
    type: "info" | "warning" | "success" = "info"
  ) => {
    setAnnouncement({ message, active, type });
  };

  return (
    <AppContext.Provider
      value={{
        isHydrated,
        isAuthenticated,
        currentUser,
        currentRole,
        setCurrentRole,
        users,
        courses,
        reviews,
        announcement,
        login,
        loginWithGoogle,
        signup,
        logout,
        enrollInCourse,
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
        addUser,
        deleteUser,
        updateUserPassword,
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
