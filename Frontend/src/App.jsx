import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";

import LoginView from "./views/LoginView";
import OnboardingChatView from "./views/OnboardingChatView";
import DashboardView from "./views/DashboardView";
import MonitoringView from "./views/MonitoringView";
import ProfileView from "./views/ProfileView";
import VoiceCallView from "./views/VoiceCallView";

// Views that require the user to be authenticated before accessing them
const PROTECTED_VIEWS = [
  "onboarding",
  "dashboard",
  "monitoring",
  "profile",
  "voicecall",
];

function MainApp() {
  const [currentView, setCurrentView] = useState("login");
  const { isAuthenticated } = useAuth();

  const handleNavigate = (viewName) => {
    // Auth guard: redirect unauthenticated users to login for protected views
    if (PROTECTED_VIEWS.includes(viewName) && !isAuthenticated) {
      setCurrentView("login");
      window.scrollTo(0, 0);
      return;
    }
    setCurrentView(viewName);
    window.scrollTo(0, 0);
  };

  // If the user logs out while on a protected view, snap back to login
  React.useEffect(() => {
    if (!isAuthenticated && PROTECTED_VIEWS.includes(currentView)) {
      setCurrentView("login");
    }
  }, [isAuthenticated]);

  return (
    <div className="app-viewport">
      <TopNav currentView={currentView} setCurrentView={handleNavigate} />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {currentView === "login" && (
          <LoginView onLoginSuccess={() => handleNavigate("onboarding")} />
        )}
        {currentView === "onboarding" && isAuthenticated && (
          <OnboardingChatView onContinue={() => handleNavigate("dashboard")} />
        )}
        {currentView === "dashboard" && isAuthenticated && (
          <DashboardView onNavigate={handleNavigate} />
        )}
        {currentView === "monitoring" && isAuthenticated && <MonitoringView />}
        {currentView === "profile" && isAuthenticated && (
          <ProfileView onLogout={() => handleNavigate("login")} />
        )}
        {currentView === "voicecall" && isAuthenticated && (
          <VoiceCallView onEndCall={() => handleNavigate("dashboard")} />
        )}
      </main>

      <BottomNav currentView={currentView} setCurrentView={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
