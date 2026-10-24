/**
 * Grind framför hela sajten.
 *
 * Körs före de statiska filerna i Netlifys request-kedja. Utan giltig
 * sessionscookie skickas besökaren till /login; med giltig cookie returneras
 * undefined, vilket låter Netlify servera den vanliga filen.
 *
 * Lösenordet läses från env-variabeln SITE_PASSWORD (scope Functions).
 * Token-algoritmen måste vara identisk med netlify/functions/login.js.
 */

const COOKIE_NAME = "pd_session";
const TOKEN_MESSAGE = "portodrac-session-v1";

export const config = {
  path: "/*",
  excludedPath: ["/login", "/login.html", "/.netlify/functions/login", "/favicon.ico"],
};

export default async function gate(request) {
  const password = Netlify.env.get("SITE_PASSWORD");

  if (!password) {
    return new Response("SITE_PASSWORD saknas i Netlify-miljövariablerna.", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const expected = await sessionToken(password);
  const provided = readCookie(request.headers.get("cookie"), COOKIE_NAME);

  if (provided && safeEqual(provided, expected)) {
    return;
  }

  return new Response(null, {
    status: 302,
    headers: { location: "/login", "cache-control": "no-store" },
  });
}

async function sessionToken(password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(TOKEN_MESSAGE));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readCookie(header, name) {
  if (!header) {
    return null;
  }
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }
    if (part.slice(0, index).trim() === name) {
      return part.slice(index + 1).trim();
    }
  }
  return null;
}

function safeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
