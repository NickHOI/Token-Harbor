import path from "node:path";
import { HARBOR_PORT, getDataDir } from "./harbor-core.mjs";

export const HARBOR_SERVICE_NAME = "token-harbor";
export const HARBOR_SERVICE_VERSION = "0.1.0";
export const HARBOR_URL = `http://127.0.0.1:${HARBOR_PORT}`;

function comparablePath(value) {
  const resolved = path.resolve(String(value || ""));
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

export function healthIdentityMatches(health, expectedDataDir = getDataDir()) {
  return Boolean(
    health?.ok === true &&
    health.service === HARBOR_SERVICE_NAME &&
    health.version === HARBOR_SERVICE_VERSION &&
    Number(health.port) === HARBOR_PORT &&
    comparablePath(health.dataDir) === comparablePath(expectedDataDir)
  );
}

export async function probeHarborService(timeoutMs = 350) {
  try {
    const response = await fetch(`${HARBOR_URL}/health`, { signal: AbortSignal.timeout(timeoutMs) });
    let health = null;
    try {
      health = await response.json();
    } catch {}
    return { reachable: true, status: response.status, health };
  } catch {
    return { reachable: false, status: 0, health: null };
  }
}

export async function ensureHarborService(startServer, options = {}) {
  const expectedDataDir = options.expectedDataDir || getDataDir();
  const initial = await probeHarborService(options.probeTimeoutMs);
  if (initial.reachable) {
    if (healthIdentityMatches(initial.health, expectedDataDir)) return initial.health;
    throw new Error(`Port ${HARBOR_PORT} is occupied by a different service or Token Harbor data directory.`);
  }

  startServer();
  const timeoutMs = Math.max(500, Number(options.startupTimeoutMs || 5_000));
  const pollMs = Math.max(25, Number(options.pollMs || 100));
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, pollMs));
    const probe = await probeHarborService(options.probeTimeoutMs);
    if (!probe.reachable) continue;
    if (healthIdentityMatches(probe.health, expectedDataDir)) return probe.health;
    throw new Error(`Port ${HARBOR_PORT} became occupied by an unexpected service during startup.`);
  }
  throw new Error(`Token Harbor did not become ready on port ${HARBOR_PORT} within ${timeoutMs}ms.`);
}
