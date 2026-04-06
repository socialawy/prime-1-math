import { useNavigate } from "react-router-dom";
import { chapters } from "../data/chapters";
import { useApp } from "../context/AppContext";

export function ChapterMap() {
  const navigate = useNavigate();
  const { progress, settings } = useApp();
  const isAr = settings.language === "ar";

  return (
    <div className="min-h-screen p-6">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
        {isAr ? "الفصول" : "Chapters"}
      </h1>
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6">
        {chapters.map((ch) => {
          const cp = progress.chapterProgress[ch.id];
          const locked =
            ch.unlockAfter &&
            progress.chapterProgress[ch.unlockAfter]?.status !== "completed";

          return (
            <button
              key={ch.id}
              disabled={!!locked}
              onClick={() => navigate(`/lesson/${ch.id}`)}
              className="flex flex-col items-center gap-3 rounded-2xl p-6 shadow-md transition active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: locked ? "#e5e7eb" : ch.color + "22" }}
            >
              <span className="text-5xl">{locked ? "🔒" : ch.icon}</span>
              <span className="text-lg font-bold" style={{ color: ch.color }}>
                {isAr ? ch.titleAr : ch.titleEn}
              </span>
              {cp && cp.starsEarned > 0 && (
                <span className="text-xl">
                  {"⭐".repeat(cp.starsEarned)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
