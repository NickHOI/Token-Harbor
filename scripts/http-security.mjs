import { HARBOR_DEV_PORT, HARBOR_PORT } from "./harbor-core.mjs";

const trustedBrowserOrigins = new Set([
  `http://127.0.0.1:${HARBOR_PORT}`,
  `http://127.0.0.1:${HARBOR_DEV_PORT}`
]);

export const browserSecurityHeaders = Object.freeze({
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'"
  ].join("; "),
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
});

function firstHeader(value) {
  return String(Array.isArray(value) ? value[0] : value || "").trim();
}

export function isTrustedLocalRequest(headers = {}) {
  const origin = firstHeader(headers.origin);
  if (origin) return trustedBrowserOrigins.has(origin);
  return firstHeader(headers["sec-fetch-site"]).toLowerCase() !== "cross-site";
}
