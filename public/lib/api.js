export async function getHealth() {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("Failed to fetch health status.");
  return res.json();
}

export async function getSensorData() {
  const res = await fetch("/api/sensor");
  if (!res.ok) throw new Error("Failed to fetch sensor data.");
  return res.json();
}

export async function createSensorData(data) {
  const res = await fetch("/api/sensor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "Failed to create sensor data.");
  }
  return res.json();
}
