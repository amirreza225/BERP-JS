import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { createSensorData, getHealth, getSensorData } from "./lib/api.js";

const queryClient = new QueryClient();

function HealthBadge({ health, error }) {
  if (error) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-red-100 text-red-800">
        error
      </span>
    );
  }
  if (!health) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-gray-100 text-gray-600">
        loading…
      </span>
    );
  }
  const degraded = health.status === "degraded";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium ${
        degraded
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      {health.status} · {health.runtime}
    </span>
  );
}

function SensorTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-gray-500 mt-2">No sensor records yet.</p>;
  }
  return (
    <div className="overflow-x-auto mt-3">
      <table className="min-w-full text-sm border border-gray-200 rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-600">
              Sensor ID
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">
              Value
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100">
              <td className="px-4 py-2 font-mono">{row.sensorId}</td>
              <td className="px-4 py-2">{row.value}</td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(row.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsertForm() {
  const [sensorId, setSensorId] = useState("");
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSensorData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensorData"] });
      setSensorId("");
      setValue("");
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({ sensorId, value: parseFloat(value) });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-2 items-end mt-3"
    >
      <div>
        <label htmlFor="sensorId" className="block text-xs text-gray-500 mb-1">
          Sensor ID
        </label>
        <input
          id="sensorId"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          placeholder="sensor-1"
          required
        />
      </div>
      <div>
        <label htmlFor="value" className="block text-xs text-gray-500 mb-1">
          Value
        </label>
        <input
          id="value"
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-28"
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="42.5"
          required
        />
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-4 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {mutation.isPending ? "Inserting…" : "Insert"}
      </button>
      {mutation.isError && (
        <span className="text-sm text-red-700">{mutation.error.message}</span>
      )}
      {mutation.isSuccess && (
        <span className="text-sm text-green-700">Record inserted.</span>
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">BERP-JS</h1>
        <p className="text-gray-500 mt-1">
          Bun · Elysia · React · Prisma · TimescaleDB — pure JavaScript
          full-stack boilerplate.
        </p>
        <nav className="flex gap-4 mt-4">
          <Link
            to="/"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            About
          </Link>
        </nav>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">
          API Health
        </h2>
        <div className="flex items-center gap-3">
          <HealthBadge health={health} error={healthError} />
          {health && (
            <span className="text-xs text-gray-400">{health.timestamp}</span>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Insert Sensor Record
        </h2>
        <InsertForm />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Latest Sensor Data{" "}
          <span className="font-normal normal-case">
            ({rows.length} records)
          </span>
        </h2>
        <SensorTable rows={rows} />
      </section>
    </div>
  );
}

function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">About BERP-JS</h1>
        <nav className="flex gap-4 mt-4">
          <Link
            to="/"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            About
          </Link>
        </nav>
      </header>
      <p className="text-gray-700">
        This is an enterprise-ready full-stack boilerplate using Bun, Elysia,
        React, Prisma, and TimescaleDB. It features Bun Workspaces for monorepo
        support, React Router for client-side navigation, and React Query for
        data fetching.
      </p>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
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
        <div className="max-w-3xl mx-auto px-4 py-10 text-red-700">
          <h1 className="text-lg font-bold mb-2">Something went wrong</h1>
          <pre className="text-sm whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
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
