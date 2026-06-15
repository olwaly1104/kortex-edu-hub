import { FinHeader } from "@/pages/financas/_FinHeader";
import { OnboardingStepBanner } from "@/components/admin/OnboardingStepBanner";
import { Building2, Lock, Pencil, Check, GraduationCap, Users, UserCog, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { CursoTemplate } from "@/data/academica2Data";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadDocentes, fullName, type DocenteRow } from "@/lib/peopleStorage";

type FacState = { id: string; name: string; decano: string; editing: boolean; cursos: CursoTemplate[] };

export default function AdminFaculdadesCursos() {
  const [faculdades, setFaculdades] = useState<FacState[]>([]);
  const [docentes, setDocentes] = useState<DocenteRow[]>(() => loadDocentes());

  // Refresh docentes list when the page regains focus, so newly added teachers appear in dropdowns.
  useEffect(() => {
    const refresh = () => setDocentes(loadDocentes());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const decanoOptions = useMemo(() => docentes.map((d) => fullName(d)).filter(Boolean), [docentes]);
  const coordOptions = useMemo(() => docentes.map((d) => fullName(d)).filter(Boolean), [docentes]);

  // Add Faculdade dialog
  const [openAddFac, setOpenAddFac] = useState(false);
  const [newFac, setNewFac] = useState({ name: "", decano: "" });

  const submitNewFac = () => {
    if (!newFac.name.trim()) return;
    setFaculdades((prev) => [
      ...prev,
      { id: `fac-${Date.now()}`, name: newFac.name.trim(), decano: newFac.decano.trim(), editing: false, cursos: [] },
    ]);
    setNewFac({ name: "", decano: "" });
    setOpenAddFac(false);
  };

  // Add Curso dialog
  const [openAddCurso, setOpenAddCurso] = useState<string | null>(null);
  const [newCurso, setNewCurso] = useState({ name: "", code: "", years: 4, estudantesEsperados: 0, coordenador: "" });

  const submitNewCurso = () => {
    if (!openAddCurso || !newCurso.name.trim() || !newCurso.code.trim()) return;
    const facId = openAddCurso;
    const fac = faculdades.find((f) => f.id === facId);
    if (!fac) return;
    update(facId, {
      cursos: [
        ...fac.cursos,
        {
          id: `${facId}-${Date.now()}`,
          name: newCurso.name.trim(),
          code: newCurso.code.trim().toUpperCase(),
          faculty: fac.name,
          years: newCurso.years || 4,
          cadeirasPorAno: 6,
          estudantesEsperados: newCurso.estudantesEsperados || 0,
          coordenador: newCurso.coordenador.trim(),
        },
      ],
    });
    setNewCurso({ name: "", code: "", years: 4, estudantesEsperados: 0, coordenador: "" });
    setOpenAddCurso(null);
  };

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

  const totalCursos = useMemo(() => faculdades.reduce((s, f) => s + f.cursos.length, 0), [faculdades]);
  const totalEstud = useMemo(() => faculdades.reduce((s, f) => s + f.cursos.reduce((a, c) => a + c.estudantesEsperados, 0), 0), [faculdades]);
  const decanosCount = useMemo(() => faculdades.filter((f) => f.decano.trim()).length, [faculdades]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <OnboardingStepBanner />
      <FinHeader
        title="Faculdades & Cursos"
        subtitle="Estrutura académica da instituição"
        icon={<Building2 className="w-5 h-5 text-primary" />}
        right={<Button size="sm" onClick={() => setOpenAddFac(true)} className="gap-1"><Plus className="w-3.5 h-3.5" /> Adicionar Faculdade</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Faculdades</p><p className="text-2xl font-bold tabular-nums">{faculdades.length}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold tabular-nums">{totalCursos}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Estudantes est.</p><p className="text-2xl font-bold tabular-nums">{totalEstud}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold tabular-nums">{decanosCount}</p></div>
      </div>

      <div className="space-y-4">
        {faculdades.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <Building2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">Nenhuma faculdade registada</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione a primeira faculdade para começar a estrutura académica.</p>
          </div>
        )}
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
                      <Input value={f.decano} onChange={(e) => update(f.id, { decano: e.target.value })} placeholder="Nome do decano" className="h-6 text-xs border-0 px-0 shadow-none focus-visible:ring-0" />
                    ) : (
                      <p className="text-xs font-semibold leading-tight">{f.decano || <span className="text-muted-foreground italic font-normal">Por atribuir</span>}</p>
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
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setOpenAddCurso(f.id)}>
                  <Plus className="w-3 h-3" /> Adicionar Curso
                </Button>
              </div>
              {f.cursos.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Nenhum curso registado nesta faculdade.
                </div>
              ) : (
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
                            <Input value={c.coordenador} onChange={(e) => updateCurso(f.id, c.id, { coordenador: e.target.value })} placeholder="Nome" className="h-5 text-[11px] border-0 px-0 shadow-none focus-visible:ring-0 max-w-[140px]" />
                          ) : (
                            <p className="text-[11px] font-semibold leading-tight truncate max-w-[140px]">{c.coordenador || <span className="text-muted-foreground italic font-normal">Por atribuir</span>}</p>
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
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculdade dialog */}
      <Dialog open={openAddFac} onOpenChange={setOpenAddFac}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Faculdade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="fac-name" className="text-xs">Nome da Faculdade</Label>
              <Input id="fac-name" value={newFac.name} onChange={(e) => setNewFac({ ...newFac, name: e.target.value })} placeholder="Ex: Faculdade de Ciências Exatas" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fac-decano" className="text-xs">Decano <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input id="fac-decano" value={newFac.decano} onChange={(e) => setNewFac({ ...newFac, decano: e.target.value })} placeholder="Nome do decano" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={submitNewFac} disabled={!newFac.name.trim()}>Criar Faculdade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Curso dialog */}
      <Dialog open={!!openAddCurso} onOpenChange={(o) => !o && setOpenAddCurso(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="cur-name" className="text-xs">Nome do Curso</Label>
                <Input id="cur-name" value={newCurso.name} onChange={(e) => setNewCurso({ ...newCurso, name: e.target.value })} placeholder="Ex: Arquitectura" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cur-code" className="text-xs">Código</Label>
                <Input id="cur-code" value={newCurso.code} onChange={(e) => setNewCurso({ ...newCurso, code: e.target.value })} placeholder="ARQ" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="cur-years" className="text-xs">Duração (anos)</Label>
                <Input id="cur-years" type="number" min={1} max={8} value={newCurso.years} onChange={(e) => setNewCurso({ ...newCurso, years: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cur-est" className="text-xs">Estudantes esperados</Label>
                <Input id="cur-est" type="number" min={0} value={newCurso.estudantesEsperados} onChange={(e) => setNewCurso({ ...newCurso, estudantesEsperados: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cur-coord" className="text-xs">Coordenador <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input id="cur-coord" value={newCurso.coordenador} onChange={(e) => setNewCurso({ ...newCurso, coordenador: e.target.value })} placeholder="Nome do coordenador" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={submitNewCurso} disabled={!newCurso.name.trim() || !newCurso.code.trim()}>Criar Curso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
