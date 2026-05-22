import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { createSensorData, getHealth, getSensorData } from "./lib/api.js";

const queryClient = new QueryClient();
const repoUrl = "https://github.com/amirreza225/BERP-JS";
const swaggerUrl = "/swagger";

const CHART_COLORS = ["#2dd4bf", "#f472b6", "#60a5fa", "#a78bfa", "#34d399"];

const stack = ["Bun", "Elysia", "React 19", "Prisma", "TimescaleDB"];
const features = [
  "Pure JavaScript and JSX",
  "Single-command full-stack dev server",
  "Better Auth ready",
  "TimescaleDB hypertable migrations",
  "Docker, Vercel, Vitest, Playwright, Biome",
  "No TypeScript, Vite, Next.js, Remix, or SSR framework",
];

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(20,184,166,0.20),transparent_32%),radial-gradient(circle_at_85%_0%,rgba(244,114,182,0.14),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_44%,#111827_100%)]" />
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-base font-semibold tracking-tight">
            BERP-JS
          </Link>
          <nav className="flex items-center gap-2 text-sm text-slate-300">
            <Link
              to="/chart"
              className="rounded border border-white/15 px-3 py-1.5 hover:border-teal-300 hover:text-white"
            >
              Chart
            </Link>
            <Link
              to="/live"
              className="rounded border border-white/15 px-3 py-1.5 hover:border-teal-300 hover:text-white"
            >
              Live
            </Link>
            <a
              href={swaggerUrl}
              className="rounded border border-white/15 px-3 py-1.5 hover:border-teal-300 hover:text-white"
            >
              API docs
            </a>
            <a
              href={repoUrl}
              className="rounded bg-white px-3 py-1.5 font-medium text-slate-950 hover:bg-teal-100"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function HealthBadge({ health, error }) {
  if (error) {
    return <StatusBadge tone="red">api error</StatusBadge>;
  }
  if (!health) {
    return <StatusBadge tone="slate">checking api</StatusBadge>;
  }
  return (
    <StatusBadge tone={health.status === "ok" ? "teal" : "amber"}>
      {health.status} · {health.runtime}
    </StatusBadge>
  );
}

function StatusBadge({ tone, children }) {
  const styles = {
    amber: "border-amber-300/40 bg-amber-300/10 text-amber-100",
    red: "border-red-300/40 bg-red-300/10 text-red-100",
    slate: "border-slate-300/30 bg-slate-300/10 text-slate-200",
    teal: "border-teal-300/40 bg-teal-300/10 text-teal-100",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function Hero({ health, healthError, rows }) {
  const latestValue = rows[0]?.value ?? "ready";
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_430px] lg:py-16">
      <div className="flex min-h-[520px] flex-col justify-center">
        <div className="mb-5 flex flex-wrap gap-2">
          {stack.map((item) => (
            <span
              key={item}
              className="rounded border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-slate-200"
            >
              {item}
            </span>
          ))}
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
          Pure JavaScript full-stack starter for time-series apps.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          Clone one repo and get a Bun-native API, React dashboard, Prisma data
          layer, Better Auth, TimescaleDB migrations, tests, Docker, and Vercel
          deployment wiring.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`${repoUrl}/generate`}
            className="rounded bg-teal-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-200"
          >
            Use this template
          </a>
          <a
            href={repoUrl}
            className="rounded border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:border-teal-300"
          >
            Star on GitHub
          </a>
          <a
            href={swaggerUrl}
            className="rounded border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:border-teal-300"
          >
            Open API docs
          </a>
        </div>
      </div>

      <aside className="self-center rounded border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-teal-200">
              Live stack check
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Telemetry dashboard
            </h2>
          </div>
          <HealthBadge health={health} error={healthError} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Latest value" value={latestValue} />
          <Metric label="Records" value={rows.length} />
        </div>
        <div className="mt-4 h-36 rounded border border-white/10 bg-slate-950/70 p-3">
          <SignalBars rows={rows} />
        </div>
        <div className="mt-4">
          <SensorTable rows={rows.slice(0, 5)} compact />
        </div>
      </aside>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SignalBars({ rows }) {
  const bars = rows.length
    ? rows.slice(0, 18).map((row) => ({
        id: row.id,
        value: Number(row.value) || 0,
      }))
    : [
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

function SensorTable({ rows, compact = false }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="rounded border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
        No sensor records yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-3 py-2 font-medium">Sensor</th>
            <th className="px-3 py-2 font-medium">Value</th>
            {!compact && <th className="px-3 py-2 font-medium">Timestamp</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row) => (
            <tr key={row.id} className="bg-slate-950/40">
              <td className="px-3 py-2 font-mono text-slate-200">
                {row.sensorId}
              </td>
              <td className="px-3 py-2 text-white">{row.value}</td>
              {!compact && (
                <td className="px-3 py-2 text-slate-400">
                  {new Date(row.timestamp).toLocaleString()}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsertForm() {
  const [sensorId, setSensorId] = useState("sensor-demo");
  const [value, setValue] = useState("42.5");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSensorData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensorData"] });
      setValue((Math.random() * 100).toFixed(2));
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ sensorId, value: parseFloat(value) });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">Sensor ID</span>
        <input
          className="w-full rounded border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-300"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-slate-400">Value</span>
        <input
          className="w-full rounded border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-teal-300"
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="self-end rounded bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-200 disabled:opacity-50"
      >
        {mutation.isPending ? "Saving" : "Insert"}
      </button>
      {mutation.isError && (
        <p className="text-sm text-red-200 sm:col-span-3">
          {mutation.error.message}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-teal-200 sm:col-span-3">Record inserted.</p>
      )}
    </form>
  );
}

function Home() {
  const { data: health, isError: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });
  const { data: rows = [] } = useQuery({
    queryKey: ["sensorData"],
    queryFn: getSensorData,
  });

  const setupCommands = useMemo(
    () => [
      "git clone https://github.com/amirreza225/BERP-JS.git my-app",
      "cd my-app",
      "cp .env.example .env",
      "docker compose up -d",
      "bun install",
      "bun run db:migrate && bun run db:seed",
      "bun run dev",
    ],
    [],
  );

  return (
    <Shell>
      <Hero health={health} healthError={healthError} rows={rows} />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-white/10 bg-white/[0.05] p-5">
            <h2 className="text-lg font-semibold text-white">
              Why developers pick it
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-300">
              {features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-white/10 bg-slate-950/70 p-5">
            <h2 className="text-lg font-semibold text-white">Run it locally</h2>
            <pre className="mt-4 overflow-x-auto rounded bg-black/50 p-4 text-sm leading-7 text-teal-100">
              {setupCommands.join("\n")}
            </pre>
          </div>
        </section>

        <section className="mt-4 rounded border border-white/10 bg-white/[0.05] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Live sensor API
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                The form writes through the Elysia API into Prisma and
                TimescaleDB.
              </p>
            </div>
            <HealthBadge health={health} error={healthError} />
          </div>
          <InsertForm />
          <div className="mt-5">
            <SensorTable rows={rows} />
          </div>
        </section>
      </main>
    </Shell>
  );
}

function SensorLineChart({ data, sensors }) {
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
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
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
                stroke={CHART_COLORS[i % CHART_COLORS.length]}
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

function ChartPage() {
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

function LivePage() {
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart" element={<ChartPage />} />
          <Route path="/live" element={<LivePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 px-4 py-10 text-red-200">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-2 text-lg font-bold">Something went wrong</h1>
            <pre className="whitespace-pre-wrap text-sm">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
