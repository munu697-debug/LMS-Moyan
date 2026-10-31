"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAppStore, Course } from "@/lib/store";
import { toast } from "sonner";

export default function QuizzesPage() {
  const { courses, currentUser, submitQuizScore } = useAppStore();

  const coursesWithQuizzes = courses.filter((c) => c.quiz && c.quiz.length > 0);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    coursesWithQuizzes[0]?.id || ""
  );

  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const quizQuestions = activeCourse?.quiz || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  const currentQuestion = quizQuestions[currentIndex];

  const handleSelectOption = (optionIdx: number) => {
    if (showExplanation) return; // prevent changing after submitted
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIdx }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let correct = 0;
      quizQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctIndex) {
          correct++;
        }
      });
      const pct = Math.round((correct / quizQuestions.length) * 100);
      setFinalScore(pct);
      setQuizCompleted(true);

      // Save to store
      if (activeCourse) {
        submitQuizScore(activeCourse.id, pct);
      }

      // Confetti if passed!
      if (pct >= 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`Outstanding! Scored ${pct}%. Certificate Unlocked! 🏆`);
      } else {
        toast.info(`You scored ${pct}%. Review the lessons and try again!`);
      }
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizCompleted(false);
    setFinalScore(0);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
            <Zap className="h-3.5 w-3.5" /> Interactive Knowledge Check
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            AI Practice Quizzes
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Test your comprehension, earn badges, and unlock verifiable credentials.
          </p>
        </div>

        {/* Course Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Select Topic:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              restartQuiz();
            }}
            className="rounded-2xl border border-input bg-card px-3.5 py-2 text-xs font-semibold text-foreground outline-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {coursesWithQuizzes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {quizQuestions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-3 text-base font-bold">No questions available for this course yet</h3>
          <p className="text-xs text-muted-foreground">Please select another course or check back soon.</p>
        </div>
      ) : !quizCompleted ? (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant sm:p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>
              Question {currentIndex + 1} of {quizQuestions.length}
            </span>
            <span className="text-primary">
              Score target: &ge;80% for Certificate
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / quizQuestions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Text */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground sm:text-xl leading-relaxed">
              {currentQuestion?.question}
            </h2>
          </div>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentIndex] === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let btnStyle = "border-border bg-muted/40 hover:bg-muted text-foreground";
              if (showExplanation) {
                if (isCorrect) {
                  btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold dark:text-emerald-400";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "border-rose-500 bg-rose-500/10 text-rose-700 font-bold dark:text-rose-400";
                } else {
                  btnStyle = "border-border/60 bg-muted/20 text-muted-foreground opacity-60";
                }
              } else if (isSelected) {
                btnStyle = "border-primary bg-primary/10 text-primary font-bold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 place-items-center rounded-lg border border-border/80 text-xs font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed"
              >
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Sparkles className="h-4 w-4" /> Explanation & Insight
                </div>
                <p className="mt-1 text-muted-foreground">{currentQuestion?.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNextQuestion}
              disabled={!showExplanation}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-elegant transition-transform hover:scale-105 disabled:opacity-50"
            >
              <span>{currentIndex < quizQuestions.length - 1 ? "Next Question" : "View Results"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Finished Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border bg-card p-8 text-center shadow-elegant sm:p-12"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <Trophy className="h-10 w-10" />
          </div>

          <h2 className="mt-6 text-2xl font-extrabold text-foreground sm:text-3xl">
            Quiz Completed!
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Topic: <span className="font-semibold text-foreground">{activeCourse?.title}</span>
          </p>

          <div className="mt-6 inline-block rounded-2xl bg-muted/60 px-8 py-4">
            <span className="text-4xl font-extrabold text-primary">{finalScore}%</span>
            <p className="text-xs font-semibold text-muted-foreground">Final Score</p>
          </div>

          <p className="mx-auto mt-4 max-w-md text-xs text-muted-foreground sm:text-sm">
            {finalScore >= 80
              ? "🎉 Congratulations! You have achieved mastery in this module and earned an official credential."
              : "Good effort! Review the lesson material and retake the quiz to unlock your certificate."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={restartQuiz}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retake Quiz
            </button>
            {finalScore >= 80 && (
              <Link
                href="/user/certificates"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-elegant hover:scale-105"
              >
                <Award className="h-4 w-4" /> View My Certificate &rarr;
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
