import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import readline from "node:readline";
import test from "node:test";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
const mcpScript = path.join(projectRoot, "scripts", "harbor-mcp.mjs");
const artifactsRoot = path.join(projectRoot, "test-artifacts");

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function rpcClient(env) {
  const child = spawn(process.execPath, [mcpScript], {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true
  });
  const lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
  const pending = new Map();
  lines.on("line", (line) => {
    const response = JSON.parse(line);
    const waiter = pending.get(response.id);
    if (!waiter) return;
    pending.delete(response.id);
    waiter.resolve(response);
  });
  child.once("exit", (code) => {
    for (const waiter of pending.values()) waiter.reject(new Error(`MCP exited with code ${code}.`));
    pending.clear();
  });
  return {
    child,
    request(message, timeoutMs = 8_000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(message.id);
          reject(new Error(`MCP request ${message.id} timed out.`));
        }, timeoutMs);
        pending.set(message.id, {
          resolve: (response) => { clearTimeout(timer); resolve(response); },
          reject: (error) => { clearTimeout(timer); reject(error); }
        });
        child.stdin.write(`${JSON.stringify(message)}\n`);
      });
    },
    stop() {
      lines.close();
      child.kill();
    }
  };
}

async function unusedPort() {
  const server = http.createServer();
  const port = await listen(server);
  await close(server);
  return port;
}

test("cold MCP status waits for the verified server and enforces command revisions", async (t) => {
  const port = await unusedPort();
  const dataDir = path.join(artifactsRoot, `service-${port}`);
  fs.rmSync(dataDir, { recursive: true, force: true });
  const client = rpcClient({ TOKEN_HARBOR_PORT: String(port), TOKEN_HARBOR_DATA_DIR: dataDir });
  t.after(async () => {
    client.stop();
    try { await fetch(`http://127.0.0.1:${port}/api/shutdown`, { method: "POST" }); } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  const status = await client.request({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "harbor_status", arguments: {} } });
  assert.equal(status.error, undefined);
  assert.match(status.result.content[0].text, /Sail Power/);

  const health = await (await fetch(`http://127.0.0.1:${port}/health`)).json();
  assert.equal(health.service, "token-harbor");
  assert.equal(health.version, "0.1.0");
  assert.equal(path.resolve(health.dataDir), path.resolve(dataDir));

  const initial = await (await fetch(`http://127.0.0.1:${port}/api/state`)).json();
  const command = {
    actionId: "action_protocol_001",
    actorId: initial.multiplayer.player.id,
    worldId: initial.multiplayer.world.id,
    baseRevision: initial.multiplayer.revision,
    type: "game.acknowledge_recovery",
    payload: {}
  };
  const appliedResponse = await fetch(`http://127.0.0.1:${port}/api/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  assert.equal(appliedResponse.status, 200);
  const applied = await appliedResponse.json();
  assert.equal(applied.multiplayer.revision, initial.multiplayer.revision + 1);

  const duplicateResponse = await fetch(`http://127.0.0.1:${port}/api/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  assert.equal(duplicateResponse.status, 200);
  assert.equal((await duplicateResponse.json()).multiplayer.revision, applied.multiplayer.revision);

  const staleResponse = await fetch(`http://127.0.0.1:${port}/api/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...command, actionId: "action_protocol_002" })
  });
  assert.equal(staleResponse.status, 409);

  const wrongWorldResponse = await fetch(`http://127.0.0.1:${port}/api/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...command, actionId: "action_protocol_003", worldId: "world_not_the_same", baseRevision: applied.multiplayer.revision })
  });
  assert.equal(wrongWorldResponse.status, 409);
});

test("MCP refuses a foreign health service and never shuts it down", async (t) => {
  let shutdownRequests = 0;
  const fakeServer = http.createServer((request, response) => {
    if (request.url === "/api/shutdown") shutdownRequests += 1;
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(`${JSON.stringify({ ok: true, service: "not-token-harbor" })}\n`);
  });
  const port = await listen(fakeServer);
  const dataDir = path.join(artifactsRoot, `foreign-${port}`);
  const client = rpcClient({ TOKEN_HARBOR_PORT: String(port), TOKEN_HARBOR_DATA_DIR: dataDir });
  t.after(async () => {
    client.stop();
    await close(fakeServer);
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  const response = await client.request({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "open_harbor", arguments: {} } });
  assert.match(response.error.message, /occupied by a different service/i);
  assert.equal(shutdownRequests, 0);
});
