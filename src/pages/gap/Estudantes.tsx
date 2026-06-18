import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, GraduationCap, X, Inbox, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { useEstudantes, useCursos } from "@/lib/useInstitution";
import { supabase } from "@/integrations/supabase/client";

function useGapCounts() {
  return useQuery({
    queryKey: ["gap-estudante-counts"],
    queryFn: async () => {
      const [sol, agd] = await Promise.all([
        (supabase as any).from("solicitacoes_gap").select("estudante_id"),
        (supabase as any).from("agendamentos_gap").select("estudante_id"),
      ]);
      const sols = new Map<string, number>();
      const agds = new Map<string, number>();
      (sol.data || []).forEach((r: any) => sols.set(r.estudante_id, (sols.get(r.estudante_id) || 0) + 1));
      (agd.data || []).forEach((r: any) => agds.set(r.estudante_id, (agds.get(r.estudante_id) || 0) + 1));
      return { sols, agds };
    },
  });
}

export default function GapEstudantes() {
  const navigate = useNavigate();
  const { data: estudantes = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const { data: counts } = useGapCounts();
  const [search, setSearch] = useState("");

  const cursoCode = useMemo(() => {
    const m = new Map<string, string>();
    cursos.forEach((c: any) => m.set(c.id, c.codigo || c.nome || "—"));
    return m;
  }, [cursos]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return estudantes
      .map((e: any) => {
        const parts = (e.nome || "").trim().split(/\s+/);
        const primeiro = e.primeiro_nome || parts[0] || "";
        const ultimo = e.ultimo_nome || (parts.length > 1 ? parts.slice(1).join(" ") : "");
        return {
          ...e,
          primeiro,
          ultimo,
          curso: cursoCode.get(e.curso_id) || "—",
          nSol: counts?.sols.get(e.id) || 0,
          nAgd: counts?.agds.get(e.id) || 0,
        };
      })
      .filter((r) =>
        !term ||
        [r.matricula, r.primeiro, r.ultimo, r.email, r.curso].some((v) => String(v).toLowerCase().includes(term)),
      );
  }, [estudantes, cursoCode, search, counts]);

  const numCursos = new Set(rows.map((r) => r.curso)).size;
  const numTurmas = new Set(rows.map((r) => `${r.curso}-${r.ano}${r.turma}`)).size;

  const kpis = [
    { label: "Total", value: estudantes.length, icon: Inbox, iconBg: "bg-muted text-muted-foreground" },
    { label: "Activos", value: rows.length, icon: GraduationCap, iconBg: "bg-primary/10 text-primary" },
    { label: "Cursos", value: numCursos, icon: BookOpen, iconBg: "bg-blue-50 text-blue-600" },
    { label: "Turmas", value: numTurmas, icon: Layers, iconBg: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <FinHeader
        title="Discentes"
        subtitle="Estudantes matriculados na instituição e acompanhados pelo GAP."
        icon={<Users className="w-6 h-6 text-primary" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold mt-1 text-foreground tabular-nums">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar ID, discente, email ou curso…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1">
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
          <div className="ml-auto text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {rows.length} de {estudantes.length}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">A carregar discentes…</Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left font-semibold py-2.5 px-4">ID</th>
                <th className="text-left font-semibold py-2.5 px-4">Discente</th>
                <th className="text-left font-semibold py-2.5 px-4">Curso</th>
                <th className="text-left font-semibold py-2.5 px-4">Ano · Turma</th>
                <th className="text-right font-semibold py-2.5 px-4">Nº Solicitações</th>
                <th className="text-right font-semibold py-2.5 px-4">Nº Agendamentos</th>
                <th className="text-left font-semibold py-2.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-3">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Nenhum discente encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1">Ajuste a pesquisa ou registe novos estudantes na instituição.</p>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => r.matricula && navigate(`/gap/estudantes/${r.matricula}`)}
                    className={cn("hover:bg-muted/30 transition-colors", r.matricula && "cursor-pointer")}
                  >
                    <td className="py-3 px-4 text-xs font-mono text-foreground">{r.matricula || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground">{r.primeiro} {r.ultimo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-foreground">{r.curso}</td>
                    <td className="py-3 px-4 text-xs tabular-nums text-foreground">{r.ano}º · {r.turma}</td>
                    <td className="py-3 px-4 text-xs tabular-nums text-right text-foreground">{r.nSol}</td>
                    <td className="py-3 px-4 text-xs tabular-nums text-right text-foreground">{r.nAgd}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        Activo
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
