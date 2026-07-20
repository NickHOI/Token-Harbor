import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { floatingEntryLaunch, shouldLaunchFloatingEntry } from "./floating-entry-core.mjs";
import { ensureHarborService, HARBOR_URL } from "./harbor-service.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverScript = path.join(scriptDir, "harbor-server.mjs");

function readStdin() {
  return new Promise((resolve) => {
    let raw = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (raw += chunk));
    process.stdin.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

async function ensureServer() {
  await ensureHarborService(() => {
    const child = spawn(process.execPath, [serverScript], {
      cwd: path.resolve(scriptDir, ".."),
      detached: true,
      env: process.env,
      stdio: "ignore",
      windowsHide: true
    });
    child.unref();
  });
}

function launchFloatingEntry(event) {
  if (!shouldLaunchFloatingEntry(event)) return;
  const launch = floatingEntryLaunch(scriptDir);
  const child = spawn(launch.command, launch.args, {
    cwd: path.resolve(scriptDir, ".."),
    detached: true,
    env: process.env,
    stdio: "ignore",
    windowsHide: true
  });
  child.unref();
}

const event = await readStdin();
try {
  await ensureServer();
  launchFloatingEntry(event);
  await fetch(`${HARBOR_URL}/api/hook`, {
    body: JSON.stringify(event),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal: AbortSignal.timeout(800)
  });
} catch {
  // Hooks must never block the user's Codex work.
}

process.stdout.write("{}\n");
