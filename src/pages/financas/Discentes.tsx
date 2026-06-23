import { FinHeader } from "@/pages/financas/_FinHeader";
import { Users, Search, GraduationCap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEstudantes, useCursos } from "@/lib/useInstitution";

/**
 * Finanças → Discentes (view-only)
 * Espelha a tabela de GAP → Discentes mas sem ações de criar/eliminar.
 * Aparece na sidebar do módulo Finanças por baixo de Orçamentos.
 */
export default function FinancasDiscentes() {
  const navigate = useNavigate();
  const { data: rows = [], isLoading } = useEstudantes();
  const { data: cursos = [] } = useCursos();
  const [q, setQ] = useState("");

  const cursoCode = useMemo(() => {
    const m = new Map<string, string>();
    cursos.forEach((c: any) => m.set(c.id, c.codigo || c.nome || "—"));
    return m;
  }, [cursos]);

  const normalized = useMemo(
    () =>
      rows.map((r: any) => {
        const parts = (r.nome || "").trim().split(/\s+/);
        return {
          id: r.id as string,
          primeiroNome: r.primeiro_nome || parts[0] || "",
          ultimoNome: r.ultimo_nome || (parts.length > 1 ? parts.slice(1).join(" ") : ""),
          email: r.email as string,
          curso: cursoCode.get(r.curso_id) || "—",
          ano: r.ano as string,
          turma: r.turma as string,
        };
      }),
    [rows, cursoCode],
  );

  const filtered = useMemo(
    () =>
      normalized.filter((r) =>
        [r.primeiroNome, r.ultimoNome, r.email, r.curso].some((v) =>
          String(v).toLowerCase().includes(q.toLowerCase()),
        ),
      ),
    [normalized, q],
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Discentes"
        subtitle="Consulta dos discentes registados na instituição (apenas leitura)."
        icon={<Users className="w-5 h-5 text-primary" />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Total" value={normalized.length} />
        <Stat label="Ativos" value={normalized.length} accent />
        <Stat label="Cursos" value={new Set(normalized.map((r) => r.curso)).size} />
        <Stat label="Turmas" value={new Set(normalized.map((r) => `${r.curso}-${r.ano}${r.turma}`)).size} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Procurar discente..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} de {normalized.length}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center text-sm text-muted-foreground gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar discentes…
        </div>
      ) : normalized.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 flex flex-col items-center gap-3 text-center">
          <GraduationCap className="w-7 h-7 text-muted-foreground" />
          <p className="text-sm font-semibold">Nenhum discente registado</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Os discentes são adicionados pelo GAP em Discentes e aparecem aqui automaticamente.
          </p>
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
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/gap/estudantes/${r.id}`)}
                  className="hover:bg-muted/30 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">
                        {r.primeiroNome} {r.ultimoNome}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-4 text-xs font-mono">{r.curso}</td>
                  <td className="py-3 px-4 text-xs tabular-nums">
                    {r.ano}º · {r.turma}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      Ativo
                    </span>
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
