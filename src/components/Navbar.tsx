"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    switch (currentUser.role) {
      case "tutor":
        return "/tutor/dashboard";
      case "admin":
        return "/admin/dashboard";
      case "student":
      default:
        return "/user/dashboard";
    }
  };

  const getRoleLabel = () => {
    if (!currentUser) return { label: "", icon: GraduationCap, color: "" };
    switch (currentUser.role) {
      case "tutor":
        return { label: "Tutor", icon: Sparkles, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
      case "admin":
        return { label: "Admin", icon: ShieldCheck, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" };
      case "student":
      default:
        return { label: "Student", icon: GraduationCap, color: "text-primary bg-primary/10 border-primary/20" };
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully.");
    router.push("/");
  };

  const roleMeta = getRoleLabel();
  const RoleIcon = roleMeta.icon;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-tight text-foreground group">
          <img
            src="/logo.png"
            alt="Moyan AI"
            className="h-10 w-10 rounded-xl object-contain shadow-sm border border-border/40 group-hover:scale-105 transition-transform"
          />
          <div className="leading-tight">
            <span className="text-lg font-extrabold">Moyan</span>
            <span className="text-lg font-bold text-primary">AI</span>
            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              Learn
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link
            href="/"
            className={`transition-colors hover:text-primary ${
              pathname === "/" ? "font-semibold text-primary" : ""
            }`}
          >
            Home
          </Link>
          <Link
            href="/courses"
            className={`flex items-center gap-1.5 transition-colors hover:text-primary ${
              pathname.startsWith("/courses") ? "font-semibold text-primary" : ""
            }`}
          >
            <Compass className="h-4 w-4" /> Explore Courses
          </Link>
          <Link
            href="/#features"
            className="transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="/#reviews"
            className="transition-colors hover:text-primary"
          >
            Reviews
          </Link>
        </nav>

        {/* Right Actions: Authenticated vs Guest */}
        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <>
              {/* Active User Pill */}
              <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card px-3 py-1.5 shadow-sm">
                {currentUser.role === "admin" ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-[10px] font-extrabold text-white shadow-sm">
                    SA
                  </div>
                ) : (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    loading="lazy"
                    decoding="async"
                    className="h-7 w-7 rounded-full border border-border object-cover"
                  />
                )}
                <div className="text-left text-xs leading-none">
                  <p className="font-semibold text-foreground truncate max-w-[100px]">
                    {currentUser.role === "admin" ? "Super Admin" : currentUser.name}
                  </p>
                  <span className={`mt-0.5 inline-flex items-center gap-1 rounded-md border px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleMeta.color}`}>
                    <RoleIcon className="h-2.5 w-2.5" />
                    {roleMeta.label}
                  </span>
                </div>
              </div>

              {/* Dashboard Link */}
              <Link
                href={getDashboardLink()}
                className="group flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-105"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>My {roleMeta.label} Panel</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-full border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-muted"
              >
                <LogIn className="h-3.5 w-3.5 text-primary" />
                <span>Log in</span>
              </Link>

              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-elegant transition-transform hover:scale-105"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign up</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl border border-border p-2 text-foreground md:hidden hover:bg-muted"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-card px-6 py-6 md:hidden"
          >
            <div className="space-y-4">
              {currentUser ? (
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    {currentUser.role === "admin" ? (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-xs font-extrabold text-white shadow-sm border border-purple-400/30">
                        SA
                      </div>
                    ) : (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        loading="lazy"
                        decoding="async"
                        className="h-10 w-10 rounded-full border border-border object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {currentUser.role === "admin" ? "Super Admin" : currentUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${roleMeta.color}`}>
                        <RoleIcon className="h-3 w-3" /> {roleMeta.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 rounded-xl border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-3 w-3" /> Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 border-b border-border/60 pb-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl border border-border py-2 text-center text-xs font-bold text-foreground hover:bg-muted"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl bg-gradient-primary py-2 text-center text-xs font-bold text-primary-foreground shadow-sm"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Home
                </Link>
                <Link
                  href="/courses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Courses Catalog
                </Link>

                {currentUser && (
                  <Link
                    href={getDashboardLink()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
                  >
                    Open {roleMeta.label} Panel <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
