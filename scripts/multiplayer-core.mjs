import { randomUUID } from "node:crypto";
import { createSocialState, normalizeSocialState } from "./social-core.mjs";

export const MULTIPLAYER_SCHEMA_VERSION = 1;
export const MAX_ACTION_RECEIPTS = 500;
export const MAX_OUTBOX_EVENTS = 500;

function nowIso() {
  return new Date().toISOString();
}

function safeId(value, fallbackPrefix) {
  const normalized = String(value || "").trim();
  if (/^[a-zA-Z0-9_-]{8,128}$/.test(normalized)) return normalized;
  return `${fallbackPrefix}_${randomUUID()}`;
}

export function createMultiplayerState(timestamp = nowIso()) {
  const playerId = `player_${randomUUID()}`;
  const worldId = `world_${randomUUID()}`;
  return {
    schemaVersion: MULTIPLAYER_SCHEMA_VERSION,
    mode: "local",
    localPlayerId: playerId,
    world: {
      id: worldId,
      name: "Token Harbor",
      visibility: "private",
      ownerPlayerId: playerId,
      createdAt: timestamp
    },
    players: {
      [playerId]: { id: playerId, displayName: "Captain", createdAt: timestamp, lastSeenAt: timestamp }
    },
    memberships: {
      [playerId]: { playerId, role: "owner", joinedAt: timestamp }
    },
    revision: 0,
    processedActionIds: [],
    outbox: [],
    outboxAcks: {},
    social: createSocialState(playerId, timestamp),
    lastEventAt: null
  };
}

export function normalizeMultiplayerState(raw, timestamp = nowIso()) {
  const base = createMultiplayerState(timestamp);
  if (!raw || typeof raw !== "object") return base;

  const localPlayerId = safeId(raw.localPlayerId, "player");
  const worldId = safeId(raw.world?.id, "world");
  const ownerPlayerId = safeId(raw.world?.ownerPlayerId || localPlayerId, "player");
  const state = {
    ...base,
    ...raw,
    schemaVersion: MULTIPLAYER_SCHEMA_VERSION,
    mode: raw.mode === "cloud" ? "cloud" : "local",
    localPlayerId,
    world: {
      ...base.world,
      ...(raw.world || {}),
      id: worldId,
      ownerPlayerId
    },
    players: { ...(raw.players || {}) },
    memberships: { ...(raw.memberships || {}) },
    revision: Number.isFinite(Number(raw.revision)) ? Math.max(0, Math.floor(Number(raw.revision))) : 0,
    processedActionIds: Array.isArray(raw.processedActionIds)
      ? raw.processedActionIds.map(String).filter((id) => /^[a-zA-Z0-9_-]{8,128}$/.test(id)).slice(-MAX_ACTION_RECEIPTS)
      : [],
    outbox: Array.isArray(raw.outbox)
      ? raw.outbox.filter((event) => event && Number.isFinite(Number(event.revision))).slice(-MAX_OUTBOX_EVENTS)
      : [],
    outboxAcks: Object.fromEntries(Object.entries(raw.outboxAcks || {}).flatMap(([consumerId, revision]) => (
      /^[a-zA-Z0-9_-]{3,64}$/.test(consumerId) && Number.isFinite(Number(revision))
        ? [[consumerId, Math.max(0, Math.floor(Number(revision)))]]
        : []
    ))),
    social: normalizeSocialState(raw.social, localPlayerId, timestamp)
  };

  if (!state.players[localPlayerId]) {
    state.players[localPlayerId] = { id: localPlayerId, displayName: "Captain", createdAt: timestamp, lastSeenAt: timestamp };
  }
  if (!state.players[ownerPlayerId]) {
    state.players[ownerPlayerId] = { id: ownerPlayerId, displayName: "Captain", createdAt: timestamp, lastSeenAt: timestamp };
  }
  if (!state.memberships[ownerPlayerId]) {
    state.memberships[ownerPlayerId] = { playerId: ownerPlayerId, role: "owner", joinedAt: timestamp };
  }
  if (!state.memberships[localPlayerId]) {
    state.memberships[localPlayerId] = { playerId: localPlayerId, role: localPlayerId === ownerPlayerId ? "owner" : "member", joinedAt: timestamp };
  }
  return state;
}

export function ensureActor(multiplayer, requestedActorId, timestamp = nowIso()) {
  const requested = safeId(requestedActorId || multiplayer.localPlayerId, "player");
  const actorId = multiplayer.mode === "local" && !multiplayer.players[requested]
    ? multiplayer.localPlayerId
    : requested;
  if (!multiplayer.players[actorId]) {
    multiplayer.players[actorId] = { id: actorId, displayName: "Visiting Captain", createdAt: timestamp, lastSeenAt: timestamp };
  } else {
    multiplayer.players[actorId].lastSeenAt = timestamp;
  }
  if (!multiplayer.memberships[actorId]) {
    multiplayer.memberships[actorId] = { playerId: actorId, role: "member", joinedAt: timestamp };
  }
  return actorId;
}

export function hasProcessedAction(multiplayer, actionId) {
  return Boolean(actionId && multiplayer.processedActionIds.includes(actionId));
}

export function sanitizeActionPayload(action) {
  const payload = {};
  for (const key of ["portId", "amount", "routeId", "encounterId", "orderId", "speciesId", "vesselId", "itemId", "roleId", "facilityId"]) {
    if (action?.[key] !== undefined) payload[key] = action[key];
  }
  return payload;
}

export function recordDomainEvent(state, { type, actorId, actionId = null, payload = {} }) {
  const timestamp = nowIso();
  const multiplayer = state.multiplayer;
  const resolvedActorId = ensureActor(multiplayer, actorId, timestamp);
  if (actionId && hasProcessedAction(multiplayer, actionId)) return null;

  multiplayer.revision += 1;
  const event = {
    eventId: `${multiplayer.world.id}:${multiplayer.revision}`,
    worldId: multiplayer.world.id,
    revision: multiplayer.revision,
    type,
    actorId: resolvedActorId,
    actionId: actionId || null,
    occurredAt: timestamp,
    payload
  };
  multiplayer.outbox = [...multiplayer.outbox, event].slice(-MAX_OUTBOX_EVENTS);
  if (actionId) {
    multiplayer.processedActionIds = [...multiplayer.processedActionIds, actionId].slice(-MAX_ACTION_RECEIPTS);
  }
  multiplayer.lastEventAt = timestamp;
  return event;
}

export function getMultiplayerStatus(state, requestedActorId) {
  const multiplayer = state.multiplayer;
  const actorId = requestedActorId && multiplayer.players[requestedActorId]
    ? requestedActorId
    : multiplayer.localPlayerId;
  return {
    schemaVersion: multiplayer.schemaVersion,
    mode: multiplayer.mode,
    world: multiplayer.world,
    player: multiplayer.players[actorId] || null,
    membership: multiplayer.memberships[actorId] || null,
    revision: multiplayer.revision,
    pendingEvents: multiplayer.outbox.filter((event) => event.revision > Number(multiplayer.outboxAcks.default || 0)).length,
    realtime: "sse"
  };
}

/** @param {any} afterRevision @param {any} limit */
export function getEventsAfter(state, afterRevision = 0, limit = 200) {
  const parsedRevision = Number(afterRevision || 0);
  const parsedLimit = Number(limit || 200);
  const revision = Number.isFinite(parsedRevision) ? Math.max(0, parsedRevision) : 0;
  const safeLimit = Number.isFinite(parsedLimit) ? Math.min(200, Math.max(1, parsedLimit)) : 200;
  return state.multiplayer.outbox.filter((event) => event.revision > revision).slice(0, safeLimit);
}

/** @param {any} afterRevision @param {any} limit */
export function getEventPage(state, afterRevision = 0, limit = 200) {
  const parsedRevision = Number(afterRevision || 0);
  const revision = Number.isFinite(parsedRevision) ? Math.max(0, Math.floor(parsedRevision)) : 0;
  const events = getEventsAfter(state, revision, limit);
  const oldestAvailableRevision = state.multiplayer.outbox[0]?.revision ?? state.multiplayer.revision + 1;
  const gapDetected = revision + 1 < oldestAvailableRevision;
  return {
    worldId: state.multiplayer.world.id,
    revision: state.multiplayer.revision,
    oldestAvailableRevision,
    gapDetected,
    requiresSnapshot: gapDetected,
    events
  };
}

export function acknowledgeOutbox(state, throughRevision, consumerId = "default") {
  const parsedRevision = Number(throughRevision || 0);
  const revision = Number.isFinite(parsedRevision)
    ? Math.min(state.multiplayer.revision, Math.max(0, Math.floor(parsedRevision)))
    : 0;
  const consumer = String(consumerId || "default").trim();
  if (!/^[a-zA-Z0-9_-]{3,64}$/.test(consumer)) throw new Error("Outbox consumer id is invalid.");
  state.multiplayer.outboxAcks ||= {};
  state.multiplayer.outboxAcks[consumer] = Math.max(Number(state.multiplayer.outboxAcks[consumer] || 0), revision);
  return state;
}

export function createSyncSnapshot(state) {
  const snapshotState = JSON.parse(JSON.stringify(state));
  snapshotState.multiplayer = {
    ...snapshotState.multiplayer,
    processedActionIds: undefined,
    outbox: undefined,
    outboxAcks: undefined
  };
  delete snapshotState.multiplayer.processedActionIds;
  delete snapshotState.multiplayer.outbox;
  delete snapshotState.multiplayer.outboxAcks;
  delete snapshotState.sessions;
  delete snapshotState.recentTelemetryIds;
  return {
    schemaVersion: MULTIPLAYER_SCHEMA_VERSION,
    worldId: state.multiplayer.world.id,
    revision: state.multiplayer.revision,
    generatedAt: nowIso(),
    state: snapshotState
  };
}
