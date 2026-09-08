import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

// Returns "Good morning", "Good afternoon", or "Good evening" based on local time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Compute a simple week-over-week trend from a weekly data array.
// Returns an object: { direction: 'up'|'down'|'flat', pct: number }
function weekTrend(weekly) {
  if (!weekly || weekly.length < 2) return null;
  const prev = weekly[weekly.length - 2];
  const curr = weekly[weekly.length - 1];
  if (prev === 0) return null;
  const pct = Math.round(((curr - prev) / prev) * 100);
  return {
    direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat",
    pct: Math.abs(pct),
  };
}

export default function DashboardView({ onNavigate }) {
  const { userProfile, updateUserDoc } = useAuth();
  const userName = userProfile.name || "User";

  // ── Schedule ─────────────────────────────────────────────────────────────
  // Use doc schedule if available; otherwise start with an empty list so
  // new users see a blank slate rather than fake demo data.
  const docSchedule = userProfile.doc?.schedule ?? null;
  const [schedule, setSchedule] = useState(docSchedule || []);

  // Keep schedule in sync when the doc loads / updates from the backend,
  // but only replace local state when the incoming doc actually has a schedule
  // (prevents wiping out local optimistic updates on unrelated doc syncs).
  const prevDocScheduleRef = useRef(docSchedule);
  useEffect(() => {
    const incoming = userProfile.doc?.schedule ?? null;
    if (incoming && incoming !== prevDocScheduleRef.current) {
      prevDocScheduleRef.current = incoming;
      setSchedule(incoming);
    }
  }, [userProfile.doc]);

  // Fix race condition: always toggle against the latest local schedule state,
  // not against userProfile.doc (which may be stale when toggling rapidly).
  const toggleScheduleStatus = (id) => {
    setSchedule((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "completed" ? "upcoming" : "completed",
            }
          : item,
      );
      // Persist to backend using the latest toggled snapshot
      const currentDoc = userProfile.doc || {};
      updateUserDoc({ ...currentDoc, schedule: updated });
      return updated;
    });
  };

  // ── Metrics ───────────────────────────────────────────────────────────────
  const metrics = userProfile.doc?.health_metrics || {};
  const wellbeingScore =
    userProfile.wellbeingScore ?? metrics.wellbeing_score ?? 0;
  const wellbeingStatus =
    userProfile.wellbeingStatus ?? metrics.wellbeing_status ?? "—";

  // Trend badges — computed from real data; null means "no data yet"
  const wellbeingTrend = weekTrend(metrics.weekly_wellbeing);
  const stressTrend = weekTrend(metrics.weekly_stress);
  const sleepTrend = weekTrend(metrics.weekly_sleep);

  // Sparkline bars — derived from weekly_mood (7 values, normalised to %)
  const weeklyMood = metrics.weekly_mood;
  const sparklineBars = (() => {
    if (!weeklyMood || weeklyMood.length === 0) return [];
    const max = Math.max(...weeklyMood, 1);
    return weeklyMood.map((v, i) => ({
      pct: Math.round((v / max) * 100),
      active: i === weeklyMood.length - 1,
    }));
  })();

  // ── Streak insight ────────────────────────────────────────────────────────
  const streakDays = metrics.streak_days ?? 0;

  const hasData = wellbeingScore > 0 || streakDays > 0 || schedule.length > 0;

  return (
    <section
      className="view-screen active-view"
      id="view-dashboard"
      aria-label="Home Dashboard"
    >
      <div className="dashboard-wrapper">
        {/* Welcome Banner */}
        <header className="dashboard-header">
          <div className="greeting-area">
            <h1 className="user-greeting">
              {getGreeting()}, {userName}
            </h1>
            <p className="greeting-subtext">
              Here's an overview of how you've been doing this week.
            </p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn-vc-hero"
              onClick={() => onNavigate("voicecall")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>Start Voice Call</span>
            </button>
          </div>
        </header>

        {/* Reassuring Headline Card */}
        <div className="quote-card">
          <h2 className="quote-text">
            &ldquo;What happened to you is part of your story, not the
            DEFINITION of who you are&rdquo;
          </h2>
          <div className="quote-action">
            <button
              type="button"
              className="btn-text-link"
              onClick={() => onNavigate("voicecall")}
            >
              Talk to us Now →
            </button>
          </div>
        </div>

        {/* Main Metrics Cards Grid */}
        <div className="metrics-grid">
          {/* Card 1: Wellbeing Overview */}
          <div className="metric-card card-wellbeing">
            <div className="card-header">
              <h3>Wellbeing Overview</h3>
              {wellbeingStatus !== "—" && (
                <span className="badge-status badge-good">
                  {wellbeingStatus}
                </span>
              )}
            </div>
            <div className="score-display">
              <span className="big-score">{wellbeingScore || "—"}</span>
              {wellbeingScore > 0 && <span className="score-max">/100</span>}
            </div>
            {wellbeingTrend ? (
              <div
                className={`trend-indicator trend-${wellbeingTrend.direction === "up" ? "up" : "down"}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  {wellbeingTrend.direction === "up" ? (
                    <>
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </>
                  ) : (
                    <>
                      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                      <polyline points="17 18 23 18 23 12" />
                    </>
                  )}
                </svg>
                <span>
                  {wellbeingTrend.direction === "up" ? "↑" : "↓"}{" "}
                  {wellbeingTrend.pct}% from last week
                </span>
              </div>
            ) : (
              <p className="card-footer-note" style={{ marginTop: 0 }}>
                Keep logging to see trends.
              </p>
            )}
            <p className="card-footer-note">
              Based on sleep consistency, activity &amp; daily check-ins.
            </p>
          </div>

          {/* Card 2: Mood Trend Summary */}
          <div className="metric-card card-mood">
            <div className="card-header">
              <h3>Mood Trend</h3>
              <span className="card-tag">7-Day View</span>
            </div>
            <div className="metric-value-row">
              <span className="metric-primary-val">
                {metrics.mood_trend ||
                  (sparklineBars.length === 0 ? "No data yet" : "Tracking...")}
              </span>
            </div>
            {sparklineBars.length > 0 ? (
              <div className="mini-chart-placeholder">
                <div className="sparkline-bar-group">
                  {sparklineBars.map((bar, i) => (
                    <span
                      key={i}
                      className={`bar${bar.active ? " active" : ""}`}
                      style={{ height: `${bar.pct}%` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="card-footer-note" style={{ marginTop: "8px" }}>
                Chat with the AI companion to start tracking your mood.
              </p>
            )}
            <button
              type="button"
              className="card-action-link"
              onClick={() => onNavigate("monitoring")}
            >
              <span>View Mood Analytics →</span>
            </button>
          </div>

          {/* Card 3: Stress Level Monitor */}
          <div className="metric-card card-stress">
            <div className="card-header">
              <h3>Stress Indicator</h3>
              {metrics.stress_trend ? (
                <span className="badge-status badge-low">
                  {metrics.stress_trend}
                </span>
              ) : (
                <span className="badge-status badge-neutral">Not tracked</span>
              )}
            </div>
            <div className="metric-value-row">
              {metrics.weekly_stress && metrics.weekly_stress.length > 0 ? (
                <>
                  <span className="metric-primary-val">
                    {metrics.weekly_stress[
                      metrics.weekly_stress.length - 1
                    ].toFixed(1)}{" "}
                    <small>/ 10</small>
                  </span>
                  {stressTrend && (
                    <span
                      className={`trend-badge trend-${stressTrend.direction === "down" ? "up" : "down"}`}
                    >
                      {stressTrend.direction === "down" ? "↓" : "↑"}{" "}
                      {stressTrend.pct}%{" "}
                      {stressTrend.direction === "down" ? "lower" : "higher"}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className="metric-primary-val"
                  style={{
                    fontSize: "1rem",
                    color: "var(--color-text-subtle)",
                  }}
                >
                  No data yet
                </span>
              )}
            </div>
            <p className="card-footer-note">
              Lower stress levels correlate with better focus and sleep.
            </p>
            <button
              type="button"
              className="card-action-link"
              onClick={() => onNavigate("monitoring")}
            >
              <span>Manage Stress Trends →</span>
            </button>
          </div>

          {/* Card 4: Sleep & Recovery Log */}
          <div className="metric-card card-sleep">
            <div className="card-header">
              <h3>Sleep Duration</h3>
              <span className="card-tag">Target: 7.5h</span>
            </div>
            <div className="metric-value-row">
              <span className="metric-primary-val">
                {metrics.sleep_average || "Not tracked"}
              </span>
              {sleepTrend && (
                <span
                  className={`trend-badge trend-${sleepTrend.direction === "up" ? "up" : "down"}`}
                >
                  {sleepTrend.direction === "up" ? "+" : "-"}
                  {sleepTrend.pct}% avg
                </span>
              )}
            </div>
            {!metrics.sleep_average && (
              <p className="card-footer-note">
                Log your sleep in the daily check-in to see trends here.
              </p>
            )}
            <button
              type="button"
              className="card-action-link"
              onClick={() => onNavigate("monitoring")}
            >
              <span>Sleep Quality Charts →</span>
            </button>
          </div>
        </div>

        {/* Section 2: Timetable / Daily Schedule */}
        <div className="dashboard-section schedule-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Today's Routine &amp; Timetable</h2>
              <p className="section-subtitle">
                Your personalised habits, synced with the database.
              </p>
            </div>
          </div>

          <div className="timetable-card">
            {schedule.length === 0 ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "var(--color-text-subtle)",
                }}
              >
                <p style={{ marginBottom: "12px" }}>No schedule set up yet.</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onNavigate("onboarding")}
                >
                  Set up my routine →
                </button>
              </div>
            ) : (
              <div className="timetable-list" id="schedule-container">
                {schedule.map((item) => (
                  <div
                    key={item.id}
                    className={`timetable-row ${item.status === "completed" ? "completed" : ""}`}
                  >
                    <div className="time-col">{item.time}</div>
                    <div className="timeline-indicator">
                      <span className={`timeline-dot ${item.status}`}></span>
                      <span className="timeline-line"></span>
                    </div>
                    <div className="content-col">
                      <div className="item-header">
                        <h4 className="item-title">{item.title}</h4>
                        <span
                          className={`category-badge tag-${item.category.toLowerCase()}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p className="item-note">{item.note}</p>
                    </div>
                    <div className="action-col">
                      <button
                        type="button"
                        className="status-toggle-btn"
                        onClick={() => toggleScheduleStatus(item.id)}
                      >
                        {item.status === "completed" ? "✓ Done" : "Mark Done"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Personalised Insights */}
        <div className="dashboard-section insights-section">
          <div className="section-header">
            <h2 className="section-title">Personalised Insights</h2>
            <p className="section-subtitle">
              Observations based on your actual logged data.
            </p>
          </div>

          {!hasData ? (
            /* Empty state — no data logged yet */
            <div
              className="insight-card"
              style={{ textAlign: "center", padding: "32px" }}
            >
              <h4 className="insight-title" style={{ marginBottom: "8px" }}>
                No insights yet
              </h4>
              <p className="insight-description">
                Insights appear once you start logging your mood, sleep, and
                daily check-ins. Use the AI companion to get started.
              </p>
              <div className="insight-footer" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="insight-action-btn"
                  onClick={() => onNavigate("onboarding")}
                >
                  Start my first check-in →
                </button>
              </div>
            </div>
          ) : (
            <div className="insights-grid" id="insights-container">
              {/* Streak insight — only shown if there is actual streak data */}
              {streakDays > 0 && (
                <div className="insight-card">
                  <div className="insight-header">
                    <span className="insight-category">Wellbeing Streak</span>
                    <span className="insight-tag">Milestone</span>
                  </div>
                  <h4 className="insight-title">
                    {streakDays} {streakDays === 1 ? "Day" : "Days"} of
                    Consistent Tracking
                  </h4>
                  <p className="insight-description">
                    You've completed your daily check-in {streakDays}{" "}
                    {streakDays === 1 ? "day" : "days"} in a row. Regular
                    logging improves recommendation accuracy.
                  </p>
                  <div className="insight-footer">
                    <button
                      type="button"
                      className="insight-action-btn"
                      onClick={() => onNavigate("onboarding")}
                    >
                      Quick Check-in →
                    </button>
                  </div>
                </div>
              )}

              {/* Mood insight — only shown when mood data exists */}
              {weeklyMood &&
                weeklyMood.length >= 2 &&
                (() => {
                  const latest = weeklyMood[weeklyMood.length - 1];
                  const prev = weeklyMood[weeklyMood.length - 2];
                  const diff = latest - prev;
                  return (
                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-category">Mood</span>
                        <span className="insight-tag">
                          {diff >= 0 ? "Improving" : "Needs attention"}
                        </span>
                      </div>
                      <h4 className="insight-title">
                        {diff >= 0
                          ? "Mood trending upward"
                          : "Mood dipped recently"}
                      </h4>
                      <p className="insight-description">
                        Your mood score moved from {prev.toFixed(1)} to{" "}
                        {latest.toFixed(1)} compared to the previous day.
                        {diff >= 0
                          ? " Keep up the positive habits."
                          : " Consider checking in with the AI companion for support."}
                      </p>
                      <div className="insight-footer">
                        <button
                          type="button"
                          className="insight-action-btn"
                          onClick={() => onNavigate("monitoring")}
                        >
                          View Mood Chart →
                        </button>
                      </div>
                    </div>
                  );
                })()}

              {/* Stress insight — only shown when stress data exists */}
              {metrics.weekly_stress &&
                metrics.weekly_stress.length >= 2 &&
                (() => {
                  const latest =
                    metrics.weekly_stress[metrics.weekly_stress.length - 1];
                  const prev =
                    metrics.weekly_stress[metrics.weekly_stress.length - 2];
                  const diff = latest - prev;
                  return (
                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-category">
                          Stress Patterns
                        </span>
                        <span className="insight-tag">
                          {diff <= 0 ? "Positive trend" : "Monitor closely"}
                        </span>
                      </div>
                      <h4 className="insight-title">
                        {diff <= 0
                          ? "Stress is easing"
                          : "Stress increased recently"}
                      </h4>
                      <p className="insight-description">
                        Your stress score shifted from {prev.toFixed(1)} to{" "}
                        {latest.toFixed(1)}.
                        {diff <= 0
                          ? " Great work managing pressure."
                          : " Try a short breathing exercise or reach out to the AI companion."}
                      </p>
                      <div className="insight-footer">
                        <button
                          type="button"
                          className="insight-action-btn"
                          onClick={() => onNavigate("monitoring")}
                        >
                          View Stress Chart →
                        </button>
                      </div>
                    </div>
                  );
                })()}

              {/* Wellbeing progress — shown when wellbeing array has entries */}
              {metrics.weekly_wellbeing &&
                metrics.weekly_wellbeing.length > 0 &&
                (() => {
                  const current =
                    metrics.weekly_wellbeing[
                      metrics.weekly_wellbeing.length - 1
                    ];
                  return (
                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-category">
                          Overall Wellbeing
                        </span>
                        <span className="insight-tag">Weekly Summary</span>
                      </div>
                      <h4 className="insight-title">
                        Current score: {current}/100
                      </h4>
                      <p className="insight-description">
                        Your composite wellbeing score is calculated from mood,
                        stress, and sleep data.
                        {current >= 70
                          ? " You're in a good place — keep the momentum going."
                          : current >= 50
                            ? " There's room to improve. Consistent check-ins will help."
                            : " Let's work on building better habits together."}
                      </p>
                      <div className="insight-footer">
                        <button
                          type="button"
                          className="insight-action-btn"
                          onClick={() => onNavigate("monitoring")}
                        >
                          View Full Trends →
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
