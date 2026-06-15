import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Discente = { id: string; nome: string; email: string; curso: string; ano: string; turma: string; estado: "Ativo" | "Inativo" };

const seed: Discente[] = [
  { id: "1", nome: "Ana Silva",       email: "ana.silva@upra.kor",       curso: "ARQ", ano: "1", turma: "A", estado: "Ativo" },
  { id: "2", nome: "Bruno Costa",     email: "bruno.costa@upra.kor",     curso: "EC",  ano: "1", turma: "B", estado: "Ativo" },
  { id: "3", nome: "Carla Mendes",    email: "carla.mendes@upra.kor",    curso: "MED", ano: "2", turma: "A", estado: "Ativo" },
  { id: "4", nome: "Diogo Pereira",   email: "diogo.pereira@upra.kor",   curso: "DIR", ano: "2", turma: "C", estado: "Ativo" },
  { id: "5", nome: "Eunice Lopes",    email: "eunice.lopes@upra.kor",    curso: "ECN", ano: "3", turma: "A", estado: "Ativo" },
  { id: "6", nome: "Fábio Antunes",   email: "fabio.antunes@upra.kor",   curso: "EI",  ano: "1", turma: "B", estado: "Ativo" },
  { id: "7", nome: "Gisela Tavares",  email: "gisela.tavares@upra.kor",  curso: "ARQ", ano: "2", turma: "A", estado: "Ativo" },
  { id: "8", nome: "Hugo Faria",      email: "hugo.faria@upra.kor",      curso: "EC",  ano: "3", turma: "B", estado: "Inativo" },
];

export default function AdminDiscentes() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => seed.filter((r) =>
    [r.nome, r.email, r.curso].some((v) => v.toLowerCase().includes(q.toLowerCase()))
  ), [q]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Discentes"
        subtitle="Todos os estudantes registados na instituição"
        icon={<Users className="w-5 h-5 text-primary" />}
        right={<Link to="/admin/onboarding/estudantes"><Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Registar Discentes</Button></Link>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold tabular-nums">{seed.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Ativos</p><p className="text-2xl font-bold tabular-nums text-emerald-600">{seed.filter(r=>r.estado==="Ativo").length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold tabular-nums">{new Set(seed.map(r=>r.curso)).size}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Turmas</p><p className="text-2xl font-bold tabular-nums">{new Set(seed.map(r=>`${r.curso}-${r.ano}${r.turma}`)).size}</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Procurar discente..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">{rows.length} de {seed.length}</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Nome</th>
              <th className="text-left font-semibold px-4 py-2.5">Email</th>
              <th className="text-left font-semibold px-4 py-2.5">Curso</th>
              <th className="text-left font-semibold px-4 py-2.5">Ano</th>
              <th className="text-left font-semibold px-4 py-2.5">Turma</th>
              <th className="text-left font-semibold px-4 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5 font-medium">{r.nome}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{r.email}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.curso}</td>
                <td className="px-4 py-2.5 tabular-nums">{r.ano}º</td>
                <td className="px-4 py-2.5">{r.turma}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.estado==="Ativo"?"bg-emerald-50 text-emerald-700":"bg-muted text-muted-foreground"}`}>{r.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
