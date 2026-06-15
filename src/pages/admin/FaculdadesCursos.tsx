import { FinHeader } from "@/pages/financas/_FinHeader";
import { Building2, Lock, Pencil, Check, GraduationCap, Users, UserCog, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cursoTemplates, type CursoTemplate } from "@/data/academica2Data";
import { useMemo, useState } from "react";

const decanosPool = ["Dr. Manuel Rebelo", "Dra. Helena Vaz", "Dr. Eduardo Pinto", "Dra. Cristina Marques", "Dr. Joaquim Sousa"];
const coordenadoresPool = ["Dr. Fábio Costa", "Dra. Marta Lopes", "Dr. Hugo Faria", "Dra. Sílvia Antunes", "Dr. Tomás Henriques", "Dra. Sara Quintas", "Dr. Rui Pinto", "Dra. Helena Vaz", "Dr. Manuel Pires", "Dr. Vasco Lima", "Dra. Clara Pinto"];

type FacState = { id: string; name: string; decano: string; editing: boolean; cursos: CursoTemplate[] };

const facDecanoMap: Record<string, string> = {
  "Faculdade de Ciências Exatas": "Dr. Manuel Rebelo",
  "Faculdade de Ciências da Saúde": "Dra. Helena Vaz",
  "Faculdade de Ciências Sociais": "Dr. Eduardo Pinto",
  "Faculdade de Letras": "Dra. Helena Vaz",
  "Faculdade de Ciências Agrárias": "Dr. Vasco Lima",
};

export default function AdminFaculdadesCursos() {
  const [faculdades, setFaculdades] = useState<FacState[]>([]);


  const update = (id: string, patch: Partial<FacState>) =>
    setFaculdades((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const updateCurso = (facId: string, cursoId: string, patch: Partial<CursoTemplate>) => {
    const fac = faculdades.find((f) => f.id === facId);
    if (!fac) return;
    update(facId, { cursos: fac.cursos.map((c) => (c.id === cursoId ? { ...c, ...patch } : c)) });
  };

  const removeCurso = (facId: string, cursoId: string) => {
    const fac = faculdades.find((f) => f.id === facId);
    if (!fac) return;
    update(facId, { cursos: fac.cursos.filter((c) => c.id !== cursoId) });
  };

  const addCurso = (facId: string) => {
    const fac = faculdades.find((f) => f.id === facId);
    if (!fac) return;
    update(facId, { cursos: [...fac.cursos, { id: `${facId}-${Date.now()}`, name: "Novo Curso", code: "NEW", faculty: fac.name, years: 4, cadeirasPorAno: 6, estudantesEsperados: 100, coordenador: coordenadoresPool[0] }] });
  };

  const totalCursos = useMemo(() => faculdades.reduce((s, f) => s + f.cursos.length, 0), [faculdades]);
  const totalEstud = useMemo(() => faculdades.reduce((s, f) => s + f.cursos.reduce((a, c) => a + c.estudantesEsperados, 0), 0), [faculdades]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <FinHeader title="Faculdades & Cursos" subtitle="Estrutura académica da instituição" icon={<Building2 className="w-5 h-5 text-primary" />} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Faculdades</p><p className="text-2xl font-bold tabular-nums">{faculdades.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold tabular-nums">{totalCursos}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Estudantes est.</p><p className="text-2xl font-bold tabular-nums">{totalEstud}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold tabular-nums">{faculdades.length}</p></div>
      </div>

      <div className="space-y-4">
        {faculdades.map((f) => (
          <div key={f.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  {f.editing ? (
                    <Input value={f.name} onChange={(e) => update(f.id, { name: e.target.value })} className="h-8 text-sm font-semibold mb-1" />
                  ) : (
                    <p className="text-base font-semibold truncate">{f.name}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {f.cursos.length} cursos</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {f.cursos.reduce((a, c) => a + c.estudantesEsperados, 0)} estudantes</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
                  <UserCog className="w-3.5 h-3.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">Decano</p>
                    {f.editing ? (
                      <Select value={f.decano} onValueChange={(v) => update(f.id, { decano: v })}>
                        <SelectTrigger className="h-6 text-xs border-0 px-0 shadow-none focus:ring-0"><SelectValue /></SelectTrigger>
                        <SelectContent>{decanosPool.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-semibold leading-tight">{f.decano}</p>
                    )}
                  </div>
                </div>
                {!f.editing && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-[11px] font-semibold"><Lock className="w-3 h-3" /> Bloqueado</span>}
                <Button size="sm" variant={f.editing ? "default" : "outline"} className="gap-1 h-8" onClick={() => update(f.id, { editing: !f.editing })}>
                  {f.editing ? <><Check className="w-3.5 h-3.5" /> Concluir</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cursos da Faculdade</p>
                {f.editing && (
                  <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => addCurso(f.id)}>
                    <Plus className="w-3 h-3" /> Adicionar Curso
                  </Button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {f.cursos.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card">
                    <span className="inline-flex items-center justify-center h-5 min-w-[34px] px-1 rounded bg-primary text-primary-foreground text-[10px] font-bold">{c.code}</span>
                    <div className="min-w-0 flex-1">
                      {f.editing ? (
                        <Input value={c.name} onChange={(e) => updateCurso(f.id, c.id, { name: e.target.value })} className="h-6 text-xs mb-0.5" />
                      ) : (
                        <p className="text-xs font-medium truncate">{c.name}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground truncate">{c.years} anos · ~{c.estudantesEsperados} est.</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 shrink-0">
                      <UserCog className="w-3 h-3 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-tight">Coord.</p>
                        {f.editing ? (
                          <Select value={c.coordenador} onValueChange={(v) => updateCurso(f.id, c.id, { coordenador: v })}>
                            <SelectTrigger className="h-5 text-[11px] border-0 px-0 shadow-none focus:ring-0 gap-1"><SelectValue /></SelectTrigger>
                            <SelectContent>{coordenadoresPool.map((co) => <SelectItem key={co} value={co}>{co}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : (
                          <p className="text-[11px] font-semibold leading-tight truncate max-w-[140px]">{c.coordenador}</p>
                        )}
                      </div>
                    </div>
                    {f.editing && (
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeCurso(f.id, c.id)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
