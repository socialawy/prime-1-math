import { useParams, useNavigate } from "react-router-dom";
import { chapters } from "../data/chapters";

export function LessonScreen() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();

  const chapter = chapters.find((c) => c.id === chapterId);

  if (!chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-red-500">
        Chapter not found
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <button
        onClick={() => navigate("/chapters")}
        className="mb-6 rounded-xl bg-gray-200 px-6 py-3 text-lg font-bold"
      >
        ← Back
      </button>

      <div className="text-center mb-8">
        <h1
          className="text-4xl font-bold"
          style={{ color: chapter.color }}
        >
          {chapter.icon} {chapter.titleEn}
        </h1>
        <p className="text-xl opacity-60" style={{ color: chapter.color }}>
          {chapter.titleAr}
        </p>
      </div>

      {chapter.lessons.length === 0 ? (
        <div className="mt-16 text-center text-2xl text-gray-400">
          Coming soon...
        </div>
      ) : (
        <div className="mx-auto max-w-xl space-y-4">
          {chapter.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-xl bg-white p-6 shadow-md"
            >
              <h2 className="text-xl font-bold">
                {lesson.titleEn}
              </h2>
              <p className="text-sm opacity-60">
                {lesson.titleAr}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
