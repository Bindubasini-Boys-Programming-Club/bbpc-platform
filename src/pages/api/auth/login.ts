import { createSqliteAuthRepository } from "@/server/auth/repository-sqlite";
import { createAuthService } from "@/server/auth/service";
import { createSessionService } from "@/server/auth/session";

export async function POST({ request }: { request: Request }) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const rememberMe =
    form.get("rememberMe") === "on" || form.get("rememberMe") === "true";

  const repo = createSqliteAuthRepository();
  const auth = createAuthService(repo);
  const sessions = createSessionService(repo);

  await auth.init();

  try {
    const session = await auth.login({
      email,
      password,
      rememberMe: Boolean(rememberMe),
    });

    const headers = new Headers();
    sessions.setSessionCookie({
      sessionId: session.sessionId,
      rememberMe: Boolean(rememberMe),
      headers,
    });
    headers.set("content-type", "application/json");

    return new Response(
      JSON.stringify({ ok: true, sessionId: session.sessionId, userId: session.userId }),
      { status: 200, headers },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "Login failed" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      },
    );
  }
}


