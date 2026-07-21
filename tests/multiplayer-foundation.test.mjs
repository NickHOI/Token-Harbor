import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { CURRENT_STATE_VERSION, applyAction, getStatePath, readState } from "../scripts/harbor-core.mjs";
import {
  acknowledgeOutbox,
  createSyncSnapshot,
  getEventPage,
  getEventsAfter,
  getMultiplayerStatus,
  normalizeMultiplayerState
} from "../scripts/multiplayer-core.mjs";
import {
  SOCIAL_RULES,
  calculateLeaderboardScores,
  canRaid,
  getSocialConfig,
  normalizeSocialState
} from "../scripts/social-core.mjs";

const testDataDir = path.resolve("test-artifacts", "multiplayer-test");
process.env.TOKEN_HARBOR_DATA_DIR = testDataDir;

function freshState() {
  fs.rmSync(testDataDir, { recursive: true, force: true });
  const state = readState();
  state.sailingPower = 128.6;
  state.totalDistance = 2845;
  state.totalTokens = 1_286_000;
  state.ports.coral.progress = 72;
  return state;
}

test("creates a stable local player and private world identity", () => {
  const first = freshState();
  const second = readState();
  assert.match(first.multiplayer.localPlayerId, /^player_/);
  assert.match(first.multiplayer.world.id, /^world_/);
  assert.equal(second.multiplayer.localPlayerId, first.multiplayer.localPlayerId);
  assert.equal(second.multiplayer.world.id, first.multiplayer.world.id);
  assert.equal(getMultiplayerStatus(second).world.visibility, "private");
});

test("deduplicates retried commands with the same action id", () => {
  let state = freshState();
  const context = { actorId: state.multiplayer.localPlayerId, actionId: "action_retry_001" };
  state = applyAction(state, { type: "allocate_port", portId: "coral", amount: 10 }, context);
  const revision = state.multiplayer.revision;
  state = applyAction(readState(), { type: "allocate_port", portId: "coral", amount: 10 }, context);
  assert.equal(state.ports.coral.progress, 82);
  assert.equal(state.sailingPower, 118.6);
  assert.equal(state.multiplayer.revision, revision);
});

test("records sanitized domain events and supports incremental outbox reads", () => {
  let state = freshState();
  state = applyAction(
    state,
    { type: "allocate_port", portId: "coral", amount: 4, secret: "redact" },
    { actionId: "action_event_001" }
  );
  state = applyAction(
    state,
    { type: "allocate_port", portId: "coral", amount: 3 },
    { actionId: "action_event_002" }
  );
  const events = getEventsAfter(state, 1, 20);
  assert.equal(events.length, 1);
  assert.equal(events[0].payload.amount, 3);
  assert.equal("secret" in state.multiplayer.outbox[0].payload, false);

  acknowledgeOutbox(state, 1);
  assert.deepEqual(state.multiplayer.outbox.map((event) => event.revision), [1, 2]);
  assert.equal(state.multiplayer.outboxAcks.default, 1);
  assert.equal(getMultiplayerStatus(state).pendingEvents, 1);
});

test("keeps independent outbox cursors and detects history gaps", () => {
  const state = freshState();
  state.multiplayer.revision = 6;
  state.multiplayer.outbox = [5, 6].map((revision) => ({
    eventId: `${state.multiplayer.world.id}:${revision}`,
    worldId: state.multiplayer.world.id,
    revision,
    type: "game.test"
  }));
  acknowledgeOutbox(state, 5, "browser_one");
  acknowledgeOutbox(state, 6, "sync_agent");
  assert.equal(state.multiplayer.outboxAcks.browser_one, 5);
  assert.equal(state.multiplayer.outboxAcks.sync_agent, 6);
  assert.deepEqual(state.multiplayer.outbox.map((event) => event.revision), [5, 6]);
  const page = getEventPage(state, 1);
  assert.equal(page.gapDetected, true);
  assert.equal(page.requiresSnapshot, true);
  assert.equal(page.oldestAvailableRevision, 5);
  const normalized = normalizeMultiplayerState(state.multiplayer);
  assert.equal(normalized.outboxAcks.browser_one, 5);
});

test("builds a browser-safe sync snapshot without private receipts or sessions", () => {
  let state = freshState();
  state = applyAction(state, { type: "allocate_port", portId: "coral", amount: 2 }, { actionId: "action_snapshot_001" });
  state.sessions.privateSession = { id: "privateSession", status: "running" };
  const snapshot = createSyncSnapshot(state);
  assert.equal(snapshot.worldId, state.multiplayer.world.id);
  assert.equal(snapshot.revision, 1);
  assert.equal("outbox" in snapshot.state.multiplayer, false);
  assert.equal("processedActionIds" in snapshot.state.multiplayer, false);
  assert.equal("sessions" in snapshot.state, false);
  assert.equal("recentTelemetryIds" in snapshot.state, false);
});

test("migrates version two saves without losing the current fish inventory", () => {
  freshState();
  const previous = readState();
  delete previous.multiplayer;
  previous.version = 2;
  previous.inventory = { silver_dart: 9, ghost_ray: 2 };
  previous.boat = {
    vesselId: "trawler",
    ownedVesselIds: ["skiff", "trawler"],
    engineLevel: 4,
    hullLevel: 3,
    netLevel: 2,
    sonarLevel: 2,
    coolerLevel: 3,
    cannonLevel: 2,
    vesselHealth: { skiff: 70, trawler: 120 }
  };
  fs.writeFileSync(getStatePath(), `${JSON.stringify(previous)}\n`, "utf8");

  const migrated = readState();
  assert.equal(migrated.version, CURRENT_STATE_VERSION);
  assert.equal(migrated.inventory.silver_dart, 9);
  assert.equal(migrated.inventory.ghost_ray, 2);
  assert.match(migrated.multiplayer.world.id, /^world_/);
  assert.equal(migrated.boat.vesselId, "vessel-2");
  assert.equal(migrated.boat.selectedVesselId, "vessel-2");
  assert.equal(migrated.boat.vessels["vessel-1"].classId, "skiff");
  assert.equal(migrated.boat.vessels["vessel-2"].classId, "trawler");
  assert.equal(migrated.boat.vessels["vessel-1"].equipment.engine, 4);
  assert.equal(migrated.boat.vessels["vessel-2"].equipment.hull, 3);
  assert.equal(migrated.facilities.lighthouse.level, 1);
  assert.deepEqual(migrated.autoVoyages, {});
  assert.equal(migrated.materials, 0);
});

test("publishes multiple leaderboard styles instead of one pay-to-win score", () => {
  const state = freshState();
  state.inventory.moonfin_tuna = 2;
  state.inventory.ghost_ray = 1;
  state.multiplayer.social.profile.helpfulnessPoints = 7;
  const scores = calculateLeaderboardScores(state);
  assert.equal(scores.voyage_distance, state.totalDistance);
  assert.equal(scores.rare_catches, 14);
  assert.equal(scores.helpful_captain, 7);
  assert.ok(scores.harbor_prosperity > 0);
  assert.equal(getSocialConfig().leaderboards.length, 4);
});

test("allows only bounded friend raids after protection and cooldown checks", () => {
  const now = Date.parse("2026-07-19T12:00:00.000Z");
  const matureProfile = { createdAt: new Date(now - SOCIAL_RULES.newPlayerProtectionMs - 1).toISOString() };
  const attackerRaids = { tickets: 1, lastTargets: {} };
  const targetRaids = { shieldUntil: null, incomingEffects: [] };

  assert.equal(canRaid({ attackerId: "player_a", targetId: "player_b", attackerRaids, targetProfile: matureProfile, targetRaids, now }).code, "friends_only");
  assert.equal(canRaid({ attackerId: "player_a", targetId: "player_b", friendship: { status: "accepted" }, attackerRaids, targetProfile: { createdAt: new Date(now).toISOString() }, targetRaids, now }).code, "new_player_protection");

  const allowed = canRaid({
    attackerId: "player_a",
    targetId: "player_b",
    friendship: { status: "accepted" },
    attackerRaids,
    targetProfile: matureProfile,
    targetRaids,
    now
  });
  assert.deepEqual(allowed, { allowed: true, code: "allowed" });
  assert.equal(getSocialConfig().rules.tokenTheftAllowed, false);
  assert.equal(getSocialConfig().rules.permanentLossAllowed, false);
});

test("resets daily social limits, expires effects, and rotates seasons", () => {
  const playerId = "player_lifecycle_001";
  const normalized = normalizeSocialState({
    profile: { playerId, createdAt: "2026-01-01T00:00:00.000Z" },
    gifts: { sentToday: 5, resetDate: "2026-06-30", history: [] },
    raids: {
      tickets: 0,
      ticketResetDate: "2026-06-30",
      incomingEffects: [{ id: "expired", expiresAt: "2026-06-30T23:59:59.000Z" }]
    },
    leaderboard: { seasonId: "season-2026-q2", scores: { rare_catches: 99 }, cachedRanks: { rare_catches: 1 } }
  }, playerId, "2026-07-01T12:00:00.000Z");
  assert.equal(normalized.gifts.sentToday, 0);
  assert.equal(normalized.raids.tickets, SOCIAL_RULES.raidTicketLimit);
  assert.deepEqual(normalized.raids.incomingEffects, []);
  assert.equal(normalized.leaderboard.seasonId, "season-2026-q3");
  assert.deepEqual(normalized.leaderboard.scores, {});
  assert.deepEqual(normalized.leaderboard.cachedRanks, {});
});

test("scores every expansion rare catch and does not penalize spending coins", () => {
  const state = freshState();
  state.inventory = { ember_lionfish: 1, ribbon_moray: 1, glass_squid: 1, lantern_angler: 1, crown_coelacanth: 1 };
  state.coins = 50_000;
  const before = calculateLeaderboardScores(state);
  state.coins = 0;
  const after = calculateLeaderboardScores(state);
  assert.equal(before.rare_catches, 42);
  assert.equal(after.harbor_prosperity, before.harbor_prosperity);
});

test.after(() => fs.rmSync(testDataDir, { recursive: true, force: true }));
