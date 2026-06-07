import "server-only";
import crypto from "node:crypto";

// Minimal signed-cookie session for the MVP. A stateless token holds the user id;
// an HMAC signature prevents tampering. This is intentionally dependency-light —
// swap for NextAuth / Supabase Auth when real persistence is needed.

const SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

export function signSession(userId: string): string {
  const payload = Buffer.from(userId).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  // Constant-time compare to avoid timing attacks.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return Buffer.from(payload, "base64url").toString("utf8");
}
