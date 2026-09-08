import React from "react";
import { useAuth } from "../context/AuthContext";

export default function TopNav({ currentView, setCurrentView }) {
  const { userProfile } = useAuth();

  // Hide top nav on login, onboarding, or voice call screens
  if (
    currentView === "login" ||
    currentView === "onboarding" ||
    currentView === "voicecall"
  ) {
    return null;
  }

  const userName = userProfile.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="top-nav" id="top-nav">
      <div className="nav-container">
        <div
          className="brand-logo"
          role="button"
          tabIndex={0}
          aria-label="Go to home dashboard"
          onClick={() => setCurrentView("dashboard")}
          onKeyDown={(e) => e.key === "Enter" && setCurrentView("dashboard")}
        >
          <span className="logo-text">MENTAL HEALTH</span>
        </div>

        <nav className="desktop-menu">
          <button
            type="button"
            className={`nav-item ${currentView === "dashboard" ? "active" : ""}`}
            aria-current={currentView === "dashboard" ? "page" : undefined}
            onClick={() => setCurrentView("dashboard")}
          >
            <span>Home</span>
          </button>
          <button
            type="button"
            className={`nav-item ${currentView === "monitoring" ? "active" : ""}`}
            aria-current={currentView === "monitoring" ? "page" : undefined}
            onClick={() => setCurrentView("monitoring")}
          >
            <span>Monitoring</span>
          </button>
          <button
            type="button"
            className={`nav-item ${currentView === "profile" ? "active" : ""}`}
            aria-current={currentView === "profile" ? "page" : undefined}
            onClick={() => setCurrentView("profile")}
          >
            <span>Profile</span>
          </button>
          <button
            type="button"
            className="btn-vc-pill"
            onClick={() => setCurrentView("voicecall")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>Voice Call</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
