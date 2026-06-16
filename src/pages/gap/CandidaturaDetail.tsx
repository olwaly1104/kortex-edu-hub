import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/EmptyState";
import { ArrowLeft } from "lucide-react";

export default function GapCandidaturaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cand, setCand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data } = await (supabase as any).from("candidaturas").select("*").eq("id", id).maybeSingle();
      setCand(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">A carregar…</div>;
  }

  if (!cand) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <EmptyState title="Candidatura não encontrada" description={`Não existe candidatura com o identificador ${id ?? "—"}.`} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <Card className="p-6 space-y-5">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{cand.nome}</h1>
            <p className="text-sm text-muted-foreground">{cand.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="capitalize">{cand.estado}</Badge>
            <Badge variant="secondary" className="capitalize">{cand.pagamento_status}</Badge>
          </div>
        </header>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Telefone" value={cand.telefone ?? "—"} />
          <Info label="Origem" value={cand.origem ?? "—"} />
          <Info label="Faculdade" value={cand.faculdade ?? "—"} />
          <Info label="Curso pretendido" value={cand.curso_pretendido ?? "—"} />
          <Info label="Sessão" value={cand.sessao ?? "—"} />
          <Info label="Recebida" value={new Date(cand.created_at).toLocaleString("pt-PT")} />
        </div>
        {cand.notas && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Notas</p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{cand.notas}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
}
