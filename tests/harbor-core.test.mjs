import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  AUTOMATED_FLEET_EFFICIENCY,
  EQUIPMENT_CATALOG,
  FISH_SPECIES,
  HURRICANE_CHANCE,
  NEW_VESSEL_COST,
  ORDER_REFRESH_COOLDOWN_MS,
  ORDER_TIERS,
  PIRATE_PORT_PROFILES,
  PIRATE_PORT_THREATS,
  PIRATE_THREATS,
  SUPPORTED_INTERFACE_LANGUAGES,
  applyAction,
  applyHookEvent,
  autoVoyageProgress,
  cannonDamageForLevel,
  creditTokens,
  generateAutomaticRewards,
  generateVoyageThreat,
  generateVoyageEncounters,
  getAccessibleOrderSpecies,
  getBoatCapacity,
  getProgressionEffects,
  getProgressionView,
  getVesselHealth,
  getVesselMaxHealth,
  getVoyageCargo,
  readState,
  reconcileTimedState,
  progressionLevelCap,
  pirateThreatForTier,
  progressionUpgradeCost,
  summarizeAgents,
  vesselRepairCost,
  voyageProgress
} from "../scripts/harbor-core.mjs";

const testDataDir = path.resolve("test-artifacts", "state-test");
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

function releaseState() {
  fs.rmSync(testDataDir, { recursive: true, force: true });
  return readState();
}

test("starts a release harbor with no free resources or progress", () => {
  const state = releaseState();
  assert.equal(state.coins, 0);
  assert.equal(state.sailingPower, 0);
  assert.equal(state.totalTokens, 0);
  assert.equal(state.totalDistance, 0);
  assert.equal(state.ports.coral.progress, 0);
  assert.equal(state.boat.vesselId, "vessel-1");
  assert.equal(state.boat.selectedVesselId, "vessel-1");
  assert.equal(state.boat.vessels["vessel-1"].classId, "skiff");
  assert.equal(state.preferences.language, null);
});

test("stores only supported shared interface languages", () => {
  let state = freshState();
  for (const language of SUPPORTED_INTERFACE_LANGUAGES) {
    state = applyAction(state, { type: "set_language", language });
    assert.equal(state.preferences.language, language);
  }
  assert.throws(() => applyAction(state, { type: "set_language", language: "es" }), /Unsupported interface language/i);
});

test("turns token usage into pooled sailing power exactly once", () => {
  let state = freshState();
  state = creditTokens(state, 25_000, "response-001");
  assert.equal(state.sailingPower, 131.1);
  assert.equal(state.totalTokens, 1_311_000);
  assert.equal(state.tokenRemainder, 5_000);

  state = creditTokens(state, 25_000, "response-001");
  assert.equal(state.sailingPower, 131.1);
  assert.equal(state.totalTokens, 1_311_000);
});

test("keeps sailing power centralized until the player allocates it", () => {
  let state = freshState();
  state = applyAction(state, { type: "allocate_port", portId: "coral", amount: 10 });
  assert.equal(state.sailingPower, 118.6);
  assert.equal(state.ports.coral.progress, 82);
  assert.equal(state.ports.coral.unlocked, false);

  state = applyAction(state, { type: "allocate_port", portId: "coral", amount: 50 });
  assert.equal(state.sailingPower, 100.6);
  assert.equal(state.ports.coral.progress, 100);
  assert.equal(state.ports.coral.unlocked, true);
});

test("pauses a live voyage when Codex needs attention and resumes on work", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state = applyHookEvent(state, { hook_event_name: "Stop", session_id: "test-session" });
  assert.equal(state.activeVoyage.pauseReason, "agent");
  assert.ok(state.activeVoyage.pausedAt);
  assert.deepEqual(summarizeAgents(state), { running: 0, needsInput: 0, ready: 1 });

  state = applyHookEvent(state, { hook_event_name: "UserPromptSubmit", session_id: "test-session" });
  assert.equal(state.activeVoyage.pausedAt, null);
  assert.equal(state.activeVoyage.pauseReason, null);
  assert.deepEqual(summarizeAgents(state), { running: 1, needsInput: 0, ready: 0 });
});

test("fish require repeated hits before entering voyage cargo", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const encounter = state.activeVoyage.encounters[0];
  const requiredHits = encounter.hp;
  for (let index = 0; index < requiredHits - 1; index += 1) {
    state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  }
  assert.equal(state.activeVoyage.caughtFish.length, 0);
  state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  assert.equal(state.activeVoyage.caughtFish.length, 1);
  assert.equal(state.activeVoyage.encounters[0].status, "caught");
});

test("cooler slots and hull weight limit catches until upgraded", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state.activeVoyage.encounters = Array.from({ length: 4 }, (_, index) => ({
    id: `capacity-${index}`,
    speciesId: "silver_dart",
    hp: 1,
    maxHp: 1,
    status: "active"
  }));
  for (let index = 0; index < 3; index += 1) {
    state = applyAction(state, { type: "hit_fish", encounterId: `capacity-${index}` });
  }
  assert.deepEqual(getBoatCapacity(state), { slots: 3, weight: 6 });
  assert.deepEqual(getVoyageCargo(state.activeVoyage), {
    slots: 3,
    weight: 3.3,
    fish: state.activeVoyage.caughtFish
  });
  assert.throws(
    () => applyAction(state, { type: "hit_fish", encounterId: "capacity-3" }),
    /cooler is full/i
  );

  state.activeVoyage = null;
  state.coins = 2_000;
  state = applyAction(state, { type: "upgrade_equipment", itemId: "cooler" });
  state = applyAction(state, { type: "upgrade_equipment", itemId: "hull" });
  assert.deepEqual(getBoatCapacity(state), { slots: 5, weight: 10 });
  assert.throws(() => applyAction(state, { type: "upgrade_cooler" }), /unknown harbor action/i);
  assert.throws(() => applyAction(state, { type: "upgrade_hull" }), /unknown harbor action/i);
});

test("hull blocks an overweight fish even when cooler slots remain", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state.activeVoyage.encounters = [
    { id: "heavy-1", speciesId: "sunscale_oarfish", hp: 1, maxHp: 1, status: "active" },
    { id: "heavy-2", speciesId: "silver_dart", hp: 1, maxHp: 1, status: "active" }
  ];
  state = applyAction(state, { type: "hit_fish", encounterId: "heavy-1" });
  assert.equal(getVoyageCargo(state.activeVoyage).weight, 5.4);
  assert.throws(
    () => applyAction(state, { type: "hit_fish", encounterId: "heavy-2" }),
    /hold would be overweight/i
  );
});

test("farther routes generate a higher rarity mix", () => {
  const rank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
  const average = (routeId) => {
    const encounters = Array.from({ length: 80 }, (_, index) => generateVoyageEncounters(routeId, `${routeId}-${index}`)).flat();
    return encounters.reduce((sum, encounter) => sum + rank[FISH_SPECIES[encounter.speciesId].rarity], 0) / encounters.length;
  };
  assert.ok(average("coral") > average("nearshore"));
  assert.ok(average("abyss") > average("coral"));
});

test("keeps each island fish inside its declared habitat", () => {
  for (const routeId of ["nearshore", "coral", "abyss"]) {
    const encounters = Array.from({ length: 80 }, (_, index) => generateVoyageEncounters(routeId, `habitat-${routeId}-${index}`)).flat();
    assert.ok(encounters.every((encounter) => FISH_SPECIES[encounter.speciesId].routes.includes(routeId)));
  }
  assert.ok(!FISH_SPECIES.lagoon_blenny.routes.includes("nearshore"));
  assert.deepEqual(FISH_SPECIES.crown_coelacanth.routes, ["abyss"]);
  assert.equal(Object.values(FISH_SPECIES).filter((fish) => fish.sprite).length, 9);
});

test("fish burst profiles become more aggressive with rarity", () => {
  const encounters = Array.from({ length: 120 }, (_, index) => generateVoyageEncounters("abyss", `dash-${index}`)).flat();
  const allowedProfiles = new Set(["a", "b", "c", "frenzy"]);
  const legendary = encounters.filter((encounter) => FISH_SPECIES[encounter.speciesId].rarity === "legendary");

  assert.ok(encounters.every((encounter) => allowedProfiles.has(encounter.dashProfile)));
  assert.ok(legendary.length > 0);
  assert.ok(legendary.every((encounter) => encounter.dashProfile === "frenzy"));
  assert.ok(encounters
    .filter((encounter) => FISH_SPECIES[encounter.speciesId].rarity === "epic")
    .every((encounter) => ["c", "frenzy"].includes(encounter.dashProfile)));
});

test("mixes ordinary reversals with agile rare-fish turns and escapes", () => {
  const encounters = Array.from({ length: 320 }, (_, index) => generateVoyageEncounters("abyss", `behavior-${index}`)).flat();
  const allowedProfiles = new Set(["pass", "return", "turn", "escape"]);
  const forRarity = (rarity) => encounters.filter((encounter) => FISH_SPECIES[encounter.speciesId].rarity === rarity);
  const agileRate = (items) => items.filter((encounter) => ["turn", "escape"].includes(encounter.behaviorProfile)).length / items.length;
  const common = forRarity("common");
  const rare = forRarity("rare");
  const legendary = forRarity("legendary");

  assert.ok(encounters.every((encounter) => allowedProfiles.has(encounter.behaviorProfile)));
  assert.ok(common.some((encounter) => encounter.behaviorProfile === "return"));
  assert.ok(common.some((encounter) => encounter.behaviorProfile === "pass"));
  assert.ok(rare.some((encounter) => encounter.behaviorProfile === "turn"));
  assert.ok(rare.some((encounter) => encounter.behaviorProfile === "escape"));
  assert.ok(agileRate(rare) > agileRate(common));
  assert.ok(agileRate(legendary) > agileRate(rare));
});

test("finishes a voyage and deposits the exact captured fish after its timer", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const encounter = state.activeVoyage.encounters[0];
  encounter.hp = 1;
  state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  const speciesId = state.activeVoyage.caughtFish[0].speciesId;
  state.activeVoyage.threat = { pirate: null, hurricane: null };
  state.activeVoyage.startedAt -= state.activeVoyage.durationMs + 50;
  assert.equal(voyageProgress(state.activeVoyage), 1);

  state = applyAction(state, { type: "complete_voyage" });
  assert.equal(state.activeVoyage, null);
  assert.equal(state.totalDistance, 2857);
  assert.equal(state.inventory[speciesId], 1);
});

test("manual voyages use a 90 second baseline and can return early with caught cargo", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  assert.equal(state.activeVoyage.durationMs, 90_000);
  const encounter = state.activeVoyage.encounters[0];
  encounter.hp = 1;
  state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  const speciesId = state.activeVoyage.caughtFish[0].speciesId;
  state.activeVoyage.threat = { pirate: null, hurricane: null };
  state.activeVoyage.startedAt -= 45_000;
  state = applyAction(state, { type: "return_voyage" });
  assert.equal(state.activeVoyage, null);
  assert.equal(state.inventory[speciesId], 1);
  assert.equal(state.totalDistance, 2851);
});

test("locks hurricane risk to five percent at departure and scales pirates by route", () => {
  const threats = Array.from({ length: 2_000 }, (_, index) => generateVoyageThreat("nearshore", `weather-${index}`));
  const hurricaneRate = threats.filter((threat) => threat.hurricane).length / threats.length;
  assert.ok(hurricaneRate > HURRICANE_CHANCE - 0.015 && hurricaneRate < HURRICANE_CHANCE + 0.015);
  assert.ok(threats.every((threat) => Boolean(threat.hurricane) !== Boolean(threat.pirate)));
  assert.ok(PIRATE_THREATS.coral.hp > PIRATE_THREATS.nearshore.hp);
  assert.ok(PIRATE_THREATS.abyss.shipDamage > PIRATE_THREATS.coral.shipDamage);
  assert.ok(PIRATE_THREATS.abyss.attackIntervalMs < PIRATE_THREATS.nearshore.attackIntervalMs);
});

test("every harbor tier raises pirate health, damage, fire rate, and patrol speed", () => {
  const portIds = ["driftwood", "coral", "mist"];
  assert.deepEqual(Object.keys(PIRATE_PORT_PROFILES), portIds);
  const threats = portIds.map((portId) => PIRATE_PORT_THREATS[portId]);
  for (let index = 1; index < threats.length; index += 1) {
    assert.ok(threats[index].tier > threats[index - 1].tier);
    assert.ok(threats[index].hp > threats[index - 1].hp);
    assert.ok(threats[index].shipDamage > threats[index - 1].shipDamage);
    assert.ok(threats[index].attackIntervalMs < threats[index - 1].attackIntervalMs);
    assert.ok(threats[index].patrolSeconds < threats[index - 1].patrolSeconds);
  }
  const futurePort = pirateThreatForTier(4, { portId: "future", id: "future-raider", name: "Future Raider" });
  assert.ok(futurePort.hp > threats.at(-1).hp);
  assert.ok(futurePort.shipDamage > threats.at(-1).shipDamage);
  assert.ok(futurePort.attackIntervalMs < threats.at(-1).attackIntervalMs);
  assert.ok(futurePort.patrolSeconds < threats.at(-1).patrolSeconds);
});

test("keeps pirate growth playable across a long archipelago", () => {
  const threats = Array.from({ length: 25 }, (_, index) => pirateThreatForTier(index + 1));
  for (let index = 1; index < threats.length; index += 1) {
    assert.ok(threats[index].hp > threats[index - 1].hp);
    assert.ok(threats[index].shipDamage > threats[index - 1].shipDamage);
    assert.ok(threats[index].attackIntervalMs <= threats[index - 1].attackIntervalMs);
    assert.ok(threats[index].patrolSeconds <= threats[index - 1].patrolSeconds);
  }
  assert.deepEqual(
    [1, 2, 3, 5, 8, 12].map((tier) => {
      const threat = threats[tier - 1];
      return [threat.hp, threat.shipDamage, threat.attackIntervalMs, threat.patrolSeconds];
    }),
    [
      [5, 10, 6_500, 12],
      [10, 14, 6_050, 11.4],
      [16, 19, 5_600, 10.7],
      [31, 29, 4_700, 9.4],
      [59, 46, 3_800, 7.5],
      [104, 69, 3_800, 6.2]
    ]
  );
  assert.ok(threats[24].hp < 300);
  assert.ok(threats[24].shipDamage < 160);
});

test("combines cannon levels with larger-vessel mount bonuses", () => {
  assert.equal(EQUIPMENT_CATALOG.cannon.maxLevel, 100);
  assert.deepEqual([1, 2, 3, 4].map((rank) => cannonDamageForLevel(12, rank)), [12, 13, 15, 16]);
  for (const rank of [1, 2, 3, 4]) {
    for (let level = 2; level <= 100; level += 1) {
      assert.ok(cannonDamageForLevel(level, rank) > cannonDamageForLevel(level - 1, rank));
    }
  }
  assert.ok(cannonDamageForLevel(48, 4) * 2 >= pirateThreatForTier(12).hp);
});

test("cannon upgrades defeat pirate encounters with fewer clicks", () => {
  let state = freshState();
  state.coins = 5_000;
  state = applyAction(state, { type: "upgrade_equipment", itemId: "cannon" });
  assert.equal(getProgressionEffects(state).cannonDamage, 2);
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state.activeVoyage.threat = {
    hurricane: null,
    pirate: { ...PIRATE_THREATS.nearshore, hp: 5, maxHp: 5, status: "active", appearsAtProgress: 0, lastAttackAt: Date.now(), stolenFish: 0 }
  };
  state = applyAction(state, { type: "hit_pirate" });
  state = applyAction(state, { type: "hit_pirate" });
  assert.equal(state.activeVoyage.threat.pirate.hp, 1);
  state = applyAction(state, { type: "hit_pirate" });
  assert.equal(state.activeVoyage.threat.pirate.status, "defeated");
});

test("pirates steal catches, wreck the ship, and require a paid repair", () => {
  let state = freshState();
  state.coins = 500;
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const encounter = state.activeVoyage.encounters[0];
  encounter.hp = 1;
  state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  state.activeVoyage.shipHp = PIRATE_THREATS.nearshore.shipDamage;
  state.activeVoyage.threat = {
    hurricane: null,
    pirate: { ...PIRATE_THREATS.nearshore, hp: 5, maxHp: 5, status: "active", appearsAtProgress: 0, lastAttackElapsedMs: 0, stolenFish: 0 }
  };
  state.activeVoyage.startedAt -= PIRATE_THREATS.nearshore.attackIntervalMs;
  reconcileTimedState(state, Date.now());
  assert.equal(state.activeVoyage.shipHp, 0);
  assert.equal(state.activeVoyage.wrecked, true);
  assert.equal(state.activeVoyage.wreckReason, "pirates");
  assert.equal(state.activeVoyage.caughtFish.length, 0);
  state = applyAction(state, { type: "return_voyage" });
  assert.equal(getVesselHealth(state, "vessel-1"), 0);
  assert.equal(vesselRepairCost(state, "vessel-1"), 300);
  assert.throws(() => applyAction(state, { type: "launch_voyage", routeId: "nearshore" }), /repair/i);
  state = applyAction(state, { type: "repair_vessel", vesselId: "vessel-1" });
  assert.equal(state.coins, 200);
  assert.equal(getVesselHealth(state, "vessel-1"), getVesselMaxHealth(state, "vessel-1"));
});

test("each successful pirate attack steals one random fish from current voyage cargo", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  state.activeVoyage.caughtFish = [
    { speciesId: "silver_dart" },
    { speciesId: "coral_snapper" },
    { speciesId: "moonfin_tuna" }
  ];
  state.activeVoyage.threat = {
    hurricane: null,
    pirate: { ...PIRATE_THREATS.nearshore, hp: 5, maxHp: 5, status: "active", appearsAtProgress: 0, lastAttackElapsedMs: 0, stolenFish: 0 }
  };
  state.activeVoyage.startedAt -= PIRATE_THREATS.nearshore.attackIntervalMs;

  reconcileTimedState(state, Date.now(), { random: () => 0.4 });

  assert.deepEqual(state.activeVoyage.caughtFish.map((fish) => fish.speciesId), ["silver_dart", "moonfin_tuna"]);
  assert.equal(state.activeVoyage.threat.pirate.stolenFish, 1);
  assert.equal(state.activeVoyage.shipHp, state.activeVoyage.maxShipHp - PIRATE_THREATS.nearshore.shipDamage);
});

test("a triggered hurricane wrecks the vessel and destroys the full voyage catch", () => {
  let state = freshState();
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const encounter = state.activeVoyage.encounters[0];
  encounter.hp = 1;
  state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  state.activeVoyage.threat = { pirate: null, hurricane: { type: "hurricane", status: "waiting", appearsAtProgress: 0 } };
  reconcileTimedState(state, Date.now());
  assert.equal(state.activeVoyage.wreckReason, "hurricane");
  assert.equal(state.activeVoyage.shipHp, 0);
  assert.deepEqual(state.activeVoyage.caughtFish, []);
  state = applyAction(state, { type: "return_voyage" });
  assert.equal(state.inventory[encounter.speciesId], 0);
  assert.equal(getVesselHealth(state, "vessel-1"), 0);
});

test("automated voyages use spare ships at 30 percent efficiency and never catch legendary fish", () => {
  const rewards = generateAutomaticRewards("abyss", "deepsea", "auto-efficiency");
  assert.equal(rewards.efficiency, AUTOMATED_FLEET_EFFICIENCY);
  assert.equal(rewards.fish.length, 3);
  assert.ok(rewards.fish.every((fish) => fish.rarity !== "legendary"));
  assert.ok(rewards.coins > 0);
  assert.ok(rewards.materials > 0);
});

test("automated ships keep sailing through Codex pauses and wait for manual collection", () => {
  let state = freshState();
  state.coins = 100_000;
  state.facilities.lighthouse.level = 3;
  state.ports.mist.unlocked = true;
  state.facilities.berth.level = 2;
  state = applyAction(state, { type: "buy_vessel" });
  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-2" });
  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-2" });
  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-2" });
  assert.throws(
    () => applyAction(state, { type: "dispatch_auto_voyage", vesselId: "vessel-1", routeId: "nearshore" }),
    /manual vessel/i
  );
  state = applyAction(state, { type: "dispatch_auto_voyage", vesselId: "vessel-2", routeId: "abyss" });
  const voyage = state.autoVoyages["vessel-2"];
  assert.ok(voyage);
  state = applyAction(state, { type: "select_vessel", vesselId: "vessel-2" });
  assert.equal(state.boat.selectedVesselId, "vessel-2");
  assert.throws(() => applyAction(state, { type: "assign_manual_vessel", vesselId: "vessel-2" }), /automated fleet/i);

  state = applyHookEvent(state, { hook_event_name: "Stop", session_id: "auto-test" });
  assert.equal(state.autoVoyages["vessel-2"].startedAt, voyage.startedAt);
  state.autoVoyages["vessel-2"].startedAt -= state.autoVoyages["vessel-2"].durationMs + 50;
  assert.equal(autoVoyageProgress(state.autoVoyages["vessel-2"]), 1);
  const rewards = state.autoVoyages["vessel-2"].rewards;
  const beforeCoins = state.coins;
  const beforeMaterials = state.materials;
  state = applyAction(state, { type: "claim_auto_voyage", vesselId: "vessel-2" });
  assert.equal(state.autoVoyages["vessel-2"], undefined);
  assert.equal(state.coins, beforeCoins + rewards.coins);
  assert.equal(state.materials, beforeMaterials + rewards.materials);
  assert.ok(rewards.fish.every((fish) => state.inventory[fish.speciesId] > 0));
});

test("builds every extra vessel as a fresh skiff and upgrades its class independently", () => {
  let state = freshState();
  state.coins = 20_000;
  state = applyAction(state, { type: "upgrade_equipment", itemId: "engine", vesselId: "vessel-1" });
  assert.throws(() => applyAction(state, { type: "buy_vessel" }), /No berth available/i);

  state = applyAction(state, { type: "upgrade_facility", facilityId: "berth" });
  const beforeBuildCoins = state.coins;
  state = applyAction(state, { type: "buy_vessel" });
  assert.equal(state.coins, beforeBuildCoins - NEW_VESSEL_COST);
  assert.equal(state.boat.vessels["vessel-2"].classId, "skiff");
  assert.equal(state.boat.vessels["vessel-2"].equipment.engine, 1);
  assert.equal(state.boat.vessels["vessel-1"].equipment.engine, 2);
  assert.equal(state.boat.vesselId, "vessel-1");
  assert.equal(state.boat.selectedVesselId, "vessel-2");

  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-2" });
  assert.equal(state.boat.vessels["vessel-2"].classId, "trawler");
  assert.equal(state.boat.vessels["vessel-1"].classId, "skiff");
  state = applyAction(state, { type: "assign_manual_vessel", vesselId: "vessel-2" });
  assert.equal(state.boat.vesselId, "vessel-2");
  assert.deepEqual(getBoatCapacity(state), { slots: 5, weight: 12 });
});

test("applies equipment and crew bonuses to real voyage rules", () => {
  let state = freshState();
  state.coins = 50_000;
  state = applyAction(state, { type: "upgrade_equipment", itemId: "engine" });
  state = applyAction(state, { type: "upgrade_equipment", itemId: "net" });
  state = applyAction(state, { type: "upgrade_equipment", itemId: "sonar" });
  state = applyAction(state, { type: "upgrade_crew", roleId: "captain" });
  state = applyAction(state, { type: "upgrade_crew", roleId: "fisher" });
  state = applyAction(state, { type: "upgrade_crew", roleId: "engineer" });

  const effects = getProgressionEffects(state);
  assert.equal(effects.netDamage, 2);
  assert.equal(effects.encounterBonus, 1);
  assert.ok(effects.rarityBonus > 0);
  assert.ok(effects.voyageDurationMultiplier < 1);

  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  assert.equal(state.activeVoyage.encounters.length, 6);
  assert.ok(state.activeVoyage.durationMs < 90_000);
  const encounter = state.activeVoyage.encounters[0];
  encounter.hp = 2;
  state = applyAction(state, { type: "hit_fish", encounterId: encounter.id });
  assert.equal(state.activeVoyage.encounters[0].status, "caught");
});

test("makes every net, cannon, and fisher level immediately meaningful", () => {
  let state = freshState();
  state.coins = 20_000;
  const before = getProgressionEffects(state);
  state = applyAction(state, { type: "upgrade_equipment", itemId: "net" });
  state = applyAction(state, { type: "upgrade_equipment", itemId: "cannon" });
  state = applyAction(state, { type: "upgrade_crew", roleId: "fisher" });
  const after = getProgressionEffects(state);
  assert.equal(after.netDamage, before.netDamage + 1);
  assert.equal(after.cannonDamage, before.cannonDamage + 1);
  assert.equal(after.encounterBonus, before.encounterBonus + 1);
});

test("exposes hull upgrades and snapshots all voyage equipment at departure", () => {
  let state = freshState();
  state.coins = 20_000;
  state.facilities.berth.level = 2;
  state = applyAction(state, { type: "buy_vessel" });
  state = applyAction(state, { type: "select_vessel", vesselId: "vessel-1" });
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  assert.deepEqual(state.activeVoyage.boatCapacity, { slots: 3, weight: 6 });
  assert.throws(() => applyAction(state, { type: "upgrade_equipment", itemId: "hull", vesselId: "vessel-1" }), /after it returns to port/i);

  state = applyAction(state, { type: "select_vessel", vesselId: "vessel-2" });
  state = applyAction(state, { type: "upgrade_equipment", itemId: "cooler", vesselId: "vessel-2" });
  state = applyAction(state, { type: "upgrade_equipment", itemId: "net", vesselId: "vessel-2" });
  assert.deepEqual(getBoatCapacity(state, "vessel-2"), { slots: 5, weight: 6 });
  assert.deepEqual(getBoatCapacity(state, "vessel-1"), { slots: 3, weight: 6 });
  assert.deepEqual(state.activeVoyage.boatCapacity, { slots: 3, weight: 6 });
  assert.equal(state.activeVoyage.netDamage, 1);
  state.activeVoyage = null;

  const oldMaxHp = getVesselMaxHealth(state, "vessel-1");
  state = applyAction(state, { type: "upgrade_equipment", itemId: "hull", vesselId: "vessel-1" });
  assert.deepEqual(getBoatCapacity(state, "vessel-1"), { slots: 3, weight: 10 });
  assert.equal(getVesselMaxHealth(state, "vessel-1"), oldMaxHp + 15);
  assert.equal(getVesselHealth(state, "vessel-1"), oldMaxHp + 15);
});

test("keeps late engine levels effective and gives lighthouse LV.4 a real bonus", () => {
  let state = freshState();
  state.boat.vessels["vessel-1"].equipment.engine = 7;
  state.crew.engineer.level = 9;
  state.facilities.lighthouse.level = 3;
  const beforeEngine = getProgressionEffects(state).voyageDurationMultiplier;
  state.boat.vessels["vessel-1"].equipment.engine = 8;
  const afterEngine = getProgressionEffects(state).voyageDurationMultiplier;
  state.crew.engineer.level = 10;
  const afterEngineer = getProgressionEffects(state).voyageDurationMultiplier;
  assert.ok(afterEngine < beforeEngine);
  assert.ok(afterEngineer < afterEngine);

  state.coins = 50_000;
  state.ports.coral.unlocked = true;
  state.ports.mist.unlocked = true;
  const beforeBeacon = getProgressionEffects(state);
  state = applyAction(state, { type: "upgrade_facility", facilityId: "lighthouse" });
  const afterBeacon = getProgressionEffects(state);
  assert.equal(afterBeacon.beaconRarityBonus, 0.12);
  assert.equal(afterBeacon.beaconVoyageBonus, 0.1);
  assert.equal(afterBeacon.rarityBonus, beforeBeacon.rarityBonus + 0.12);
  assert.ok(afterBeacon.voyageDurationMultiplier < beforeBeacon.voyageDurationMultiplier);
});

test("opens four long-term upgrade levels with every unlocked port", () => {
  let state = freshState();
  state.coins = 1_000_000;
  let engine = getProgressionView(state).equipment.find((item) => item.id === "engine");
  let lighthouse = getProgressionView(state).facilities.find((item) => item.id === "lighthouse");
  assert.equal(engine.availableMaxLevel, 4);
  assert.equal(lighthouse.availableMaxLevel, 2);

  for (let level = 1; level < 4; level += 1) state = applyAction(state, { type: "upgrade_equipment", itemId: "engine" });
  engine = getProgressionView(state).equipment.find((item) => item.id === "engine");
  assert.equal(engine.level, 4);
  assert.equal(engine.worldCapped, true);
  assert.throws(() => applyAction(state, { type: "upgrade_equipment", itemId: "engine" }), /another port/i);

  state.ports.coral.unlocked = true;
  assert.equal(progressionLevelCap(state, "equipment", EQUIPMENT_CATALOG.engine), 8);
  state = applyAction(state, { type: "upgrade_equipment", itemId: "engine" });
  assert.equal(state.boat.vessels["vessel-1"].equipment.engine, 5);

  state.ports.mist.unlocked = true;
  assert.equal(progressionLevelCap(state, "equipment", EQUIPMENT_CATALOG.engine), 12);
  state.ports.outer = { id: "outer", unlocked: true };
  assert.equal(progressionLevelCap(state, "equipment", EQUIPMENT_CATALOG.engine), 16);
  state.ports.frost = { id: "frost", unlocked: true };
  assert.equal(progressionLevelCap(state, "equipment", EQUIPMENT_CATALOG.engine), 20);
});

test("raises prices sharply when a new port upgrade band begins", () => {
  const lastCoastalLevel = progressionUpgradeCost(550, 4);
  const firstCoralLevel = progressionUpgradeCost(550, 5);
  assert.ok(firstCoralLevel > lastCoastalLevel * 2);
  assert.ok(progressionUpgradeCost(550, 12) > firstCoralLevel * 4);
});

test("requires lighthouse and vessel tiers before far-sea routes", () => {
  let state = freshState();
  state.coins = 50_000;
  state.ports.coral.unlocked = true;
  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-1" });
  assert.throws(() => applyAction(state, { type: "launch_voyage", routeId: "coral" }), /Lighthouse LV.2 required/i);

  state = applyAction(state, { type: "upgrade_facility", facilityId: "lighthouse" });
  state = applyAction(state, { type: "launch_voyage", routeId: "coral" });
  assert.equal(state.activeVoyage.routeId, "coral");
});

test("turns fish sales and harbor facilities into a repeatable economy", () => {
  let state = freshState();
  state.coins = 10_000;
  state.inventory.silver_dart = 2;
  state = applyAction(state, { type: "upgrade_facility", facilityId: "market" });
  const afterUpgrade = state.coins;
  state = applyAction(state, { type: "sell_fish", speciesId: "silver_dart", amount: 1 });
  assert.equal(state.inventory.silver_dart, 1);
  assert.equal(state.coins - afterUpgrade, 61);

  const progression = getProgressionView(state);
  assert.equal(progression.effects.marketMultiplier, 1.1);
  assert.equal(progression.effects.warehouseCapacity, 20);
  assert.equal(progression.facilities.find((facility) => facility.id === "market").value, "Sale price ×1.1");
});

test("generates attainable orders and replaces each delivered slot", () => {
  let state = freshState();
  const accessible = new Set(getAccessibleOrderSpecies(state).map((fish) => fish.id));
  assert.equal(state.orders.length, ORDER_TIERS.length);
  assert.ok(state.orders.every((order) => Object.keys(order.needs).every((speciesId) => accessible.has(speciesId))));
  assert.ok(!accessible.has("ghost_ray"));
  assert.ok(!accessible.has("sunscale_oarfish"));

  const order = state.orders[0];
  const oldOrderId = order.id;
  for (const [speciesId, amount] of Object.entries(order.needs)) state.inventory[speciesId] = amount;
  const expectedReward = order.reward;
  state = applyAction(state, { type: "deliver_order", orderId: order.id });
  assert.equal(state.coins, expectedReward);
  assert.equal(state.orderBoard.completedCount, 1);
  assert.notEqual(state.orders[0].id, oldOrderId);
  assert.ok(Object.keys(order.needs).every((speciesId) => state.inventory[speciesId] === 0));
});

test("refreshes the full order board for free on a ten-minute cooldown", () => {
  let state = freshState();
  const previousIds = state.orders.map((order) => order.id);
  state.orderBoard.freeRefreshAt = 0;
  state = applyAction(state, { type: "refresh_orders" });
  assert.notDeepEqual(state.orders.map((order) => order.id), previousIds);
  assert.ok(state.orderBoard.freeRefreshAt - state.orderBoard.refreshedAt === ORDER_REFRESH_COOLDOWN_MS);
  assert.throws(() => applyAction(state, { type: "refresh_orders" }), /cooling down/i);
});

test("expands order ingredients only after matching seas and ships unlock", () => {
  let state = freshState();
  state.coins = 100_000;
  state.ports.coral.unlocked = true;
  state.ports.mist.unlocked = true;
  state.facilities.lighthouse.level = 3;
  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-1" });
  state = applyAction(state, { type: "upgrade_vessel", vesselId: "vessel-1" });
  assert.deepEqual(new Set(getAccessibleOrderSpecies(state).map((fish) => fish.id)), new Set(Object.keys(FISH_SPECIES)));
});

test("prevents catches when the harbor cold storage is full", () => {
  let state = freshState();
  state.inventory.silver_dart = 20;
  state = applyAction(state, { type: "launch_voyage", routeId: "nearshore" });
  const encounter = state.activeVoyage.encounters[0];
  encounter.hp = 1;
  assert.throws(() => applyAction(state, { type: "hit_fish", encounterId: encounter.id }), /harbor cold store is full/i);
});

test.after(() => fs.rmSync(testDataDir, { recursive: true, force: true }));
