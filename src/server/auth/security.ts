import argon2 from "argon2";
import crypto from "crypto";

export function newId(prefix = "id"): string {
  // URL-safe random id.
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456, // ~19MB
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeRole(role: string): "member" | "leader" | "admin" {
  if (role === "leader" || role === "admin" || role === "member") return role;
  return "member";
}

export function generateSessionId(): string {
  return `sess_${crypto.randomBytes(32).toString("hex")}`;
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function parseBoolean(input: unknown): boolean {
  return input === true || input === "true" || input === "on" || input === "1";
}

