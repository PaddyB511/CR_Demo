import "./App.css";
import BrowsePage from "./views/BrowsePage";
import WatchPage from "./views/WatchPage.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProgressPage from "./views/ProgressPage";
import JournalPage from "./views/JournalPage";
// import ProgressPage from "./views/ProgressPage"; // Unused import
// import LevelBadgeInline, { LevelBadge } from "./components/ProgressPageComponents/LevelBadge"; // Unused import
// import LevelCard from "./components/ProgressPageComponents/LevelCard"; // Unused import
// import Dashboard from "./components/ProgressPageComponents/Dashboard"; // Unused import
// import DailyGoalProgress from "./components/ProgressPageComponents/DailyGoalProgress"; // Unused import
// import TotalInputCard from "./components/ProgressPageComponents/TotalInputCard"; // Unused import
// import MiniBar from "./components/ProgressPageComponents/MiniBar"; // Unused import
// import SegBar from "./components/ProgressPageComponents/SegBar"; // Unused import

// Removed unused local User type

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/browse" replace />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/watch/:id" element={<WatchPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/journal" element={<JournalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
