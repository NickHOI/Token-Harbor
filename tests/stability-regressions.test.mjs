import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PIRATE_THREATS,
  applyAction,
  applyHookEvent,
  creditTokens,
  generateAutomaticRewards,
  getProgressionEffects,
  getStateBackupPath,
  getStatePath,
  readState,
  reconcileTimedState,
  writeState
} from "../scripts/harbor-core.mjs";

const testDataDir = path.resolve("test-artifacts", "stability-test");
process.env.TOKEN_HARBOR_DATA_DIR = testDataDir;

function freshState() {
  fs.rmSync(testDataDir, { recursive: true, force: true });
  const state = readState();
  state.sailingPower = 500;
  return writeState(state);
}

test("recovers a corrupt primary save from the last verified backup", () => {
  let state = freshState();
  state.coins = 42;
  state = writeState(state);
  state.coins = 84;
  writeState(state);
  fs.writeFileSync(getStatePath(), "{broken-json", "utf8");

  const recovered = readState();
  assert.equal(recovered.coins, 42);
  assert.equal(recovered.recovery.code, "save_recovered_from_backup");
  const quarantine = fs.readdirSync(testDataDir).find((file) => file.startsWith("harbor-state.json.corrupt-"));
  assert.ok(quarantine);
  assert.equal(fs.readFileSync(path.join(testDataDir, quarantine), "utf8"), "{broken-json");
});

test("quarantines unreadable primary and backup saves before resetting", () => {
  freshState();
  fs.writeFileSync(getStatePath(), "invalid-primary", "utf8");
  fs.writeFileSync(getStateBackupPath(), "invalid-backup", "utf8");
  const recovered = readState();
  assert.equal(recovered.recovery.code, "save_reset_after_corruption");
  assert.equal(recovered.coins, 0);
  const quarantined = fs.readdirSync(testDataDir).filter((file) => file.includes(".corrupt-"));
  assert.equal(quarantined.length, 2);
  assert.ok(quarantined.some((file) => file.startsWith("harbor-state.json.corrupt-")));
  assert.ok(quarantined.some((file) => file.startsWith("harbor-state.json.bak.corrupt-")));
});

test("durable receipts survive bounded in-save receipt eviction", () => {
  let state = freshState();
  const worldId = state.multiplayer.world.id;
  state = applyAction(state, { type: "allocate_port", portId: "coral", amount: 10 }, { actionId: "action_durable_001" });
  state.multiplayer.processedActionIds = [];
  state = writeState(state);
  const revision = state.multiplayer.revision;
  state = applyAction(state, { type: "allocate_port", portId: "coral", amount: 10 }, { actionId: "action_durable_001" });
  assert.equal(state.multiplayer.world.id, worldId);
  assert.equal(state.ports.coral.progress, 10);
  assert.equal(state.multiplayer.revision, revision);

  state = creditTokens(state, 10_000, "telemetry_durable_001");
  const power = state.sailingPower;
  state.recentTelemetryIds = [];
  state = writeState(state);
  state = creditTokens(state, 10_000, "telemetry_durable_001");
  assert.equal(state.sailingPower, power);
});

test("rejects non-integer fish sales without corrupting persisted numbers", () => {
  let state = freshState();
  state.inventory.silver_dart = 5;
  state = writeState(state);
  for (const amount of ["not-a-number", Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5]) {
    assert.throws(() => applyAction(state, { type: "sell_fish", speciesId: "silver_dart", amount }), /positive integer/i);
  }
  const persisted = readState();
  assert.equal(persisted.inventory.silver_dart, 5);
  assert.equal(Number.isFinite(persisted.coins), true);
});

test("authoritatively resolves offline hurricanes and pirate attack catch-up", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const hurricaneVoyage = state.activeVoyage;
  hurricaneVoyage.threat = { pirate: null, hurricane: { status: "waiting", appearsAtProgress: 0.1 } };
  reconcileTimedState(state, hurricaneVoyage.startedAt + hurricaneVoyage.durationMs * 0.2);
  assert.equal(hurricaneVoyage.wrecked, true);
  assert.equal(hurricaneVoyage.wreckReason, "hurricane");

  state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const pirateVoyage = state.activeVoyage;
  pirateVoyage.shipHp = 50;
  pirateVoyage.caughtFish = [{ speciesId: "silver_dart" }, { speciesId: "silver_dart" }, { speciesId: "silver_dart" }];
  pirateVoyage.threat = {
    hurricane: null,
    pirate: { ...PIRATE_THREATS.nearshore, status: "active", appearsAtProgress: 0, lastAttackElapsedMs: 0, attackIntervalMs: 1_000, shipDamage: 1, attackSequence: 0, stolenFish: 0 }
  };
  reconcileTimedState(state, pirateVoyage.startedAt + 3_500, { random: () => 0 });
  assert.equal(pirateVoyage.shipHp, 47);
  assert.equal(pirateVoyage.threat.pirate.stolenFish, 3);
  assert.equal(pirateVoyage.caughtFish.length, 0);
});

test("one waiting session keeps the voyage paused while another session runs", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state = applyHookEvent(state, { session_id: "session-a", hook_event_name: "PermissionRequest" });
  const pausedAt = state.activeVoyage.pausedAt;
  state = applyHookEvent(state, { session_id: "session-b", hook_event_name: "UserPromptSubmit" });
  assert.equal(state.activeVoyage.pausedAt, pausedAt);
  assert.equal(state.activeVoyage.pauseReason, "agent");
  state = applyHookEvent(state, { session_id: "session-a", hook_event_name: "UserPromptSubmit" });
  assert.equal(state.activeVoyage.pausedAt, null);
});

test("automatic catches and warehouse claims respect every capacity reservation", () => {
  const rewards = generateAutomaticRewards("abyss", "deepsea", "capacity-regression", {
    crewEncounterBonus: 50,
    boatCapacity: { slots: 1, weight: 100 }
  });
  assert.ok(rewards.fish.length <= 1);
  assert.ok(rewards.fish.reduce((sum, fish) => sum + fish.weight, 0) <= 100);

  let state = freshState();
  const capacity = getProgressionEffects(state).warehouseCapacity;
  state.inventory.silver_dart = capacity - 2;
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state.activeVoyage.caughtFish = [{ speciesId: "silver_dart" }];
  state.activeVoyage.threat = { pirate: null, hurricane: null };
  state.autoVoyages["vessel-2"] = {
    id: "auto-capacity-test",
    vesselId: "vessel-2",
    routeId: "nearshore",
    startedAt: Date.now() - 100_000,
    durationMs: 1,
    ready: true,
    rewards: { fish: [{ speciesId: "silver_dart" }, { speciesId: "silver_dart" }], coins: 0, materials: 0 }
  };
  assert.throws(() => applyAction(state, { type: "claim_auto_voyage", vesselId: "vessel-2" }), /cold store is full/i);
});

test("automated materials reduce repair coins and are consumed first", () => {
  let state = freshState();
  state.coins = 500;
  state.materials = 2;
  state.boat.vessels["vessel-1"].health = 0;
  state = applyAction(state, { type: "repair_vessel", vesselId: "vessel-1" });
  assert.equal(state.materials, 0);
  assert.equal(state.coins, 320);
  assert.equal(state.boat.vessels["vessel-1"].health, 100);
});

test.after(() => fs.rmSync(testDataDir, { recursive: true, force: true }));
