import { useQuery } from "@tanstack/react-query";
import { Shell } from "../components/layout/Shell.jsx";
import { HealthBadge } from "../components/ui/HealthBadge.jsx";
import { Metric } from "../components/ui/Metric.jsx";
import {
  features,
  repoUrl,
  setupCommands,
  stack,
  swaggerUrl,
} from "../config/site.js";
import { InsertForm } from "../features/sensors/InsertForm.jsx";
import { SensorTable } from "../features/sensors/SensorTable.jsx";
import { SignalBars } from "../features/sensors/SignalBars.jsx";
import { getHealth, getSensorData } from "../lib/api.js";

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

export function Home() {
  const { data: health, isError: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });
  const { data: rows = [] } = useQuery({
    queryKey: ["sensorData"],
    queryFn: getSensorData,
  });

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
