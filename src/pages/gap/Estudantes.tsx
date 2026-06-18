import { useMemo, useState } from "react";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Search, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEstudantes, useCursos } from "@/lib/useInstitution";

export default function GapEstudantes() {
  const { data: estudantes = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const [q, setQ] = useState("");

  const cursoCode = useMemo(() => {
    const m = new Map<string, string>();
    cursos.forEach((c: any) => m.set(c.id, c.codigo || c.nome || "—"));
    return m;
  }, [cursos]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return estudantes
      .map((e: any) => {
        const parts = (e.nome || "").trim().split(/\s+/);
        const primeiro = e.primeiro_nome || parts[0] || "";
        const ultimo = e.ultimo_nome || (parts.length > 1 ? parts.slice(1).join(" ") : "");
        return { ...e, primeiro, ultimo, curso: cursoCode.get(e.curso_id) || "—" };
      })
      .filter((r) =>
        !term ||
        [r.primeiro, r.ultimo, r.email, r.curso].some((v) => String(v).toLowerCase().includes(term)),
      );
  }, [estudantes, cursoCode, q]);

  const ativos = rows.length;
  const numCursos = new Set(rows.map((r) => r.curso)).size;
  const numTurmas = new Set(rows.map((r) => `${r.curso}-${r.ano}${r.turma}`)).size;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Discentes" subtitle="Estudantes acompanhados pelo GAP" icon={<Users className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={estudantes.length} />
        <Stat label="Activos" value={ativos} accent />
        <Stat label="Cursos" value={numCursos} />
        <Stat label="Turmas" value={numTurmas} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Procurar discente..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">{rows.length} de {estudantes.length}</div>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground py-12">A carregar discentes…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">Nenhum discente registado</p>
          <p className="text-xs text-muted-foreground mt-1">Os estudantes registados na instituição aparecem aqui.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-semibold py-2.5 px-4">Estudante</th>
                <th className="text-left font-semibold py-2.5 px-4">Email</th>
                <th className="text-left font-semibold py-2.5 px-4">Curso</th>
                <th className="text-left font-semibold py-2.5 px-4">Ano · Turma</th>
                <th className="text-left font-semibold py-2.5 px-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"><GraduationCap className="w-4 h-4" /></div>
                      <span className="font-semibold">{r.primeiro} {r.ultimo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-4 text-xs font-mono">{r.curso}</td>
                  <td className="py-3 px-4 text-xs tabular-nums">{r.ano}º · {r.turma}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">Activo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-emerald-600" : ""}`}>{value}</p>
    </div>
  );
}
