const PLAYER_KEY = "token-harbor-player-id";

function validId(value) {
  return /^[a-zA-Z0-9_-]{8,128}$/.test(String(value || ""));
}

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getStoredPlayerId() {
  try {
    const value = globalThis.localStorage?.getItem(PLAYER_KEY);
    return validId(value) ? value : null;
  } catch {
    return null;
  }
}

export function rememberPlayerId(playerId) {
  if (!validId(playerId)) return;
  try {
    globalThis.localStorage?.setItem(PLAYER_KEY, playerId);
  } catch {
    // Private browsing can reject storage; the server still owns the local identity.
  }
}

export function createActionId() {
  return `action_${uuid()}`;
}
