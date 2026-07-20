export const SOCIAL_SCHEMA_VERSION = 1;

export const SOCIAL_RULES = Object.freeze({
  friendRaidOnly: true,
  raidTicketLimit: 3,
  raidCooldownMs: 6 * 60 * 60 * 1000,
  shieldAfterRaidMs: 12 * 60 * 60 * 1000,
  newPlayerProtectionMs: 72 * 60 * 60 * 1000,
  maxConcurrentRaidEffects: 1,
  dailyGiftLimit: 5,
  permanentLossAllowed: false,
  tokenTheftAllowed: false
});

export const RAID_TYPES = Object.freeze({
  lighthouse_blackout: {
    id: "lighthouse_blackout",
    label: "Lighthouse Blackout",
    durationMs: 10 * 60 * 1000,
    effect: "cosmetic_darkness",
    repairable: true
  },
  tangled_nets: {
    id: "tangled_nets",
    label: "Tangled Nets",
    durationMs: 15 * 60 * 1000,
    effect: "next_voyage_delay_8_percent",
    repairable: true
  },
  false_beacon: {
    id: "false_beacon",
    label: "False Beacon",
    durationMs: 12 * 60 * 1000,
    effect: "route_marker_scramble",
    repairable: true
  }
});

export const LEADERBOARD_BOARDS = Object.freeze({
  harbor_prosperity: { id: "harbor_prosperity", label: "Harbor Prosperity", cadence: "seasonal" },
  voyage_distance: { id: "voyage_distance", label: "Voyage Distance", cadence: "weekly" },
  rare_catches: { id: "rare_catches", label: "Rare Catches", cadence: "seasonal" },
  helpful_captain: { id: "helpful_captain", label: "Helpful Captains", cadence: "weekly" }
});

const RARE_CATCH_WEIGHTS = Object.freeze({
  moonfin_tuna: 3,
  ember_lionfish: 3,
  glass_squid: 3,
  ghost_ray: 8,
  ribbon_moray: 8,
  lantern_angler: 8,
  sunscale_oarfish: 20,
  crown_coelacanth: 20
});

function nowIso() {
  return new Date().toISOString();
}

function currentDate(timestamp) {
  return String(timestamp).slice(0, 10);
}

export function currentSeasonId(timestamp = nowIso()) {
  const date = new Date(timestamp);
  const year = Number.isNaN(date.getTime()) ? new Date().getUTCFullYear() : date.getUTCFullYear();
  const month = Number.isNaN(date.getTime()) ? new Date().getUTCMonth() : date.getUTCMonth();
  return `season-${year}-q${Math.floor(month / 3) + 1}`;
}

export function createSocialState(playerId, timestamp = nowIso()) {
  return {
    schemaVersion: SOCIAL_SCHEMA_VERSION,
    profile: {
      playerId,
      handle: "New Captain",
      harborName: "Token Harbor",
      showcaseFishId: null,
      createdAt: timestamp,
      helpfulnessPoints: 0
    },
    friendships: {},
    friendRequests: [],
    visits: { total: 0, recent: [] },
    gifts: { sentToday: 0, resetDate: currentDate(timestamp), history: [] },
    raids: {
      tickets: SOCIAL_RULES.raidTicketLimit,
      ticketResetDate: currentDate(timestamp),
      shieldUntil: null,
      lastTargets: {},
      incomingEffects: [],
      history: []
    },
    leaderboard: {
      seasonId: currentSeasonId(timestamp),
      scores: {},
      cachedRanks: {}
    }
  };
}

export function normalizeSocialState(raw, playerId, timestamp = nowIso()) {
  const base = createSocialState(playerId, timestamp);
  if (!raw || typeof raw !== "object") return base;
  const state = {
    ...base,
    ...raw,
    schemaVersion: SOCIAL_SCHEMA_VERSION,
    profile: { ...base.profile, ...(raw.profile || {}), playerId },
    friendships: { ...(raw.friendships || {}) },
    friendRequests: Array.isArray(raw.friendRequests) ? raw.friendRequests.slice(-100) : [],
    visits: {
      ...base.visits,
      ...(raw.visits || {}),
      recent: Array.isArray(raw.visits?.recent) ? raw.visits.recent.slice(-50) : []
    },
    gifts: {
      ...base.gifts,
      ...(raw.gifts || {}),
      history: Array.isArray(raw.gifts?.history) ? raw.gifts.history.slice(-100) : []
    },
    raids: {
      ...base.raids,
      ...(raw.raids || {}),
      lastTargets: { ...(raw.raids?.lastTargets || {}) },
      incomingEffects: Array.isArray(raw.raids?.incomingEffects) ? raw.raids.incomingEffects.slice(-20) : [],
      history: Array.isArray(raw.raids?.history) ? raw.raids.history.slice(-100) : []
    },
    leaderboard: {
      ...base.leaderboard,
      ...(raw.leaderboard || {}),
      scores: { ...(raw.leaderboard?.scores || {}) },
      cachedRanks: { ...(raw.leaderboard?.cachedRanks || {}) }
    }
  };
  const today = currentDate(timestamp);
  if (state.gifts.resetDate !== today) {
    state.gifts.sentToday = 0;
    state.gifts.resetDate = today;
  }
  if (state.raids.ticketResetDate !== today) {
    state.raids.tickets = SOCIAL_RULES.raidTicketLimit;
    state.raids.ticketResetDate = today;
  }
  state.raids.incomingEffects = state.raids.incomingEffects.filter((effect) => Date.parse(effect.expiresAt) > Date.parse(timestamp));
  const seasonId = currentSeasonId(timestamp);
  if (state.leaderboard.seasonId !== seasonId) {
    state.leaderboard.seasonId = seasonId;
    state.leaderboard.scores = {};
    state.leaderboard.cachedRanks = {};
  }
  return state;
}

export function calculateLeaderboardScores(gameState, socialState = gameState.multiplayer?.social) {
  const inventory = gameState.inventory || {};
  const rareCatchScore = Object.entries(RARE_CATCH_WEIGHTS).reduce(
    (sum, [speciesId, weight]) => sum + Number(inventory[speciesId] || 0) * weight,
    0
  );
  const unlockedPorts = Object.values(gameState.ports || {}).filter((port) => port.unlocked).length;
  const fleetScore = Object.values(gameState.boat?.vessels || {}).reduce((sum, vessel) => (
    sum +
    Object.values(vessel?.equipment || {}).reduce((equipmentSum, level) => equipmentSum + Number(level || 1) * 250, 0) +
    Math.max(1, Number({ skiff: 1, trawler: 2, ocean: 3, deepsea: 4 }[vessel?.classId] || 1)) * 500
  ), 0);
  const crewScore = Object.values(gameState.crew || {}).reduce((sum, role) => sum + Number(role?.level || 1) * 300, 0);
  const facilityScore = Object.values(gameState.facilities || {}).reduce((sum, facility) => sum + Number(facility?.level || 1) * 400, 0);
  return {
    harbor_prosperity: Math.floor(
      Number(gameState.harborLevel || 0) * 1_000 +
      fleetScore +
      crewScore +
      facilityScore +
      unlockedPorts * 500
    ),
    voyage_distance: Math.floor(Number(gameState.totalDistance || 0)),
    rare_catches: rareCatchScore,
    helpful_captain: Math.floor(Number(socialState?.profile?.helpfulnessPoints || 0))
  };
}

export function getSocialStatus(gameState, playerId) {
  const social = gameState.multiplayer.social;
  const viewerPlayerId = gameState.multiplayer.players[playerId]
    ? playerId
    : gameState.multiplayer.localPlayerId;
  return {
    schemaVersion: social.schemaVersion,
    profile: { ...social.profile },
    viewerPlayerId,
    friendCount: Object.values(social.friendships).filter((friendship) => friendship.status === "accepted").length,
    pendingRequests: social.friendRequests.filter((request) => request.status === "pending").length,
    visits: { total: social.visits.total, recent: social.visits.recent },
    gifts: {
      sentToday: social.gifts.sentToday,
      dailyLimit: SOCIAL_RULES.dailyGiftLimit,
      resetDate: social.gifts.resetDate
    },
    raids: {
      tickets: social.raids.tickets,
      ticketLimit: SOCIAL_RULES.raidTicketLimit,
      shieldUntil: social.raids.shieldUntil,
      activeEffects: social.raids.incomingEffects.filter((effect) => Date.parse(effect.expiresAt) > Date.now())
    },
    leaderboard: {
      seasonId: social.leaderboard.seasonId,
      scores: calculateLeaderboardScores(gameState, social),
      cachedRanks: social.leaderboard.cachedRanks
    }
  };
}

export function getSocialConfig() {
  return {
    schemaVersion: SOCIAL_SCHEMA_VERSION,
    rules: SOCIAL_RULES,
    raidTypes: Object.values(RAID_TYPES),
    leaderboards: Object.values(LEADERBOARD_BOARDS)
  };
}

export function canRaid({ attackerId, targetId, friendship, attackerRaids, targetProfile, targetRaids, now = Date.now() }) {
  if (!attackerId || !targetId || attackerId === targetId) return { allowed: false, code: "invalid_target" };
  if (SOCIAL_RULES.friendRaidOnly && friendship?.status !== "accepted") return { allowed: false, code: "friends_only" };
  if (Number(attackerRaids?.tickets || 0) <= 0) return { allowed: false, code: "no_tickets" };

  const protectedUntil = Date.parse(targetProfile?.createdAt || "") + SOCIAL_RULES.newPlayerProtectionMs;
  if (Number.isFinite(protectedUntil) && protectedUntil > now) {
    return { allowed: false, code: "new_player_protection", retryAt: new Date(protectedUntil).toISOString() };
  }

  const shieldUntil = Date.parse(targetRaids?.shieldUntil || "");
  if (Number.isFinite(shieldUntil) && shieldUntil > now) {
    return { allowed: false, code: "target_shielded", retryAt: new Date(shieldUntil).toISOString() };
  }

  const activeEffects = (targetRaids?.incomingEffects || []).filter((effect) => Date.parse(effect.expiresAt) > now);
  if (activeEffects.length >= SOCIAL_RULES.maxConcurrentRaidEffects) {
    return { allowed: false, code: "target_effect_limit" };
  }

  const lastRaidAt = Date.parse(attackerRaids?.lastTargets?.[targetId] || "");
  const cooldownUntil = lastRaidAt + SOCIAL_RULES.raidCooldownMs;
  if (Number.isFinite(cooldownUntil) && cooldownUntil > now) {
    return { allowed: false, code: "target_cooldown", retryAt: new Date(cooldownUntil).toISOString() };
  }

  return { allowed: true, code: "allowed" };
}
