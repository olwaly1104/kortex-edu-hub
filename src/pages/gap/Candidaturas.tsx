import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FinHeader } from "@/pages/financas/_FinHeader";
import EmptyState from "@/components/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Cand = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  curso_pretendido: string | null;
  faculdade: string | null;
  estado: string;
  pagamento_status: string;
  created_at: string;
};

export default function GapCandidaturas() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Cand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("candidaturas")
        .select("id,nome,email,telefone,curso_pretendido,faculdade,estado,pagamento_status,created_at")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setRows((data as Cand[]) ?? []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <FinHeader title="Candidaturas" subtitle="Pedidos de admissão recebidos" icon={<ClipboardList className="w-5 h-5" />} />
      {loading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">A carregar…</Card>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Sem candidaturas"
          description="Quando um candidato submeter o formulário público, a candidatura aparece aqui em tempo real."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Candidato</th>
                <th className="text-left px-4 py-2.5 font-semibold">Curso</th>
                <th className="text-left px-4 py-2.5 font-semibold">Estado</th>
                <th className="text-left px-4 py-2.5 font-semibold">Pagamento</th>
                <th className="text-left px-4 py-2.5 font-semibold">Recebida</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`./${c.id}`)}
                  className="border-t border-border cursor-pointer hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.nome}</p>
                    <p className="text-[12px] text-muted-foreground">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {c.curso_pretendido ?? "—"}
                    {c.faculdade && <p className="text-[11px] text-muted-foreground">{c.faculdade}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{c.estado}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{c.pagamento_status}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("pt-PT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
