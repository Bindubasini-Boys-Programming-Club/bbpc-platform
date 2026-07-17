import { createMockAuthRepository } from "@/server/auth/repository-mock";
import { createAuthService } from "@/server/auth/service";


export async function POST({ request }: { request: Request }) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const fullName = form.get("fullname") ? String(form.get("fullname")) : undefined;
  const password = String(form.get("password") || "");

  const repo = createMockAuthRepository();

  const auth = createAuthService(repo);
  await auth.init();

  try {
    const user = await auth.register({
      email,
      fullName,
      password,
      role: "member",
    });
    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "Registration failed" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}


