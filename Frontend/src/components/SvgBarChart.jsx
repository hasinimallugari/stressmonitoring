import React from 'react';

export default function SvgBarChart({ labels, values, min = 0, max = 12, barColor = "#4a6984", unit = "h" }) {
    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 25, bottom: 35, left: 40 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const count = values.length;
    const barWidth = Math.min(32, (chartW / count) * 0.55);

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="custom-svg-chart" aria-label="Bar chart visualization">
            {/* Grid Lines */}
            <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="#eee" strokeDasharray="3 3" />
            <line x1={padding.left} y1={padding.top + chartH / 2} x2={width - padding.right} y2={padding.top + chartH / 2} stroke="#eee" strokeDasharray="3 3" />
            <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="#e0ded7" />

            {values.map((val, i) => {
                const xCenter = padding.left + (i + 0.5) * (chartW / count);
                const barX = xCenter - barWidth / 2;
                const normalizedVal = (val - min) / (max - min);
                const barH = normalizedVal * chartH;
                const barY = padding.top + chartH - barH;

                return (
                    <g key={i}>
                        <rect x={barX} y={barY} width={barWidth} height={barH} rx="4" fill={barColor} opacity="0.85" className="chart-bar">
                            <title>{labels[i]}: {val}{unit}</title>
                        </rect>
                        <text x={xCenter} y={height - 10} textAnchor="middle" fontSize="11" fill="#757c70" fontFamily="var(--font-sans)">
                            {labels[i]}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
