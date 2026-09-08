import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import SvgLineChart from "../components/SvgLineChart";
import SvgBarChart from "../components/SvgBarChart";

// Compute average of an array, rounded to one decimal place.
function avg(arr) {
  if (!arr || arr.length === 0) return null;
  return (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1);
}

export default function MonitoringView() {
  const { userProfile } = useAuth();
  const [timeframe, setTimeframe] = useState("7d");

  const metrics = userProfile.doc?.health_metrics || {};

  // ── Weekly labels & data (always from real user doc) ─────────────────────
  const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const weeklyMood = metrics.weekly_mood || [];
  const weeklyStress = metrics.weekly_stress || [];
  const weeklySleep = metrics.weekly_sleep || [];
  const weeklyWellbeing = metrics.weekly_wellbeing || [];

  // ── 30-day data: only use what is stored in the doc (no fake arrays) ──────
  // The doc may not have monthly arrays yet — we derive what we can from
  // weekly data by repeating the 7-day window as a single "this week" point,
  // or show an empty state.
  const monthly30Labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const monthlyMood = metrics.monthly_mood || [];
  const monthlyStress = metrics.monthly_stress || [];
  const monthlySleep = metrics.monthly_sleep || [];
  const monthlyWellbeing = metrics.monthly_wellbeing || [];

  // Pick the right dataset based on selected timeframe
  const currentLabels = timeframe === "7d" ? weeklyLabels : monthly30Labels;
  const currentMood = timeframe === "7d" ? weeklyMood : monthlyMood;
  const currentStress = timeframe === "7d" ? weeklyStress : monthlyStress;
  const currentSleep = timeframe === "7d" ? weeklySleep : monthlySleep;
  const currentWellbeing =
    timeframe === "7d" ? weeklyWellbeing : monthlyWellbeing;

  // Computed averages (null when no data)
  const moodAvg = avg(currentMood);
  const stressAvg = avg(currentStress);
  const sleepAvg = avg(currentSleep);
  const wellbeingAvg = avg(currentWellbeing);

  const noDataForTimeframe =
    currentMood.length === 0 &&
    currentStress.length === 0 &&
    currentSleep.length === 0 &&
    currentWellbeing.length === 0;

  return (
    <section
      className="view-screen active-view"
      id="view-monitoring"
      aria-label="Health Monitoring Dashboard"
    >
      <div className="dashboard-wrapper">
        <header className="page-title-header">
          <div>
            <h1 className="page-title">Wellbeing &amp; Health Monitoring</h1>
            <p className="page-subtitle">
              Track emotional trends, sleep duration, and stress indicators over
              time (loaded from backend DB).
            </p>
          </div>

          {/* Timeframe toggle — uses .tab-btn / .tab-btn.active from style.css */}
          <div className="timeframe-toggle">
            <button
              type="button"
              className={`tab-btn ${timeframe === "7d" ? "active" : ""}`}
              onClick={() => setTimeframe("7d")}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              className={`tab-btn ${timeframe === "30d" ? "active" : ""}`}
              onClick={() => setTimeframe("30d")}
            >
              Last 30 Days
            </button>
          </div>
        </header>

        {noDataForTimeframe ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "60px 24px",
              color: "var(--color-text-subtle)",
              gap: "12px",
              textAlign: "center",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.4"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              No data for this period
            </h3>
            <p style={{ maxWidth: "380px", fontSize: "0.9rem" }}>
              {timeframe === "30d"
                ? "Monthly data will appear here as it accumulates from your weekly logs."
                : "Start logging your mood, stress, and sleep through daily check-ins to see your trends."}
            </p>
          </div>
        ) : (
          <div className="charts-grid">
            {/* Chart 1: Mood Score */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Mood &amp; Energy Trajectory</h3>
                  <p className="chart-sub">
                    Daily self-reported mood score (1–10)
                  </p>
                </div>
                {moodAvg !== null ? (
                  <span className="chart-stat-badge">Avg: {moodAvg} / 10</span>
                ) : (
                  <span className="chart-stat-badge" style={{ opacity: 0.5 }}>
                    No data
                  </span>
                )}
              </div>
              <div className="svg-chart-container" id="chart-mood">
                {currentMood.length >= 2 ? (
                  <SvgLineChart
                    labels={currentLabels.slice(0, currentMood.length)}
                    values={currentMood}
                    min={0}
                    max={10}
                    lineColor="#486e2e"
                    fillColor="rgba(72, 110, 46, 0.08)"
                    unit="/10"
                  />
                ) : (
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: "0.88rem",
                      padding: "40px 0",
                      textAlign: "center",
                    }}
                  >
                    Not enough data yet — keep logging.
                  </p>
                )}
              </div>
            </div>

            {/* Chart 2: Stress Indicator */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Perceived Stress Levels</h3>
                  <p className="chart-sub">
                    Lower scores indicate calmer state (1–10)
                  </p>
                </div>
                {stressAvg !== null ? (
                  <span className="chart-stat-badge accent-stress">
                    Avg: {stressAvg} / 10
                  </span>
                ) : (
                  <span
                    className="chart-stat-badge accent-stress"
                    style={{ opacity: 0.5 }}
                  >
                    No data
                  </span>
                )}
              </div>
              <div className="svg-chart-container" id="chart-stress">
                {currentStress.length >= 2 ? (
                  <SvgLineChart
                    labels={currentLabels.slice(0, currentStress.length)}
                    values={currentStress}
                    min={0}
                    max={10}
                    lineColor="#c86d3b"
                    fillColor="rgba(200, 109, 59, 0.08)"
                    unit="/10"
                  />
                ) : (
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: "0.88rem",
                      padding: "40px 0",
                      textAlign: "center",
                    }}
                  >
                    Not enough data yet — keep logging.
                  </p>
                )}
              </div>
            </div>

            {/* Chart 3: Sleep Duration */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Sleep Hours &amp; Recovery</h3>
                  <p className="chart-sub">
                    Total sleep logged per night (hours)
                  </p>
                </div>
                {sleepAvg !== null ? (
                  <span className="chart-stat-badge accent-sleep">
                    Avg: {sleepAvg}h / night
                  </span>
                ) : (
                  <span
                    className="chart-stat-badge accent-sleep"
                    style={{ opacity: 0.5 }}
                  >
                    {metrics.sleep_average || "No data"}
                  </span>
                )}
              </div>
              <div className="svg-chart-container" id="chart-sleep">
                {currentSleep.length >= 2 ? (
                  <SvgBarChart
                    labels={currentLabels.slice(0, currentSleep.length)}
                    values={currentSleep}
                    min={0}
                    max={12}
                    barColor="#4a6984"
                    unit="h"
                  />
                ) : (
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: "0.88rem",
                      padding: "40px 0",
                      textAlign: "center",
                    }}
                  >
                    Not enough data yet — keep logging.
                  </p>
                )}
              </div>
            </div>

            {/* Chart 4: Overall Wellbeing Score */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-title">Composite Wellbeing Score</h3>
                  <p className="chart-sub">
                    Aggregated score based on routine, mood &amp; stress
                  </p>
                </div>
                {wellbeingAvg !== null ? (
                  <span className="chart-stat-badge accent-wellbeing">
                    Avg: {wellbeingAvg}%
                  </span>
                ) : userProfile.wellbeingScore > 0 ? (
                  <span className="chart-stat-badge accent-wellbeing">
                    Score: {userProfile.wellbeingScore}%
                  </span>
                ) : (
                  <span
                    className="chart-stat-badge accent-wellbeing"
                    style={{ opacity: 0.5 }}
                  >
                    No data
                  </span>
                )}
              </div>
              <div className="svg-chart-container" id="chart-wellbeing">
                {currentWellbeing.length >= 2 ? (
                  <SvgLineChart
                    labels={currentLabels.slice(0, currentWellbeing.length)}
                    values={currentWellbeing}
                    min={0}
                    max={100}
                    lineColor="#2b5c53"
                    fillColor="rgba(43, 92, 83, 0.12)"
                    unit="%"
                  />
                ) : (
                  <p
                    style={{
                      color: "var(--color-text-subtle)",
                      fontSize: "0.88rem",
                      padding: "40px 0",
                      textAlign: "center",
                    }}
                  >
                    Not enough data yet — keep logging.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
