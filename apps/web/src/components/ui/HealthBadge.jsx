import { StatusBadge } from "./StatusBadge.jsx";

export function HealthBadge({ health, error }) {
  if (error) return <StatusBadge tone="red">api error</StatusBadge>;
  if (!health) return <StatusBadge tone="slate">checking api</StatusBadge>;

  return (
    <StatusBadge tone={health.status === "ok" ? "teal" : "amber"}>
      {health.status} · {health.runtime}
    </StatusBadge>
  );
}
