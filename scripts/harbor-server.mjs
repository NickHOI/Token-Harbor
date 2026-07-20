import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  HARBOR_PORT,
  HARBOR_DEV_PORT,
  applyAction,
  applyHookEvent,
  autoVoyageProgress,
  creditTokens,
  getBoatCapacity,
  getDataDir,
  getFishCatalog,
  getProgressionView,
  getRarities,
  getRoutes,
  getVoyageCargo,
  hasDurableActionReceipt,
  readState,
  reconcileTimedState,
  summarizeAgents,
  voyageProgress,
  writeState
} from "./harbor-core.mjs";
import {
  acknowledgeOutbox,
  createSyncSnapshot,
  getEventPage,
  getMultiplayerStatus
} from "./multiplayer-core.mjs";
import { getSocialConfig, getSocialStatus } from "./social-core.mjs";
import { browserSecurityHeaders, isTrustedLocalRequest } from "./http-security.mjs";
import { HARBOR_SERVICE_NAME, HARBOR_SERVICE_VERSION } from "./harbor-service.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDir, "..");
const webRoot = path.join(pluginRoot, "game", "dist");
const maxBodyBytes = 2 * 1024 * 1024;
const eventClients = new Set();
/** @type {Promise<unknown>} */
let mutationQueue = Promise.resolve();
const devOrigin = `http://127.0.0.1:${HARBOR_DEV_PORT}`;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp"
};

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "Access-Control-Allow-Headers": "Content-Type, X-Token-Harbor-Player, X-Token-Harbor-Action",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": devOrigin,
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    ...browserSecurityHeaders,
    ...extraHeaders
  });
  response.end(`${JSON.stringify(payload)}\n`);
}

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function safeRequestId(value) {
  const normalized = String(Array.isArray(value) ? value[0] : value || "").trim();
  return /^[a-zA-Z0-9_-]{8,128}$/.test(normalized) ? normalized : null;
}

function requestActorId(request, url) {
  return safeRequestId(request.headers["x-token-harbor-player"] || url.searchParams.get("playerId"));
}

function requestActionId(request) {
  return safeRequestId(request.headers["x-token-harbor-action"]);
}

function normalizeCommand(request, url, body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RequestError(400, "Command body must be a JSON object.");
  }
  const hasEnvelope = body.payload !== undefined || body.worldId !== undefined || body.baseRevision !== undefined;
  const rawType = String(body.type || "").replace(/^game\./, "");
  if (!rawType) throw new RequestError(400, "Command type is required.");
  const payload = hasEnvelope ? body.payload : body;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new RequestError(400, "Command payload must be an object.");
  }
  const actionId = safeRequestId(body.actionId || requestActionId(request));
  if (!actionId) throw new RequestError(400, "A valid actionId is required.");
  const actorId = safeRequestId(body.actorId || requestActorId(request, url));
  const worldId = body.worldId === undefined ? null : safeRequestId(body.worldId);
  if (body.worldId !== undefined && !worldId) throw new RequestError(400, "worldId is invalid.");
  const parsedRevision = body.baseRevision === undefined ? null : Number(body.baseRevision);
  if (parsedRevision !== null && (!Number.isInteger(parsedRevision) || parsedRevision < 0)) {
    throw new RequestError(400, "baseRevision must be a non-negative integer.");
  }
  if (worldId === null || parsedRevision === null) {
    throw new RequestError(428, "worldId and baseRevision are required for state-changing commands.");
  }
  return {
    action: { ...payload, type: rawType },
    actionId,
    actorId,
    worldId,
    baseRevision: parsedRevision
  };
}

/**
 * @template T
 * @param {() => T | Promise<T>} operation
 * @returns {Promise<T>}
 */
function runMutation(operation) {
  const result = mutationQueue.then(operation);
  mutationQueue = result.catch(() => null);
  return result;
}

function sendSse(response, eventName, payload) {
  response.write(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`);
}

function broadcastStateChanged(state, changeType) {
  const payload = {
    worldId: state.multiplayer.world.id,
    revision: state.multiplayer.revision,
    changeType,
    occurredAt: state.multiplayer.lastEventAt || state.updatedAt
  };
  for (const response of eventClients) sendSse(response, "state_changed", payload);
}

function openEventStream(request, response, state) {
  response.writeHead(200, {
    "Access-Control-Allow-Origin": devOrigin,
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8",
    "X-Accel-Buffering": "no",
    ...browserSecurityHeaders
  });
  eventClients.add(response);
  sendSse(response, "ready", {
    worldId: state.multiplayer.world.id,
    revision: state.multiplayer.revision,
    heartbeatMs: 20_000
  });
  request.on("close", () => eventClients.delete(response));
}

function reconcileState(state, changeType = "game.timer") {
  const beforeRevision = state.multiplayer.revision;
  if (!reconcileTimedState(state)) return state;
  writeState(state);
  if (state.multiplayer.revision !== beforeRevision) broadcastStateChanged(state, changeType);
  return state;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request body must be JSON."));
      }
    });
    request.on("error", reject);
  });
}

function publicState(state = readState(), actorId = null) {
  const { multiplayer, sessions: _sessions, recentTelemetryIds: _recentTelemetryIds, ...gameState } = state;
  return {
    ...gameState,
    multiplayer: getMultiplayerStatus(state, actorId),
    social: getSocialStatus(state, actorId || multiplayer.localPlayerId),
    activeVoyage: state.activeVoyage
      ? { ...state.activeVoyage, progress: voyageProgress(state.activeVoyage) }
      : null,
    autoVoyages: Object.fromEntries(Object.entries(state.autoVoyages || {}).map(([vesselId, voyage]) => [
      vesselId,
      { ...voyage, progress: autoVoyageProgress(voyage), ready: autoVoyageProgress(voyage) >= 0.995 }
    ])),
    agents: summarizeAgents(state),
    routes: Object.values(getRoutes()),
    fishCatalog: Object.values(getFishCatalog()),
    rarities: getRarities(),
    progression: getProgressionView(state),
    boatCapacity: getBoatCapacity(state),
    voyageCargo: getVoyageCargo(state.activeVoyage)
  };
}

function parseJsonString(value) {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function primitive(value) {
  if (!value || typeof value !== "object") return value;
  for (const key of ["stringValue", "intValue", "doubleValue", "boolValue"]) {
    if (key in value) return value[key];
  }
  if (value.kvlistValue?.values) {
    return Object.fromEntries(value.kvlistValue.values.map((entry) => [entry.key, primitive(entry.value)]));
  }
  return value;
}

function collectLogRecords(payload) {
  return (payload.resourceLogs || []).flatMap((resourceLog) =>
    (resourceLog.scopeLogs || []).flatMap((scopeLog) => scopeLog.logRecords || [])
  );
}

function usageFromObject(value, seen = new Set()) {
  if (!value || typeof value !== "object" || seen.has(value)) return null;
  seen.add(value);
  const normalized = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key.toLowerCase(), primitive(item)])
  );
  const total = Number(normalized.total_tokens ?? normalized.totaltokens);
  if (Number.isFinite(total) && total > 0) return Math.floor(total);
  const input = Number(normalized.input_tokens ?? normalized.inputtokens);
  const output = Number(normalized.output_tokens ?? normalized.outputtokens);
  if ((Number.isFinite(input) && input > 0) || (Number.isFinite(output) && output > 0)) {
    return Math.floor((Number.isFinite(input) ? input : 0) + (Number.isFinite(output) ? output : 0));
  }
  for (const item of Object.values(value)) {
    const parsed = typeof item === "string" ? parseJsonString(item) : primitive(item);
    const result = usageFromObject(parsed, seen);
    if (result) return result;
  }
  return null;
}

function telemetryCredits(payload) {
  return collectLogRecords(payload).flatMap((record, index) => {
    const attributes = Object.fromEntries(
      (record.attributes || []).map((attribute) => [attribute.key, primitive(attribute.value)])
    );
    const body = primitive(record.body);
    const parsedBody = parseJsonString(body) || body;
    const serialized = JSON.stringify({ attributes, body: parsedBody }).toLowerCase();
    if (!serialized.includes("response.completed")) return [];
    const tokenCount = usageFromObject({ attributes, body: parsedBody });
    if (!tokenCount) return [];
    const id = String(
      attributes["event.id"] ||
        attributes["response.id"] ||
        record.traceId ||
        record.spanId ||
        `${record.timeUnixNano || Date.now()}-${index}`
    );
    return [{ id, tokenCount }];
  });
}

function serveStatic(requestPath, response) {
  const requested = requestPath === "/" ? "/index.html" : requestPath;
  const normalized = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.resolve(webRoot, `.${path.sep}${normalized}`);
  if (!filePath.startsWith(path.resolve(webRoot))) return false;
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) filePath = path.join(webRoot, "index.html");
  if (!fs.existsSync(filePath)) return false;
  const hashedAsset = /[.-][a-zA-Z0-9_-]{8,}\.(?:css|js)$/.test(path.basename(filePath));
  response.writeHead(200, {
    "Cache-Control": filePath.endsWith("index.html") || !hashedAsset ? "no-cache" : "public, max-age=31536000, immutable",
    "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
    ...browserSecurityHeaders
  });
  fs.createReadStream(filePath).pipe(response);
  return true;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `127.0.0.1:${HARBOR_PORT}`}`);
  if (!isTrustedLocalRequest(request.headers)) {
    return sendJson(response, 403, { error: "Cross-site requests are not allowed." });
  }
  if (request.method === "OPTIONS") return sendJson(response, 204, {});

  try {
    if (request.method === "GET" && url.pathname === "/health") {
      return sendJson(response, 200, {
        ok: true,
        service: HARBOR_SERVICE_NAME,
        version: HARBOR_SERVICE_VERSION,
        port: HARBOR_PORT,
        dataDir: getDataDir()
      });
    }
    if (request.method === "GET" && url.pathname === "/api/state") {
      const state = await runMutation(() => reconcileState(readState()));
      return sendJson(response, 200, publicState(state, requestActorId(request, url)), {
        "X-Token-Harbor-Revision": String(state.multiplayer.revision)
      });
    }
    if (request.method === "POST" && url.pathname === "/api/action") {
      const body = await readBody(request);
      const command = normalizeCommand(request, url, body);
      const state = await runMutation(() => {
        const before = reconcileState(readState());
        if (hasDurableActionReceipt(before, command.actionId)) return before;
        if (command.worldId && command.worldId !== before.multiplayer.world.id) {
          throw new RequestError(409, "Command belongs to a different harbor world.");
        }
        if (command.baseRevision !== null && command.baseRevision !== before.multiplayer.revision) {
          throw new RequestError(409, "Harbor state changed. Refresh and retry.");
        }
        const beforeRevision = before.multiplayer.revision;
        const next = applyAction(before, command.action, {
          actorId: command.actorId,
          actionId: command.actionId
        });
        if (next.multiplayer.revision !== beforeRevision) broadcastStateChanged(next, `game.${command.action.type}`);
        return next;
      });
      return sendJson(response, 200, publicState(state, command.actorId), {
        "X-Token-Harbor-Revision": String(state.multiplayer.revision)
      });
    }
    if (request.method === "POST" && url.pathname === "/api/hook") {
      const body = await readBody(request);
      await runMutation(() => {
        const state = applyHookEvent(readState(), body);
        broadcastStateChanged(state, `codex.${body.hook_event_name || "unknown"}`);
        return state;
      });
      return sendJson(response, 200, { ok: true });
    }
    if (request.method === "GET" && url.pathname === "/api/events") {
      const state = await runMutation(() => reconcileState(readState()));
      return openEventStream(request, response, state);
    }
    if (request.method === "GET" && url.pathname === "/api/multiplayer/status") {
      const state = await runMutation(() => reconcileState(readState()));
      return sendJson(response, 200, getMultiplayerStatus(state, requestActorId(request, url)));
    }
    if (request.method === "GET" && url.pathname === "/api/multiplayer/snapshot") {
      const state = await runMutation(() => reconcileState(readState()));
      return sendJson(response, 200, createSyncSnapshot(state));
    }
    if (request.method === "GET" && url.pathname === "/api/multiplayer/events") {
      const state = await runMutation(() => reconcileState(readState()));
      return sendJson(response, 200, getEventPage(
        state,
        url.searchParams.get("afterRevision"),
        url.searchParams.get("limit")
      ));
    }
    if (request.method === "POST" && url.pathname === "/api/multiplayer/ack") {
      const body = await readBody(request);
      const state = await runMutation(() => writeState(acknowledgeOutbox(
        readState(),
        body.throughRevision,
        body.consumerId
      )));
      const consumerId = String(body.consumerId || "default");
      return sendJson(response, 200, {
        ok: true,
        revision: state.multiplayer.revision,
        consumerId,
        acknowledgedRevision: state.multiplayer.outboxAcks[consumerId],
        pendingEvents: state.multiplayer.outbox.filter((event) => (
          event.revision > state.multiplayer.outboxAcks[consumerId]
        )).length
      });
    }
    if (request.method === "GET" && url.pathname === "/api/social/config") {
      return sendJson(response, 200, getSocialConfig());
    }
    if (request.method === "GET" && url.pathname === "/api/social/status") {
      const state = await runMutation(() => reconcileState(readState()));
      return sendJson(response, 200, getSocialStatus(state, requestActorId(request, url) || state.multiplayer.localPlayerId));
    }
    if (request.method === "POST" && url.pathname === "/api/shutdown") {
      sendJson(response, 200, { ok: true });
      setTimeout(() => server.close(() => process.exit(0)), 25);
      return;
    }
    if (request.method === "POST" && url.pathname === "/v1/logs") {
      const credits = telemetryCredits(await readBody(request));
      await runMutation(() => {
        let state = readState();
        const beforeRevision = state.multiplayer.revision;
        for (const credit of credits) state = creditTokens(state, credit.tokenCount, credit.id);
        if (state.multiplayer.revision !== beforeRevision) broadcastStateChanged(state, "economy.token_credited");
        return state;
      });
      return sendJson(response, 200, { partialSuccess: {} });
    }
    if (
      request.method === "POST" &&
      url.pathname === "/api/dev/credit" &&
      process.env.TOKEN_HARBOR_DEV === "1"
    ) {
      const body = await readBody(request);
      const state = await runMutation(() => {
        const next = creditTokens(readState(), body.tokens, `dev-${Date.now()}`);
        broadcastStateChanged(next, "economy.token_credited");
        return next;
      });
      return sendJson(response, 200, publicState(state, requestActorId(request, url)));
    }
    if (request.method === "GET" && serveStatic(url.pathname, response)) return;
    sendJson(response, 404, { error: "Not found." });
  } catch (error) {
    const status = Number(error?.status) || (error?.code ? 500 : 400);
    if (status >= 500) process.stderr.write(`${error instanceof Error ? error.stack || error.message : "Request failed."}\n`);
    if (!response.headersSent) sendJson(response, status, { error: error instanceof Error ? error.message : "Request failed." });
    else response.end();
  }
});

const stateTimer = setInterval(() => {
  runMutation(() => reconcileState(readState())).catch((error) => {
    process.stderr.write(`Timed state reconciliation failed: ${error.message}\n`);
  });
}, 500);
stateTimer.unref();

const heartbeat = setInterval(() => {
  for (const response of eventClients) response.write(": keepalive\n\n");
}, 20_000);
heartbeat.unref();

server.on("close", () => {
  clearInterval(heartbeat);
  clearInterval(stateTimer);
  for (const response of eventClients) response.end();
  eventClients.clear();
});

server.on("error", (error) => {
  process.stderr.write(`Token Harbor server failed on port ${HARBOR_PORT}: ${error.message}\n`);
  process.exit(1);
});

server.listen(HARBOR_PORT, "127.0.0.1");
