import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TopNav from "./components/TopNav";
import BottomNav from "./components/BottomNav";

import LoginView from "./views/LoginView";
import AssessmentFormView from "./views/AssessmentFormView";
import OnboardingChatView from "./views/OnboardingChatView";
import DashboardView from "./views/DashboardView";
import MonitoringView from "./views/MonitoringView";
import ProfileView from "./views/ProfileView";
import VoiceCallView from "./views/VoiceCallView";

const PROTECTED_VIEWS = [
  "assessment",
  "onboarding",
  "dashboard",
  "monitoring",
  "profile",
  "voicecall",
];

// Nav is hidden on these views
const FULLSCREEN_VIEWS = ["login", "assessment", "voicecall"];

function MainApp() {
  const { isAuthenticated, isRestoringSession, submittedForm } = useAuth();
  const [currentView, setCurrentView] = useState("login");

  // After session restore (page load or persisted login), decide where to land
  useEffect(() => {
    if (isRestoringSession) return;

    if (isAuthenticated) {
      // Route to assessment if the user hasn't submitted the form yet
      setCurrentView(submittedForm ? "dashboard" : "assessment");
    }
  }, [isRestoringSession, isAuthenticated, submittedForm]);

  const handleNavigate = (viewName) => {
    if (PROTECTED_VIEWS.includes(viewName) && !isAuthenticated) {
      setCurrentView("login");
      window.scrollTo(0, 0);
      return;
    }
    setCurrentView(viewName);
    window.scrollTo(0, 0);
  };

  // Snap back to login on logout
  useEffect(() => {
    if (!isAuthenticated && PROTECTED_VIEWS.includes(currentView)) {
      setCurrentView("login");
    }
  }, [isAuthenticated]);

  // Loading spinner while re-validating persisted session
  if (isRestoringSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            color: "var(--color-primary)",
            letterSpacing: "0.06em",
          }}
        >
          MENTAL HEALTH
        </div>
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--color-primary-badge)",
            borderTop: "3px solid var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const hideNav = FULLSCREEN_VIEWS.includes(currentView);

  return (
    <div className="app-viewport">
      {!hideNav && (
        <TopNav currentView={currentView} setCurrentView={handleNavigate} />
      )}

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {currentView === "login" && (
          <LoginView
            onLoginSuccess={(userData) => {
              // userData.submitted_form comes from the backend response via AuthContext
              // The useEffect above will handle the redirect once context updates,
              // but we also handle it inline for immediate navigation after fresh login.
              handleNavigate(
                userData?.submitted_form ? "dashboard" : "assessment",
              );
            }}
          />
        )}

        {currentView === "assessment" && isAuthenticated && (
          <AssessmentFormView onComplete={() => handleNavigate("onboarding")} />
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

      {!hideNav && (
        <BottomNav currentView={currentView} setCurrentView={handleNavigate} />
      )}
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
