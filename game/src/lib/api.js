import { createActionId, getStoredPlayerId, rememberPlayerId } from "./clientIdentity.js";

export class HarborApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "HarborApiError";
    this.status = status;
  }
}

function playerHeaders(extra = {}) {
  const playerId = getStoredPlayerId();
  return playerId ? { ...extra, "X-Token-Harbor-Player": playerId } : extra;
}

export async function getState() {
  const response = await fetch("/api/state", { cache: "no-store", headers: playerHeaders() });
  if (!response.ok) throw new Error("Harbor connection unavailable");
  const payload = await response.json();
  rememberPlayerId(payload.multiplayer?.player?.id);
  return payload;
}

export async function sendAction(action, context = {}) {
  const { type, ...payload } = action || {};
  const actionId = context.actionId || createActionId();
  const playerId = getStoredPlayerId();
  const command = {
    actionId,
    actorId: playerId || undefined,
    worldId: context.worldId,
    baseRevision: context.baseRevision,
    type: `game.${type}`,
    payload
  };
  const request = {
    method: "POST",
    headers: playerHeaders({
      "Content-Type": "application/json",
      "X-Token-Harbor-Action": actionId
    }),
    body: JSON.stringify(command)
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch("/api/action", request);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status >= 500 && attempt === 0) continue;
        throw new HarborApiError(result.error || "Action failed", response.status);
      }
      rememberPlayerId(result.multiplayer?.player?.id);
      return result;
    } catch (error) {
      if (error instanceof HarborApiError || attempt > 0) throw error;
    }
  }
  throw new HarborApiError("Harbor connection unavailable");
}

export function subscribeToState(onStateChanged) {
  if (!globalThis.EventSource) return () => {};
  const playerId = getStoredPlayerId();
  const query = playerId ? `?playerId=${encodeURIComponent(playerId)}` : "";
  const source = new EventSource(`/api/events${query}`);
  source.addEventListener("state_changed", (event) => {
    try {
      onStateChanged(JSON.parse(event.data));
    } catch {
      onStateChanged(null);
    }
  });
  return () => source.close();
}
