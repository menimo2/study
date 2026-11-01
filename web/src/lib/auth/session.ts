import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "report_session";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}

export function signSession(username: string): string {
  const body = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + MAX_AGE_MS }),
    "utf8",
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readSession(token: string | undefined | null): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", secret()).update(body).digest("base64url");
  } catch {
    return null;
  }
  const actual = Buffer.from(sig);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      u?: string;
      exp?: number;
    };
    if (!payload.u || typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.u;
  } catch {
    return null;
  }
}

export async function getSessionUsername(): Promise<string | null> {
  try {
    const jar = await cookies();
    return readSession(jar.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(MAX_AGE_MS / 1000),
  };
}
