export const WEATHER_SLOT_MS = 45 * 60 * 1000;
export const TIME_PHASE_DURATION_MS = 60 * 60 * 1000;
export const TIME_CYCLE_DURATION_MS = TIME_PHASE_DURATION_MS * 4;

const TIME_PHASES = [
  { id: "dawn", label: "\u65e5\u51fa", daylight: 0.42, warmth: 0.9 },
  { id: "day", label: "\u4e2d\u5348", daylight: 1, warmth: 0.05 },
  { id: "dusk", label: "\u9ec3\u660f", daylight: 0.46, warmth: 1 },
  { id: "night", label: "\u591c\u665a", daylight: 0, warmth: 0.04 }
];

export const WEATHER_TYPES = [
  { id: "clear", label: "\u6674\u5929", threshold: 0.42, wind: "\u6771\u98a8 2 \u7d1a", visibility: "12 \u6d77\u91cc" },
  { id: "cloudy", label: "\u591a\u96f2", threshold: 0.66, wind: "\u6d77\u98a8 3 \u7d1a", visibility: "9 \u6d77\u91cc" },
  { id: "fog", label: "\u5927\u9727", threshold: 0.82, wind: "\u5fae\u98a8 1 \u7d1a", visibility: "2 \u6d77\u91cc" },
  { id: "rain", label: "\u5927\u96e8", threshold: 0.96, wind: "\u6771\u5357\u98a8 4 \u7d1a", visibility: "5 \u6d77\u91cc" },
  { id: "storm", label: "\u96f7\u96e8", threshold: 1, wind: "\u5f37\u98a8 6 \u7d1a", visibility: "3 \u6d77\u91cc" }
];

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(start, end, value) {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

function hashToUnit(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

export function getSceneTransition(cycleHour) {
  const normalized = ((Number(cycleHour) % TIME_PHASES.length) + TIME_PHASES.length) % TIME_PHASES.length;
  const phaseIndex = Math.floor(normalized);
  const nextIndex = (phaseIndex + 1) % TIME_PHASES.length;
  return {
    from: TIME_PHASES[phaseIndex].id,
    to: TIME_PHASES[nextIndex].id,
    progress: smoothstep(0, 1, normalized - phaseIndex)
  };
}

export function getTimeLighting(date) {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const cycleHour = ((hour % TIME_PHASES.length) + TIME_PHASES.length) % TIME_PHASES.length;
  const phaseIndex = Math.floor(cycleHour);
  const nextIndex = (phaseIndex + 1) % TIME_PHASES.length;
  const progress = smoothstep(0, 1, cycleHour - phaseIndex);
  const current = TIME_PHASES[phaseIndex];
  const next = TIME_PHASES[nextIndex];
  const daylight = current.daylight + (next.daylight - current.daylight) * progress;
  const warmth = current.warmth + (next.warmth - current.warmth) * progress;
  const period = { id: current.id, label: current.label };

  return { hour, cycleHour, daylight, warmth, period, sceneTransition: getSceneTransition(cycleHour) };
}

export function getWeather(date, seed = "token-harbor") {
  const slot = Math.floor(date.getTime() / WEATHER_SLOT_MS);
  const roll = hashToUnit(`${seed}:${slot}`);
  const weather = WEATHER_TYPES.find((candidate) => roll < candidate.threshold) || WEATHER_TYPES[0];
  return { ...weather, slot, roll };
}

export function getWorldEnvironment(date = new Date(), seed) {
  const lighting = getTimeLighting(date);
  const weather = getWeather(date, seed);
  const clock = new Intl.DateTimeFormat("zh-Hant", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  return { ...lighting, weather, clock };
}
