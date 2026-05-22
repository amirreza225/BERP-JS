const chartColors = ["#2dd4bf", "#f472b6", "#60a5fa", "#a78bfa", "#34d399"];

export function SensorLineChart({ data, sensors }) {
  const W = 700;
  const H = 280;
  const pad = { top: 16, right: 24, bottom: 48, left: 52 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const values = data.map((d) => Number(d.value));
  const vMin = Math.min(...values);
  const vMax = Math.max(...values);
  const vRange = vMax - vMin || 1;
  const tMin = new Date(data[0].timestamp).getTime();
  const tMax = new Date(data[data.length - 1].timestamp).getTime();
  const tRange = tMax - tMin || 1;

  const xOf = (ts) => ((new Date(ts).getTime() - tMin) / tRange) * iw;
  const yOf = (v) => ih - ((Number(v) - vMin) / vRange) * ih;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: ih - t * ih,
    label: (vMin + t * vRange).toFixed(1),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Sensor data line chart"
    >
      <g transform={`translate(${pad.left},${pad.top})`}>
        {yTicks.map(({ y, label }) => (
          <g key={label}>
            <line
              x1={0}
              y1={y}
              x2={iw}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 4"
            />
            <text
              x={-8}
              y={y + 4}
              textAnchor="end"
              fill="#64748b"
              fontSize={11}
            >
              {label}
            </text>
          </g>
        ))}
        {sensors.map((sensorId, i) => {
          const pts = data
            .filter((d) => d.sensorId === sensorId)
            .map(
              (d) =>
                `${xOf(d.timestamp).toFixed(1)},${yOf(d.value).toFixed(1)}`,
            );
          return (
            <polyline
              key={sensorId}
              points={pts.join(" ")}
              fill="none"
              stroke={chartColors[i % chartColors.length]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
        <line x1={0} y1={0} x2={0} y2={ih} stroke="rgba(255,255,255,0.2)" />
        <line x1={0} y1={ih} x2={iw} y2={ih} stroke="rgba(255,255,255,0.2)" />
        <g transform={`translate(0,${ih + 24})`}>
          {sensors.map((sensorId, i) => (
            <g key={sensorId} transform={`translate(${i * 130},0)`}>
              <line
                x1={0}
                y1={0}
                x2={14}
                y2={0}
                stroke={chartColors[i % chartColors.length]}
                strokeWidth={2}
              />
              <text x={18} y={4} fill="#94a3b8" fontSize={11}>
                {sensorId}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
