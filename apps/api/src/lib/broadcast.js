const clients = new Set();

export function subscribe(ws) {
  clients.add(ws);
}

export function unsubscribe(ws) {
  clients.delete(ws);
}

export function broadcast(data) {
  if (clients.size === 0) return;
  const msg = typeof data === "string" ? data : JSON.stringify(data);
  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch {
      clients.delete(ws);
    }
  }
}
