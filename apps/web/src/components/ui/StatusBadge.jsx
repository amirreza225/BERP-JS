export function StatusBadge({ tone, children }) {
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
