import type { AuthUser, Role, Session } from "./types";

export interface AuthRepository {
  createUser(args: {
    id: string;
    email: string;
    fullName?: string | null;
    passwordHash: string;
    role: Role;
  }): Promise<AuthUser>;

  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(userId: string): Promise<AuthUser | null>;

  // Needed for secure password verification
  getPasswordHashByEmail(email: string): Promise<string | null>;

  createSession(args: {
    sessionId: string;
    userId: string;
    expiresAt: Date;
    rememberMe: boolean;
  }): Promise<Session>;

  getSession(sessionId: string): Promise<Session | null>;

  revokeSession(sessionId: string): Promise<void>;

  createOrUpdateProfile(args: {
    userId: string;
    avatarUrl?: string | null;
    bio?: string | null;
    location?: string | null;
  }): Promise<void>;

  getProfile(userId: string): Promise<{
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
  } | null>;
}


