import { createMockAuthRepository } from "@/server/auth/repository-mock";
import { createSessionService } from "@/server/auth/session";


export async function POST({ request }: { request: Request }) {
  const repo = createMockAuthRepository();

  const sessions = createSessionService(repo);

  const headers = new Headers();
  sessions.clearSessionCookie(headers);

  headers.set("content-type", "application/json");

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers,
  });
}

