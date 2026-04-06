import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { SplashScreen } from "./screens/SplashScreen";
import { ChapterMap } from "./screens/ChapterMap";
import { ExamPractice } from "./screens/ExamPractice";
import { LessonScreen } from "./screens/LessonScreen";
import { DevGuidedBox } from "./screens/DevGuidedBox";
import { DevSplitTree } from "./screens/DevSplitTree";
import { DevHundredsChart } from "./screens/DevHundredsChart";
import { DevBlockGrouper } from "./screens/DevBlockGrouper";
import { DevNumberLine } from "./screens/DevNumberLine";
import { DevAreaGrid } from "./screens/DevAreaGrid";
import { DevCapacity } from "./screens/DevCapacity";
import { DevShapes } from "./screens/DevShapes";
import { DevClock } from "./screens/DevClock";
import { DevWordProblem } from "./screens/DevWordProblem";
import { DevArtCorner } from "./screens/DevArtCorner";

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/chapters" element={<ChapterMap />} />
          <Route path="/exam-practice" element={<ExamPractice />} />
          <Route path="/lesson/:chapterId" element={<LessonScreen />} />
          <Route path="/dev/guidedbox" element={<DevGuidedBox />} />
          <Route path="/dev/splittree" element={<DevSplitTree />} />
          <Route path="/dev/hundreds" element={<DevHundredsChart />} />
          <Route path="/dev/areagrid" element={<DevAreaGrid />} />
          <Route path="/dev/capacity" element={<DevCapacity />} />
          <Route path="/dev/shapes" element={<DevShapes />} />
          <Route path="/dev/clock" element={<DevClock />} />
          <Route path="/dev/wordproblem" element={<DevWordProblem />} />
          <Route path="/dev/artcorner" element={<DevArtCorner />} />
          <Route path="/dev/blockgrouper" element={<DevBlockGrouper />} />
          <Route path="/dev/numberline" element={<DevNumberLine />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
