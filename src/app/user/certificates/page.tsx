"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  CheckCircle2,
  Download,
  Share2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAppStore, Certificate } from "@/lib/store";
import { toast } from "sonner";

export default function CertificatesPage() {
  const { currentUser, courses } = useAppStore();
  const certificates = currentUser?.certificates || [];

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(
    certificates[0] || null
  );

  const handleShare = (cert: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: `${cert.courseTitle} Certificate`,
        text: `I just earned a verified certificate in ${cert.courseTitle} on Moyan Learn!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(cert.credentialUrl);
      toast.success("Credential verification link copied to clipboard!");
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
          <Award className="h-3.5 w-3.5" /> Verifiable Achievements
        </span>
        <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
          Earned Certificates
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Cryptographically stamped certificates earned through AI adaptive courses and &ge;80% quiz scores.
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-3 text-base font-bold">No certificates earned yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Complete a course quiz with a score of 80% or higher to unlock your official credential.
          </p>
          <Link
            href="/user/quizzes"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-amber-300" /> Go to Practice Quizzes
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Certificates List on Left */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground">Your Credentials ({certificates.length})</h2>
            {certificates.map((cert) => {
              const isSelected = selectedCert?.id === cert.id;
              return (
                <button
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold text-foreground sm:text-sm">
                      {cert.courseTitle}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Issued: {cert.issueDate}</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Grade: {cert.grade}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Certificate Preview Card on Right */}
          {selectedCert && (
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Credential ID: <span className="font-mono text-foreground">{selectedCert.id}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(selectedCert)}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                  >
                    <Download className="h-3.5 w-3.5" /> Print / Save PDF
                  </button>
                </div>
              </div>

              {/* Ornamental Certificate Frame */}
              <div className="relative overflow-hidden rounded-3xl border-4 border-double border-primary/40 bg-gradient-to-br from-card via-card to-secondary p-8 text-center shadow-2xl sm:p-12">
                <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

                {/* Top Badge */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-elegant">
                  <img
                    src="/logo.png"
                    alt="Moyan AI Badge"
                    className="h-14 w-14 rounded-2xl object-contain border border-primary/30"
                  />
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">
                  Moyan AI Academy of Adaptive Intelligence
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl font-serif">
                  Certificate of Mastery
                </h2>

                <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
                  This certifies that
                </p>

                <h3 className="mt-2 text-xl font-bold text-foreground sm:text-2xl underline decoration-primary underline-offset-8">
                  {selectedCert.studentName}
                </h3>

                <p className="mx-auto mt-4 max-w-lg text-xs text-muted-foreground leading-relaxed sm:text-sm">
                  has successfully satisfied all curriculum requirements, adaptive problem sets, and achieved an examination score of <strong className="text-foreground">{selectedCert.grade}%</strong> in:
                </p>

                <h4 className="mt-2 text-lg font-extrabold text-primary sm:text-xl">
                  {selectedCert.courseTitle}
                </h4>

                <div className="mt-10 flex flex-wrap items-center justify-between border-t border-border/80 pt-6 text-xs text-muted-foreground">
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Date of Issuance</p>
                    <p className="text-[11px]">{selectedCert.issueDate}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">Verified AI Credential</span>
                  </div>

                  <div className="text-right">
                    <p className="font-serif italic text-foreground text-sm font-bold">
                      {courses.find((c) => c.id === selectedCert.courseId)?.instructor?.name || "Verified Faculty Instructor"}
                    </p>
                    <p className="text-[10px]">Lead Curriculum Director</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
