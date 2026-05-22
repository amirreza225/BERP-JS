import { useQuery } from "@tanstack/react-query";
import { Shell } from "../components/layout/Shell.jsx";
import { SensorLineChart } from "../features/sensors/SensorLineChart.jsx";
import { getSensorData } from "../lib/api.js";

export function ChartPage() {
  const { data: rows = [] } = useQuery({
    queryKey: ["sensorData"],
    queryFn: getSensorData,
  });

  const sorted = [...rows].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );
  const sensors = [...new Set(sorted.map((d) => d.sensorId))];

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold text-white">Sensor chart</h1>
        <p className="mb-6 text-sm text-slate-400">
          Most recent 100 readings grouped by sensor ID.
        </p>
        <div className="rounded border border-white/10 bg-white/[0.05] p-5">
          {sorted.length === 0 ? (
            <p className="text-sm text-slate-400">
              No data yet. Insert records on the home page.
            </p>
          ) : (
            <SensorLineChart data={sorted} sensors={sensors} />
          )}
        </div>
      </main>
    </Shell>
  );
}
