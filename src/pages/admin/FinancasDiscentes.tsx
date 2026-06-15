import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Row = {
  id: string;
  matricula: string;
  nome: string;
  curso: string;
  ano: string;
  turma: string;
  estado: "Em dia" | "Por regularizar";
  saldo: number;
};

const SEED: Row[] = [];


export default function AdminFinancasDiscentes() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => SEED.filter(r => [r.nome, r.matricula, r.curso].some(v => v.toLowerCase().includes(q.toLowerCase()))),
    [q]
  );

  const openProfile = (r: Row) => navigate(`/coordenador/estudantes/${r.id}`);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Discentes — Estado Financeiro" subtitle="Consulta financeira de todos os discentes" icon={<Users className="w-5 h-5 text-primary" />} />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Procurar por nome, matrícula ou curso..." className="pl-9 h-9" />
          </div>
          <div className="text-xs text-muted-foreground ml-auto">{filtered.length} discentes</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-2.5 px-3 font-semibold">Matrícula</th>
                <th className="py-2.5 px-3 font-semibold">Nome</th>
                <th className="py-2.5 px-3 font-semibold">Curso</th>
                <th className="py-2.5 px-3 font-semibold">Ano</th>
                <th className="py-2.5 px-3 font-semibold">Turma</th>
                <th className="py-2.5 px-3 font-semibold text-right">Saldo</th>
                <th className="py-2.5 px-3 font-semibold">Estado</th>
                <th className="py-2.5 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} onClick={() => openProfile(r)} className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs">{r.matricula}</td>
                  <td className="py-2.5 px-3 font-medium text-foreground">{r.nome}</td>
                  <td className="py-2.5 px-3">{r.curso}</td>
                  <td className="py-2.5 px-3">{r.ano}º</td>
                  <td className="py-2.5 px-3">{r.turma}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{r.saldo > 0 ? `${r.saldo.toLocaleString("pt-PT")} Kz` : "—"}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={r.estado === "Em dia" ? "secondary" : "destructive"} className="text-[10px]">{r.estado}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right"><ChevronRight className="w-4 h-4 text-muted-foreground inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
