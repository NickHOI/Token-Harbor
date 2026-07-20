import assert from "node:assert/strict";
import test from "node:test";
import { HarborApiError, sendAction } from "../game/src/lib/api.js";

function installBrowserIdentity(playerId = "player_client_test") {
  const values = new Map([["token-harbor-player-id", playerId]]);
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, String(value))
  };
}

test("retries a server failure with the identical command id and envelope", async (t) => {
  installBrowserIdentity();
  const requests = [];
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    delete globalThis.localStorage;
  });
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options, body: JSON.parse(options.body) });
    if (requests.length === 1) return new Response(JSON.stringify({ error: "temporary" }), { status: 503 });
    return new Response(JSON.stringify({ multiplayer: { player: { id: "player_client_test" }, revision: 8 } }), { status: 200 });
  };

  const result = await sendAction(
    { type: "allocate_port", portId: "coral", amount: 10 },
    { worldId: "world_client_test", baseRevision: 7, actionId: "action_client_retry_001" }
  );
  assert.equal(result.multiplayer.revision, 8);
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0].body, requests[1].body);
  assert.equal(requests[0].body.actionId, "action_client_retry_001");
  assert.equal(requests[0].body.actorId, "player_client_test");
  assert.equal(requests[0].body.worldId, "world_client_test");
  assert.equal(requests[0].body.baseRevision, 7);
  assert.equal(requests[0].body.type, "game.allocate_port");
  assert.deepEqual(requests[0].body.payload, { portId: "coral", amount: 10 });
});

test("surfaces conflict status without retrying a stale command", async (t) => {
  installBrowserIdentity();
  let requests = 0;
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
    delete globalThis.localStorage;
  });
  globalThis.fetch = async () => {
    requests += 1;
    return new Response(JSON.stringify({ error: "Harbor state changed. Refresh and retry." }), { status: 409 });
  };

  await assert.rejects(
    sendAction(
      { type: "sell_fish", speciesId: "silver_dart", amount: 1 },
      { worldId: "world_client_test", baseRevision: 2, actionId: "action_client_conflict_001" }
    ),
    (error) => error instanceof HarborApiError && error.status === 409
  );
  assert.equal(requests, 1);
});
