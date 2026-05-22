import { Link } from "react-router-dom";
import { repoUrl, swaggerUrl } from "../../config/site.js";

export function Shell({ children }) {
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
