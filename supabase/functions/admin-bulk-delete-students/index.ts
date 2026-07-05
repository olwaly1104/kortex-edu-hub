import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Body = {
  ids?: string[];
  all?: boolean;
};

const STAFF_ALLOWED = new Set(["admin", "gap", "academica", "financas"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Sessão inválida." }, 401);
    const callerId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: callerRoles } = await admin.from("user_roles").select("role").eq("user_id", callerId);
    const roles = new Set((callerRoles ?? []).map((r: any) => String(r.role)));
    if (![...roles].some((role) => STAFF_ALLOWED.has(role))) {
      return json({ error: "Sem permissões para remover discentes." }, 403);
    }

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("institution_id")
      .eq("id", callerId)
      .maybeSingle();
    const institutionId = (callerProfile?.institution_id as string) || callerId;

    const body = (await req.json().catch(() => ({}))) as Body;
    const rawIds = Array.isArray(body.ids) ? body.ids : [];
    const ids = [...new Set(rawIds.map((id) => String(id || "").trim()).filter(Boolean))];
    const deleteAll = body.all === true;
    if (!deleteAll && ids.length === 0) return json({ error: "Selecione pelo menos um discente." }, 400);
    if (!deleteAll && ids.includes(callerId)) return json({ error: "Não pode remover a sua própria conta." }, 400);

    let query = admin
      .from("estudantes")
      .select("id,email,foto_url,bilhete_url,certificado_url,enc_bilhete_url")
      .eq("owner_user_id", institutionId);
    if (!deleteAll) query = query.in("id", ids);

    const { data: students, error: listErr } = await query;
    if (listErr) return json({ error: listErr.message }, 400);

    const targets = (students ?? []).filter((s: any) => s.id !== callerId);
    let deleted = 0;
    let failed = 0;

    const files = targets.flatMap((s: any) => [s.foto_url, s.bilhete_url, s.certificado_url, s.enc_bilhete_url]).filter(Boolean);
    if (files.length) await admin.storage.from("discentes").remove(files as string[]);

    for (const student of targets as any[]) {
      const id = String(student.id);
      const email = String(student.email || "").trim().toLowerCase();
      try {
        await admin.from("estudantes").delete().eq("id", id).eq("owner_user_id", institutionId);
        await admin.from("user_roles").delete().eq("user_id", id).eq("role", "estudante");
        await admin.from("profiles").delete().eq("id", id);
        if (email) await admin.from("profiles").delete().eq("email", email).eq("institution_id", institutionId);
        const { error: authErr } = await admin.auth.admin.deleteUser(id);
        if (authErr && !/not found/i.test(authErr.message)) throw authErr;
        deleted++;
      } catch (error) {
        failed++;
        console.error("student delete failed", id, (error as Error).message);
      }
    }

    return json({ ok: failed === 0, deleted, failed });
  } catch (error) {
    console.error("admin-bulk-delete-students error:", error);
    return json({ error: (error as Error).message || "Erro interno." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}