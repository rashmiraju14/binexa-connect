import test from "node:test";
import assert from "node:assert/strict";
import { safeNextPath } from "../lib/auth/navigation.ts";

test("OAuth destinations retain local paths and reject external redirects", () => {
  assert.equal(safeNextPath("/resources?topic=wellness#latest"), "/resources?topic=wellness#latest");
  for (const destination of ["https://evil.example", "//evil.example", "/\\evil.example", "/\nevil.example", "/auth/callback?code=old", "/auth/sign-in?provider=facebook", "/sign-in", "/sign-up"]) {
    assert.equal(safeNextPath(destination), "/", destination);
  }
});
