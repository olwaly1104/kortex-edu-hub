// Admin → Utilizadores: create a real auth user with immediate-login password.
// Only callable by signed-in admins. Uses the service-role key to create the
// auth.users row and link it to the caller's institution.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  email?: string;
  password?: string;
  name?: string;
  modulo?: string;
};

const ALLOWED_ROLES = new Set([
  "admin", "estudante", "professor", "coordenador", "decano",
  "reitor", "financas", "academica", "gap", "inscricoes",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  try {
    // 1) Authenticate the caller and ensure they are an admin
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsErr || !claims?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const callerId = claims.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return json({ error: "Apenas administradores podem criar utilizadores." }, 403);
    }

    // 2) Validate body
    const body = (await req.json().catch(() => ({}))) as Body;
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const name = (body.name || "").trim();
    const modulo = (body.modulo || "").trim();
    if (!email || !password || !name || !modulo) {
      return json({ error: "Preencha nome, email, palavra-passe e módulo." }, 400);
    }
    if (password.length < 6) {
      return json({ error: "Palavra-passe deve ter pelo menos 6 caracteres." }, 400);
    }
    if (!ALLOWED_ROLES.has(modulo)) {
      return json({ error: "Módulo inválido." }, 400);
    }

    // 3) Create the auth user (immediate login, no email confirmation)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name, modulo },
    });
    if (createErr || !created.user) {
      return json({ error: createErr?.message ?? "Falha ao criar utilizador." }, 400);
    }
    const newUserId = created.user.id;

    // 4) Ensure profile row + link to caller's institution
    await admin.from("profiles").upsert(
      {
        id: newUserId,
        display_name: name,
        email,
        institution_id: callerId,
      },
      { onConflict: "id" }
    );

    // 5) Assign role
    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: newUserId, role: modulo });
    if (roleErr) {
      console.warn("user_roles insert failed:", roleErr.message);
    }

    return json({
      ok: true,
      user: { id: newUserId, email, name, modulo },
    });
  } catch (e) {
    console.error("admin-create-user error:", e);
    return json({ error: (e as Error).message || "Erro interno." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
