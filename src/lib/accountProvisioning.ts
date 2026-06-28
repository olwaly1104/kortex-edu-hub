import { supabase } from "@/integrations/supabase/client";

export function generatedPassword(prefix = "Kortex") {
  return `${prefix}@${Math.random().toString(36).slice(2, 8)}`;
}

export async function provisionKortexUser(input: { name: string; email: string; modulo: string; password?: string }) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password || generatedPassword(input.modulo === "estudante" ? "Aluno" : "Kortex");
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: { name, email, password, modulo: input.modulo },
  });
  const serverError = (data && typeof data === "object" && "error" in data) ? (data as any).error : null;
  if (error || serverError) throw new Error(String(serverError || error?.message || "Falha ao criar utilizador."));
  const created = (data as any)?.user as { id: string; email: string; name: string; modulo: string } | undefined;
  if (!created?.id) throw new Error("Resposta inesperada do servidor.");
  return { ...created, password };
}
