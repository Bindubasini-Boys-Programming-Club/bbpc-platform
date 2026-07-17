import type { AuthRepository } from "./repository";
import { SESSION_COOKIE, getCookieOptions, signCookie, unsignCookie } from "./cookies";
import { constantTimeEqual } from "./security";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "dev_cookie_secret_change_me";

export function createSessionService(repo: AuthRepository) {
  return {
    async getUserFromRequest(req: Request) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
      if (!match) return null;

      const signed = decodeURIComponent(match[1]);
      const raw = unsignCookie(signed, COOKIE_SECRET);
      if (!raw) return null;

      const sessionId = raw;
      const session = await repo.getSession(sessionId);
      if (!session) return null;

      if (session.expiresAt.getTime() < Date.now()) {
        await repo.revokeSession(sessionId);
        return null;
      }

      const user = await repo.findUserById(session.userId);
      return user;
    },

    setSessionCookie({
      sessionId,
      rememberMe,
      headers,
    }: {
      sessionId: string;
      rememberMe: boolean;
      headers: Headers;
    }) {
      const signed = signCookie(sessionId, COOKIE_SECRET);
      const opts = getCookieOptions();

      const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
      const parts = [
        `${SESSION_COOKIE}=${encodeURIComponent(signed)}`,
        `Path=${opts.path}`,
        `HttpOnly`,
        `SameSite=${opts.sameSite}`,
        opts.secure ? `Secure` : "",
        `Max-Age=${maxAge}`,
      ].filter(Boolean);

      headers.append("Set-Cookie", parts.join("; "));
    },

    clearSessionCookie(headers: Headers) {
      const parts = [
        `${SESSION_COOKIE}=`,
        `Path=/`,
        `HttpOnly`,
        `SameSite=${getCookieOptions().sameSite}`,
        `Max-Age=0`,
      ];
      headers.append("Set-Cookie", parts.join("; "));
    },
  };
}

