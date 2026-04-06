import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ActivityRenderer } from "../components/ActivityRenderer";
import { AppLogo } from "../components/AppLogo";
import { chapters } from "../data/chapters";
import { useApp } from "../context/AppContext";
import { buildLessonForChapter } from "../lib/lessonBuilder";
import type { ActivityResult } from "../types/curriculum";

export function LessonScreen() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const chapter = chapters.find((entry) => entry.id === chapterId);
  const [runSeed, setRunSeed] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ActivityResult[]>([]);

  const lesson = useMemo(() => {
    if (!chapterId) return null;
    return buildLessonForChapter(chapterId);
  }, [chapterId, runSeed]);

  useEffect(() => {
    setCurrentIndex(0);
    setResults([]);
  }, [chapterId, runSeed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, chapterId, runSeed]);

  if (!chapter || !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-red-500">
        Chapter not found
      </div>
    );
  }

  const activities = lesson.activities;
  const currentActivity = activities[currentIndex];
  const completed = currentIndex >= activities.length;
  const averageScore =
    results.length === 0
      ? 0
      : Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length);
  const passedCount = results.filter((result) => result.score >= 70).length;
  const stars = averageScore >= 90 ? 3 : averageScore >= 75 ? 2 : averageScore >= 50 ? 1 : 0;

  const handleComplete = (result: ActivityResult) => {
    if (!chapterId || !currentActivity) return;
    if (results.some((entry) => entry.activityId === currentActivity.id)) return;

    const normalizedResult: ActivityResult = {
      ...result,
      activityId: currentActivity.id,
    };

    setResults((prev) => [...prev, normalizedResult]);
    dispatch({
      type: "COMPLETE_ACTIVITY",
      chapterId,
      lessonId: lesson.lessonId,
      activityId: currentActivity.id,
      result: normalizedResult,
    });

    if (currentIndex < activities.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setCurrentIndex(activities.length);
    dispatch({
      type: "COMPLETE_LESSON",
      chapterId,
      lessonId: lesson.lessonId,
      score:
        averageScore === 0
          ? normalizedResult.score
          : Math.round(
              (averageScore * results.length + normalizedResult.score) /
                (results.length + 1),
            ),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/chapters")}
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
          >
            Back to Chapters
          </button>
          <button
            onClick={() => setRunSeed((seed) => seed + 1)}
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
          >
            Try Again
          </button>
        </div>

        <div
          className="rounded-3xl px-6 py-5 text-white shadow-lg"
          style={{ backgroundColor: chapter.color }}
        >
          <div className="flex items-center gap-4">
            <AppLogo size="md" className="bg-white/90 p-1" />
            <div className="text-5xl">{chapter.icon}</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                {lesson.titleEn}
              </p>
              <h1 className="text-3xl font-black">{chapter.titleEn}</h1>
              <p className="text-base text-white/85">{chapter.titleAr}</p>
            </div>
          </div>
        </div>

        {!completed && currentActivity && (
          <>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>
                  {currentIndex + 1} of {activities.length}
                </span>
                <span>{Math.round(((currentIndex + 1) / activities.length) * 100)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  animate={{ width: `${((currentIndex + 1) / activities.length) * 100}%` }}
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
              Lesson Complete
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-900">
              You got {passedCount} out of {activities.length}!
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Average score: {averageScore}%
            </p>
            <div className="mt-6 text-5xl">
              {stars > 0 ? "*".repeat(stars) : "-"}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              1 star for 50%+, 2 stars for 75%+, 3 stars for 90%+
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setRunSeed((seed) => seed + 1)}
                className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/chapters")}
                className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-800 shadow-sm"
              >
                Back to Chapters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
