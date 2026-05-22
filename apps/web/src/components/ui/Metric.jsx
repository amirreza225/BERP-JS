export function Metric({ label, value }) {
  return (
    <div className="rounded border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
