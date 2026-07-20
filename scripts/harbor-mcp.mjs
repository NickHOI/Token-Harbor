import { spawn } from "node:child_process";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { ensureHarborService, HARBOR_URL } from "./harbor-service.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverScript = path.join(scriptDir, "harbor-server.mjs");
const harborUrl = HARBOR_URL;

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

function result(id, payload) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result: payload })}\n`);
}

function error(id, message) {
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32603, message } })}\n`);
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", async (line) => {
  let request;
  try {
    request = JSON.parse(line);
    if (request.method === "initialize") {
      return result(request.id, {
        protocolVersion: request.params?.protocolVersion || "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "token-harbor", version: "0.1.0" }
      });
    }
    if (request.method === "notifications/initialized") return;
    if (request.method === "ping") return result(request.id, {});
    if (request.method === "tools/list") {
      return result(request.id, {
        tools: [
          {
            name: "open_harbor",
            description: "Start Token Harbor and return its local game URL.",
            inputSchema: { type: "object", properties: {}, additionalProperties: false }
          },
          {
            name: "harbor_status",
            description: "Read the player's current Sail Power, coins, voyage, and Codex attention state.",
            inputSchema: { type: "object", properties: {}, additionalProperties: false }
          }
        ]
      });
    }
    if (request.method === "tools/call") {
      await ensureServer();
      if (request.params?.name === "open_harbor") {
        return result(request.id, {
          content: [{ type: "text", text: `Token Harbor is ready: ${harborUrl}` }]
        });
      }
      if (request.params?.name === "harbor_status") {
        const response = await fetch(`${harborUrl}/api/state`, { signal: AbortSignal.timeout(1_500) });
        if (!response.ok) throw new Error(`Token Harbor state request failed with HTTP ${response.status}.`);
        const state = await response.json();
        const summary = `Sail Power ${state.sailingPower} · Coins ${state.coins} · Distance ${state.totalDistance} nm`;
        return result(request.id, { content: [{ type: "text", text: summary }] });
      }
      throw new Error("Unknown Token Harbor tool.");
    }
    if (request.id !== undefined) error(request.id, "Method not found.");
  } catch (caught) {
    if (request?.id !== undefined) error(request.id, caught instanceof Error ? caught.message : "Request failed.");
  }
});
