import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ActivityRenderer } from "../components/ActivityRenderer";
import { useApp } from "../context/AppContext";
import {
  loadOrCreateExamSet,
  regenerateExamSet,
  type BuiltAssessment,
} from "../lib/examBuilder";
import type { ActivityResult } from "../types/curriculum";

export function ExamPractice() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [version, setVersion] = useState(0);
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ActivityResult[]>([]);

  const assessments = useMemo(() => loadOrCreateExamSet(), [version]);
  const activeAssessment =
    assessments.find((assessment) => assessment.id === activeAssessmentId) ?? null;
  const currentActivity = activeAssessment?.activities[currentIndex] ?? null;
  const completed = !!activeAssessment && currentIndex >= activeAssessment.activities.length;

  const averageScore =
    results.length === 0
      ? 0
      : Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);

  const beginAssessment = (assessment: BuiltAssessment) => {
    setActiveAssessmentId(assessment.id);
    setCurrentIndex(0);
    setResults([]);
  };

  const resetToOverview = () => {
    setActiveAssessmentId(null);
    setCurrentIndex(0);
    setResults([]);
  };

  const handleRegenerate = () => {
    regenerateExamSet();
    setVersion((value) => value + 1);
    resetToOverview();
  };

  const handleComplete = (result: ActivityResult) => {
    if (!activeAssessment || !currentActivity) return;
    if (results.some((entry) => entry.activityId === currentActivity.id)) return;

    const normalized: ActivityResult = {
      ...result,
      activityId: currentActivity.id,
    };

    setResults((prev) => [...prev, normalized]);
    dispatch({
      type: "COMPLETE_ACTIVITY",
      chapterId: "exam-practice",
      lessonId: activeAssessment.id,
      activityId: currentActivity.id,
      result: normalized,
    });

    if (currentIndex < activeAssessment.activities.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setCurrentIndex(activeAssessment.activities.length);
  };

  if (!activeAssessment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/chapters")}
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
            >
              Back to Chapters
            </button>
            <button
              onClick={handleRegenerate}
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-sm"
            >
              Generate New Assessment
            </button>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Exam Practice
            </p>
            <h1 className="mt-3 text-4xl font-black text-slate-900">
              Practice the final assessments
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Each assessment gives you 6 mixed activities across shapes, comparison,
              making 10, using 10, place value, and time or word problems.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assessments.map((assessment, index) => (
              <button
                key={assessment.id}
                onClick={() => beginAssessment(assessment)}
                className="rounded-3xl bg-white p-6 text-left shadow-md transition hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Assessment {index + 1}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  {assessment.title}
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  {assessment.activities.length} activities
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={resetToOverview}
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
          >
            Back to Assessments
          </button>
          <div className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm">
            {activeAssessment.title}
          </div>
        </div>

        {!completed && currentActivity && (
          <>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>
                  {currentIndex + 1} of {activeAssessment.activities.length}
                </span>
                <span>{Math.round(((currentIndex + 1) / activeAssessment.activities.length) * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  animate={{
                    width: `${((currentIndex + 1) / activeAssessment.activities.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentActivity.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl bg-white p-3 shadow-lg"
              >
                <ActivityRenderer activity={currentActivity} onComplete={handleComplete} />
              </motion.div>
            </AnimatePresence>
          </>
        )}

        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white p-8 text-center shadow-lg"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Assessment Complete
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">
              Score: {averageScore}%
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              You finished {activeAssessment.activities.length} mixed activities.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => beginAssessment(activeAssessment)}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-sm"
              >
                Try Again
              </button>
              <button
                onClick={resetToOverview}
                className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-800 shadow-sm"
              >
                Back to Assessments
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
