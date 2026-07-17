export type Role = "member" | "leader" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

