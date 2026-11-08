import assert from "node:assert/strict";
import test from "node:test";
import { authenticate } from "../lib/auth.js";
import { authorize } from "../lib/authorization.js";

function requestWithCredentials(username, password) {
  const encoded = Buffer.from(`${username}:${password}`).toString("base64");
  return new Request("http://localhost/admin", {
    headers: { Authorization: `Basic ${encoded}` },
  });
}

test("Basic 인증과 관리자 권한을 확인한다", () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = "test-secret";

  try {
    assert.equal(authenticate(new Request("http://localhost/admin")), null);
    assert.equal(authenticate(requestWithCredentials("admin", "wrong")), null);

    const user = authenticate(requestWithCredentials("admin", "test-secret"));
    assert.deepEqual(user, { username: "admin", role: "admin" });
    assert.equal(authorize(user, "admin:page"), true);
    assert.equal(authorize(user, "stats:read"), true);
    assert.equal(authorize(user, "unknown"), false);
  } finally {
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
  }
});
