import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Shell } from "../components/layout/Shell.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { getSensorData } from "../lib/api.js";

export function LivePage() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("connecting");
  const isVercel = window.location.hostname.endsWith(".vercel.app");
  const { data: polledRows = [] } = useQuery({
    queryKey: ["sensorData", "live"],
    queryFn: getSensorData,
    refetchInterval: isVercel ? 3000 : false,
    enabled: isVercel,
  });

  useEffect(() => {
    if (isVercel) {
      setStatus("polling");
      return;
    }
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/api/ws/sensor`);
    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("error");
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [data, ...prev].slice(0, 50));
      } catch {
        // ignore malformed frames
      }
    };
    return () => ws.close();
  }, [isVercel]);

  useEffect(() => {
    if (!isVercel) return;
    setEvents(polledRows.slice(0, 50));
  }, [isVercel, polledRows]);

  const badgeTone =
    {
      connected: "teal",
      connecting: "slate",
      disconnected: "amber",
      error: "red",
      polling: "teal",
    }[status] ?? "slate";

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Live telemetry</h1>
          <StatusBadge tone={badgeTone}>{status}</StatusBadge>
        </div>
        <p className="mb-6 text-sm text-slate-400">
          {isVercel
            ? "Vercel serverless does not keep WebSocket connections open, so this page polls the sensor API every 3 seconds."
            : "Real-time sensor events via WebSocket. Insert data on the home page to see it stream here."}
        </p>
        {events.length === 0 ? (
          <p className="rounded border border-white/10 bg-white/[0.05] p-6 text-sm text-slate-400">
            Waiting for events… Insert a sensor reading on the home page.
          </p>
        ) : (
          <div className="overflow-hidden rounded border border-white/10 bg-white/[0.05]">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Sensor</th>
                  <th className="px-3 py-2 text-left font-medium">Value</th>
                  <th className="px-3 py-2 text-left font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {events.map((ev) => (
                  <tr key={ev.id} className="bg-slate-950/40">
                    <td className="px-3 py-2 font-mono text-slate-200">
                      {ev.sensorId}
                    </td>
                    <td className="px-3 py-2 text-white">{ev.value}</td>
                    <td className="px-3 py-2 text-slate-400">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          {isVercel ? (
            <>
              Polls <code className="font-mono">/api/sensor</code>. WebSocket
              streaming is available in self-hosted mode.
            </>
          ) : (
            <>
              Streams from <code className="font-mono">/api/ws/sensor</code>.
              Works in self-hosted mode (Docker, Railway, Fly.io).
            </>
          )}
        </p>
      </main>
    </Shell>
  );
}
