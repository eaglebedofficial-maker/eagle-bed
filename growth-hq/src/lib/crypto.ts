import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";

function key(): Buffer {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 32) throw new Error("APP_SECRET must be set to at least 32 random characters (see .env.example).");
  return createHash("sha256").update(s).digest();
}

/** Encrypt a secret (API key, OAuth token) for storage. */
export function seal(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64url")).join(".");
}

export function open(sealed: string): string {
  const [iv, tag, enc] = sealed.split(".").map((p) => Buffer.from(p, "base64url"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}

export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  return salt.toString("base64url") + "." + scryptSync(pw, salt, 64).toString("base64url");
}

export function checkPassword(pw: string, stored: string): boolean {
  const [salt, h] = stored.split(".");
  const a = scryptSync(pw, Buffer.from(salt, "base64url"), 64);
  const b = Buffer.from(h, "base64url");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sign(value: string): string {
  return value + "." + createHmac("sha256", key()).update(value).digest("base64url");
}

export function unsign(signed: string | undefined): string | null {
  if (!signed) return null;
  const i = signed.lastIndexOf(".");
  if (i < 0) return null;
  const v = signed.slice(0, i);
  const expect = Buffer.from(sign(v));
  const got = Buffer.from(signed);
  return expect.length === got.length && timingSafeEqual(expect, got) ? v : null;
}

export const newId = (p: string) => p + "_" + randomBytes(8).toString("hex");
