"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Brain,
  BookOpen,
  Trophy,
  MessageSquare,
  BarChart3,
  Zap,
  Star,
  PlayCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  { icon: Brain, title: "Gemini AI tutor", text: "Ask anything, 24/7. Explanations that adapt to how you learn in real-time." },
  { icon: BookOpen, title: "Adaptive courses", text: "Lessons reshape themselves around your strengths, pacing, and gaps." },
  { icon: MessageSquare, title: "Instant feedback", text: "Assignments graded in seconds with clear, actionable guidance." },
  { icon: BarChart3, title: "Smart analytics", text: "See progress, streaks, and concept mastery at a single glance." },
  { icon: Trophy, title: "Certificates", text: "Earn verifiable credentials with score badges as you complete paths." },
  { icon: Zap, title: "Quiz generator", text: "Turn any curriculum topic into practice questions with instant grading." },
];

const topics = [
  "Python",
  "Data Science",
  "Generative AI",
  "UI Design",
  "Marketing",
  "Finance",
  "Web Dev",
  "Prompting",
  "Cloud",
  "Productivity",
];

export default function HomePage() {
  const { courses, currentRole, setCurrentRole } = useAppStore();

  const publishedCourses = courses.filter((c) => c.status === "published");

  return (
    <div className="min-h-screen overflow-hidden bg-background font-sans text-foreground">
      {/* Hero Section */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div
          className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-primary-glow/20 blur-2xl will-change-transform"
        />
        <div
          className="pointer-events-none absolute -right-10 top-20 h-80 w-80 rounded-full bg-accent/30 blur-2xl will-change-transform"
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            {"Learn anything,".split(" ").map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="mr-[0.25em] inline-block"
              >
                {w}
              </motion.span>
            ))}
            {"smarter with AI".split(" ").map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 40, rotateX: -60 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.35 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-gradient animate-shimmer mr-[0.25em] inline-block"
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            A personal AI tutor, adaptive courses and instant feedback — now with dedicated
            portals for <strong className="text-foreground">Students</strong>, <strong className="text-foreground">Tutors</strong>, and <strong className="text-foreground">Admins</strong>.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/user/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-105"
            >
              Start Student Experience <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 font-semibold text-foreground transition-colors hover:border-primary/40 shadow-sm"
            >
              <PlayCircle className="h-5 w-5 text-primary" /> Browse All Courses
            </Link>
          </motion.div>



          {/* Interactive Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-3xl border border-border bg-card p-4 text-left shadow-elegant md:p-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-3 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground">Continue learning</p>
                    <Link href="/user/dashboard" className="text-xs font-semibold text-primary hover:underline">
                      View all enrolled &rarr;
                    </Link>
                  </div>

                  {publishedCourses.slice(0, 3).map((c, i) => {
                    const mockProgress = [75, 45, 20][i] || 30;
                    return (
                      <Link
                        key={c.id}
                        href={`/user/learn/${c.id}`}
                        className="block rounded-2xl border border-border bg-muted/60 p-4 transition-all hover:border-primary/40 hover:bg-muted"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-foreground">{c.title}</span>
                          <span className="text-xs font-medium text-muted-foreground">{mockProgress}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${mockProgress}%` }}
                            transition={{ delay: 0.8 + i * 0.2, duration: 1.2 }}
                            className="h-full rounded-full bg-gradient-primary"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-col rounded-2xl bg-gradient-primary p-4 text-primary-foreground md:col-span-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4" /> Gemini AI Tutor
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary-foreground/20 px-3.5 py-2"
                    >
                      Explain neural networks simply?
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 }}
                      className="w-fit max-w-[90%] rounded-2xl rounded-bl-sm bg-card px-3.5 py-2.5 text-card-foreground shadow-sm"
                    >
                      Think of it like a team of tiny decision makers, each passing hints to the next…
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: 2.2 }}
                      className="flex gap-1 pl-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -left-6 -top-6 hidden items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card md:flex"
            >
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">7-day streak!</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -right-6 hidden items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-card md:flex"
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">Quiz score 96%</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Topics Marquee */}
      <div className="border-y border-border bg-card/60 py-5">
        <div className="flex w-max animate-marquee gap-10">
          {[...topics, ...topics].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-20 md:grid-cols-4">
        {[
          ["120K+", "Active learners"],
          ["850+", "AI-powered courses"],
          ["4.9★", "Average rating"],
          ["3x", "Faster mastery"],
        ].map(([n, l], i) => (
          <motion.div
            key={l}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={i}
            className="text-center"
          >
            <p className="text-gradient text-4xl font-extrabold md:text-5xl">{n}</p>
            <p className="mt-2 text-sm text-muted-foreground">{l}</p>
          </motion.div>
        ))}
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
            Everything you need to grow
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              whileHover={{ y: -8 }}
              className="group rounded-3xl border border-border bg-card p-7 shadow-card transition-colors hover:border-primary/40"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary transition-all group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Curriculum</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                Popular learning paths
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Browse complete library <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {publishedCourses.map((c, i) => (
              <motion.div
                key={c.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                whileHover={{ scale: 1.03 }}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all"
              >
                <div>
                  <div className="relative h-44 bg-gradient-primary">
                    <div className="absolute inset-0 bg-grid opacity-60" />
                    <BookOpen className="absolute bottom-4 right-4 h-14 w-14 text-primary-foreground/30 transition-transform group-hover:scale-110" />
                    <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
                      {c.level}
                    </span>
                    <span className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-bold text-primary-foreground">
                      ${c.price}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {c.category}
                    </div>
                    <h3 className="mt-2 text-lg font-bold leading-snug">{c.title}</h3>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {c.tagline}
                    </p>

                    <div className="mt-5 flex items-center gap-2 border-t border-border/60 pt-4">
                      <img
                        src={c.instructor.avatar}
                        alt={c.instructor.name}
                        loading="lazy"
                        decoding="async"
                        className="h-7 w-7 rounded-full border border-border object-cover"
                      />
                      <span className="text-xs font-medium text-foreground">{c.instructor.name}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 bg-muted/30 px-6 py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {c.rating}
                    <span className="text-muted-foreground font-normal">({c.reviewCount})</span>
                  </div>
                  <Link
                    href={`/user/learn/${c.id}`}
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                  >
                    Open Course <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Loved by Learners</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">What our community says</h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            ["Aisha K.", "The AI tutor feels like a patient professor who's always available. My confidence went through the roof."],
            ["Rahul M.", "I finished my Machine Learning course in half the time. The interactive quiz generator is pure magic."],
            ["Sara P.", "Beautiful, calm and genuinely motivating to use every single day. The streak tracker keeps me on fire!"],
          ].map(([n, q], i) => (
            <motion.figure
              key={n}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              custom={i}
              className="rounded-3xl border border-border bg-card p-7 shadow-card"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mt-4 text-base italic text-foreground leading-relaxed">
                "{q}"
              </blockquote>
              <figcaption className="mt-5 font-bold text-primary">{n}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section id="pricing" className="px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-primary px-8 py-16 text-center text-primary-foreground shadow-elegant"
        >
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Start your smarter learning journey
            </h2>
            <p className="mx-auto mt-4 max-w-xl opacity-90 text-sm md:text-base">
              Explore adaptive courses, AI-generated quizzes, and track your streaks today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/user/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-card px-8 py-4 font-bold text-primary shadow-lg transition-transform hover:scale-105"
              >
                Enter Student Panel <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tutor/dashboard"
                onClick={() => setCurrentRole("tutor")}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/15 px-8 py-4 font-bold text-primary-foreground transition-all hover:bg-primary-foreground/25"
              >
                Become a Tutor <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <img
              src="/logo.png"
              alt="Moyan AI Logo"
              className="h-8 w-8 rounded-lg object-contain shadow-sm border border-border/40"
            />
            <span>Moyan AI</span>
          </div>
          <p>© 2026 Moyan Learn Inc. AI-Powered Adaptive LMS.</p>
          <div className="flex gap-6 text-xs">
            <Link href="/courses" className="hover:text-primary">Courses</Link>
            <Link href="/user/dashboard" className="hover:text-primary">Student</Link>
            <Link href="/tutor/dashboard" className="hover:text-primary">Tutor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
