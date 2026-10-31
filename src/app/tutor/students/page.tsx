"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Mail,
  Flame,
  CheckCircle2,
  Award,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export default function TutorStudentsPage() {
  const { users, courses } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const studentUsers = users.filter((u) => u.role === "student");

  const filtered = studentUsers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Learner Community
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            Enrolled Student Roster
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            View student engagement metrics, completion rates, and active streaks.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="w-full rounded-2xl border border-input bg-card pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Enrolled Courses</th>
                <th className="p-4">Finished Lessons</th>
                <th className="p-4">Daily Streak</th>
                <th className="p-4">Certificates</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        loading="lazy"
                        decoding="async"
                        className="h-9 w-9 rounded-full border border-border object-cover"
                      />
                      <div>
                        <p className="font-bold text-foreground">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-foreground">
                    {s.enrolledCourseIds.length} Active Courses
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-600">
                      {s.completedLessonIds.length} Completed
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-500">
                      <Flame className="h-3.5 w-3.5 fill-amber-500" /> {s.streakDays} Days
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-primary">
                      <Award className="h-3.5 w-3.5" /> {s.certificates.length} Verified
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => toast.info(`Message dialog opened for ${s.name}`)}
                      className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-blue-500 hover:text-blue-600"
                    >
                      <Mail className="h-3 w-3" /> Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
