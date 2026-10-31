"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  UserCheck,
  UserX,
  Flame,
  Award,
} from "lucide-react";
import { useAppStore, UserRole } from "@/lib/store";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { users, updateUserRole, toggleUserStatus } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole, name: string) => {
    updateUserRole(userId, newRole);
    toast.success(`Updated role for ${name} to ${newRole.toUpperCase()}.`);
  };

  const handleStatusToggle = (userId: string, currentStatus: string, name: string) => {
    toggleUserStatus(userId);
    if (currentStatus === "active") {
      toast.warning(`${name}'s account has been suspended.`);
    } else {
      toast.success(`${name}'s account has been reactivated.`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Access Governance
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            User Directory & Role Authority
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Promote accounts, adjust permissions, and manage platform safety.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-2xl border border-input bg-card pl-9 pr-3 py-2 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="tutor">Tutors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6">User Profile</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Stats & Streak</th>
                <th className="p-4">Joined</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => {
                const isSuspended = u.status === "suspended";
                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          loading="lazy"
                          decoding="async"
                          className="h-10 w-10 rounded-full border border-border object-cover"
                        />
                        <div>
                          <p className="font-bold text-foreground">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u.id, e.target.value as UserRole, u.name)
                        }
                        className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-bold capitalize outline-none focus:border-purple-600"
                      >
                        <option value="student">Student</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isSuspended
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.role === "tutor" ? (
                        <span className="font-bold text-blue-600">
                          ${u.earnings?.toLocaleString() || "14,850"} earned
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold text-amber-500">
                            <Flame className="h-3 w-3 fill-amber-500" /> {u.streakDays}d
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-primary">
                            {u.certificates.length} certs
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-muted-foreground">{u.joinedDate}</td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.status, u.name)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                          isSuspended
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "border-rose-500/40 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                        }`}
                      >
                        {isSuspended ? (
                          <>
                            <UserCheck className="h-3 w-3" /> Reactivate
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3" /> Suspend
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
