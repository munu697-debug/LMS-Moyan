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
  Plus,
  KeyRound,
  Trash2,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Mail,
  User as UserIcon,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAppStore, UserRole, User } from "@/lib/store";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const {
    users,
    currentUser,
    updateUserRole,
    toggleUserStatus,
    approveUser,
    rejectUser,
    addUser,
    deleteUser,
    updateUserPassword,
  } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const pendingTutorsCount = users.filter((u) => u.role === "tutor" && u.status === "pending_approval").length;

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [passwordUserModal, setPasswordUserModal] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Add User Form State
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addRole, setAddRole] = useState<UserRole>("tutor");
  const [addTitle, setAddTitle] = useState("Staff AI Researcher & Instructor");
  const [addBio, setAddBio] = useState("");

  // Change Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all"
        ? true
        : roleFilter === "pending_approval"
        ? u.role === "tutor" && u.status === "pending_approval"
        : u.role === roleFilter;
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

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      toast.error("Please provide both name and email.");
      return;
    }

    const result = addUser({
      name: addName.trim(),
      email: addEmail.trim(),
      password: addPassword.trim(),
      role: addRole,
      title: addTitle.trim(),
      bio: addBio.trim(),
    });

    if (!result.success) {
      toast.error(result.error || "Failed to create user account.");
      return;
    }

    toast.success(
      `New ${addRole.toUpperCase()} account created for ${addName}! 🎉`
    );
    setIsAddUserModalOpen(false);
    // Reset form
    setAddName("");
    setAddEmail("");
    setAddPassword("");
    setAddRole("tutor");
    setAddBio("");
  };

  const handleUpdatePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUserModal) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const result = updateUserPassword(passwordUserModal.id, newPassword);
    if (!result.success) {
      toast.error(result.error || "Failed to update password.");
      return;
    }

    toast.success(`Password for ${passwordUserModal.name} successfully updated! 🔑`);
    setPasswordUserModal(null);
    setNewPassword("");
    setShowPassword(false);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    const result = deleteUser(userToDelete.id);
    if (!result.success) {
      toast.error(result.error || "Could not delete user.");
    } else {
      toast.success(`User "${userToDelete.name}" has been removed from platform.`);
    }
    setUserToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Access Governance
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            User Directory & Role Authority
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Add instructors or students, update passwords, promote accounts, and manage platform safety.
          </p>
        </div>

        {/* Action Button: Add User / Tutor */}
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-purple-700 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Tutor or User</span>
        </button>
      </div>

      {/* Pending Tutors Alert Banner */}
      {pendingTutorsCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {pendingTutorsCount} Tutor Application{pendingTutorsCount > 1 ? "s" : ""} Awaiting Admin Approval
              </p>
              <p className="text-[11px] text-muted-foreground">
                Instructors cannot log in or create courses until verified and approved by an administrator.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRoleFilter("pending_approval")}
            className="self-start sm:self-auto rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Review Pending ({pendingTutorsCount})
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
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
            <option value="all">All Roles ({users.length})</option>
            {pendingTutorsCount > 0 && (
              <option value="pending_approval">Pending Tutors ({pendingTutorsCount})</option>
            )}
            <option value="tutor">Tutors ({users.filter((u) => u.role === "tutor").length})</option>
            <option value="student">Students ({users.filter((u) => u.role === "student").length})</option>
            <option value="admin">Admins ({users.filter((u) => u.role === "admin").length})</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground font-semibold">
          Showing <strong className="text-foreground">{filtered.length}</strong> active profiles
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
                <th className="p-4">Stats & Info</th>
                <th className="p-4">Current Password</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((u) => {
                const isSuspended = u.status === "suspended";
                const isPending = u.status === "pending_approval";
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    {/* User Profile */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {u.role === "admin" ? (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-xs font-extrabold text-white shadow-sm border border-purple-400/30">
                            SA
                          </div>
                        ) : (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-10 rounded-full border border-border object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-foreground">
                              {u.role === "admin" ? "Super Admin" : u.name}
                            </p>
                            {isCurrent && (
                              <span className="rounded-md bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold text-purple-600">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          {u.title && <p className="text-[10px] text-purple-600 truncate max-w-xs">{u.title}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
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

                    {/* Status Badge */}
                    <td className="p-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
                          <Clock className="h-3 w-3" /> PENDING APPROVAL
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isSuspended
                              ? "bg-rose-500/10 text-rose-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </span>
                      )}
                    </td>

                    {/* Stats & Streak */}
                    <td className="p-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                          <Clock className="h-3 w-3" /> Awaiting Verification
                        </span>
                      ) : u.role === "tutor" ? (
                        <span className="font-bold text-blue-600">
                          ₹{u.earnings?.toLocaleString("en-IN") || "0"} earned
                        </span>
                      ) : u.role === "admin" ? (
                        <span className="font-bold text-purple-600">Super Admin</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold text-amber-500">
                            <Flame className="h-3 w-3 fill-amber-500" /> {u.streakDays}d
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-semibold text-primary">
                            {u.certificates?.length || 0} certs
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Masked Password with quick display */}
                    <td className="p-4 font-mono text-[11px] text-muted-foreground">
                      <span className="rounded-lg bg-muted px-2 py-1 font-semibold text-foreground">
                        {u.password || "••••••••"}
                      </span>
                    </td>

                    {/* Action Buttons: Password, Suspend, Delete OR Approve Tutor */}
                    <td className="p-4 pr-6 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Approve Tutor Button */}
                          <button
                            onClick={() => {
                              approveUser(u.id);
                              toast.success(`Approved tutor account for ${u.name}! They can now log in and access the Tutor Studio.`);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            title="Approve tutor account"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve Tutor</span>
                          </button>

                          {/* Reject Tutor Button */}
                          <button
                            onClick={() => {
                              rejectUser(u.id);
                              toast.warning(`Application rejected for ${u.name}.`);
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 transition-all cursor-pointer"
                            title="Reject tutor application"
                          >
                            <UserX className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Password Button */}
                          <button
                            onClick={() => {
                              setPasswordUserModal(u);
                              setNewPassword(u.password || "");
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/20 transition-all cursor-pointer"
                            title="Change user password"
                          >
                            <KeyRound className="h-3 w-3" />
                            <span>Change Pass</span>
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status, u.name)}
                            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              isSuspended
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
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

                          {/* Delete User (cannot delete self) */}
                          {!isCurrent && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="inline-flex items-center rounded-xl border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-600 hover:bg-rose-500/20 transition-all cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add New Tutor / User */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-600/10 text-purple-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">Add New Account</h2>
                  <p className="text-xs text-muted-foreground">Create a new tutor, student, or admin</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["tutor", "student", "admin"] as const).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setAddRole(r)}
                      className={`rounded-2xl border py-2 text-xs font-bold capitalize transition-all ${
                        addRole === r
                          ? "border-purple-600 bg-purple-600/10 text-purple-600 shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {r === "tutor" ? "👨‍🏫 Tutor" : r === "student" ? "🎓 Student" : "🛡️ Admin"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Full Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full rounded-2xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-2xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Initial Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Enter account password..."
                    className="w-full rounded-2xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              {addRole === "tutor" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Professional Title / Domain</label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="e.g. Senior ML Architect & Researcher"
                    className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs outline-none focus:border-purple-600"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-2xl border border-border px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create {addRole.toUpperCase()} Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Change User Password */}
      {passwordUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-600/10 text-purple-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground">Change Password</h2>
                  <p className="text-xs text-muted-foreground">{passwordUserModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordUserModal(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-3.5 space-y-1 text-xs">
              <p className="text-muted-foreground">User: <strong className="text-foreground">{passwordUserModal.name}</strong></p>
              <p className="text-muted-foreground">Email: <strong className="text-foreground">{passwordUserModal.email}</strong></p>
              <p className="text-muted-foreground">Role: <span className="font-bold text-purple-600 capitalize">{passwordUserModal.role}</span></p>
            </div>

            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">New Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters..."
                    className="w-full rounded-2xl border border-input bg-background pl-10 pr-10 py-2.5 text-xs font-mono outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The user will be able to log in immediately with this new password.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setPasswordUserModal(null)}
                  className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" /> Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: Delete User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Delete Account</h3>
                <p className="text-xs text-muted-foreground">{userToDelete.name}</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-foreground">{userToDelete.name}</strong> ({userToDelete.email})? This will revoke access and clear their platform records.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="rounded-2xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-transform active:scale-95 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
