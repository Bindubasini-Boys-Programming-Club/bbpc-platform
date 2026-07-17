import type { AuthRepository } from "./repository";
import type { AuthUser, Role, Session } from "./types";
import crypto from "crypto";

type UserRow = Omit<AuthUser, "createdAt" | "updatedAt"> & {
  createdAt: Date;
  updatedAt: Date;
};

type SessionRow = Session;

type ProfileRow = {
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
};

function toRole(role: string): Role {
  if (role === "leader" || role === "admin" || role === "member") return role;
  return "member";
}

// In-memory demo storage (process-local). On Vercel, this is enough to pass
// build and provide working demo responses.
const memory = {
  usersById: new Map<string, UserRow>(),
  usersByEmail: new Map<string, string>(), // email -> userId
  sessionsById: new Map<string, SessionRow>(),
  profilesByUserId: new Map<string, ProfileRow>(),
};

// Keep repo creation deterministic but not tied to DB.
export function createMockAuthRepository(): AuthRepository {
  return {
    async createUser(args) {
      const now = new Date();
      const user: UserRow = {
        id: args.id,
        email: args.email,
        fullName: args.fullName ?? null,
        role: toRole(args.role),
        createdAt: now,
        updatedAt: now,
      };

      // Emulate uniqueness by email.
      const existingId = memory.usersByEmail.get(args.email);
      if (existingId && existingId !== args.id) {
        throw new Error("Email already exists");
      }

      memory.usersById.set(args.id, user);
      memory.usersByEmail.set(args.email, args.id);

      // Store password hash in a separate map keyed by email.
      // We can’t change AuthRepository’s interface, so we store via a hidden symbol-like map.
      passwordHashes.set(args.email, args.passwordHash);

      return user as unknown as AuthUser;
    },

    async findUserByEmail(email: string) {
      const userId = memory.usersByEmail.get(email);
      if (!userId) return null;
      const u = memory.usersById.get(userId);
      if (!u) return null;
      return u as unknown as AuthUser;
    },

    async findUserById(userId: string) {
      const u = memory.usersById.get(userId);
      if (!u) return null;
      return u as unknown as AuthUser;
    },

    async getPasswordHashByEmail(email: string) {
      return passwordHashes.get(email) ?? null;
    },

    async createSession(args) {
      const row: SessionRow = {
        sessionId: args.sessionId,
        userId: args.userId,
        expiresAt: args.expiresAt,
      };
      memory.sessionsById.set(args.sessionId, row);
      return {
        sessionId: row.sessionId,
        userId: row.userId,
        expiresAt: row.expiresAt,
      };
    },

    async getSession(sessionId: string) {
      const row = memory.sessionsById.get(sessionId);
      if (!row) return null;
      return row;
    },

    async revokeSession(sessionId: string) {
      memory.sessionsById.delete(sessionId);
    },

    async createOrUpdateProfile(args) {
      const prev = memory.profilesByUserId.get(args.userId);
      memory.profilesByUserId.set(args.userId, {
        avatarUrl: args.avatarUrl ?? prev?.avatarUrl ?? null,
        bio: args.bio ?? prev?.bio ?? null,
        location: args.location ?? prev?.location ?? null,
      });
    },

    async getProfile(userId: string) {
      const row = memory.profilesByUserId.get(userId);
      return row ?? null;
    },
  };
}

// Password hashes storage separate from user storage.
// This mirrors the interface requirement: only allow lookup by email.
const passwordHashes: Map<string, string> = new Map();

// Ensure crypto is referenced so bundlers keep node polyfills stable.
// (No-op, but safe.)
crypto.randomBytes(1);

