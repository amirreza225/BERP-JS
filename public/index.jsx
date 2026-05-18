import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { getHealth, getSensorData, createSensorData } from "./lib/api.js";

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
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium bg-green-100 text-green-800">
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
            <th className="px-4 py-2 text-left font-medium text-gray-600">Sensor ID</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Value</th>
            <th className="px-4 py-2 text-left font-medium text-gray-600">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-gray-100">
              <td className="px-4 py-2 font-mono">{row.sensorId}</td>
              <td className="px-4 py-2">{row.value}</td>
              <td className="px-4 py-2 text-gray-500">{new Date(row.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InsertForm({ onInserted }) {
  const [sensorId, setSensorId] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await createSensorData({ sensorId, value: parseFloat(value) });
      setStatus({ ok: true, msg: "Record inserted." });
      setSensorId("");
      setValue("");
      onInserted();
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end mt-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Sensor ID</label>
        <input
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36"
          value={sensorId}
          onChange={(e) => setSensorId(e.target.value)}
          placeholder="sensor-1"
          required
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Value</label>
        <input
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
        disabled={loading}
        className="px-4 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? "Inserting…" : "Insert"}
      </button>
      {status && (
        <span className={`text-sm ${status.ok ? "text-green-700" : "text-red-700"}`}>
          {status.msg}
        </span>
      )}
    </form>
  );
}

function App() {
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(false);
  const [rows, setRows] = useState([]);

  async function fetchAll() {
    try {
      const h = await getHealth();
      setHealth(h);
      setHealthError(false);
    } catch {
      setHealthError(true);
    }
    try {
      const data = await getSensorData();
      setRows(data);
    } catch {
      // table stays empty
    }
  }

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">BERP-JS</h1>
        <p className="text-gray-500 mt-1">
          Bun · Elysia · React · Prisma · TimescaleDB — pure JavaScript full-stack boilerplate.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-2">API Health</h2>
        <div className="flex items-center gap-3">
          <HealthBadge health={health} error={healthError} />
          {health && (
            <span className="text-xs text-gray-400">{health.timestamp}</span>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-1">Insert Sensor Record</h2>
        <InsertForm onInserted={fetchAll} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Latest Sensor Data <span className="font-normal normal-case">({rows.length} records)</span>
        </h2>
        <SensorTable rows={rows} />
      </section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
