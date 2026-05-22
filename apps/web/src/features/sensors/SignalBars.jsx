const demoBars = [
  { id: "demo-01", value: 22 },
  { id: "demo-02", value: 48 },
  { id: "demo-03", value: 35 },
  { id: "demo-04", value: 76 },
  { id: "demo-05", value: 54 },
  { id: "demo-06", value: 91 },
  { id: "demo-07", value: 63 },
  { id: "demo-08", value: 44 },
  { id: "demo-09", value: 70 },
  { id: "demo-10", value: 58 },
  { id: "demo-11", value: 82 },
  { id: "demo-12", value: 49 },
  { id: "demo-13", value: 67 },
  { id: "demo-14", value: 73 },
  { id: "demo-15", value: 52 },
  { id: "demo-16", value: 88 },
  { id: "demo-17", value: 60 },
  { id: "demo-18", value: 79 },
];

export function SignalBars({ rows }) {
  const bars = rows.length
    ? rows.slice(0, 18).map((row) => ({
        id: row.id,
        value: Number(row.value) || 0,
      }))
    : demoBars;
  const max = Math.max(...bars.map((bar) => Math.abs(bar.value)), 1);

  return (
    <div className="flex h-full items-end gap-1.5">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="w-full rounded-sm bg-gradient-to-t from-teal-400 to-pink-300"
          style={{
            height: `${Math.max(12, (Math.abs(bar.value) / max) * 100)}%`,
          }}
        />
      ))}
    </div>
  );
}
