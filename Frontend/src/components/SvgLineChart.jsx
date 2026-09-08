import React from "react";

export default function SvgLineChart({
  labels,
  values,
  min = 0,
  max = 10,
  lineColor = "#486e2e",
  fillColor = "rgba(72, 110, 46, 0.08)",
  unit = "/10",
}) {
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 25, bottom: 35, left: 40 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Guard: need at least 2 points to draw a line
  if (!values || values.length < 2) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="custom-svg-chart"
        aria-label="Insufficient data for line chart"
      >
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize="13"
          fill="#aaa"
          fontFamily="var(--font-sans)"
        >
          Not enough data yet
        </text>
      </svg>
    );
  }

  const count = values.length;
  const safeMax = max === min ? max + 1 : max; // prevent division by zero on flat range

  const points = values.map((val, idx) => {
    // Safe x: single-point edge case guard (count - 1 is always ≥ 1 here)
    const x = padding.left + (idx / (count - 1)) * chartW;
    const normalizedVal = (val - min) / (safeMax - min);
    const y = padding.top + chartH - normalizedVal * chartH;
    return { x, y, val };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="custom-svg-chart"
      aria-label={`Line chart: ${labels?.[0] ?? ""} to ${labels?.[labels.length - 1] ?? ""}`}
    >
      {/* Grid Lines */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={width - padding.right}
        y2={padding.top}
        stroke="#eee"
        strokeDasharray="3 3"
      />
      <line
        x1={padding.left}
        y1={padding.top + chartH / 2}
        x2={width - padding.right}
        y2={padding.top + chartH / 2}
        stroke="#eee"
        strokeDasharray="3 3"
      />
      <line
        x1={padding.left}
        y1={padding.top + chartH}
        x2={width - padding.right}
        y2={padding.top + chartH}
        stroke="#e0ded7"
      />

      {/* Area Fill */}
      <path d={areaD} fill={fillColor} />

      {/* Curve Line */}
      <path
        d={pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Points & Labels */}
      {points.map((pt, i) => (
        <g key={i}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r="4"
            fill={lineColor}
            stroke="#fff"
            strokeWidth="2"
            className="chart-point"
          >
            <title>
              {labels?.[i] ?? i}: {pt.val}
              {unit}
            </title>
          </circle>
          <text
            x={pt.x}
            y={height - 10}
            textAnchor="middle"
            fontSize="11"
            fill="#757c70"
            fontFamily="var(--font-sans)"
          >
            {labels?.[i] ?? i}
          </text>
        </g>
      ))}
    </svg>
  );
}
