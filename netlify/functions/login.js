/**
 * Inloggning för portodrac.es.
 *
 * Tar emot formuläret från /login, jämför med env-variabeln SITE_PASSWORD och
 * sätter en signerad cookie (HMAC-SHA256 av lösenordet). Ingen lösenordstext
 * lagras i koden eller i cookien.
 *
 * Samma token räknas fram i netlify/edge-functions/gate.js — ändrar du
 * TOKEN_MESSAGE här måste du ändra den där också.
 */

const crypto = require("node:crypto");

const COOKIE_NAME = "pd_session";
const TOKEN_MESSAGE = "portodrac-session-v1";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dagar

function sessionToken(password) {
  return crypto.createHmac("sha256", password).update(TOKEN_MESSAGE).digest("hex");
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function bodyToParams(event) {
  const raw = event.body || "";
  const text = event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf8") : raw;
  const contentType = (event.headers && (event.headers["content-type"] || event.headers["Content-Type"])) || "";
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(text);
      return new URLSearchParams(parsed || {});
    } catch (err) {
      return new URLSearchParams();
    }
  }
  return new URLSearchParams(text);
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { allow: "POST" }, body: "Method Not Allowed" };
  }

  const password = process.env.SITE_PASSWORD;
  if (!password) {
    return {
      statusCode: 500,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      body: "SITE_PASSWORD saknas i Netlify-miljövariablerna.",
    };
  }

  const submitted = bodyToParams(event).get("password") || "";

  if (!safeEqual(submitted, password)) {
    return {
      statusCode: 302,
      headers: { location: "/login?fel=1", "cache-control": "no-store" },
      body: "",
    };
  }

  const cookie = [
    `${COOKIE_NAME}=${sessionToken(password)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ].join("; ");

  return {
    statusCode: 302,
    headers: { location: "/", "set-cookie": cookie, "cache-control": "no-store" },
    body: "",
  };
};
