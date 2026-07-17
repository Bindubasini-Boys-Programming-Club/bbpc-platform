import { createSqliteAuthRepository } from "@/server/auth/repository-sqlite";
import { createSessionService } from "@/server/auth/session";

export async function GET({ request }: { request: Request }) {
  const repo = createSqliteAuthRepository();
  const sessions = createSessionService(repo);
  const user = await sessions.getUserFromRequest(request);

  if (!user) {
    return new Response(JSON.stringify({ ok: true, user: null }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, user }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

