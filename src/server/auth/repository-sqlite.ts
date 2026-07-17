import { runDb, getDb, allDb } from "../db/sqlite";
import type { AuthRepository } from "./repository";
import type { AuthUser, Role, Session } from "./types";

function toRole(role: string): Role {
  if (role === "leader" || role === "admin" || role === "member") return role;
  return "member";
}

const ENABLE_SQLITE =
  process.env.BEARNIE_DB_SQLITE === "1" ||
  process.env.BEARNIE_DB_SQLITE === "true";

export function createSqliteAuthRepository(): AuthRepository {
  if (!ENABLE_SQLITE) {
    throw new Error(
      "SQLite auth repository is disabled. Set BEARNIE_DB_SQLITE=1 to enable it.",
    );
  }

  return {
    async createUser(args) {
      const now = new Date().toISOString();
      await runDb(
        `INSERT INTO users (id, email, full_name, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          args.id,
          args.email,
          args.fullName ?? null,
          args.passwordHash,
          args.role,
          now,
          now,
        ],
      );

      const user = await this.findUserById(args.id);
      if (!user) throw new Error("Failed to create user");
      return user;
    },

    async findUserByEmail(email: string) {
      const user = await getDb<any>(
        `SELECT id, email, full_name as fullName, role, created_at as createdAt, updated_at as updatedAt
         FROM users WHERE email = ?`,
        [email],
      );
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: toRole(user.role),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      } as AuthUser;
    },

    async getPasswordHashByEmail(email: string) {
      const row = await getDb<any>(
        `SELECT password_hash as passwordHash FROM users WHERE email = ?`,
        [email],
      );
      if (!row) return null;
      return row.passwordHash as string;
    },

    async findUserById(userId: string) {
      const row = await getDb<any>(
        `SELECT id, email, full_name as fullName, role, created_at as createdAt, updated_at as updatedAt
         FROM users WHERE id = ?`,
        [userId],
      );
      if (!row) return null;
      return {
        id: row.id,
        email: row.email,
        fullName: row.fullName,
        role: toRole(row.role),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      } as AuthUser;
    },

    async createSession(args) {
      const now = new Date().toISOString();
      const expiresAt = args.expiresAt.toISOString();
      await runDb(
        `INSERT INTO sessions (session_id, user_id, expires_at, created_at, remember_me)
         VALUES (?, ?, ?, ?, ?)`,
        [args.sessionId, args.userId, expiresAt, now, args.rememberMe ? 1 : 0],
      );

      return {
        sessionId: args.sessionId,
        userId: args.userId,
        expiresAt: args.expiresAt,
      } as Session;
    },

    async getSession(sessionId: string) {
      const row = await getDb<any>(
        `SELECT session_id, user_id, expires_at
         FROM sessions WHERE session_id = ? AND revoked_at IS NULL`,
        [sessionId],
      );
      if (!row) return null;
      return {
        sessionId: row.session_id,
        userId: row.user_id,
        expiresAt: new Date(row.expires_at),
      } as Session;
    },

    async revokeSession(sessionId: string) {
      await runDb(
        `UPDATE sessions SET revoked_at = ? WHERE session_id = ?`,
        [new Date().toISOString(), sessionId],
      );
    },

    async createOrUpdateProfile(args) {
      const now = new Date().toISOString();
      await runDb(
        `INSERT INTO profiles (user_id, avatar_url, bio, location, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           avatar_url = excluded.avatar_url,
           bio = excluded.bio,
           location = excluded.location,
           updated_at = excluded.updated_at`,
        [
          args.userId,
          args.avatarUrl ?? null,
          args.bio ?? null,
          args.location ?? null,
          now,
          now,
        ],
      );
    },

    async getProfile(userId: string) {
      const row = await getDb<any>(
        `SELECT avatar_url as avatarUrl, bio, location
         FROM profiles WHERE user_id = ?`,
        [userId],
      );
      if (!row) return null;
      return {
        avatarUrl: row.avatarUrl,
        bio: row.bio,
        location: row.location,
      };
    },
  };
}

