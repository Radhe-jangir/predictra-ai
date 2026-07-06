import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Skeleton } from "./components/ui/Skeleton";
import { pageTransition } from "./lib/motion";

const AppLayout = lazy(() =>
  import("./components/AppLayout").then((module) => ({ default: module.AppLayout })),
);
const AuthPage = lazy(() =>
  import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })),
);
const ChatPage = lazy(() =>
  import("./pages/ChatPage").then((module) => ({ default: module.ChatPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const DatasetsPage = lazy(() =>
  import("./pages/DatasetsPage").then((module) => ({ default: module.DatasetsPage })),
);
const InsightsPage = lazy(() =>
  import("./pages/InsightsPage").then((module) => ({ default: module.InsightsPage })),
);
const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((module) => ({ default: module.LandingPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })),
);

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Skeleton className="h-24 w-full" />
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageShell><LandingPage /></PageShell>} />
          <Route path="/login" element={<PageShell><AuthPage mode="login" /></PageShell>} />
          <Route path="/signup" element={<PageShell><AuthPage mode="signup" /></PageShell>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="datasets" element={<DatasetsPage />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="/404" element={<PageShell><NotFoundPage /></PageShell>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
