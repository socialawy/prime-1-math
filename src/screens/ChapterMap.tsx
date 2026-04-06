import { useNavigate } from "react-router-dom";
import { chapters } from "../data/chapters";
import { useApp } from "../context/AppContext";

export function ChapterMap() {
  const navigate = useNavigate();
  const { progress, settings, updateSettings } = useApp();

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto mb-8 flex max-w-4xl items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Chapters
        </h1>
        <button
          onClick={() => updateSettings({ devMode: !settings.devMode })}
          className={`rounded-xl px-4 py-2 text-sm font-bold shadow-sm ${
            settings.devMode
              ? "bg-amber-500 text-white"
              : "bg-white text-slate-700"
          }`}
        >
          Dev Mode: {settings.devMode ? "On" : "Off"}
        </button>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6">
        {chapters.map((chapter) => {
          const chapterProgress = progress.chapterProgress[chapter.id];
          const locked = settings.devMode
            ? false
            : chapter.id === "ch10"
              ? false
              : chapterProgress?.status === "locked"
                ? true
                : chapter.unlockAfter
                  ? progress.chapterProgress[chapter.unlockAfter]?.status !== "completed"
                  : false;

          return (
            <button
              key={chapter.id}
              disabled={locked}
              onClick={() => navigate(`/lesson/${chapter.id}`)}
              className="flex flex-col items-center gap-3 rounded-2xl p-6 shadow-md transition active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: locked ? "#e5e7eb" : chapter.color + "22" }}
            >
              <span className="text-3xl font-bold text-slate-600">
                {locked ? "LOCK" : chapter.icon}
              </span>
              <span className="text-lg font-bold" style={{ color: chapter.color }}>
                {chapter.titleEn}
              </span>
              <span className="text-center text-sm opacity-60" style={{ color: chapter.color }}>
                {chapter.titleAr}
              </span>
              {chapterProgress && chapterProgress.starsEarned > 0 && (
                <span className="text-xl">
                  {"*".repeat(chapterProgress.starsEarned)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
