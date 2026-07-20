import assert from "node:assert/strict";
import test from "node:test";
import {
  TIME_CYCLE_DURATION_MS,
  TIME_PHASE_DURATION_MS,
  WEATHER_SLOT_MS,
  getSceneTransition,
  getTimeLighting,
  getWeather,
  getWorldEnvironment
} from "../game/src/lib/worldEnvironment.js";

test("rotates the four harbor periods once per local clock hour", () => {
  assert.equal(TIME_PHASE_DURATION_MS, 60 * 60 * 1000);
  assert.equal(TIME_CYCLE_DURATION_MS, 4 * 60 * 60 * 1000);
  assert.equal(getTimeLighting(new Date(2026, 6, 19, 8, 0)).period.id, "dawn");
  assert.equal(getTimeLighting(new Date(2026, 6, 19, 9, 0)).period.id, "day");
  assert.equal(getTimeLighting(new Date(2026, 6, 19, 10, 0)).period.id, "dusk");
  assert.equal(getTimeLighting(new Date(2026, 6, 19, 11, 0)).period.id, "night");
  assert.equal(getTimeLighting(new Date(2026, 6, 19, 12, 0)).period.id, "dawn");
});

test("blends light and warmth continuously within every phase hour", () => {
  const dawn = getTimeLighting(new Date(2026, 6, 19, 8, 0));
  const dawnToDay = getTimeLighting(new Date(2026, 6, 19, 8, 30));
  const day = getTimeLighting(new Date(2026, 6, 19, 9, 0));
  const dusk = getTimeLighting(new Date(2026, 6, 19, 10, 0));
  const night = getTimeLighting(new Date(2026, 6, 19, 11, 0));

  assert.ok(dawn.daylight > night.daylight);
  assert.ok(dawnToDay.daylight > dawn.daylight && dawnToDay.daylight < day.daylight);
  assert.ok(dawnToDay.warmth < dawn.warmth && dawnToDay.warmth > day.warmth);
  assert.equal(day.daylight, 1);
  assert.ok(dusk.warmth > day.warmth);
  assert.equal(night.daylight, 0);
});

test("crossfades through all scene keyframes during the four-hour cycle", () => {
  assert.deepEqual(getSceneTransition(0), { from: "dawn", to: "day", progress: 0 });
  assert.deepEqual(getSceneTransition(1), { from: "day", to: "dusk", progress: 0 });
  assert.deepEqual(getSceneTransition(2), { from: "dusk", to: "night", progress: 0 });
  assert.deepEqual(getSceneTransition(3), { from: "night", to: "dawn", progress: 0 });

  const midpoint = getSceneTransition(2.5);
  assert.equal(midpoint.from, "dusk");
  assert.equal(midpoint.to, "night");
  assert.ok(midpoint.progress > 0 && midpoint.progress < 1);
});

test("keeps random weather stable for its 45 minute slot", () => {
  const start = new Date(2026, 6, 19, 12, 1);
  const first = getWeather(start, "player-seed");
  const sameSlot = getWeather(new Date(start.getTime() + 20 * 60 * 1000), "player-seed");

  assert.equal(WEATHER_SLOT_MS, 45 * 60 * 1000);
  assert.equal(first.slot, sameSlot.slot);
  assert.equal(first.id, sameSlot.id);
});

test("combines accelerated local time and weather as independent world state", () => {
  const environment = getWorldEnvironment(new Date(2026, 6, 19, 10, 30), "player-seed");
  assert.equal(environment.period.id, "dusk");
  assert.ok(environment.weather.id);
  assert.match(environment.clock, /^\d{2}:\d{2}$/);
});
