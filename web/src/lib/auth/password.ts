import { createHash } from "crypto";

export function hashPasswordSha256(password: string): string {
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function verifyPasswordSha256(password: string, storedHash: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(storedHash)) return false;
  return hashPasswordSha256(password) === storedHash;
}
