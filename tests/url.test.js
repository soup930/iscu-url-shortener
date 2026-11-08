import assert from "node:assert/strict";
import test from "node:test";
import {
  createShortCode,
  UrlValidationError,
  validateOriginalUrl,
} from "../lib/url.js";

test("같은 URL은 같은 6자리 shortCode를 만든다", () => {
  const url = "https://example.com/path";
  const first = createShortCode(url);
  const second = createShortCode(url);

  assert.equal(first, second);
  assert.match(first, /^[A-Za-z0-9]{6}$/);
});

test("빈 URL과 지원하지 않는 프로토콜을 거부한다", () => {
  assert.throws(
    () => validateOriginalUrl(""),
    (error) => error instanceof UrlValidationError && error.code === "MISSING_URL",
  );
  assert.throws(
    () => validateOriginalUrl("javascript:alert(1)"),
    (error) => error instanceof UrlValidationError && error.code === "INVALID_URL",
  );
});

test("자기 서비스 호스트는 scheme과 path에 관계없이 거부한다", () => {
  const service = "https://my-app.vercel.app";

  for (const value of [
    service,
    `${service}/abc123`,
    "http://my-app.vercel.app/xyz",
  ]) {
    assert.throws(
      () => validateOriginalUrl(value, service),
      (error) =>
        error instanceof UrlValidationError &&
        error.code === "SELF_URL_NOT_ALLOWED",
    );
  }
});

test("다른 Vercel 서비스 URL은 허용한다", () => {
  const value = "https://other-service.vercel.app/sample";
  assert.equal(
    validateOriginalUrl(value, "https://my-app.vercel.app"),
    value,
  );
});
