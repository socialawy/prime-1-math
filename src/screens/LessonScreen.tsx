import { useParams, useNavigate } from "react-router-dom";
import { chapters } from "../data/chapters";
import { ActivityRenderer } from "../components/ActivityRenderer";

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
        <div className="mx-auto max-w-4xl space-y-6">
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
              {lesson.activities.length > 0 ? (
                <div className="mt-6 space-y-6">
                  {lesson.activities.map((activity) => (
                    <ActivityRenderer
                      key={activity.id}
                      activity={activity}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-400">
                  No activities yet.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
