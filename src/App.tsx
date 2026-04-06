import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { SplashScreen } from "./screens/SplashScreen";
import { ChapterMap } from "./screens/ChapterMap";
import { LessonScreen } from "./screens/LessonScreen";

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/chapters" element={<ChapterMap />} />
          <Route path="/lesson/:chapterId" element={<LessonScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
