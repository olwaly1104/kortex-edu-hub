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
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("getUser failed:", userErr?.message);
      return json({ error: userErr?.message || "Sessão inválida. Inicie sessão novamente." }, 401);
    }
    const callerId = userData.user.id;
    console.log("admin-create-user caller:", callerId);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    // Resolve caller's roles + institution.
    const { data: callerRoles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const roles = new Set((callerRoles ?? []).map((r: any) => String(r.role)));
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("institution_id")
      .eq("id", callerId)
      .maybeSingle();
    const institutionId = (callerProfile?.institution_id as string) || callerId;

    // Admins can create any module. Staff (gap, academica, financas, coordenador,
    // decano, reitor, inscricoes) can provision estudantes for their institution.
    const STAFF_PROVISIONERS = new Set([
      "gap", "academica", "financas", "coordenador", "decano", "reitor", "inscricoes",
    ]);
    const isAdmin = roles.has("admin");
    if (!isAdmin) {
      const metadataRole = String(userData.user.user_metadata?.modulo ?? "").toLowerCase();
      const callerEmail = String(userData.user.email ?? "").toLowerCase();
      const isInstitutionAdmin = metadataRole === "admin" || /^admin@.+\.kor$/.test(callerEmail);
      if (isInstitutionAdmin) {
        const { error: backfillErr } = await admin
          .from("user_roles")
          .insert({ user_id: callerId, role: "admin" });
        if (backfillErr && backfillErr.code !== "23505") {
          console.error("admin role backfill failed:", backfillErr.message);
          return json({ error: "Falha ao ativar permissões de administrador: " + backfillErr.message }, 500);
        }
        roles.add("admin");
        console.log("admin role backfilled for caller:", callerId);
      } else {
        const isStaff = [...roles].some((r) => STAFF_PROVISIONERS.has(r));
        if (!isStaff) {
          return json({ error: "Sem permissões para criar utilizadores." }, 403);
        }
      }
    }

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
    // Non-admin staff can only provision estudantes.
    if (!isAdmin && modulo !== "estudante") {
      return json({ error: "Apenas administradores podem criar utilizadores deste tipo." }, 403);
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name, modulo },
    });
    let newUserId = created.user?.id;
    if (createErr || !newUserId) {
      const alreadyExists = /already|registered|exists/i.test(createErr?.message ?? "");
      if (!alreadyExists) {
        return json({ error: createErr?.message ?? "Falha ao criar utilizador." }, 400);
      }
      const { data: existingProfile, error: existingErr } = await admin
        .from("profiles")
        .select("id,institution_id")
        .eq("email", email)
        .maybeSingle();
      if (existingErr || !existingProfile?.id) {
        return json({ error: "Este email já existe na autenticação, mas ainda não tem perfil ligado. Crie com outro email." }, 409);
      }
      if (existingProfile.institution_id && existingProfile.institution_id !== institutionId) {
        return json({ error: "Este email já pertence a outra instituição." }, 409);
      }
      newUserId = existingProfile.id;
    }

    // Force the new user to change the admin-provided password on first sign-in.
    const { error: profileErr } = await admin.from("profiles").upsert(
      {
        id: newUserId,
        display_name: name,
        email,
        institution_id: institutionId,
        must_change_password: true,
      },
      { onConflict: "id" }
    );
    if (profileErr) {
      console.error("profiles upsert failed:", profileErr.message);
      return json({ error: "Conta criada mas falhou ao ligar o perfil: " + profileErr.message }, 500);
    }

    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: newUserId, role: modulo }, { onConflict: "user_id,role" });
    if (roleErr) {
      console.error("user_roles insert failed:", roleErr.message);
      return json({ error: "Conta criada mas falhou ao atribuir módulo: " + roleErr.message }, 500);
    }
    console.log("admin-create-user success:", { newUserId, email, modulo });

    // Wire the user into the matching people table so other modules (Cadeiras,
    // Faculdades, Cursos, Departamentos, etc.) see them immediately.
    // - docente roles → public.docentes (id == auth user id, owner == institution)
    // - staff roles   → public.staff
    // estudante is not auto-inserted: estudantes.curso_id is NOT NULL and must
    // be assigned on the Estudantes onboarding page.
    const DOCENTE_ROLES = new Set(["professor", "coordenador", "decano", "reitor"]);
    const STAFF_ROLES = new Set(["financas", "academica", "gap", "inscricoes"]);
    const parts = name.split(/\s+/);
    const primeiro = parts[0] || name;
    const ultimo = parts.slice(1).join(" ") || "";
    if (DOCENTE_ROLES.has(modulo)) {
      const cargo = modulo === "professor" ? "Docente"
        : modulo === "coordenador" ? "Coordenador"
        : modulo === "decano" ? "Decano" : "Reitor";
      const { error: docErr } = await admin.from("docentes").upsert({
        id: newUserId,
        owner_user_id: institutionId,
        primeiro_nome: primeiro,
        ultimo_nome: ultimo,
        email,
        cargo,
        categoria: "Assistente",
      }, { onConflict: "id" });
      if (docErr) console.error("docente upsert failed:", docErr.message);
    } else if (STAFF_ROLES.has(modulo)) {
      const funcaoMap: Record<string, string> = {
        financas: "Finanças", academica: "Área Académica", gap: "GAP", inscricoes: "Inscrições",
      };
      const { error: stErr } = await admin.from("staff").upsert({
        id: newUserId,
        owner_user_id: institutionId,
        primeiro_nome: primeiro,
        ultimo_nome: ultimo,
        email,
        funcao: funcaoMap[modulo] || modulo,
        departamento: funcaoMap[modulo] || modulo,
      }, { onConflict: "id" });
      if (stErr) console.error("staff upsert failed:", stErr.message);
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
