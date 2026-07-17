import type { AuthRepository } from "./repository";
import {
  generateSessionId,
  hashPassword,
  normalizeEmail,
  newId,
  verifyPassword,
} from "./security";


export interface RegisterInput {
  email: string;
  fullName?: string;
  password: string;
  role?: "member" | "leader" | "admin";
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function createAuthService(repo: AuthRepository) {
  return {
    async init() {
      // Temporarily disabled DB migration for Vercel build compatibility.
      // Real DB setup will be restored later (Supabase/Postgres).
      return;
    },

    async register(input: RegisterInput) {
      const email = normalizeEmail(input.email);
      if (!email || !email.includes("@")) throw new Error("Invalid email");
      if (!input.password || input.password.length < 10) {
        throw new Error("Password must be at least 10 characters");
      }

      const passwordHash = await hashPassword(input.password);
      const id = newId("user");
      const role = input.role ?? "member";

      return repo.createUser({
        id,
        email,
        fullName: input.fullName?.trim() || null,
        passwordHash,
        role,
      });
    },

    async login(input: LoginInput) {
      const email = normalizeEmail(input.email);

      // Fetch hash separately so we can verify securely.
      const [user, passwordHash] = await Promise.all([
        repo.findUserByEmail(email),
        repo.getPasswordHashByEmail(email),
      ]);

      if (!user || !passwordHash) {
        // Avoid user enumeration / timing differences.
        await new Promise((r) => setTimeout(r, 200));
        throw new Error("Invalid credentials");
      }

      const ok = await verifyPassword(passwordHash, input.password);
      if (!ok) {
        await new Promise((r) => setTimeout(r, 200));
        throw new Error("Invalid credentials");
      }

      const expiresAt = new Date(
        Date.now() +
          (input.rememberMe
            ? 1000 * 60 * 60 * 24 * 30
            : 1000 * 60 * 60 * 24 * 7),
      );

      const sessionId = generateSessionId();
      return repo.createSession({
        sessionId,
        userId: user.id,
        expiresAt,
        rememberMe: input.rememberMe,
      });
    },
  };
}

