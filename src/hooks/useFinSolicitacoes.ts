import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FinSolicitacao, FinStatus, FinType, FinAnexo, FinHistorico } from "@/data/financasSolicitacoesData";

type Row = {
  id: string;
  ref: string;
  direction: "recebida" | "enviada";
  type: string;
  title: string;
  description: string | null;
  requester_user_id: string;
  requester_name: string | null;
  requester_role: string | null;
  requester_matricula: string | null;
  destinatario: string | null;
  destinatario_user_id: string | null;
  responsavel: string | null;
  valor: number | null;
  prazo_de: string | null;
  prazo_ate: string | null;
  due_date: string | null;
  status: FinStatus;
  anexos: FinAnexo[] | null;
  historico: FinHistorico[] | null;
  created_at: string;
  updated_at: string;
};

function rowToSolicitacao(r: Row): FinSolicitacao {
  return {
    id: r.id,
    ref: r.ref,
    direction: r.direction,
    type: r.type as FinType,
    title: r.title,
    description: r.description ?? "",
    requester: r.requester_name ?? "—",
    requesterRole: r.requester_role ?? undefined,
    requesterMatricula: r.requester_matricula ?? undefined,
    destinatario: r.destinatario ?? undefined,
    responsavel: r.responsavel ?? undefined,
    date: r.created_at,
    dueDate: r.due_date ?? undefined,
    status: r.status,
    anexos: r.anexos ?? [],
    historico: r.historico ?? [],
  };
}

export function useFinSolicitacoes() {
  const [items, setItems] = useState<FinSolicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fin_solicitacoes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems((data as unknown as Row[]).map(rowToSolicitacao));
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { items, loading, refresh };
}

export async function fetchFinSolicitacao(id: string): Promise<FinSolicitacao | null> {
  const { data, error } = await supabase
    .from("fin_solicitacoes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToSolicitacao(data as unknown as Row);
}

export type NewFinSolicitacaoInput = {
  type: FinType;
  title: string;
  description: string;
  destinatario?: string;
  responsavel?: string;
  valor?: number | null;
  prazoDe?: string | null;
  prazoAte?: string | null;
  dueDate?: string | null;
  anexos?: FinAnexo[];
};

export async function createFinSolicitacao(input: NewFinSolicitacaoInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, institution_id")
    .eq("id", user.id)
    .maybeSingle();

  const year = new Date().getFullYear();
  const ref = `REQ-${year}-${String(Date.now()).slice(-4)}`;

  const historico: FinHistorico[] = [{
    data: new Date().toISOString(),
    actor: profile?.display_name ?? user.email ?? "Requerente",
    accao: "Solicitação submetida",
    nota: "Pedido criado via portal institucional.",
  }];

  const { data, error } = await supabase
    .from("fin_solicitacoes")
    .insert({
      ref,
      direction: "enviada",
      type: input.type,
      title: input.title,
      description: input.description,
      requester_user_id: user.id,
      requester_name: profile?.display_name ?? user.email ?? null,
      destinatario: input.destinatario ?? null,
      responsavel: input.responsavel ?? null,
      valor: input.valor ?? null,
      prazo_de: input.prazoDe ?? null,
      prazo_ate: input.prazoAte ?? null,
      due_date: input.dueDate ?? input.prazoAte ?? null,
      status: "pendente",
      anexos: (input.anexos ?? []) as unknown as never,
      historico: historico as unknown as never,
      institution_id: profile?.institution_id ?? user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToSolicitacao(data as unknown as Row);
}

export async function deleteFinSolicitacao(id: string) {
  const { error } = await supabase.from("fin_solicitacoes").delete().eq("id", id);
  if (error) throw error;
}
