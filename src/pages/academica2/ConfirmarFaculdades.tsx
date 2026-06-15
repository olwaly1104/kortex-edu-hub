import { OnboardingStepBanner, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cursoTemplates, type CursoTemplate } from "@/data/academica2Data";
import {
  Building2, Check, ArrowLeft, UserCog, GraduationCap, Users, ChevronRight, Pencil, Plus, X,
} from "lucide-react";
import { toast } from "sonner";

const decanosPool = [
  "Dr. Manuel Rebelo",
  "Dra. Helena Vaz",
  "Dr. Eduardo Pinto",
  "Dra. Cristina Marques",
  "Dr. Joaquim Sousa",
];

const coordenadoresPool = [
  "Dr. Fábio Costa", "Dra. Marta Lopes", "Dr. Hugo Faria", "Dra. Sílvia Antunes",
  "Dr. Tomás Henriques", "Dra. Sara Quintas", "Dr. Rui Pinto", "Dra. Helena Vaz",
];

interface FacState {
  id: string;
  name: string;
  decano: string;
  confirmed: boolean;
  editing: boolean;
  cursos: CursoTemplate[];
}

const initialFaculdades: FacState[] = [
  { id: "exatas", name: "Faculdade de Ciências Exatas", decano: "Dr. Manuel Rebelo", confirmed: false, editing: false, cursos: cursoTemplates.filter(c => c.faculty === "Faculdade de Ciências Exatas") },
  { id: "saude", name: "Faculdade de Ciências da Saúde", decano: "Dra. Helena Vaz", confirmed: false, editing: false, cursos: cursoTemplates.filter(c => c.faculty === "Faculdade de Ciências da Saúde") },
  { id: "sociais", name: "Faculdade de Ciências Sociais", decano: "Dr. Eduardo Pinto", confirmed: false, editing: false, cursos: cursoTemplates.filter(c => c.faculty === "Faculdade de Ciências Sociais") },
];

const emptyCurso = { code: "", name: "", coordenador: coordenadoresPool[0], years: 4, cadeirasPorAno: 6, estudantesEsperados: 100 };

export default function ConfirmarFaculdades() {
  const isOnboarding = useIsOnboardingStep();
  const [faculdades, setFaculdades] = useState<FacState[]>(initialFaculdades);
  const [addOpenFor, setAddOpenFor] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...emptyCurso });

  const update = (id: string, patch: Partial<FacState>) =>
    setFaculdades(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const updateCurso = (facId: string, cursoId: string, patch: Partial<CursoTemplate>) => {
    const fac = faculdades.find(f => f.id === facId);
    if (!fac) return;
    update(facId, { cursos: fac.cursos.map(c => c.id === cursoId ? { ...c, ...patch } : c) });
  };

  const confirmAll = () => {
    setFaculdades(prev => prev.map(f => ({ ...f, confirmed: true, editing: false })));
    toast.success("Faculdades & cursos confirmados");
  };

  const addCurso = (facId: string) => {
    if (!draft.code.trim() || !draft.name.trim()) {
      toast.error("Código e nome do curso são obrigatórios");
      return;
    }
    const fac = faculdades.find(f => f.id === facId);
    if (!fac) return;
    const novo: CursoTemplate = {
      id: `${facId}-${draft.code.toLowerCase()}-${Date.now()}`,
      name: draft.name.trim(),
      code: draft.code.trim().toUpperCase(),
      faculty: fac.name,
      years: Number(draft.years) || 4,
      cadeirasPorAno: Number(draft.cadeirasPorAno) || 6,
      estudantesEsperados: Number(draft.estudantesEsperados) || 100,
      coordenador: draft.coordenador.trim() || "—",
    };
    update(facId, { cursos: [...fac.cursos, novo] });
    toast.success(`Curso ${novo.code} adicionado a ${fac.name}`);
    setDraft({ ...emptyCurso });
    setAddOpenFor(null);
  };

  const removeCurso = (facId: string, cursoId: string) => {
    const fac = faculdades.find(f => f.id === facId);
    if (!fac) return;
    update(facId, { cursos: fac.cursos.filter(c => c.id !== cursoId) });
  };

  const confirmedCount = faculdades.filter(f => f.confirmed).length;
  const totalCursos = useMemo(() => faculdades.reduce((s, f) => s + f.cursos.length, 0), [faculdades]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <OnboardingStepBanner actions={
        <Button onClick={confirmAll} size="sm" variant="outline" className="gap-1 h-8"><Check className="w-3.5 h-3.5" /> Confirmar Todas</Button>
      } />
      {!isOnboarding && (
        <div>
          <Link to="/areaacademica/criador" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Criador
          </Link>
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <Badge className="mb-2 gap-1"><Building2 className="w-3 h-3" /> Passo 1 de 5</Badge>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" /> Confirmar Faculdades & Cursos
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Validar faculdades, decanos e os cursos (com respetivos coordenadores) de cada uma.
              </p>
            </div>
            <Button onClick={confirmAll} className="gap-2"><Check className="w-4 h-4" /> Confirmar Todas</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold">{totalCursos}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Estudantes</p><p className="text-2xl font-bold">{faculdades.reduce((s, f) => s + f.cursos.reduce((a, c) => a + c.estudantesEsperados, 0), 0)}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold">{faculdades.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Docentes</p><p className="text-2xl font-bold">{totalCursos * 8}</p></Card>
      </div>

      <div className="space-y-4">
        {faculdades.map(f => {
          const cursos = f.cursos;
          return (
            <Card key={f.id} className={`overflow-hidden transition ${f.confirmed ? "border-emerald-300" : ""}`}>
              <div className={`px-5 py-4 border-b flex items-center justify-between flex-wrap gap-3 ${f.confirmed ? "bg-emerald-50/40" : "bg-muted/20"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    {f.editing ? (
                      <Input value={f.name} onChange={e => update(f.id, { name: e.target.value })} className="h-8 text-sm font-semibold mb-1" />
                    ) : (
                      <p className="text-base font-semibold truncate">{f.name}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {cursos.length} cursos</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cursos.reduce((a, c) => a + c.estudantesEsperados, 0)} estudantes est.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
                    <UserCog className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground leading-tight">Decano</p>
                      {f.editing ? (
                        <Select value={f.decano} onValueChange={v => update(f.id, { decano: v })}>
                          <SelectTrigger className="h-6 text-xs border-0 px-0 shadow-none focus:ring-0"><SelectValue /></SelectTrigger>
                          <SelectContent>{decanosPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <p className="text-xs font-semibold leading-tight">{f.decano}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => update(f.id, { editing: !f.editing })}>
                    <Pencil className="w-3 h-3" /> {f.editing ? "Concluir" : "Editar"}
                  </Button>
                  <Button size="sm" className={`gap-1 h-8 ${f.confirmed ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => update(f.id, { confirmed: !f.confirmed, editing: false })}>
                    <Check className="w-3 h-3" /> {f.confirmed ? "Confirmada" : "Confirmar"}
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cursos da Faculdade</p>
                  {f.editing && (
                    <Dialog
                      open={addOpenFor === f.id}
                      onOpenChange={(o) => { setAddOpenFor(o ? f.id : null); if (!o) setDraft({ ...emptyCurso }); }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                          <Plus className="w-3 h-3" /> Adicionar Curso
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Curso</DialogTitle>
                          <DialogDescription className="text-xs">Novo curso para {f.name}</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Código</Label>
                            <Input value={draft.code} onChange={e => setDraft({ ...draft, code: e.target.value })} placeholder="ARQ" className="h-8" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Anos</Label>
                            <Input type="number" min={1} max={8} value={draft.years} onChange={e => setDraft({ ...draft, years: Number(e.target.value) })} className="h-8" />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Nome do Curso</Label>
                            <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Arquitectura" className="h-8" />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <Label className="text-xs">Coordenador</Label>
                            <Select value={draft.coordenador} onValueChange={v => setDraft({ ...draft, coordenador: v })}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{coordenadoresPool.map(co => <SelectItem key={co} value={co}>{co}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Cadeiras/Ano</Label>
                            <Input type="number" min={1} max={12} value={draft.cadeirasPorAno} onChange={e => setDraft({ ...draft, cadeirasPorAno: Number(e.target.value) })} className="h-8" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Estudantes Esp.</Label>
                            <Input type="number" min={0} value={draft.estudantesEsperados} onChange={e => setDraft({ ...draft, estudantesEsperados: Number(e.target.value) })} className="h-8" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" size="sm" onClick={() => { setAddOpenFor(null); setDraft({ ...emptyCurso }); }}>Cancelar</Button>
                          <Button size="sm" onClick={() => addCurso(f.id)} className="gap-1"><Plus className="w-3 h-3" /> Adicionar</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {cursos.map(c => (
                    <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:bg-muted/30 transition">
                      <span className="inline-flex items-center justify-center h-5 min-w-[34px] px-1 rounded bg-primary text-primary-foreground text-[10px] font-bold">{c.code}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.years} anos · ~{c.estudantesEsperados} estudantes</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded border bg-muted/30 shrink-0">
                        <UserCog className="w-3 h-3 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-tight">Coord.</p>
                          {f.editing ? (
                            <Select value={c.coordenador} onValueChange={v => updateCurso(f.id, c.id, { coordenador: v })}>
                              <SelectTrigger className="h-5 text-[11px] border-0 px-0 shadow-none focus:ring-0 gap-1"><SelectValue /></SelectTrigger>
                              <SelectContent>{coordenadoresPool.map(co => <SelectItem key={co} value={co}>{co}</SelectItem>)}</SelectContent>
                            </Select>
                          ) : (
                            <p className="text-[11px] font-semibold leading-tight truncate max-w-[140px]">{c.coordenador}</p>
                          )}
                        </div>
                      </div>
                      {f.editing ? (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeCurso(f.id, c.id)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                  {cursos.length === 0 && (
                    <p className="text-xs text-muted-foreground italic col-span-full">Sem cursos. {f.editing ? "Clique em \"Adicionar Curso\"." : "Active edição para adicionar."}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" asChild><Link to="/areaacademica/criador">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador/cadeiras">Próximo: Confirmar Cadeiras <ChevronRight className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}
