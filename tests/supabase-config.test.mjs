import test from "node:test";
import assert from "node:assert/strict";
import { getSupabaseConfig } from "../lib/supabase/config.ts";

test("missing Supabase settings cannot initialize authentication", () => {
  assert.equal(getSupabaseConfig("", "", ""), null);
  assert.equal(getSupabaseConfig("https://example.supabase.co", " ", ""), null);
  assert.equal(getSupabaseConfig("", "public-test-key", ""), null);
});

test("browser, server and middleware share publishable and legacy key support", () => {
  const url = "https://example.supabase.co";
  assert.deepEqual(getSupabaseConfig(url, "publishable-test", "legacy-test"), { url, key: "publishable-test" });
  assert.deepEqual(getSupabaseConfig(url, "", "legacy-test"), { url, key: "legacy-test" });
  assert.deepEqual(getSupabaseConfig(` ${url} `, " ", " legacy-test "), { url, key: "legacy-test" });
});
