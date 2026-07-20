import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  createMultiplayerState,
  ensureActor,
  hasProcessedAction,
  normalizeMultiplayerState,
  recordDomainEvent,
  sanitizeActionPayload
} from "./multiplayer-core.mjs";

function configuredPort(name, fallback) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65_535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return value;
}

export const HARBOR_PORT = configuredPort("TOKEN_HARBOR_PORT", 47831);
export const HARBOR_DEV_PORT = configuredPort("TOKEN_HARBOR_DEV_PORT", 5173);
export const TOKENS_PER_SAILING_POWER = 10_000;
export const CURRENT_STATE_VERSION = 10;
export const AUTOMATED_FLEET_EFFICIENCY = 0.3;
export const HURRICANE_CHANCE = 0.05;
export const ORDER_REFRESH_COOLDOWN_MS = 10 * 60 * 1000;
export const PROGRESSION_LEVELS_PER_PORT = 4;
export const NEW_VESSEL_COST = 1800;
export const MATERIAL_REPAIR_VALUE = 60;
export const SUPPORTED_INTERFACE_LANGUAGES = ["en", "pt-BR", "de", "fr", "ja", "ko", "zh-Hans", "zh-Hant"];
const MAX_SESSION_RECORDS = 100;
const ACTION_ID_PATTERN = /^[a-zA-Z0-9_-]{8,128}$/;

function finiteNumber(value, fallback = 0, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const bounded = Math.max(minimum, Math.min(maximum, parsed));
  return integer ? Math.floor(bounded) : bounded;
}

function requiredPositiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1 || parsed > Number.MAX_SAFE_INTEGER) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}

export const RARITIES = {
  common: { id: "common", label: "Common", color: "#b7c7c3" },
  uncommon: { id: "uncommon", label: "Uncommon", color: "#63c69b" },
  rare: { id: "rare", label: "Rare", color: "#64aee8" },
  epic: { id: "epic", label: "Epic", color: "#b98be5" },
  legendary: { id: "legendary", label: "Legendary", color: "#efbd58" }
};

export const FISH_SPECIES = {
  silver_dart: { id: "silver_dart", name: "Silver Dart", rarity: "common", hp: 2, weight: 1.1, value: 55, swimSeconds: 9.2, routes: ["nearshore"], asset: "silver-dart.png" },
  coral_snapper: { id: "coral_snapper", name: "Coral Snapper", rarity: "uncommon", hp: 3, weight: 1.8, value: 120, swimSeconds: 8.2, routes: ["nearshore", "coral"], asset: "coral-snapper.png" },
  moonfin_tuna: { id: "moonfin_tuna", name: "Moonfin Tuna", rarity: "rare", hp: 5, weight: 3.2, value: 290, swimSeconds: 7.1, routes: ["nearshore", "coral", "abyss"], asset: "moonfin-tuna.png" },
  ghost_ray: { id: "ghost_ray", name: "Ghost Ray", rarity: "epic", hp: 7, weight: 4.5, value: 680, swimSeconds: 6.3, routes: ["coral", "abyss"], asset: "ghost-ray.png" },
  sunscale_oarfish: { id: "sunscale_oarfish", name: "Sunscale Oarfish", rarity: "legendary", hp: 10, weight: 5.4, value: 1500, swimSeconds: 5.6, routes: ["abyss"], asset: "sunscale-oarfish.png" },
  lagoon_blenny: { id: "lagoon_blenny", name: "Lagoon Blenny", rarity: "common", hp: 2, weight: 0.9, value: 70, swimSeconds: 9.4, routes: ["coral"], sprite: { col: 0, row: 0 } },
  reef_butterfly: { id: "reef_butterfly", name: "Reef Butterflyfish", rarity: "uncommon", hp: 3, weight: 1.5, value: 155, swimSeconds: 8.1, routes: ["coral"], sprite: { col: 1, row: 0 } },
  ember_lionfish: { id: "ember_lionfish", name: "Ember Lionfish", rarity: "rare", hp: 6, weight: 2.7, value: 390, swimSeconds: 6.8, routes: ["coral"], sprite: { col: 2, row: 0 } },
  ribbon_moray: { id: "ribbon_moray", name: "Ribbon Moray", rarity: "epic", hp: 8, weight: 4, value: 840, swimSeconds: 6, routes: ["coral"], sprite: { col: 3, row: 0 } },
  mist_sardine: { id: "mist_sardine", name: "Mist Sardine", rarity: "common", hp: 2, weight: 1, value: 85, swimSeconds: 9, routes: ["abyss"], sprite: { col: 0, row: 1 } },
  frostfin_hake: { id: "frostfin_hake", name: "Frostfin Hake", rarity: "uncommon", hp: 4, weight: 2.4, value: 220, swimSeconds: 7.8, routes: ["abyss"], sprite: { col: 1, row: 1 } },
  glass_squid: { id: "glass_squid", name: "Glass Squid", rarity: "rare", hp: 6, weight: 3, value: 450, swimSeconds: 7, routes: ["abyss"], sprite: { col: 2, row: 1 } },
  lantern_angler: { id: "lantern_angler", name: "Lantern Anglerfish", rarity: "epic", hp: 9, weight: 4.8, value: 980, swimSeconds: 5.8, routes: ["abyss"], sprite: { col: 3, row: 1 } },
  crown_coelacanth: { id: "crown_coelacanth", name: "Crown Coelacanth", rarity: "legendary", hp: 12, weight: 6.2, value: 1950, swimSeconds: 5.2, routes: ["abyss"], sprite: { col: 4, row: 1 } }
};

export const VESSEL_CATALOG = {
  skiff: { id: "skiff", name: "Fishing Skiff", rank: 1, cost: 0, weight: 6, slots: 3, baseHp: 100, encounterBonus: 0, durationMultiplier: 1, requiredLighthouse: 1 },
  trawler: { id: "trawler", name: "Trawler", rank: 2, cost: 2400, weight: 12, slots: 5, baseHp: 140, encounterBonus: 1, durationMultiplier: 0.96, requiredLighthouse: 1 },
  ocean: { id: "ocean", name: "Ocean Vessel", rank: 3, cost: 12000, weight: 22, slots: 7, baseHp: 185, encounterBonus: 2, durationMultiplier: 0.91, requiredLighthouse: 2 },
  deepsea: { id: "deepsea", name: "Deep-Sea Ship", rank: 4, cost: 50000, weight: 36, slots: 10, baseHp: 240, encounterBonus: 3, durationMultiplier: 0.85, requiredLighthouse: 3 }
};

const VESSEL_CLASSES = Object.values(VESSEL_CATALOG).sort((left, right) => left.rank - right.rank);
const VESSEL_EQUIPMENT_IDS = ["engine", "hull", "net", "sonar", "cooler", "cannon"];

function normalizeVesselEquipment(source = {}) {
  return Object.fromEntries(VESSEL_EQUIPMENT_IDS.map((itemId) => [
    itemId,
    finiteNumber(
      source.equipment?.[itemId] ?? source[`${itemId}Level`] ?? 1,
      1,
      { minimum: 1, maximum: EQUIPMENT_CATALOG[itemId]?.maxLevel || 1, integer: true }
    )
  ]));
}

function createVesselInstance(id, number, classId = "skiff", source = {}) {
  const resolvedClassId = VESSEL_CATALOG[classId] ? classId : "skiff";
  return {
    id,
    number: Math.max(1, Math.floor(Number(number) || 1)),
    classId: resolvedClassId,
    equipment: normalizeVesselEquipment(source),
    health: Number.isFinite(Number(source.health)) ? Math.round(Number(source.health)) : VESSEL_CATALOG[resolvedClassId].baseHp
  };
}

export const EQUIPMENT_CATALOG = {
  engine: { id: "engine", name: "Engine", baseCost: 600, maxLevel: 20, detail: "Shortens voyage time every level" },
  hull: { id: "hull", name: "Hull", baseCost: 700, maxLevel: 20, detail: "+4 kg hold and +15 hull HP per level" },
  net: { id: "net", name: "Net", baseCost: 550, maxLevel: 20, detail: "+1 catch damage per level" },
  sonar: { id: "sonar", name: "Sonar", baseCost: 750, maxLevel: 20, detail: "+6% rare odds per level" },
  cooler: { id: "cooler", name: "Cooler", baseCost: 500, maxLevel: 20, detail: "+2 slots per level" },
  cannon: { id: "cannon", name: "Cannon", baseCost: 900, maxLevel: 100, detail: "Damage rises every level; larger vessels amplify it" }
};

export const PIRATE_PORT_PROFILES = {
  driftwood: { portId: "driftwood", tier: 1, id: "coastal-raider", name: "Coastal Raider" },
  coral: { portId: "coral", tier: 2, id: "reef-corsair", name: "Reef Corsair" },
  mist: { portId: "mist", tier: 3, id: "blackwake-brig", name: "Blackwake Brig" }
};

export function cannonDamageForLevel(level = 1, vesselRank = 1) {
  const normalizedLevel = Math.max(1, Math.floor(Number(level) || 1));
  const normalizedRank = Math.max(1, Math.floor(Number(vesselRank) || 1));
  const mountMultiplier = 1 + Math.min(0.6, (normalizedRank - 1) * 0.12);
  return Math.max(1, Math.round(normalizedLevel * mountMultiplier));
}

export function pirateThreatForTier(tier, identity = {}) {
  const normalizedTier = Math.max(1, Math.floor(Number(tier) || 1));
  const step = normalizedTier - 1;
  return {
    id: identity.id || `tier-${normalizedTier}-raider`,
    name: identity.name || `Tier ${normalizedTier} Raider`,
    portId: identity.portId || null,
    tier: normalizedTier,
    hp: Math.round(5 + step * 3 + 1.8 * step ** 1.5),
    shipDamage: Math.round(10 + step * 4 + 0.45 * step ** 1.45),
    attackIntervalMs: Math.max(3_800, 6_500 - step * 450),
    patrolSeconds: Math.max(6.2, round(12 - step * 0.65))
  };
}

export const PIRATE_PORT_THREATS = Object.fromEntries(
  Object.entries(PIRATE_PORT_PROFILES).map(([portId, profile]) => [portId, pirateThreatForTier(profile.tier, profile)])
);

export const PIRATE_THREATS = {
  nearshore: PIRATE_PORT_THREATS.driftwood,
  coral: PIRATE_PORT_THREATS.coral,
  abyss: PIRATE_PORT_THREATS.mist
};

export const CREW_CATALOG = {
  captain: { id: "captain", name: "Captain", baseCost: 900, maxLevel: 20, detail: "Raises rare-fish odds" },
  fisher: { id: "fisher", name: "Fisher", baseCost: 700, maxLevel: 20, detail: "+1 fish per level" },
  engineer: { id: "engineer", name: "Engineer", baseCost: 800, maxLevel: 20, detail: "Shortens voyage time every level" }
};

export const FACILITY_CATALOG = {
  berth: { id: "berth", name: "Berth", baseCost: 1000, maxLevel: 12, detail: "+1 ship berth per level" },
  coldStorage: { id: "coldStorage", name: "Cold Store", baseCost: 850, maxLevel: 20, detail: "+20 fish capacity per level" },
  market: { id: "market", name: "Market", baseCost: 1200, maxLevel: 20, detail: "+10% sale price per level" },
  lighthouse: { id: "lighthouse", name: "Lighthouse", baseCost: 1600, maxLevel: 12, detail: "Unlocks seas; LV.4+ boosts rarity and speed" }
};

const routes = {
  nearshore: {
    id: "nearshore", name: "Coastal Run", portId: "driftwood", cost: 8, durationMs: 90_000, distance: 12, encounterCount: 5, requiredLighthouse: 1, requiredVesselRank: 1,
    rarityLabel: "Mostly common", rarityWeights: { common: 72, uncommon: 23, rare: 5, epic: 0, legendary: 0 }
  },
  coral: {
    id: "coral", name: "Coral Route", portId: "coral", cost: 20, durationMs: 90_000, distance: 32, requiredPort: "coral", encounterCount: 6, requiredLighthouse: 2, requiredVesselRank: 2,
    rarityLabel: "Better rare odds", rarityWeights: { common: 38, uncommon: 36, rare: 21, epic: 5, legendary: 0 }
  },
  abyss: {
    id: "abyss", name: "Mist Depths", portId: "mist", cost: 38, durationMs: 90_000, distance: 70, requiredPort: "mist", encounterCount: 7, requiredLighthouse: 3, requiredVesselRank: 3,
    rarityLabel: "Epic and legendary", rarityWeights: { common: 12, uncommon: 26, rare: 32, epic: 24, legendary: 6 }
  }
};

const defaultInventory = () => Object.fromEntries(Object.keys(FISH_SPECIES).map((id) => [id, 0]));

export const ORDER_TIERS = [
  { id: "standard", itemTypes: 1, minCount: 2, maxCount: 3, rewardMultiplier: 1.35, clients: ["morning-market", "dockside-cafe"] },
  { id: "priority", itemTypes: 2, minCount: 1, maxCount: 2, rewardMultiplier: 1.55, clients: ["reef-banquet", "harbor-hotel"] },
  { id: "premium", itemTypes: 2, minCount: 1, maxCount: 2, rewardMultiplier: 1.85, clients: ["collector-cooler", "ocean-research"] }
];

const initialState = () => {
  const state = {
    version: CURRENT_STATE_VERSION,
  sailingPower: 0,
  coins: 0,
  totalDistance: 0,
  totalTokens: 0,
  tokenRemainder: 0,
  lastTokenCredit: 0,
  lastTokenCreditAt: null,
  preferences: {
    language: null
  },
  harborLevel: 1,
  boat: {
    vesselId: "vessel-1",
    selectedVesselId: "vessel-1",
    nextVesselSequence: 2,
    vessels: {
      "vessel-1": createVesselInstance("vessel-1", 1)
    }
  },
  crew: {
    captain: { level: 1 },
    fisher: { level: 1 },
    engineer: { level: 1 }
  },
  facilities: {
    berth: { level: 1 },
    coldStorage: { level: 1 },
    market: { level: 1 },
    lighthouse: { level: 1 }
  },
  ports: {
    driftwood: { id: "driftwood", name: "Driftwood", unlocked: true, progress: 0, cost: 0 },
    coral: { id: "coral", name: "Coral Port", unlocked: false, progress: 0, cost: 100 },
    mist: { id: "mist", name: "Mistlight", unlocked: false, progress: 0, cost: 250 }
  },
  inventory: defaultInventory(),
  materials: 0,
  orders: [],
  orderBoard: {
    completedCount: 0,
    nextSequence: 1,
    refreshedAt: Date.now(),
    freeRefreshAt: 0
  },
  activeVoyage: null,
  autoVoyages: {},
  sessions: {},
  recentTelemetryIds: [],
  multiplayer: createMultiplayerState(),
    updatedAt: new Date().toISOString()
  };
  state.orders = generateOrderSet(state, 0);
  state.orderBoard.nextSequence = state.orders.length + 1;
  return state;
};

function normalizeState(raw) {
  raw = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const base = initialState();
  const sourceVersion = finiteNumber(raw.version, 1, { minimum: 1, integer: true });
  const legacyFishInventory = sourceVersion < 2;
  const savedFleet = raw?.boat?.vessels && typeof raw.boat.vessels === "object" ? raw.boat.vessels : null;
  const legacyVesselMap = {};
  let vessels;
  if (savedFleet && Object.keys(savedFleet).length) {
    vessels = Object.fromEntries(Object.entries(savedFleet).map(([savedId, entry], index) => {
      const id = String(entry?.id || savedId || `vessel-${index + 1}`);
      return [id, createVesselInstance(id, entry?.number || index + 1, entry?.classId, entry)];
    }));
  } else {
    const legacyOwned = Array.from(new Set([
      "skiff",
      ...(Array.isArray(raw?.boat?.ownedVesselIds) ? raw.boat.ownedVesselIds : [])
    ])).filter((classId) => VESSEL_CATALOG[classId]);
    vessels = Object.fromEntries(legacyOwned.map((classId, index) => {
      const id = `vessel-${index + 1}`;
      legacyVesselMap[classId] = id;
      return [id, createVesselInstance(id, index + 1, classId, {
        ...raw?.boat,
        health: raw?.boat?.vesselHealth?.[classId]
      })];
    }));
  }
  if (!Object.keys(vessels).length) vessels = { ...base.boat.vessels };
  const vesselNumbers = Object.values(vessels).map((vessel) => vessel.number);
  const manualVesselId = vessels[raw?.boat?.vesselId]
    ? raw.boat.vesselId
    : legacyVesselMap[raw?.boat?.vesselId] || Object.keys(vessels)[0];
  const selectedVesselId = vessels[raw?.boat?.selectedVesselId]
    ? raw.boat.selectedVesselId
    : manualVesselId;
  const state = {
    ...base,
    ...raw,
    version: CURRENT_STATE_VERSION,
    preferences: {
      ...base.preferences,
      ...(raw?.preferences || {})
    },
    multiplayer: normalizeMultiplayerState(raw?.multiplayer),
    boat: {
      vesselId: manualVesselId,
      selectedVesselId,
      nextVesselSequence: Math.max(Number(raw?.boat?.nextVesselSequence || 0), Math.max(...vesselNumbers, 1) + 1),
      vessels
    },
    crew: {
      captain: { ...base.crew.captain, ...(raw?.crew?.captain || {}) },
      fisher: { ...base.crew.fisher, ...(raw?.crew?.fisher || {}) },
      engineer: { ...base.crew.engineer, ...(raw?.crew?.engineer || {}) }
    },
    facilities: {
      berth: { ...base.facilities.berth, ...(raw?.facilities?.berth || {}) },
      coldStorage: { ...base.facilities.coldStorage, ...(raw?.facilities?.coldStorage || {}) },
      market: { ...base.facilities.market, ...(raw?.facilities?.market || {}) },
      lighthouse: { ...base.facilities.lighthouse, ...(raw?.facilities?.lighthouse || {}) }
    },
    ports: Object.fromEntries(Object.keys({ ...base.ports, ...(raw?.ports || {}) }).map((portId) => [
      portId,
      { ...(base.ports[portId] || {}), ...(raw?.ports?.[portId] || {}) }
    ])),
    orderBoard: {
      ...base.orderBoard,
      ...(raw?.orderBoard || {})
    },
    autoVoyages: Object.fromEntries(Object.entries(raw?.autoVoyages || {}).flatMap(([savedVesselId, voyage]) => {
      const vesselId = vessels[savedVesselId] ? savedVesselId : legacyVesselMap[savedVesselId];
      return vesselId && voyage && typeof voyage === "object" && routes[voyage.routeId]
        ? [[vesselId, { ...voyage, vesselId }]]
        : [];
    }))
  };

  if (!SUPPORTED_INTERFACE_LANGUAGES.includes(state.preferences.language)) state.preferences.language = null;

  state.sailingPower = round(finiteNumber(state.sailingPower));
  state.coins = finiteNumber(state.coins, 0, { integer: true });
  state.totalDistance = finiteNumber(state.totalDistance, 0, { integer: true });
  state.totalTokens = finiteNumber(state.totalTokens, 0, { integer: true });
  state.tokenRemainder = finiteNumber(state.tokenRemainder, 0, {
    maximum: TOKENS_PER_SAILING_POWER - 1,
    integer: true
  });
  state.lastTokenCredit = finiteNumber(state.lastTokenCredit, 0, { integer: true });
  state.materials = finiteNumber(state.materials, 0, { integer: true });

  for (const role of Object.values(CREW_CATALOG)) {
    state.crew[role.id].level = finiteNumber(state.crew[role.id].level, 1, {
      minimum: 1,
      maximum: role.maxLevel,
      integer: true
    });
  }
  for (const facility of Object.values(FACILITY_CATALOG)) {
    state.facilities[facility.id].level = finiteNumber(state.facilities[facility.id].level, 1, {
      minimum: 1,
      maximum: facility.maxLevel,
      integer: true
    });
  }
  state.harborLevel = Object.values(state.facilities).reduce((sum, entry) => sum + levelOf(entry) - 1, 1);

  state.ports = Object.fromEntries(Object.entries(base.ports).map(([portId, basePort]) => {
    const savedPort = state.ports?.[portId] || {};
    const progress = finiteNumber(savedPort.progress, 0, { maximum: basePort.cost });
    return [portId, {
      ...basePort,
      progress,
      unlocked: portId === "driftwood" || Boolean(savedPort.unlocked) || progress >= basePort.cost
    }];
  }));

  for (const vessel of Object.values(state.boat.vessels)) {
    const maxHp = getVesselMaxHealth(state, vessel.id);
    vessel.health = Number.isFinite(Number(vessel.health)) ? Math.max(0, Math.min(maxHp, Math.round(vessel.health))) : maxHp;
  }
  if (state.activeVoyage) {
    const voyageVesselId = state.boat.vessels[state.activeVoyage.vesselId]
      ? state.activeVoyage.vesselId
      : legacyVesselMap[state.activeVoyage.vesselId] || state.boat.vesselId;
    state.activeVoyage = { ...state.activeVoyage, vesselId: voyageVesselId };
  }

  if (legacyFishInventory) {
    state.inventory = {
      ...base.inventory,
      silver_dart: Number(raw?.inventory?.silverfish || 0),
      coral_snapper: Number(raw?.inventory?.prawn || 0)
    };
    state.orders = generateOrderSet(state, 0);
    state.orderBoard.nextSequence = state.orders.length + 1;
    state.activeVoyage = null;
  } else {
    state.inventory = { ...base.inventory, ...(raw?.inventory || {}) };
  }
  state.inventory = Object.fromEntries(Object.keys(FISH_SPECIES).map((speciesId) => [
    speciesId,
    finiteNumber(state.inventory[speciesId], 0, { integer: true })
  ]));
  state.recentTelemetryIds = Array.isArray(state.recentTelemetryIds)
    ? state.recentTelemetryIds.map((id) => String(id).trim()).filter((id) => id && id.length <= 512).slice(-100)
    : [];
  const sessionEntries = /** @type {Array<[string, any]>} */ (Object.entries(state.sessions || {}));
  state.sessions = Object.fromEntries(
    sessionEntries
      .map(([sessionId, session]) => /** @type {[string, { id: string, status: string, updatedAt: number }]} */ ([String(sessionId).slice(0, 256), {
        id: String(session?.id || sessionId).slice(0, 256),
        status: ["idle", "running", "needs_input", "ready"].includes(session?.status) ? session.status : "idle",
        updatedAt: finiteNumber(session?.updatedAt, 0, { integer: true })
      }]))
      .sort(([, left], [, right]) => right.updatedAt - left.updatedAt)
      .slice(0, MAX_SESSION_RECORDS)
  );
  const validOrders = Array.isArray(state.orders) && state.orders.length === ORDER_TIERS.length && state.orders.every((order) => (
    order && typeof order.id === "string" && ORDER_TIERS.some((tier) => tier.id === order.tier) &&
    Object.keys(order.needs || {}).length > 0 && Object.entries(order.needs).every(([speciesId, quantity]) => (
      FISH_SPECIES[speciesId] && Number.isInteger(Number(quantity)) && Number(quantity) > 0
    )) &&
    Number.isFinite(Number(order.reward)) && Number(order.reward) > 0
  ));
  state.orderBoard.completedCount = Math.max(0, Math.floor(Number(state.orderBoard.completedCount || 0)));
  state.orderBoard.nextSequence = Math.max(1, Math.floor(Number(state.orderBoard.nextSequence || 1)));
  state.orderBoard.refreshedAt = Math.max(0, Number(state.orderBoard.refreshedAt || 0));
  state.orderBoard.freeRefreshAt = Math.max(0, Number(state.orderBoard.freeRefreshAt || 0));
  if (sourceVersion < 7 || !validOrders) {
    state.orders = generateOrderSet(state, state.orderBoard.nextSequence - 1);
    state.orderBoard.nextSequence += state.orders.length;
    state.orderBoard.refreshedAt = Date.now();
    state.orderBoard.freeRefreshAt = 0;
  }
  if (sourceVersion < 6 && state.activeVoyage) {
    for (const fish of state.activeVoyage.caughtFish || []) {
      state.inventory[fish.speciesId] = (state.inventory[fish.speciesId] || 0) + 1;
    }
    state.activeVoyage = null;
  }
  return state;
}

export function getDataDir() {
  const configured = process.env.TOKEN_HARBOR_DATA_DIR || process.env.PLUGIN_DATA;
  const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  return configured ? path.resolve(configured) : path.join(pluginRoot, ".token-harbor-data");
}

export function getStatePath() {
  return path.join(getDataDir(), "harbor-state.json");
}

export function getStateBackupPath() {
  return `${getStatePath()}.bak`;
}

function parseStateFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function quarantineStateFile(statePath) {
  const quarantinePath = `${statePath}.corrupt-${Date.now()}`;
  fs.renameSync(statePath, quarantinePath);
  return quarantinePath;
}

function assertSerializableState(value, location = "state", seen = new Set()) {
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error(`Refusing to persist a non-finite number at ${location}.`);
  }
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) throw new Error(`Refusing to persist a circular value at ${location}.`);
  seen.add(value);
  for (const [key, item] of Object.entries(value)) assertSerializableState(item, `${location}.${key}`, seen);
  seen.delete(value);
}

function syncFile(filePath) {
  const handle = fs.openSync(filePath, "r+");
  try {
    fs.fsyncSync(handle);
  } finally {
    fs.closeSync(handle);
  }
}

function replaceFile(sourcePath, destinationPath) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      fs.renameSync(sourcePath, destinationPath);
      return;
    } catch (error) {
      if (!["EACCES", "EBUSY", "EPERM"].includes(error?.code) || attempt >= 5) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 15 * 2 ** attempt);
    }
  }
}

function receiptIdentity(kind, state, receiptId) {
  const id = String(receiptId || "").trim();
  if (!id || id.length > 512) throw new Error("Receipt id is invalid.");
  if (kind === "action" && !ACTION_ID_PATTERN.test(id)) throw new Error("Action id is invalid.");
  const worldId = String(state.multiplayer?.world?.id || "local-world");
  const digest = createHash("sha256").update(`${kind}:${worldId}:${id}`).digest("hex");
  const directory = path.join(getDataDir(), "receipts", kind, digest.slice(0, 2));
  return { id, worldId, directory, filePath: path.join(directory, `${digest}.json`) };
}

function readReceipt(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function writeReceipt(receipt, status, revision = null) {
  fs.mkdirSync(receipt.directory, { recursive: true });
  const temporaryPath = `${receipt.filePath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify({
      kind: receipt.kind,
      worldId: receipt.worldId,
      receiptId: receipt.id,
      status,
      revision,
      updatedAt: new Date().toISOString()
    })}\n`, "utf8");
    syncFile(temporaryPath);
    replaceFile(temporaryPath, receipt.filePath);
  } finally {
    try {
      if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
    } catch {}
  }
}

function beginDurableReceipt(kind, state, receiptId, alreadyApplied = false) {
  if (!receiptId) return null;
  const identity = { kind, ...receiptIdentity(kind, state, receiptId) };
  const saved = readReceipt(identity.filePath);
  if (saved) {
    if (saved.worldId !== identity.worldId || saved.receiptId !== identity.id || saved.kind !== kind) {
      throw new Error("Receipt storage collision detected.");
    }
    if (saved.status === "committed" || alreadyApplied) {
      if (saved.status !== "committed") writeReceipt(identity, "committed", state.multiplayer?.revision ?? null);
      return { ...identity, duplicate: true, pending: false };
    }
  } else if (alreadyApplied) {
    writeReceipt(identity, "committed", state.multiplayer?.revision ?? null);
    return { ...identity, duplicate: true, pending: false };
  }
  writeReceipt(identity, "pending", state.multiplayer?.revision ?? null);
  return { ...identity, duplicate: false, pending: true };
}

function commitDurableReceipt(receipt, state) {
  if (receipt?.pending) writeReceipt(receipt, "committed", state.multiplayer?.revision ?? null);
}

function abortDurableReceipt(receipt) {
  if (!receipt?.pending) return;
  try {
    fs.unlinkSync(receipt.filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export function hasDurableActionReceipt(state, actionId) {
  if (!actionId) return false;
  if (hasProcessedAction(state.multiplayer, actionId)) return true;
  const identity = receiptIdentity("action", state, actionId);
  const saved = readReceipt(identity.filePath);
  return Boolean(saved && saved.status === "committed" && saved.worldId === identity.worldId && saved.receiptId === identity.id);
}

export function readState() {
  const statePath = getStatePath();
  if (!fs.existsSync(statePath)) {
    const state = initialState();
    return writeState(state, { backupCurrent: false });
  }
  try {
    const raw = parseStateFile(statePath);
    const state = normalizeState(raw);
    if (raw.version !== CURRENT_STATE_VERSION) writeState(state);
    return state;
  } catch (primaryError) {
    const backupPath = getStateBackupPath();
    let backup = null;
    if (fs.existsSync(backupPath)) {
      try {
        backup = normalizeState(parseStateFile(backupPath));
      } catch {
        quarantineStateFile(backupPath);
        backup = null;
      }
    }
    if (backup) {
      const quarantinedPath = quarantineStateFile(statePath);
      backup.recovery = {
        code: "save_recovered_from_backup",
        at: new Date().toISOString(),
        quarantinedFile: path.basename(quarantinedPath)
      };
      return writeState(backup, { backupCurrent: false });
    }
    const quarantinedPath = quarantineStateFile(statePath);
    const state = initialState();
    state.recovery = {
      code: "save_reset_after_corruption",
      at: new Date().toISOString(),
      quarantinedFile: path.basename(quarantinedPath),
      reason: primaryError instanceof Error ? primaryError.message : "State file could not be read."
    };
    return writeState(state, { backupCurrent: false });
  }
}

export function writeState(state, options = {}) {
  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  state.updatedAt = new Date().toISOString();
  assertSerializableState(state);
  const statePath = getStatePath();
  const temporaryPath = `${statePath}.${process.pid}.tmp`;
  const backupPath = getStateBackupPath();
  const backupTemporaryPath = `${backupPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
    syncFile(temporaryPath);
    if (options.backupCurrent !== false && fs.existsSync(statePath)) {
      parseStateFile(statePath);
      fs.copyFileSync(statePath, backupTemporaryPath);
      syncFile(backupTemporaryPath);
      replaceFile(backupTemporaryPath, backupPath);
    }
    replaceFile(temporaryPath, statePath);
  } finally {
    for (const filePath of [temporaryPath, backupTemporaryPath]) {
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
    }
  }
  return state;
}

export function summarizeAgents(state) {
  const sessions = Object.values(state.sessions || {});
  return {
    running: sessions.filter((session) => session.status === "running").length,
    needsInput: sessions.filter((session) => session.status === "needs_input").length,
    ready: sessions.filter((session) => session.status === "ready").length
  };
}

export function voyageProgress(voyage, now = Date.now()) {
  if (!voyage) return 0;
  return Math.max(0, Math.min(1, voyageElapsedMs(voyage, now) / voyage.durationMs));
}

function voyageElapsedMs(voyage, now = Date.now()) {
  const pausedNow = voyage.pausedAt ? Math.max(0, now - voyage.pausedAt) : 0;
  return Math.max(0, now - voyage.startedAt - (voyage.pausedMs || 0) - pausedNow);
}

export function autoVoyageProgress(voyage, now = Date.now()) {
  if (!voyage) return 0;
  return Math.max(0, Math.min(1, (now - voyage.startedAt) / voyage.durationMs));
}

function deterministicPirateRoll(voyageId, attackSequence) {
  return seededRandom(`${voyageId}-pirate-attack-${attackSequence}`)();
}

function damageVoyageWithPirate(voyage, pirate, attackSequence, randomOverride) {
  voyage.shipHp = Math.max(0, voyage.shipHp - pirate.shipDamage);
  if (voyage.caughtFish.length) {
    const randomValue = typeof randomOverride === "function"
      ? randomOverride()
      : deterministicPirateRoll(voyage.id, attackSequence);
    const roll = Math.max(0, Math.min(0.999999, Number(randomValue) || 0));
    const stolenIndex = Math.floor(roll * voyage.caughtFish.length);
    voyage.caughtFish.splice(stolenIndex, 1);
    pirate.stolenFish += 1;
  }
  if (voyage.shipHp === 0) {
    voyage.wrecked = true;
    voyage.wreckReason = "pirates";
    voyage.caughtFish = [];
  }
}

export function reconcileTimedState(state, now = Date.now(), options = {}) {
  let changed = false;
  const voyage = state.activeVoyage;
  if (voyage && !voyage.wrecked) {
    const elapsed = voyageElapsedMs(voyage, now);
    const progress = Math.max(0, Math.min(1, elapsed / voyage.durationMs));
    const hurricane = voyage.threat?.hurricane;
    const pirate = voyage.threat?.pirate;

    if (hurricane?.status === "waiting" && progress >= hurricane.appearsAtProgress) {
      hurricane.status = "triggered";
      voyage.shipHp = 0;
      voyage.wrecked = true;
      voyage.wreckReason = "hurricane";
      voyage.caughtFish = [];
      changed = true;
      recordDomainEvent(state, {
        type: "game.hurricane_triggered",
        actorId: state.multiplayer.localPlayerId,
        payload: { voyageId: voyage.id, routeId: voyage.routeId }
      });
    } else if (pirate && pirate.status !== "defeated") {
      const appearanceElapsed = pirate.appearsAtProgress * voyage.durationMs;
      const attackCutoff = Math.min(elapsed, voyage.durationMs * 0.995);
      if (attackCutoff >= appearanceElapsed) {
        if (pirate.status === "waiting") {
          pirate.status = "active";
          pirate.lastAttackElapsedMs = appearanceElapsed;
          pirate.lastAttackAt = now - Math.max(0, elapsed - appearanceElapsed);
          changed = true;
          recordDomainEvent(state, {
            type: "game.pirate_appeared",
            actorId: state.multiplayer.localPlayerId,
            payload: { voyageId: voyage.id, routeId: voyage.routeId, tier: pirate.tier }
          });
        }

        let lastAttackElapsed = Number(pirate.lastAttackElapsedMs);
        if (!Number.isFinite(lastAttackElapsed)) {
          const lastAttackAt = Number(pirate.lastAttackAt);
          lastAttackElapsed = Number.isFinite(lastAttackAt)
            ? Math.max(appearanceElapsed, elapsed - Math.max(0, now - lastAttackAt))
            : appearanceElapsed;
        }
        const dueAttacks = Math.max(0, Math.floor((attackCutoff - lastAttackElapsed) / pirate.attackIntervalMs));
        let appliedAttacks = 0;
        let stolenFish = 0;
        for (let index = 0; index < dueAttacks && !voyage.wrecked && pirate.status !== "defeated"; index += 1) {
          pirate.attackSequence = finiteNumber(pirate.attackSequence, 0, { integer: true }) + 1;
          const beforeCatchCount = voyage.caughtFish.length;
          damageVoyageWithPirate(voyage, pirate, pirate.attackSequence, options.random);
          if (voyage.caughtFish.length < beforeCatchCount) stolenFish += 1;
          appliedAttacks += 1;
        }
        if (appliedAttacks) {
          pirate.lastAttackElapsedMs = lastAttackElapsed + appliedAttacks * pirate.attackIntervalMs;
          pirate.lastAttackAt = now - Math.max(0, elapsed - pirate.lastAttackElapsedMs);
          changed = true;
          recordDomainEvent(state, {
            type: "game.pirate_attacks_resolved",
            actorId: state.multiplayer.localPlayerId,
            payload: {
              voyageId: voyage.id,
              routeId: voyage.routeId,
              attacks: appliedAttacks,
              stolenFish,
              shipHp: voyage.shipHp
            }
          });
        }
      }
    }

    if (!voyage.wrecked && progress >= 0.995 && !voyage.ready) {
      voyage.ready = true;
      changed = true;
      recordDomainEvent(state, {
        type: "game.voyage_ready",
        actorId: state.multiplayer.localPlayerId,
        payload: { voyageId: voyage.id, routeId: voyage.routeId }
      });
    }
  }

  for (const autoVoyage of Object.values(state.autoVoyages || {})) {
    if (!autoVoyage.ready && autoVoyageProgress(autoVoyage, now) >= 0.995) {
      autoVoyage.ready = true;
      changed = true;
      recordDomainEvent(state, {
        type: "game.auto_voyage_ready",
        actorId: state.multiplayer.localPlayerId,
        payload: { voyageId: autoVoyage.id, routeId: autoVoyage.routeId, vesselId: autoVoyage.vesselId }
      });
    }
  }
  return changed;
}

function round(value, precision = 1) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function seededRandom(seed) {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function getAccessibleOrderSpecies(state) {
  const effects = getProgressionEffects(state);
  const ownedRanks = Object.values(state.boat?.vessels || {})
    .map((vessel) => VESSEL_CATALOG[vessel.classId]?.rank || 0);
  const vesselRank = Math.max(1, ...ownedRanks);
  const accessibleRoutes = new Set();
  for (const route of Object.values(routes)) {
    const portReady = !route.requiredPort || state.ports?.[route.requiredPort]?.unlocked;
    const lighthouseReady = effects.lighthouseLevel >= route.requiredLighthouse;
    if (!portReady || !lighthouseReady || vesselRank < route.requiredVesselRank) continue;
    accessibleRoutes.add(route.id);
  }
  return Object.values(FISH_SPECIES).filter((fish) => fish.routes.some((routeId) => accessibleRoutes.has(routeId)));
}

export function generateOrder(state, tierIndex, sequence) {
  const tier = ORDER_TIERS[tierIndex] || ORDER_TIERS[0];
  const species = getAccessibleOrderSpecies(state);
  if (!species.length) throw new Error("No fish are available for harbor orders.");
  const accessKey = species.map((fish) => fish.id).join("-");
  const worldId = state.multiplayer?.world?.id || "local-harbor";
  const random = seededRandom(`${worldId}-${sequence}-${tier.id}-${accessKey}`);
  const candidates = [...species];
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  const selected = candidates.slice(0, Math.min(tier.itemTypes, candidates.length));
  const needs = Object.fromEntries(selected.map((fish) => [
    fish.id,
    tier.minCount + Math.floor(random() * (tier.maxCount - tier.minCount + 1))
  ]));
  const cargoValue = Object.entries(needs).reduce((sum, [speciesId, count]) => sum + FISH_SPECIES[speciesId].value * count, 0);
  const templateId = tier.clients[Math.floor(random() * tier.clients.length)];
  const title = {
    "morning-market": "Morning Market",
    "dockside-cafe": "Dockside Cafe",
    "reef-banquet": "Reef Banquet",
    "harbor-hotel": "Harbor Hotel",
    "collector-cooler": "Deep-Sea Collection",
    "ocean-research": "Ocean Research"
  }[templateId];
  return {
    id: `order-${sequence}-${tier.id}`,
    templateId,
    title,
    tier: tier.id,
    needs,
    reward: Math.max(80, Math.round((cargoValue * tier.rewardMultiplier) / 10) * 10),
    createdAt: Date.now()
  };
}

export function generateOrderSet(state, startSequence = 0) {
  return ORDER_TIERS.map((_, tierIndex) => generateOrder(state, tierIndex, startSequence + tierIndex + 1));
}

function chooseRarity(weights, random) {
  const roll = random() * Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    cursor += weight;
    if (roll < cursor) return rarity;
  }
  return "common";
}

function boostedRarityWeights(weights, bonus = 0) {
  const multipliers = {
    common: Math.max(0.25, 1 - bonus),
    uncommon: Math.max(0.5, 1 - bonus * 0.35),
    rare: 1 + bonus,
    epic: 1 + bonus * 1.5,
    legendary: 1 + bonus * 2
  };
  return Object.fromEntries(Object.entries(weights).map(([rarity, weight]) => [rarity, weight * multipliers[rarity]]));
}

function chooseFishBehavior(rarityRank, random) {
  const roll = random();
  const profiles = [
    [[0.28, "return"], [1, "pass"]],
    [[0.36, "return"], [0.48, "turn"], [1, "pass"]],
    [[0.2, "return"], [0.65, "turn"], [0.83, "escape"], [1, "pass"]],
    [[0.1, "return"], [0.53, "turn"], [0.91, "escape"], [1, "pass"]],
    [[0.03, "return"], [0.38, "turn"], [0.98, "escape"], [1, "pass"]]
  ][Math.max(0, Math.min(4, rarityRank))];
  return profiles.find(([threshold]) => roll < threshold)?.[1] || "pass";
}

export function generateVoyageEncounters(routeId, seed = `${routeId}-${Date.now()}`, modifiers = {}) {
  const route = routes[routeId];
  if (!route) throw new Error("Unknown route.");
  const random = seededRandom(seed);
  const species = Object.values(FISH_SPECIES).filter((fish) => fish.routes.includes(routeId));
  const encounterCount = route.encounterCount + Math.max(0, Math.floor(Number(modifiers.encounterBonus || 0)));
  const rarityWeights = boostedRarityWeights(route.rarityWeights, Math.max(0, Number(modifiers.rarityBonus || 0)));
  return Array.from({ length: encounterCount }, (_, index) => {
    const rarity = chooseRarity(rarityWeights, random);
    const candidates = species.filter((fish) => fish.rarity === rarity);
    const fish = candidates[Math.floor(random() * candidates.length)] || species[0];
    const rarityRank = ["common", "uncommon", "rare", "epic", "legendary"].indexOf(fish.rarity);
    const dashProfiles = [
      ["a", "b"],
      ["a", "b", "c"],
      ["b", "c", "frenzy"],
      ["c", "frenzy"],
      ["frenzy"]
    ][Math.max(0, rarityRank)];
    return {
      id: `${seed}-fish-${index + 1}`,
      speciesId: fish.id,
      hp: fish.hp,
      maxHp: fish.hp,
      status: "active",
      lane: round(23 + random() * 55),
      direction: random() > 0.5 ? "right" : "left",
      dashProfile: dashProfiles[Math.floor(random() * dashProfiles.length)],
      behaviorProfile: chooseFishBehavior(rarityRank, random),
      swimSeconds: round(fish.swimSeconds * (0.88 + random() * 0.24)),
      delaySeconds: round(-random() * fish.swimSeconds)
    };
  });
}

export function generateVoyageThreat(routeId, seed = `${routeId}-${Date.now()}`) {
  const route = routes[routeId];
  const pirateSpec = route ? PIRATE_PORT_THREATS[route.portId] : null;
  if (!pirateSpec) throw new Error("Unknown voyage threat route.");
  const random = seededRandom(`${seed}-threat`);
  const appearsAtProgress = round(0.18 + random() * 0.34, 3);
  if (random() < HURRICANE_CHANCE) {
    return {
      hurricane: { type: "hurricane", status: "waiting", appearsAtProgress },
      pirate: null
    };
  }
  return {
    hurricane: null,
    pirate: {
      ...pirateSpec,
      hp: pirateSpec.hp,
      maxHp: pirateSpec.hp,
      status: "waiting",
      appearsAtProgress,
      lastAttackAt: null,
      lastAttackElapsedMs: null,
      attackSequence: 0,
      stolenFish: 0
    }
  };
}

function fitFishToCapacity(fish, capacity) {
  const slots = finiteNumber(capacity?.slots, 0, { integer: true });
  const weight = finiteNumber(capacity?.weight, 0);
  const accepted = [];
  let acceptedWeight = 0;
  for (const item of fish) {
    const itemWeight = finiteNumber(item?.weight, 0);
    if (accepted.length >= slots || round(acceptedWeight + itemWeight) > weight) continue;
    accepted.push(item);
    acceptedWeight += itemWeight;
  }
  return accepted;
}

export function generateAutomaticRewards(routeId, vesselId, seed = `${routeId}-${vesselId}-${Date.now()}`, modifiers = {}) {
  const route = routes[routeId];
  const vessel = VESSEL_CATALOG[vesselId];
  if (!route || !vessel) throw new Error("Unknown automated voyage.");
  const random = seededRandom(seed);
  const rarityWeights = boostedRarityWeights(route.rarityWeights, Math.max(0, Number(modifiers.rarityBonus || 0)) * 0.5);
  rarityWeights.legendary = 0;
  const species = Object.values(FISH_SPECIES).filter((fish) => fish.rarity !== "legendary" && fish.routes.includes(routeId));
  const manualCount = route.encounterCount + vessel.encounterBonus + Math.max(0, Math.floor(Number(modifiers.crewEncounterBonus || 0)));
  const rewardCount = Math.max(1, Math.round(manualCount * AUTOMATED_FLEET_EFFICIENCY));
  const generatedFish = Array.from({ length: rewardCount }, () => {
    const rarity = chooseRarity(rarityWeights, random);
    const candidates = species.filter((item) => item.rarity === rarity);
    const catchItem = candidates[Math.floor(random() * candidates.length)] || species[0];
    return {
      speciesId: catchItem.id,
      name: catchItem.name,
      rarity: catchItem.rarity,
      weight: catchItem.weight,
      value: catchItem.value
    };
  });
  const capacity = modifiers.boatCapacity || { slots: vessel.slots, weight: vessel.weight };
  const fish = fitFishToCapacity(generatedFish, capacity);
  return {
    efficiency: AUTOMATED_FLEET_EFFICIENCY,
    fish,
    coins: Math.max(4, Math.round(route.distance * (0.35 + vessel.rank * 0.1))),
    materials: Math.max(1, Math.round((route.requiredLighthouse + vessel.rank) * 0.5))
  };
}

function vesselInstance(state, vesselId = state.boat?.vesselId) {
  return state.boat?.vessels?.[vesselId] || Object.values(state.boat?.vessels || {})[0] || createVesselInstance("vessel-1", 1);
}

function vesselView(state, vesselId = state.boat?.vesselId) {
  const instance = vesselInstance(state, vesselId);
  const vesselClass = VESSEL_CATALOG[instance.classId] || VESSEL_CATALOG.skiff;
  return { ...vesselClass, id: instance.id, classId: vesselClass.id, number: instance.number, equipment: instance.equipment };
}

export function getVesselMaxHealth(state, vesselId = state.boat?.vesselId) {
  const vessel = vesselView(state, vesselId);
  const hullLevel = Math.max(1, Number(vessel.equipment?.hull || 1));
  return vessel.baseHp + (hullLevel - 1) * 15;
}

export function getVesselHealth(state, vesselId = state.boat?.vesselId) {
  const maxHp = getVesselMaxHealth(state, vesselId);
  const savedHp = Number(vesselInstance(state, vesselId).health);
  return Number.isFinite(savedHp) ? Math.max(0, Math.min(maxHp, Math.round(savedHp))) : maxHp;
}

export function vesselRepairCost(state, vesselId = state.boat?.vesselId) {
  return vesselRepairQuote(state, vesselId).coins;
}

export function vesselRepairQuote(state, vesselId = state.boat?.vesselId) {
  const vessel = vesselView(state, vesselId);
  const baseCoins = Math.max(0, (getVesselMaxHealth(state, vesselId) - getVesselHealth(state, vesselId)) * vessel.rank * 3);
  const materials = Math.min(
    finiteNumber(state.materials, 0, { integer: true }),
    Math.floor(baseCoins / MATERIAL_REPAIR_VALUE)
  );
  return { baseCoins, materials, coins: Math.max(0, baseCoins - materials * MATERIAL_REPAIR_VALUE) };
}

function voyageDurationMultiplierForVessel(state, vessel) {
  const engineLevel = Math.max(1, Number(vessel.equipment?.engine || 1));
  const engineerLevel = levelOf(state.crew?.engineer);
  const { voyageBonus } = lighthouseBonuses(levelOf(state.facilities?.lighthouse));
  return Math.max(
    0.12,
    round(vessel.durationMultiplier * (1 / (1 + (engineLevel - 1) * 0.06)) * (1 / (1 + (engineerLevel - 1) * 0.04)) * (1 - voyageBonus), 3)
  );
}

export function getBoatCapacity(state, vesselId = state.boat?.vesselId) {
  const vessel = vesselView(state, vesselId);
  const hullLevel = Math.max(1, Number(vessel.equipment?.hull || 1));
  const coolerLevel = Math.max(1, Number(vessel.equipment?.cooler || 1));
  return {
    slots: vessel.slots + (coolerLevel - 1) * 2,
    weight: vessel.weight + (hullLevel - 1) * 4
  };
}

export function getVoyageCargo(voyage) {
  const fish = voyage?.caughtFish || [];
  return {
    slots: fish.length,
    weight: round(fish.reduce((sum, item) => sum + Number(item.weight || 0), 0)),
    fish
  };
}

function levelOf(entry) {
  return Math.max(1, Math.floor(Number(entry?.level || 1)));
}

export function progressionUpgradeCost(baseCost, level) {
  const normalizedLevel = Math.max(1, Number(level));
  const completedBands = Math.floor((normalizedLevel - 1) / PROGRESSION_LEVELS_PER_PORT);
  const bandMultiplier = 1 + completedBands * 0.6;
  return Math.round((Number(baseCost) * normalizedLevel ** 1.55 * bandMultiplier) / 50) * 50;
}

export function progressionPortCount(state) {
  return Math.max(1, Object.values(state.ports || {}).filter((port) => port?.unlocked).length);
}

export function progressionLevelCap(state, category, item) {
  const portCount = progressionPortCount(state);
  if (category === "facility" && item.id === "lighthouse") return Math.min(item.maxLevel, portCount + 1);
  if (category === "facility" && item.id === "berth") {
    return Math.min(item.maxLevel, portCount * PROGRESSION_LEVELS_PER_PORT);
  }
  return Math.min(item.maxLevel, portCount * PROGRESSION_LEVELS_PER_PORT);
}

function lighthouseBonuses(level) {
  if (level < 4) return { rarityBonus: 0, voyageBonus: 0 };
  return {
    rarityBonus: round(0.12 + (level - 4) * 0.03, 2),
    voyageBonus: round(0.1 + (level - 4) * 0.025, 3)
  };
}

function progressionItemView(state, category, item, level) {
  const levelCap = progressionLevelCap(state, category, item);
  const worldCapped = level < item.maxLevel && level >= levelCap;
  return {
    availableMaxLevel: Math.max(level, levelCap),
    worldCapped,
    nextCost: level < item.maxLevel && !worldCapped ? progressionUpgradeCost(item.baseCost, level) : null
  };
}

export function getProgressionEffects(state, vesselId = state.boat?.vesselId) {
  const vessel = vesselView(state, vesselId);
  const netLevel = Math.max(1, Number(vessel.equipment?.net || 1));
  const sonarLevel = Math.max(1, Number(vessel.equipment?.sonar || 1));
  const cannonLevel = Math.max(1, Number(vessel.equipment?.cannon || 1));
  const captainLevel = levelOf(state.crew?.captain);
  const fisherLevel = levelOf(state.crew?.fisher);
  const berthLevel = levelOf(state.facilities?.berth);
  const coldStorageLevel = levelOf(state.facilities?.coldStorage);
  const marketLevel = levelOf(state.facilities?.market);
  const lighthouseLevel = levelOf(state.facilities?.lighthouse);
  const { rarityBonus: beaconRarityBonus, voyageBonus: beaconVoyageBonus } = lighthouseBonuses(lighthouseLevel);
  return {
    vessel,
    vesselRank: vessel.rank,
    berthCapacity: berthLevel,
    warehouseCapacity: coldStorageLevel * 20,
    marketMultiplier: round(1 + (marketLevel - 1) * 0.1, 2),
    lighthouseLevel,
    voyageDurationMultiplier: voyageDurationMultiplierForVessel(state, vessel),
    netDamage: netLevel,
    cannonDamage: cannonDamageForLevel(cannonLevel, vessel.rank),
    rarityBonus: round((sonarLevel - 1) * 0.06 + (captainLevel - 1) * 0.03 + beaconRarityBonus, 2),
    encounterBonus: vessel.encounterBonus + fisherLevel - 1,
    beaconRarityBonus,
    beaconVoyageBonus,
    boatCapacity: getBoatCapacity(state, vessel.id)
  };
}

function crewRarity(level) {
  if (level >= 9) return RARITIES.legendary;
  if (level >= 7) return RARITIES.epic;
  if (level >= 5) return RARITIES.rare;
  if (level >= 3) return RARITIES.uncommon;
  return RARITIES.common;
}

export function getProgressionView(state) {
  const effects = getProgressionEffects(state);
  const selectedVesselId = state.boat.selectedVesselId || state.boat.vesselId;
  const selectedEffects = getProgressionEffects(state, selectedVesselId);
  const fleet = Object.values(state.boat.vessels || {}).sort((left, right) => left.number - right.number);
  const inventoryCount = Object.values(state.inventory || {}).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
  return {
    effects: { ...effects, inventoryCount },
    selectedEffects,
    selectedVesselId,
    vessels: fleet.map((instance) => {
      const vessel = vesselView(state, instance.id);
      const nextClass = VESSEL_CLASSES.find((candidate) => candidate.rank === vessel.rank + 1) || null;
      let upgradeLockedReason = null;
      if (state.activeVoyage?.vesselId === vessel.id || state.autoVoyages?.[vessel.id]) upgradeLockedReason = "Vessel is at sea";
      else if (nextClass && effects.lighthouseLevel < nextClass.requiredLighthouse) upgradeLockedReason = `Lighthouse LV.${nextClass.requiredLighthouse} required`;
      const active = state.boat.vesselId === vessel.id;
      const assignment = active ? "manual" : state.autoVoyages?.[vessel.id] ? "automatic" : "idle";
      const maxHp = getVesselMaxHealth(state, vessel.id);
      return {
        ...vessel,
        active,
        selected: selectedVesselId === vessel.id,
        assignment,
        nextClass,
        upgradeLockedReason,
        upgradeCost: nextClass?.cost ?? null,
        hp: getVesselHealth(state, vessel.id),
        maxHp,
        repairCost: vesselRepairCost(state, vessel.id),
        repairMaterials: vesselRepairQuote(state, vessel.id).materials
      };
    }),
    fleetCapacity: effects.berthCapacity,
    canBuildVessel: fleet.length < effects.berthCapacity,
    newVesselCost: NEW_VESSEL_COST,
    equipment: Object.values(EQUIPMENT_CATALOG).map((item) => {
      const level = Math.max(1, Number(selectedEffects.vessel.equipment?.[item.id] || 1));
      return { ...item, level, ...progressionItemView(state, "equipment", item, level) };
    }),
    crew: Object.values(CREW_CATALOG).map((role) => {
      const level = levelOf(state.crew?.[role.id]);
      return { ...role, level, rarity: crewRarity(level), ...progressionItemView(state, "crew", role, level) };
    }),
    facilities: Object.values(FACILITY_CATALOG).map((facility) => {
      const level = levelOf(state.facilities?.[facility.id]);
      const values = {
        berth: `${effects.berthCapacity} berths`,
        coldStorage: `${effects.warehouseCapacity} fish capacity`,
        market: `Sale price ×${effects.marketMultiplier}`,
        lighthouse: `Sea tier ${effects.lighthouseLevel}`
      };
      return { ...facility, level, value: values[facility.id], ...progressionItemView(state, "facility", facility, level) };
    })
  };
}

function pauseVoyage(state, reason) {
  if (state.activeVoyage && !state.activeVoyage.pausedAt) {
    state.activeVoyage.pausedAt = Date.now();
    state.activeVoyage.pauseReason = reason;
  }
}

function resumeVoyage(state) {
  const voyage = state.activeVoyage;
  if (!voyage?.pausedAt || voyage.pauseReason !== "agent") return;
  voyage.pausedMs = (voyage.pausedMs || 0) + Date.now() - voyage.pausedAt;
  voyage.pausedAt = null;
  voyage.pauseReason = null;
}

function synchronizeVoyageWithSessions(state) {
  const sessions = Object.values(state.sessions || {});
  if (sessions.some((session) => session.status === "needs_input")) {
    pauseVoyage(state, "agent");
    return;
  }
  if (sessions.some((session) => session.status === "running")) {
    resumeVoyage(state);
    return;
  }
  if (sessions.some((session) => session.status === "ready")) pauseVoyage(state, "agent");
}

function pruneSessions(state) {
  state.sessions = Object.fromEntries(
    Object.entries(state.sessions || {})
      .sort(([, left], [, right]) => Number(right.updatedAt || 0) - Number(left.updatedAt || 0))
      .slice(0, MAX_SESSION_RECORDS)
  );
}

function assertRouteAvailable(state, route, vessel) {
  const lighthouseLevel = levelOf(state.facilities?.lighthouse);
  if (route.requiredPort && !state.ports[route.requiredPort]?.unlocked) throw new Error("Open the required port first.");
  if (lighthouseLevel < route.requiredLighthouse) throw new Error(`Lighthouse LV.${route.requiredLighthouse} required.`);
  if (vessel.rank < route.requiredVesselRank) throw new Error(`Rank ${route.requiredVesselRank} vessel required.`);
}

function settleManualVoyage(state, progress) {
  const voyage = state.activeVoyage;
  if (!voyage) return;
  const route = routes[voyage.routeId];
  if (!voyage.wrecked) {
    const storedFish = Object.values(state.inventory || {}).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
    const warehouseCapacity = getProgressionEffects(state).warehouseCapacity;
    if (storedFish + (voyage.caughtFish || []).length > warehouseCapacity) {
      throw new Error("The harbor cold store is full.");
    }
    for (const fish of voyage.caughtFish || []) {
      state.inventory[fish.speciesId] = (state.inventory[fish.speciesId] || 0) + 1;
    }
  }
  const vessel = state.boat.vessels[voyage.vesselId || state.boat.vesselId];
  if (vessel) vessel.health = Math.max(0, Math.round(Number(voyage.shipHp || 0)));
  state.totalDistance += Math.round(route.distance * Math.max(0, Math.min(1, progress)));
  state.activeVoyage = null;
}

export function applyAction(state, action, context = {}) {
  if (!action || typeof action !== "object" || Array.isArray(action) || typeof action.type !== "string") {
    throw new Error("Harbor action must be an object with a type.");
  }
  const actionId = String(context.actionId || "").trim();
  const receipt = beginDurableReceipt(
    "action",
    state,
    actionId,
    Boolean(actionId && hasProcessedAction(state.multiplayer, actionId))
  );
  if (receipt?.duplicate) return state;
  const actorId = ensureActor(state.multiplayer, context.actorId);
  let persisted = false;

  try {
    reconcileTimedState(state, Date.now(), { random: context.random });
    switch (action.type) {
    case "set_language": {
      if (!SUPPORTED_INTERFACE_LANGUAGES.includes(action.language)) throw new Error("Unsupported interface language.");
      state.preferences.language = action.language;
      break;
    }
    case "acknowledge_recovery": {
      delete state.recovery;
      break;
    }
    case "allocate_port": {
      const port = state.ports[action.portId];
      const amount = round(Number(action.amount));
      if (!port || port.unlocked) throw new Error("This port cannot receive Sail Power.");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Choose a valid Sail Power amount.");
      const remaining = round(port.cost - port.progress);
      const applied = Math.min(amount, remaining, state.sailingPower);
      if (applied <= 0) throw new Error("Not enough Sail Power.");
      state.sailingPower = round(state.sailingPower - applied);
      port.progress = round(port.progress + applied);
      if (port.progress >= port.cost) port.unlocked = true;
      break;
    }
    case "launch_voyage": {
      if (state.activeVoyage) throw new Error("A voyage is already active.");
      const route = routes[action.routeId];
      if (!route) throw new Error("Unknown route.");
      const progression = getProgressionEffects(state);
      assertRouteAvailable(state, route, progression.vessel);
      const maxShipHp = getVesselMaxHealth(state, progression.vessel.id);
      const currentShipHp = getVesselHealth(state, progression.vessel.id);
      if (currentShipHp < maxShipHp) throw new Error("Repair this vessel before sailing.");
      if (state.sailingPower < route.cost) throw new Error("Not enough Sail Power.");
      state.sailingPower = round(state.sailingPower - route.cost);
      const voyageId = `${route.id}-${Date.now()}`;
      state.activeVoyage = {
        id: voyageId,
        routeId: route.id,
        routeName: route.name,
        vesselId: progression.vessel.id,
        startedAt: Date.now(),
        durationMs: Math.round(route.durationMs * progression.voyageDurationMultiplier),
        netDamage: progression.netDamage,
        cannonDamage: progression.cannonDamage,
        boatCapacity: { ...progression.boatCapacity },
        shipHp: currentShipHp,
        maxShipHp,
        wrecked: false,
         wreckReason: null,
         ready: false,
        pausedAt: null,
        pausedMs: 0,
        pauseReason: null,
        encounters: generateVoyageEncounters(route.id, voyageId, progression),
        caughtFish: [],
        threat: generateVoyageThreat(route.id, voyageId)
      };
      break;
    }
    case "hit_fish": {
      const voyage = state.activeVoyage;
      if (!voyage) throw new Error("No voyage is active.");
      if (voyage.wrecked) throw new Error("The vessel is wrecked.");
      if (voyage.pausedAt) throw new Error("Fishing is unavailable while the voyage is paused.");
      const encounter = voyage.encounters?.find((item) => item.id === action.encounterId);
      if (!encounter || encounter.status !== "active") break;
      const damage = Math.max(1, Number(voyage.netDamage || 1));
      if (encounter.hp > damage) {
        encounter.hp -= damage;
        break;
      }

      const species = FISH_SPECIES[encounter.speciesId];
      const capacity = voyage.boatCapacity || getBoatCapacity(state);
      const cargo = getVoyageCargo(voyage);
      const progression = getProgressionEffects(state);
      const storedFish = Object.values(state.inventory || {}).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
      if (storedFish + cargo.slots >= progression.warehouseCapacity) throw new Error("The harbor cold store is full.");
      if (cargo.slots >= capacity.slots) throw new Error("The cooler is full.");
      if (round(cargo.weight + species.weight) > capacity.weight) throw new Error("The hold would be overweight.");
      encounter.hp = 0;
      encounter.status = "caught";
      voyage.caughtFish.push({
        encounterId: encounter.id,
        speciesId: species.id,
        name: species.name,
        rarity: species.rarity,
        weight: species.weight,
        value: species.value
      });
      break;
    }
    case "hit_pirate": {
      const voyage = state.activeVoyage;
      const pirate = voyage?.threat?.pirate;
      if (!voyage || !pirate) throw new Error("No pirate threat is active.");
      if (voyage.pausedAt) throw new Error("Combat is unavailable while the voyage is paused.");
      if (voyage.wrecked) throw new Error("The vessel is wrecked.");
      if (voyageProgress(voyage) >= 0.995 || voyageProgress(voyage) < pirate.appearsAtProgress || pirate.status === "defeated") break;
      pirate.status = "active";
      pirate.lastAttackAt ||= Date.now();
      pirate.hp = Math.max(0, pirate.hp - Math.max(1, Number(voyage.cannonDamage || 1)));
      if (pirate.hp === 0) pirate.status = "defeated";
      break;
    }
    case "toggle_voyage_pause": {
      const voyage = state.activeVoyage;
      if (!voyage) break;
      if (voyage.pausedAt) {
        voyage.pausedMs += Date.now() - voyage.pausedAt;
        voyage.pausedAt = null;
        voyage.pauseReason = null;
      } else {
        voyage.pausedAt = Date.now();
        voyage.pauseReason = "manual";
      }
      break;
    }
    case "complete_voyage": {
      const voyage = state.activeVoyage;
      if (!voyage) break;
      if (voyageProgress(voyage) < 0.995) throw new Error("The voyage is still underway.");
      settleManualVoyage(state, 1);
      break;
    }
    case "return_voyage": {
      const voyage = state.activeVoyage;
      if (!voyage) break;
      settleManualVoyage(state, voyageProgress(voyage));
      break;
    }
    case "dispatch_auto_voyage": {
      const instance = state.boat.vessels[action.vesselId];
      const vessel = instance ? vesselView(state, instance.id) : null;
      const route = routes[action.routeId];
      if (!vessel) throw new Error("This vessel is not in your fleet.");
      if (vessel.id === state.boat.vesselId) throw new Error("The manual vessel cannot join an automated voyage.");
      if (state.autoVoyages[vessel.id]) throw new Error("This vessel is already on an automated voyage.");
      if (!route) throw new Error("Unknown route.");
      assertRouteAvailable(state, route, vessel);
      if (getVesselHealth(state, vessel.id) < getVesselMaxHealth(state, vessel.id)) throw new Error("Repair this vessel before sailing.");
      if (state.sailingPower < route.cost) throw new Error("Not enough Sail Power.");
      const voyageId = `auto-${vessel.id}-${route.id}-${Date.now()}`;
      const fisherLevel = levelOf(state.crew?.fisher);
      const captainLevel = levelOf(state.crew?.captain);
      const sonarLevel = Math.max(1, Number(vessel.equipment?.sonar || 1));
      const lighthouseRarityBonus = lighthouseBonuses(levelOf(state.facilities?.lighthouse)).rarityBonus;
      state.sailingPower = round(state.sailingPower - route.cost);
      state.autoVoyages[vessel.id] = {
        id: voyageId,
        vesselId: vessel.id,
        routeId: route.id,
        routeName: route.name,
        startedAt: Date.now(),
        durationMs: Math.round(route.durationMs * voyageDurationMultiplierForVessel(state, vessel)),
        ready: false,
        boatCapacity: getBoatCapacity(state, vessel.id),
        rewards: generateAutomaticRewards(route.id, vessel.classId, voyageId, {
          crewEncounterBonus: fisherLevel - 1,
          rarityBonus: round((sonarLevel - 1) * 0.06 + (captainLevel - 1) * 0.03 + lighthouseRarityBonus, 2),
          boatCapacity: getBoatCapacity(state, vessel.id)
        })
      };
      break;
    }
    case "claim_auto_voyage": {
      const voyage = state.autoVoyages[action.vesselId];
      if (!voyage) throw new Error("This automated voyage is not available.");
      if (autoVoyageProgress(voyage) < 0.995) throw new Error("The automated voyage is still underway.");
      const rewards = voyage.rewards || { fish: [], coins: 0, materials: 0 };
      const storedFish = Object.values(state.inventory || {}).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
      const reservedManualFish = state.activeVoyage?.wrecked ? 0 : (state.activeVoyage?.caughtFish || []).length;
      const warehouseCapacity = getProgressionEffects(state).warehouseCapacity;
      if (storedFish + reservedManualFish + rewards.fish.length > warehouseCapacity) throw new Error("The harbor cold store is full.");
      for (const fish of rewards.fish) state.inventory[fish.speciesId] = (state.inventory[fish.speciesId] || 0) + 1;
      state.coins += Math.max(0, Math.round(Number(rewards.coins || 0)));
      state.materials += Math.max(0, Math.round(Number(rewards.materials || 0)));
      state.totalDistance += Math.round(routes[voyage.routeId].distance * AUTOMATED_FLEET_EFFICIENCY);
      delete state.autoVoyages[action.vesselId];
      break;
    }
    case "deliver_order": {
      const orderIndex = state.orders.findIndex((item) => item.id === action.orderId);
      const order = state.orders[orderIndex];
      if (!order) throw new Error("Order is no longer available.");
      const available = Object.entries(order.needs).every(([item, quantity]) => state.inventory[item] >= quantity);
      if (!available) throw new Error("The warehouse is missing cargo.");
      for (const [item, quantity] of Object.entries(order.needs)) state.inventory[item] -= quantity;
      state.coins += Math.round(order.reward * getProgressionEffects(state).marketMultiplier);
      state.orderBoard.completedCount += 1;
      const tierIndex = Math.max(0, ORDER_TIERS.findIndex((tier) => tier.id === order.tier));
      const sequence = state.orderBoard.nextSequence;
      state.orderBoard.nextSequence += 1;
      state.orders[orderIndex] = generateOrder(state, tierIndex, sequence);
      break;
    }
    case "refresh_orders": {
      const now = Date.now();
      if (now < state.orderBoard.freeRefreshAt) throw new Error("The order board refresh is still cooling down.");
      state.orders = generateOrderSet(state, state.orderBoard.nextSequence - 1);
      state.orderBoard.nextSequence += state.orders.length;
      state.orderBoard.refreshedAt = now;
      state.orderBoard.freeRefreshAt = now + ORDER_REFRESH_COOLDOWN_MS;
      break;
    }
    case "sell_fish": {
      const fish = FISH_SPECIES[action.speciesId];
      const amount = requiredPositiveInteger(action.amount ?? 1, "Fish amount");
      if (!fish) throw new Error("Fish type not found.");
      if (Number(state.inventory[fish.id] || 0) < amount) throw new Error("Not enough fish in storage.");
      state.inventory[fish.id] -= amount;
      state.coins += Math.round(fish.value * getProgressionEffects(state).marketMultiplier * amount);
      break;
    }
    case "buy_vessel": {
      const effects = getProgressionEffects(state);
      if (Object.keys(state.boat.vessels).length >= effects.berthCapacity) throw new Error("No berth available.");
      if (state.coins < NEW_VESSEL_COST) throw new Error("Not enough coins.");
      const number = Math.max(1, Math.floor(Number(state.boat.nextVesselSequence || 1)));
      let vesselId = `vessel-${number}`;
      let nextNumber = number;
      while (state.boat.vessels[vesselId]) {
        nextNumber += 1;
        vesselId = `vessel-${nextNumber}`;
      }
      state.coins -= NEW_VESSEL_COST;
      state.boat.vessels[vesselId] = createVesselInstance(vesselId, nextNumber);
      state.boat.nextVesselSequence = nextNumber + 1;
      state.boat.selectedVesselId = vesselId;
      break;
    }
    case "select_vessel": {
      if (!state.boat.vessels[action.vesselId]) throw new Error("This vessel is not in your fleet.");
      state.boat.selectedVesselId = action.vesselId;
      break;
    }
    case "assign_manual_vessel": {
      if (state.activeVoyage) throw new Error("The manual vessel cannot be changed during a voyage.");
      if (!state.boat.vessels[action.vesselId]) throw new Error("This vessel is not in your fleet.");
      if (state.autoVoyages[action.vesselId]) throw new Error("This vessel is assigned to the automated fleet.");
      state.boat.vesselId = action.vesselId;
      state.boat.selectedVesselId = action.vesselId;
      break;
    }
    case "upgrade_vessel": {
      const instance = state.boat.vessels[action.vesselId || state.boat.selectedVesselId];
      if (!instance) throw new Error("This vessel is not in your fleet.");
      if (state.activeVoyage?.vesselId === instance.id || state.autoVoyages[instance.id]) throw new Error("Upgrade this vessel after it returns to port.");
      const vessel = vesselView(state, instance.id);
      const nextClass = VESSEL_CLASSES.find((candidate) => candidate.rank === vessel.rank + 1);
      if (!nextClass) throw new Error("This vessel is already at its final class.");
      if (levelOf(state.facilities?.lighthouse) < nextClass.requiredLighthouse) throw new Error(`Lighthouse LV.${nextClass.requiredLighthouse} required.`);
      if (getVesselHealth(state, instance.id) < getVesselMaxHealth(state, instance.id)) throw new Error("Repair this vessel before upgrading it.");
      if (state.coins < nextClass.cost) throw new Error("Not enough coins.");
      state.coins -= nextClass.cost;
      instance.classId = nextClass.id;
      instance.health = getVesselMaxHealth(state, instance.id);
      break;
    }
    case "repair_vessel": {
      const vessel = state.boat.vessels[action.vesselId];
      if (!vessel) throw new Error("This vessel is not in your fleet.");
      if (state.activeVoyage?.vesselId === vessel.id || state.autoVoyages[vessel.id]) throw new Error("This vessel is still at sea.");
      const quote = vesselRepairQuote(state, vessel.id);
      if (!quote.baseCoins) throw new Error("This vessel does not need repairs.");
      if (state.coins < quote.coins) throw new Error("Not enough coins.");
      state.materials -= quote.materials;
      state.coins -= quote.coins;
      vessel.health = getVesselMaxHealth(state, vessel.id);
      break;
    }
    case "upgrade_equipment": {
      const item = EQUIPMENT_CATALOG[action.itemId];
      if (!item) throw new Error("Equipment not found.");
      const vessel = state.boat.vessels[action.vesselId || state.boat.selectedVesselId];
      if (!vessel) throw new Error("This vessel is not in your fleet.");
      if (state.activeVoyage?.vesselId === vessel.id || state.autoVoyages[vessel.id]) throw new Error("Upgrade this vessel after it returns to port.");
      const level = Math.max(1, Number(vessel.equipment[item.id] || 1));
      if (level >= item.maxLevel) throw new Error("Equipment is already at max level.");
      if (level >= progressionLevelCap(state, "equipment", item)) throw new Error("Open another port to unlock the next equipment band.");
      const cost = progressionUpgradeCost(item.baseCost, level);
      if (state.coins < cost) throw new Error("Not enough coins.");
      const previousMaximum = item.id === "hull" ? getVesselMaxHealth(state, vessel.id) : null;
      state.coins -= cost;
      vessel.equipment[item.id] = level + 1;
      if (item.id === "hull") {
        const gainedHp = getVesselMaxHealth(state, vessel.id) - previousMaximum;
        vessel.health = Math.min(getVesselMaxHealth(state, vessel.id), getVesselHealth(state, vessel.id) + gainedHp);
      }
      break;
    }
    case "upgrade_crew": {
      const role = CREW_CATALOG[action.roleId];
      if (!role) throw new Error("Crew member not found.");
      const level = levelOf(state.crew[role.id]);
      if (level >= role.maxLevel) throw new Error("Crew member is already at max level.");
      if (level >= progressionLevelCap(state, "crew", role)) throw new Error("Open another port to unlock the next crew band.");
      const cost = progressionUpgradeCost(role.baseCost, level);
      if (state.coins < cost) throw new Error("Not enough coins.");
      state.coins -= cost;
      state.crew[role.id].level = level + 1;
      break;
    }
    case "upgrade_facility": {
      const facility = FACILITY_CATALOG[action.facilityId];
      if (!facility) throw new Error("Harbor facility not found.");
      const level = levelOf(state.facilities[facility.id]);
      if (level >= facility.maxLevel) throw new Error("Facility is already at max level.");
      if (level >= progressionLevelCap(state, "facility", facility)) throw new Error("Open another port to unlock the next harbor band.");
      const cost = progressionUpgradeCost(facility.baseCost, level);
      if (state.coins < cost) throw new Error("Not enough coins.");
      state.coins -= cost;
      state.facilities[facility.id].level = level + 1;
      const facilityLevels = Object.values(state.facilities).reduce((sum, entry) => sum + levelOf(entry) - 1, 1);
      state.harborLevel = Math.max(state.harborLevel, facilityLevels);
      break;
    }
      default:
        throw new Error("Unknown harbor action.");
    }
    recordDomainEvent(state, {
      type: `game.${action.type}`,
      actorId,
      actionId,
      payload: sanitizeActionPayload(action)
    });
    const saved = writeState(state);
    persisted = true;
    commitDurableReceipt(receipt, saved);
    return saved;
  } catch (error) {
    if (!persisted) abortDurableReceipt(receipt);
    throw error;
  }
}

export function applyHookEvent(state, event) {
  const sessionId = event.session_id || "local-session";
  const current = state.sessions[sessionId] || { id: sessionId, status: "idle" };
  const timestamp = Date.now();
  reconcileTimedState(state, timestamp);
  switch (event.hook_event_name) {
    case "UserPromptSubmit":
    case "PostToolUse":
      state.sessions[sessionId] = { ...current, status: "running", updatedAt: timestamp };
      break;
    case "PermissionRequest":
      state.sessions[sessionId] = { ...current, status: "needs_input", updatedAt: timestamp };
      break;
    case "Stop":
      state.sessions[sessionId] = { ...current, status: "ready", updatedAt: timestamp };
      break;
    case "SessionStart":
      state.sessions[sessionId] = { ...current, status: "idle", updatedAt: timestamp };
      break;
    default:
      break;
  }
  pruneSessions(state);
  synchronizeVoyageWithSessions(state);
  recordDomainEvent(state, {
    type: `codex.${event.hook_event_name || "unknown"}`,
    actorId: state.multiplayer.localPlayerId,
    payload: { status: state.sessions[sessionId]?.status || "idle" }
  });
  return writeState(state);
}

export function creditTokens(state, tokenCount, telemetryId) {
  const parsedTokens = Number(tokenCount);
  const safeTokens = Number.isFinite(parsedTokens)
    ? finiteNumber(parsedTokens, 0, { integer: true })
    : 0;
  if (!safeTokens) return state;
  const receiptId = telemetryId ? String(telemetryId).trim() : "";
  const receipt = beginDurableReceipt(
    "telemetry",
    state,
    receiptId,
    Boolean(receiptId && state.recentTelemetryIds.includes(receiptId))
  );
  if (receipt?.duplicate) return state;
  let persisted = false;
  try {
    const combined = state.tokenRemainder + safeTokens;
    const gained = safeTokens / TOKENS_PER_SAILING_POWER;
    state.totalTokens += safeTokens;
    state.tokenRemainder = combined % TOKENS_PER_SAILING_POWER;
    state.sailingPower = round(state.sailingPower + gained);
    state.lastTokenCredit = safeTokens;
    state.lastTokenCreditAt = new Date().toISOString();
    if (receiptId) state.recentTelemetryIds = [...state.recentTelemetryIds.slice(-99), receiptId];
    recordDomainEvent(state, {
      type: "economy.token_credited",
      actorId: state.multiplayer.localPlayerId,
      payload: { tokenCount: safeTokens, sailingPowerGained: round(gained) }
    });
    const saved = writeState(state);
    persisted = true;
    commitDurableReceipt(receipt, saved);
    return saved;
  } catch (error) {
    if (!persisted) abortDurableReceipt(receipt);
    throw error;
  }
}

export function getRoutes() {
  return routes;
}

export function getFishCatalog() {
  return FISH_SPECIES;
}

export function getRarities() {
  return RARITIES;
}
