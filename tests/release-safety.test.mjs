import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { browserSecurityHeaders, isTrustedLocalRequest } from "../scripts/http-security.mjs";

test("accepts local app and native requests while rejecting cross-site browsers", () => {
  assert.equal(isTrustedLocalRequest({}), true);
  assert.equal(isTrustedLocalRequest({ origin: "http://127.0.0.1:47831" }), true);
  assert.equal(isTrustedLocalRequest({ origin: "http://127.0.0.1:5173" }), true);
  assert.equal(isTrustedLocalRequest({ origin: "https://example.com" }), false);
  assert.equal(isTrustedLocalRequest({ origin: "null" }), false);
  assert.equal(isTrustedLocalRequest({ "sec-fetch-site": "cross-site" }), false);
});

test("ships defensive browser headers for every server response", () => {
  assert.match(browserSecurityHeaders["Content-Security-Policy"], /default-src 'self'/);
  assert.match(browserSecurityHeaders["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.equal(browserSecurityHeaders["Referrer-Policy"], "no-referrer");
  assert.equal(browserSecurityHeaders["X-Content-Type-Options"], "nosniff");
  assert.equal(browserSecurityHeaders["X-Frame-Options"], "DENY");
});

test("uses SSE first with a ten-second fallback poll", () => {
  const source = fs.readFileSync(new URL("../game/src/hooks/useHarborState.js", import.meta.url), "utf8");
  assert.match(source, /FALLBACK_POLL_MS = 10_000/);
  assert.match(source, /setInterval\(refresh, FALLBACK_POLL_MS\)/);
  assert.doesNotMatch(source, /setInterval\(refresh, 1_000\)/);
});
