import test from "node:test";
import assert from "node:assert/strict";
import { CUSTOM_SITE_ORIGIN as custom, LEGACY_SITE_ORIGIN as legacy, WWW_SITE_ORIGIN as www, getSiteOrigin, getAuthOrigin, getLegacyDomainRedirect } from "../lib/site-origin.ts";

const redirect = (path = "/", options = {}) => getLegacyDomainRedirect(`${legacy}${path}`, { enabled: true, configuredOrigin: custom, ...options });

test("canonical origin validates configuration without prematurely changing production", () => {
  assert.equal(getSiteOrigin("", "production"), legacy);
  assert.equal(getSiteOrigin("", "development"), "http://localhost:3000");
  assert.equal(getSiteOrigin(custom + "/", "production"), custom);
  assert.equal(getSiteOrigin("http://localhost:3000", "development"), "http://localhost:3000");
  for (const value of ["not a URL", "http://binexaconnect.com", custom + "/path", custom + "?query=1", "https://user:password@binexaconnect.com", "javascript:alert(1)"]) {
    assert.throws(() => getSiteOrigin(value, "production"));
  }
});

test("authentication remains on its original approved host during cutover", () => {
  for (const origin of [custom, legacy, www]) {
    assert.equal(getAuthOrigin(origin + "/api/discord/callback?code=example", custom, "production"), origin);
    assert.equal(getAuthOrigin(origin + "/auth/confirm?token_hash=example", custom, "production"), origin);
  }
  for (const origin of ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://[::1]:3000"]) {
    assert.equal(getAuthOrigin(origin, custom, "development"), origin);
  }
  assert.equal(getAuthOrigin("http://localhost:3000", "http://localhost:3000", "production"), "http://localhost:3000");
});

test("unapproved auth hosts are rejected; only explicit preview deployment origins are accepted", () => {
  for (const origin of ["https://attacker.example", "https://binexaconnect.com.attacker.example", "http://binexaconnect.com", "https://other-project.vercel.app", "http://localhost:3000"]) {
    assert.throws(() => getAuthOrigin(origin, custom, "production"));
  }
  const preview = "https://exact-preview.vercel.app";
  assert.equal(getAuthOrigin(preview, custom, "production", [preview]), preview);
});

test("legacy redirect is gated and preserves printed-QR paths and query strings", () => {
  assert.equal(redirect("/", { enabled: false }), null);
  assert.equal(redirect("/", { configuredOrigin: legacy }), null);
  assert.equal(redirect("/", { configuredOrigin: "http://localhost:3000" }), null);
  assert.equal(redirect("/", { configuredOrigin: www }), null);
  const path = "/resources/healthy-habits-that-stick?utm_source=flyer&ref=a%2Fb&ref=two+words";
  assert.equal(redirect(path).href, custom + path);
  assert.equal(redirect("/", { method: "HEAD" }).href, custom + "/");
});

test("new domain, www, localhost, and preview hosts never redirect through the legacy rule", () => {
  for (const host of [custom, www, "http://localhost:3000", "http://localhost:3001", "https://preview.vercel.app"]) {
    assert.equal(getLegacyDomainRedirect(host + "/resources?utm_source=flyer", { enabled: true, configuredOrigin: custom }), null);
  }
  // Following the redirect cannot produce another redirect.
  assert.equal(getLegacyDomainRedirect(redirect("/").href, { enabled: true, configuredOrigin: custom }), null);
});

test("callbacks, email links, account flows, and auth query parameters never change host", () => {
  for (const path of ["/api/discord/connect", "/api/discord/callback", "/api/community/stats", "/auth/confirm", "/auth/reset", "/sign-in", "/sign-up", "/join-discord", "/access-granted", "/member", "/%61pi/discord/callback", "//auth/confirm", "/AUTH/confirm"]) {
    assert.equal(redirect(path), null, path);
  }
  for (const name of ["auth", "discord", "verification", "code", "state", "token_hash", "access_token", "refresh_token", "error", "error_description", "recovery"]) {
    assert.equal(redirect(`/?${name}=example`), null, name);
  }
});

test("writes and existing Supabase or Discord sessions are not moved across origins", () => {
  for (const method of ["POST", "PUT", "DELETE", "PATCH", "OPTIONS"]) assert.equal(redirect("/resources", { method }), null);
  for (const name of ["sb-example-auth-token", "sb-example-auth-token.0", "sb-example-auth-token.1", "discord_oauth_state", "discord_oauth_user", "discord_oauth_next"]) {
    assert.equal(redirect("/resources", { cookieNames: [name] }), null, name);
  }
  assert.equal(redirect("/resources", { cookieNames: ["unrelated_preference"] }).origin, custom);
});

test("unusual paths cannot turn the redirect into an external redirect", () => {
  assert.equal(redirect("//attacker.example/path").origin, custom);
  assert.equal(redirect("/%2F%2Fattacker.example/path").origin, custom);
  assert.equal(redirect("/%zz"), null);
});
