export function SensorTable({ rows, compact = false }) {
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
