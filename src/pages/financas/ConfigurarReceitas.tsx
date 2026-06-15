import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinHeader } from "@/pages/financas/_FinHeader";
import { ArrowLeft, Banknote, Building2, GraduationCap, Loader2, Save, AlertCircle } from "lucide-react";
import { useFaculdades, useCursos, usePropinas, useUpdatePropina } from "@/lib/useInstitution";
import { toast } from "sonner";

/**
 * Configurar Receitas — versão única, alimentada pela base institucional
 * (Faculdades → Cursos → Propinas). Sem dados de demonstração: tudo o que
 * aparece aqui vem do backend e fica disponível em todos os outros módulos.
 */
export default function ConfigurarReceitas() {
  const navigate = useNavigate();
  const { data: faculdades = [], isLoading: lF } = useFaculdades();
  const { data: cursos = [], isLoading: lC } = useCursos();
  const { data: propinas = [], isLoading: lP } = usePropinas();
  const updatePropina = useUpdatePropina();

  // Local drafts per curso so we can validate before persisting.
  const [draft, setDraft] = useState<Record<string, { valor: string; imposto: string }>>({});

  const propinaByCurso = useMemo(() => {
    const m = new Map<string, { valor_mensal: number; imposto: number }>();
    propinas.forEach((p) => m.set(p.curso_id, { valor_mensal: Number(p.valor_mensal) || 0, imposto: Number(p.imposto) || 0 }));
    return m;
  }, [propinas]);

  const facWithCursos = useMemo(() => {
    return faculdades.map((f) => ({
      ...f,
      cursos: cursos.filter((c) => c.faculdade_id === f.id),
    }));
  }, [faculdades, cursos]);

  const loading = lF || lC || lP;

  const save = async (cursoId: string) => {
    const d = draft[cursoId];
    const current = propinaByCurso.get(cursoId) ?? { valor_mensal: 0, imposto: 0 };
    const valor = d?.valor !== undefined ? Number(d.valor) : current.valor_mensal;
    const imposto = d?.imposto !== undefined ? Number(d.imposto) : current.imposto;
    if (Number.isNaN(valor) || valor < 0) { toast.error("Valor inválido"); return; }
    if (Number.isNaN(imposto) || imposto < 0 || imposto > 1) { toast.error("Imposto deve estar entre 0 e 1 (ex: 0.14)"); return; }
    await updatePropina.mutateAsync({ curso_id: cursoId, valor_mensal: valor, imposto });
    setDraft((s) => { const n = { ...s }; delete n[cursoId]; return n; });
    toast.success("Propina atualizada");
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader
        title="Configurar Receitas"
        subtitle="Propinas mensais por curso — base que alimenta Receitas, Discentes e Académica"
        icon={<Banknote className="w-5 h-5 text-primary" />}
        right={
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> A carregar dados institucionais…
        </div>
      ) : facWithCursos.length === 0 ? (
        <Card className="p-10 text-center">
          <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-foreground">Sem faculdades nem cursos</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Comece por adicionar faculdades e cursos em <span className="font-medium text-foreground">Admin → Faculdades & Cursos</span>.
            Cada curso novo aparece aqui automaticamente com propina a 0 Kz.
          </p>
          <Button className="mt-5" onClick={() => navigate("/admin/faculdades-cursos")}>
            Ir para Faculdades & Cursos
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {facWithCursos.map((f) => (
            <Card key={f.id} className="overflow-hidden">
              <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">{f.name}</h2>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {f.cursos.length} curso{f.cursos.length === 1 ? "" : "s"}
                </span>
              </div>
              {f.cursos.length === 0 ? (
                <div className="px-5 py-6 text-xs text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" /> Sem cursos nesta faculdade.
                </div>
              ) : (
                <div className="divide-y">
                  <div className="grid grid-cols-12 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10">
                    <div className="col-span-5">Curso</div>
                    <div className="col-span-3">Propina mensal (Kz)</div>
                    <div className="col-span-2">Imposto (0–1)</div>
                    <div className="col-span-2 text-right">Ação</div>
                  </div>
                  {f.cursos.map((c) => {
                    const p = propinaByCurso.get(c.id) ?? { valor_mensal: 0, imposto: 0 };
                    const d = draft[c.id];
                    const valorVal = d?.valor ?? String(p.valor_mensal);
                    const impVal = d?.imposto ?? String(p.imposto);
                    const dirty = d !== undefined;
                    return (
                      <div key={c.id} className="grid grid-cols-12 px-5 py-3 items-center text-sm">
                        <div className="col-span-5 flex items-center gap-2 min-w-0">
                          <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{c.code} · {c.years} anos</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            min={0}
                            className="h-9 tabular-nums"
                            value={valorVal}
                            onChange={(e) => setDraft((s) => ({ ...s, [c.id]: { valor: e.target.value, imposto: impVal } }))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            max={1}
                            className="h-9 tabular-nums"
                            value={impVal}
                            onChange={(e) => setDraft((s) => ({ ...s, [c.id]: { valor: valorVal, imposto: e.target.value } }))}
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            size="sm"
                            variant={dirty ? "default" : "outline"}
                            disabled={!dirty || updatePropina.isPending}
                            onClick={() => save(c.id)}
                            className="gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" /> Guardar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
