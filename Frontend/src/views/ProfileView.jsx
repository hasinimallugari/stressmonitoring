import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfileView({ onLogout }) {
  const { userProfile, updateUserDoc, logout } = useAuth();
  const userName = userProfile.name || "User";
  const userEmail = userProfile.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  // ── Preferences ───────────────────────────────────────────────────────────
  // Pull from persisted doc; fall back to sensible defaults only when the doc
  // hasn't loaded yet (not from hardcoded demo data).
  const savedPrefs = userProfile.doc?.preferences || {
    dailyReminder: true,
    emailSummary: false,
    darkTheme: false,
    voiceCallAudio: true,
    anonymousDataSharing: true,
  };
  const [preferences, setPreferences] = useState(savedPrefs);

  const togglePref = (key) => {
    const updatedPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(updatedPrefs);
    const newDoc = { ...(userProfile.doc || {}), preferences: updatedPrefs };
    updateUserDoc(newDoc);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // ── Stats pulled from real user data ──────────────────────────────────────
  const wellbeingScore = userProfile.wellbeingScore ?? 0;
  const wellbeingStatus = userProfile.wellbeingStatus ?? "—";
  const streakDays = userProfile.doc?.health_metrics?.streak_days ?? 0;
  const joinedDate = userProfile.doc?.profile?.joined || "";

  return (
    <section
      className="view-screen active-view"
      id="view-profile"
      aria-label="User Profile &amp; Settings"
    >
      <div className="dashboard-wrapper">
        {/* ── Profile Header ─────────────────────────────────────────── */}
        {/* Uses .dashboard-wrapper layout — no mismatched custom classes */}
        <div
          className="metric-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--color-primary-light)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 700,
              flexShrink: 0,
              border: "2px solid var(--color-primary-badge)",
            }}
          >
            {userInitial}
          </div>

          {/* Name / Email / Badges */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.6rem",
                fontWeight: 600,
                marginBottom: "2px",
              }}
              id="profile-name"
            >
              {userName}
            </h1>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                marginBottom: "8px",
              }}
              id="profile-email"
            >
              {userEmail}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  padding: "2px 8px",
                  background: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {userProfile.role || "Student / User"}
              </span>
              {joinedDate && (
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    background: "#f1efea",
                    color: "var(--color-text-muted)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  Joined {joinedDate}
                </span>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {[
              { val: wellbeingScore || "—", lbl: "Wellbeing Score" },
              {
                val: streakDays > 0 ? `${streakDays} Days` : "—",
                lbl: "Active Streak",
              },
              { val: wellbeingStatus, lbl: "Current Status" },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                  }}
                >
                  {val}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column grid ────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Column 1 — Preferences */}
          <div className="timetable-card">
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              App &amp; Monitoring Preferences
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--color-text-subtle)",
                  marginLeft: "8px",
                }}
              >
                (saved to DB)
              </span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  key: "dailyReminder",
                  title: "Daily Mindful Check-in Reminders",
                  sub: "Receive gentle notifications to log your daily mood.",
                },
                {
                  key: "voiceCallAudio",
                  title: "Voice Call Audio Response",
                  sub: "Enable speech synthesis for voice assistant calls.",
                },
                {
                  key: "emailSummary",
                  title: "Weekly Wellbeing Email Summary",
                  sub: "Get progress reports emailed every Sunday.",
                },
                {
                  key: "anonymousDataSharing",
                  title: "Anonymous Research Sharing",
                  sub: "Contribute anonymised statistics to campus mental health research.",
                },
              ].map(({ key, title, sub }) => (
                <div
                  key={key}
                  className="timetable-row"
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 600,
                        marginBottom: "2px",
                      }}
                    >
                      {title}
                    </h4>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--color-text-subtle)",
                      }}
                    >
                      {sub}
                    </p>
                  </div>
                  {/* Toggle switch — uses .switch / .slider from style.css */}
                  <label
                    className="switch"
                    style={{ flexShrink: 0, marginLeft: "16px" }}
                  >
                    <input
                      type="checkbox"
                      checked={preferences[key]}
                      onChange={() => togglePref(key)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <button
                type="button"
                className="btn-danger-outline"
                id="logout-btn"
                onClick={handleLogout}
              >
                Sign Out of Account
              </button>
            </div>
          </div>

          {/* Column 2 — Counselling info placeholder */}
          {/* Removed hardcoded "Dr. Sarah Jenkins" demo card. Shows a
                        neutral placeholder until a real counsellor integration exists. */}
          <div className="timetable-card">
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              Counselling &amp; Support
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 16px",
                gap: "12px",
                textAlign: "center",
                color: "var(--color-text-subtle)",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.45"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p style={{ fontSize: "0.9rem", maxWidth: "260px" }}>
                Counsellor session details will appear here once the scheduling
                integration is connected.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigate?.("onboarding")}
                style={{ marginTop: "4px" }}
              >
                Talk to AI Companion →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
