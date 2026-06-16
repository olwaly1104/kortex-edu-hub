// Admin → Utilizadores: delete a real auth user. Only callable by signed-in admins
// of the same institution. Removes the auth.users row, which cascades to profiles
// and user_roles via FK on delete.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", callerId).eq("role", "admin").maybeSingle();
    if (!roleRow) {
      const metadataRole = String(userData.user.user_metadata?.modulo ?? "").toLowerCase();
      const callerEmail = String(userData.user.email ?? "").toLowerCase();
      if (!(metadataRole === "admin" || /^admin@.+\.kor$/.test(callerEmail))) {
        return json({ error: "Apenas administradores podem remover utilizadores." }, 403);
      }
    }

    const body = await req.json().catch(() => ({}));
    const targetId = String((body as any).user_id || "").trim();
    if (!targetId) return json({ error: "user_id em falta." }, 400);
    if (targetId === callerId) return json({ error: "Não pode remover a sua própria conta." }, 400);

    // Verify same institution (target.profile.institution_id === callerId, since admin's institution_id = own uid)
    const { data: targetProfile } = await admin
      .from("profiles").select("institution_id").eq("id", targetId).maybeSingle();
    if (targetProfile && targetProfile.institution_id && targetProfile.institution_id !== callerId) {
      return json({ error: "Utilizador não pertence à sua instituição." }, 403);
    }

    // Delete dependent rows first (in case FK is not on-delete-cascade)
    await admin.from("user_roles").delete().eq("user_id", targetId);
    await admin.from("profiles").delete().eq("id", targetId);

    const { error: delErr } = await admin.auth.admin.deleteUser(targetId);
    if (delErr) return json({ error: delErr.message }, 400);

    console.log("admin-delete-user success:", targetId);
    return json({ ok: true });
  } catch (e) {
    console.error("admin-delete-user error:", e);
    return json({ error: (e as Error).message || "Erro interno." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
