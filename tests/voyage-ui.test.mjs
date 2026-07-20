import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const app = fs.readFileSync(new URL("../game/src/App.jsx", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../game/src/styles.css", import.meta.url), "utf8");

test("pirate raider patrols with route-scaled multi-view artwork", () => {
  assert.match(app, /data-motion-route=\{voyage\.routeId\}/);
  assert.match(app, /Number\(pirate\?\.patrolSeconds\)/);
  assert.match(app, /data-threat-tier=\{pirate\.tier \|\| 1\}/);
  for (const view of ["left", "front", "right"]) {
    assert.match(app, new RegExp(`pirate-raider-${view}\\.png`));
    assert.equal(fs.existsSync(new URL(`../game/public/assets/pirate-raider-${view}.png`, import.meta.url)), true);
  }
  assert.match(styles, /@keyframes piratePatrol\s*\{/);
  assert.match(styles, /@keyframes piratePatrolMobile\s*\{/);
  assert.match(styles, /@keyframes pirateViewFront\s*\{/);
});

test("voyage HUD exposes a prominent stateful hull meter", () => {
  assert.match(app, /className=\{`ship-health-panel/);
  assert.match(app, /role="meter"/);
  assert.match(app, /className="ship-health-bar"/);
  assert.match(styles, /\.ship-health-panel\.warning/);
  assert.match(styles, /\.ship-health-panel\.critical/);
  assert.match(styles, /@keyframes shipHullHit/);
  assert.doesNotMatch(app, /ship-health-readout/);
});

test("browser UI never advances authoritative pirate or hurricane timers", () => {
  assert.doesNotMatch(app, /type: "pirate_attack_ship"/);
  assert.doesNotMatch(app, /type: "trigger_hurricane"/);
  assert.match(app, /const readyToDock = Boolean\(voyage\.ready\)/);
});

test("fleet UI separates vessel management, class refits, and manual assignment", () => {
  assert.match(app, /function FleetSelector/);
  assert.match(app, /type: "select_vessel"/);
  assert.match(app, /type: "assign_manual_vessel"/);
  assert.match(app, /type: "upgrade_vessel"/);
  assert.match(app, /type: "buy_vessel"/);
  assert.match(app, /className="manual-vessel-picker"/);
  assert.match(app, /className="fleet-evolution"/);
  assert.match(styles, /\.fleet-selector/);
  assert.match(styles, /\.fleet-detail/);
});
