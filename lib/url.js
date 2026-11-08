import { createHash } from "node:crypto";

export const MAX_URL_LENGTH = 2048;

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export class UrlValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "UrlValidationError";
    this.code = code;
  }
}

export function validateOriginalUrl(value, serviceUrl) {
  const originalUrl = typeof value === "string" ? value.trim() : "";

  if (!originalUrl) {
    throw new UrlValidationError("MISSING_URL", "Original URL is required.");
  }

  if (originalUrl.length > MAX_URL_LENGTH) {
    throw new UrlValidationError(
      "URL_TOO_LONG",
      `URL must be ${MAX_URL_LENGTH} characters or fewer.`,
    );
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(originalUrl);
  } catch {
    throw new UrlValidationError(
      "INVALID_URL",
      "URL must be a valid http:// or https:// URL.",
    );
  }

  const isHttp = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  const isUsableHostname =
    parsedUrl.hostname === "localhost" || parsedUrl.hostname.includes(".");

  if (
    !isHttp ||
    !isUsableHostname ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    throw new UrlValidationError(
      "INVALID_URL",
      "URL must be a valid http:// or https:// URL.",
    );
  }

  if (serviceUrl) {
    const serviceHost = new URL(serviceUrl).hostname.toLowerCase();

    if (parsedUrl.hostname.toLowerCase() === serviceHost) {
      throw new UrlValidationError(
        "SELF_URL_NOT_ALLOWED",
        "The URL Shortener cannot shorten its own service URL.",
      );
    }
  }

  return originalUrl;
}

export function createShortCode(originalUrl, length = 6) {
  const hex = createHash("sha256").update(originalUrl).digest("hex");
  let code = "";

  for (let index = 0; index < length; index += 1) {
    const value = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    code += ALPHABET[value % ALPHABET.length];
  }

  return code;
}
