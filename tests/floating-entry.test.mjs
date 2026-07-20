import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { floatingEntryLaunch, shouldLaunchFloatingEntry } from "../scripts/floating-entry-core.mjs";

const floatingEntryScript = fs.readFileSync(new URL("../scripts/harbor-floating-entry.ps1", import.meta.url), "utf8");

test("launches the floating entry once at Windows session start", () => {
  assert.equal(shouldLaunchFloatingEntry({ hook_event_name: "SessionStart" }, { platform: "win32" }), true);
  assert.equal(shouldLaunchFloatingEntry({ hook_event_name: "PostToolUse" }, { platform: "win32" }), false);
  assert.equal(shouldLaunchFloatingEntry({ hook_event_name: "SessionStart" }, { platform: "darwin" }), false);
});

test("allows users to disable the floating entry", () => {
  assert.equal(
    shouldLaunchFloatingEntry({ hook_event_name: "SessionStart" }, { platform: "win32", enabled: "0" }),
    false
  );
});

test("starts PowerShell in a hidden STA process", () => {
  const launch = floatingEntryLaunch(path.resolve("scripts"));
  assert.equal(launch.command, "powershell.exe");
  assert.ok(launch.args.includes("-STA"));
  assert.ok(launch.args.includes("Hidden"));
  assert.match(launch.args.at(-1), /harbor-floating-entry\.ps1$/);
});

test("opens the harbor as a standalone browser app with a safe fallback", () => {
  assert.match(floatingEntryScript, /--app=\$harborUrl/);
  assert.match(floatingEntryScript, /Start-Process \$harborUrl/);
});

test("shows live Sail Power and connection state on the floating entry", () => {
  assert.match(floatingEntryScript, /\$\{harborUrl\}api\/state/);
  assert.match(floatingEntryScript, /sailingPower/);
  assert.match(floatingEntryScript, /PowerValue/);
  assert.match(floatingEntryScript, /StatusLight/);
});

test("labels Sail Power and renders a recognizable animated lighthouse beacon", () => {
  assert.match(floatingEntryScript, /x:Name="PowerLabel"/);
  assert.match(floatingEntryScript, /CurrentUICulture/);
  assert.match(floatingEntryScript, /x:Name="BeaconBeam"/);
  assert.match(floatingEntryScript, /x:Name="BeamRotate"/);
  assert.match(floatingEntryScript, /x:Name="LighthouseArt"/);
  assert.match(floatingEntryScript, /guia-lighthouse-pixel\.png/);
  assert.match(floatingEntryScript, /RenderOptions\.BitmapScalingMode="NearestNeighbor"/);
  assert.equal(fs.existsSync(new URL("../assets/guia-lighthouse-pixel.png", import.meta.url)), true);
  assert.doesNotMatch(floatingEntryScript, /[^\x00-\x7F]/u);
});

test("follows the saved game language and uses Windows only as first-run fallback", () => {
  assert.match(floatingEntryScript, /function Get-WindowsLanguage/);
  assert.match(floatingEntryScript, /function Set-PowerLabel/);
  assert.match(floatingEntryScript, /\$state\.preferences\.language/);
  assert.match(floatingEntryScript, /if \(\$sharedLanguage\) \{ \$sharedLanguage \} else \{ \$windowsLanguage \}/);
});
