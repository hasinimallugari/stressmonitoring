import React from "react";

export default function BottomNav({ currentView, setCurrentView }) {
  // Hide bottom nav on login, onboarding, or voice call screens
  if (
    currentView === "login" ||
    currentView === "onboarding" ||
    currentView === "voicecall"
  ) {
    return null;
  }

  return (
    <nav
      className="bottom-nav"
      id="bottom-nav"
      aria-label="Bottom Navigation Bar"
    >
      <button
        type="button"
        className={`mobile-nav-item ${currentView === "dashboard" ? "active" : ""}`}
        aria-current={currentView === "dashboard" ? "page" : undefined}
        onClick={() => setCurrentView("dashboard")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${currentView === "monitoring" ? "active" : ""}`}
        aria-current={currentView === "monitoring" ? "page" : undefined}
        onClick={() => setCurrentView("monitoring")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>Monitoring</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${currentView === "profile" ? "active" : ""}`}
        aria-current={currentView === "profile" ? "page" : undefined}
        onClick={() => setCurrentView("profile")}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Profile</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${currentView === "voicecall" ? "active" : ""}`}
        aria-current={currentView === "voicecall" ? "page" : undefined}
        onClick={() => setCurrentView("voicecall")}
      >
        <div className="mobile-vc-circle">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <span>Voice Call</span>
      </button>
    </nav>
  );
}
