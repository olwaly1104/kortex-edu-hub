import { FinHeader } from "@/pages/financas/_FinHeader";
import { OnboardingStepBanner, markOnboardingStepDone } from "@/components/admin/OnboardingStepBanner";
import { Building2, Lock, LockOpen, Pencil, Check, GraduationCap, Users, UserCog, Plus, X, Loader2, Trash2, Palette } from "lucide-react";
import { FaculdadeSiglaTag } from "@/components/faculdade/FaculdadeSiglaTag";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadDocentes, syncDocentesFromDb, fullName, type DocenteRow } from "@/lib/peopleStorage";
import {
  useFaculdades, useCursos,
  useCreateFaculdade, useUpdateFaculdade, useDeleteFaculdade,
  useCreateCurso, useUpdateCurso, useDeleteCurso,
  type FaculdadeRow, type CursoRow,
} from "@/lib/useInstitution";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminFaculdadesCursos() {
  const { user } = useAuth();
  const facsQ = useFaculdades();
  const cursosQ = useCursos();
  const createFac = useCreateFaculdade();
  const updateFac = useUpdateFaculdade();
  const deleteFac = useDeleteFaculdade();
  const createCurso = useCreateCurso();
  const updateCurso = useUpdateCurso();
  const deleteCurso = useDeleteCurso();

  const faculdades = facsQ.data ?? [];
  const cursos = cursosQ.data ?? [];
  const cursosByFac = useMemo(() => {
    const m = new Map<string, CursoRow[]>();
    cursos.forEach((c) => { const arr = m.get(c.faculdade_id) || []; arr.push(c); m.set(c.faculdade_id, arr); });
    return m;
  }, [cursos]);

  const [docentes, setDocentes] = useState<DocenteRow[]>(() => loadDocentes());
  useEffect(() => {
    // Always pull fresh docentes from the real database when this page mounts
    // so that users created via Admin → Utilizadores (Coordenador, Professor,
    // Decano, Reitor) show up immediately in the Decano/Coordenador dropdowns.
    syncDocentesFromDb().then((rows) => setDocentes(rows)).catch(() => {});
    const refresh = () => setDocentes(loadDocentes());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("upra:people-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("upra:people-changed", refresh);
    };
  }, []);
  const decanoOptions = useMemo(() => docentes.map((d) => fullName(d)).filter(Boolean), [docentes]);
  const coordOptions = decanoOptions;

  // Local UI-only state: which faculdade rows are in edit mode
  const [editingFacIds, setEditingFacIds] = useState<Record<string, boolean>>({});
  // Local buffer for edits in progress (so inputs feel snappy)
  const [edits, setEdits] = useState<Record<string, Partial<FaculdadeRow>>>({});
  const [cursoEdits, setCursoEdits] = useState<Record<string, Partial<CursoRow>>>({});

  // Faculty color palette
  const FAC_COLORS = [
    "#475569", "#1B3A6B", "#0F766E", "#15803D", "#B45309",
    "#B91C1C", "#7C3AED", "#DB2777", "#0EA5E9", "#CA8A04",
  ];

  // Add Faculdade dialog
  const [openAddFac, setOpenAddFac] = useState(false);
  const [newFac, setNewFac] = useState({ name: "", sigla: "", decano: "", color: FAC_COLORS[0] });

  const submitNewFac = async () => {
    if (!newFac.name.trim()) return;
    try {
      await createFac.mutateAsync({ name: newFac.name, sigla: newFac.sigla, decano: newFac.decano, color: newFac.color });
      markOnboardingStepDone(user?.email, "aca.fac");
      setNewFac({ name: "", sigla: "", decano: "", color: FAC_COLORS[0] });
      setOpenAddFac(false);
      toast.success("Faculdade criada");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao criar faculdade");
    }
  };

  // Confirmation dialog for edits
  const [confirmSaveFor, setConfirmSaveFor] = useState<FaculdadeRow | null>(null);


  // Add Curso dialog
  const [openAddCurso, setOpenAddCurso] = useState<string | null>(null);
  const [newCurso, setNewCurso] = useState({ name: "", code: "", years: 4, coordenador: "" });

  const submitNewCurso = async () => {
    if (!openAddCurso || !newCurso.name.trim() || !newCurso.code.trim()) return;
    try {
      await createCurso.mutateAsync({
        faculdade_id: openAddCurso,
        name: newCurso.name,
        code: newCurso.code,
        years: newCurso.years || 4,
        estudantes_esperados: 0,
        coordenador: newCurso.coordenador,
      });
      markOnboardingStepDone(user?.email, "aca.cur");
      setNewCurso({ name: "", code: "", years: 4, coordenador: "" });
      setOpenAddCurso(null);
      toast.success("Curso criado (propina iniciada em 0 Kz)");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao criar curso");
    }
  };

  const performSave = async (f: FaculdadeRow) => {
    const facPatch = edits[f.id];
    if (facPatch && (facPatch.name !== undefined || facPatch.sigla !== undefined || facPatch.decano !== undefined || facPatch.color !== undefined)) {
      await updateFac.mutateAsync({
        id: f.id,
        patch: {
          ...(facPatch.name !== undefined ? { name: facPatch.name } : {}),
          ...(facPatch.sigla !== undefined ? { sigla: facPatch.sigla } : {}),
          ...(facPatch.decano !== undefined ? { decano: facPatch.decano } : {}),
          ...(facPatch.color !== undefined ? { color: facPatch.color } : {}),
        },
      });
    }
    const cursoIds = (cursosByFac.get(f.id) ?? []).map((c) => c.id);
    for (const cid of cursoIds) {
      const patch = cursoEdits[cid];
      if (!patch) continue;
      await updateCurso.mutateAsync({
        id: cid,
        patch: {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.code !== undefined ? { code: patch.code } : {}),
          ...(patch.coordenador !== undefined ? { coordenador: patch.coordenador } : {}),
        },
      });
    }
    setEdits((e) => { const n = { ...e }; delete n[f.id]; return n; });
    setCursoEdits((e) => { const n = { ...e }; cursoIds.forEach((id) => delete n[id]); return n; });
    setEditingFacIds((m) => ({ ...m, [f.id]: false }));
    setConfirmSaveFor(null);
    toast.success("Alterações guardadas");
  };

  const toggleEdit = (f: FaculdadeRow) => {
    const isEditing = !!editingFacIds[f.id];
    if (isEditing) {
      const hasFacChanges = !!edits[f.id] && Object.keys(edits[f.id]).length > 0;
      const cursoIds = (cursosByFac.get(f.id) ?? []).map((c) => c.id);
      const hasCursoChanges = cursoIds.some((id) => cursoEdits[id] && Object.keys(cursoEdits[id]).length > 0);
      if (hasFacChanges || hasCursoChanges) {
        setConfirmSaveFor(f); // open confirmation
      } else {
        setEditingFacIds((m) => ({ ...m, [f.id]: false }));
      }
      return;
    }
    setEditingFacIds((m) => ({ ...m, [f.id]: true }));
  };


  const facValue = (f: FaculdadeRow, key: keyof FaculdadeRow) =>
    (edits[f.id]?.[key] ?? f[key]) as any;
  const cursoValue = (c: CursoRow, key: keyof CursoRow) =>
    (cursoEdits[c.id]?.[key] ?? c[key]) as any;

  const setFacField = (id: string, patch: Partial<FaculdadeRow>) =>
    setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));
  const setCursoField = (id: string, patch: Partial<CursoRow>) =>
    setCursoEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }));

  const totalCursos = cursos.length;
  const coordsCount = cursos.filter((c) => (c.coordenador || "").trim()).length;
  const decanosCount = faculdades.filter((f) => (f.decano || "").trim()).length;

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
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Coordenadores</p><p className="text-2xl font-bold tabular-nums">{coordsCount}</p></div>
        <div className="rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Decanos</p><p className="text-2xl font-bold tabular-nums">{decanosCount}</p></div>
      </div>

      {facsQ.isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> A carregar…</div>
      )}

      <div className="space-y-4">
        {!facsQ.isLoading && faculdades.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <Building2 className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-semibold text-foreground">Nenhuma faculdade registada</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione a primeira faculdade para começar a estrutura académica.</p>
          </div>
        )}
        {faculdades.map((f) => {
          const facCursos = cursosByFac.get(f.id) ?? [];
          const isEditing = !!editingFacIds[f.id];
          return (
          <div key={f.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditing ? (
                      <>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center h-6 px-2 rounded-md text-[11px] font-bold tracking-wider shadow-sm border border-black/10 hover:opacity-90"
                              style={{ backgroundColor: facValue(f, "color") || "#475569", color: "#fff" }}
                              title="Cor da faculdade"
                            >
                              {(facValue(f, "sigla") || "SIGLA").toString().slice(0, 8) || "SIGLA"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="start">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 px-1">Cor da faculdade</p>
                            <div className="grid grid-cols-5 gap-1.5">
                              {FAC_COLORS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setFacField(f.id, { color: c })}
                                  className={`w-6 h-6 rounded-md border-2 ${ (facValue(f, "color") || "#475569") === c ? "border-foreground" : "border-transparent" }`}
                                  style={{ backgroundColor: c }}
                                  aria-label={c}
                                />
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          value={facValue(f, "sigla") || ""}
                          onChange={(e) => setFacField(f.id, { sigla: e.target.value.toUpperCase() })}
                          className="h-6 px-2 py-0 text-[11px] font-bold tracking-wider w-16 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                          placeholder="SIGLA"
                          maxLength={8}
                        />
                        <Input
                          value={facValue(f, "name")}
                          onChange={(e) => setFacField(f.id, { name: e.target.value })}
                          className="h-7 text-base font-semibold w-64"
                          placeholder="Nome da faculdade"
                        />
                      </>
                    ) : (
                      <>
                        <FaculdadeSiglaTag sigla={f.sigla} color={(f as any).color} className="h-6 text-[11px]" />
                        <p className="text-base font-semibold truncate leading-none">{f.name}</p>
                      </>
                    )}

                    {/* Decano chip — same visual as coordenador chip on cursos */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 shrink-0">
                      <UserCog className="w-3 h-3 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-tight">Decano</p>
                        {isEditing ? (
                          <Select value={facValue(f, "decano") || undefined} onValueChange={(v) => setFacField(f.id, { decano: v })}>
                            <SelectTrigger className="h-5 text-[11px] border-0 px-0 shadow-none focus:ring-0 gap-1 max-w-[160px]">
                              <SelectValue placeholder={decanoOptions.length ? "Decano" : "Decano"} />
                            </SelectTrigger>
                            <SelectContent>
                              {decanoOptions.length === 0 ? (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">Registe docentes em Configurar → Docentes.</div>
                              ) : decanoOptions.map((d) => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-[11px] font-semibold leading-tight truncate max-w-[160px]">{f.decano || <span className="text-muted-foreground italic font-normal">Sem docentes</span>}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {facCursos.length} cursos</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {facCursos.reduce((a, c) => a + (c.estudantes_esperados || 0), 0)} estudantes</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold ${isEditing ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-muted text-muted-foreground"}`}>
                  {isEditing ? <><LockOpen className="w-3 h-3" /> Desbloqueado</> : <><Lock className="w-3 h-3" /> Bloqueado</>}
                </span>

                <Button
                  size="sm"
                  variant={isEditing ? "default" : "outline"}
                  className={`gap-1 h-7 ${isEditing ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" : ""}`}
                  onClick={() => toggleEdit(f)}
                >
                  {isEditing ? <><Check className="w-3.5 h-3.5" /> Confirmar</> : <><Pencil className="w-3.5 h-3.5" /> Editar</>}
                </Button>
                {isEditing && (
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={async () => {
                    if (!confirm(`Eliminar a faculdade "${f.name}" e todos os seus cursos?`)) return;
                    await deleteFac.mutateAsync(f.id);
                    toast.success("Faculdade eliminada");
                  }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cursos da Faculdade</p>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setOpenAddCurso(f.id)}>
                  <Plus className="w-3 h-3" /> Adicionar Curso
                </Button>
              </div>
              {facCursos.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Nenhum curso registado nesta faculdade.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {facCursos.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card">
                      <span className="inline-flex items-center justify-center h-5 min-w-[34px] px-1 rounded bg-primary text-primary-foreground text-[10px] font-bold">{c.code}</span>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <Input value={cursoValue(c, "name")} onChange={(e) => setCursoField(c.id, { name: e.target.value })} className="h-6 text-xs mb-0.5" />
                        ) : (
                          <p className="text-xs font-medium truncate">{c.name}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground truncate">{c.years} anos</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-muted/30 shrink-0">
                        <UserCog className="w-3 h-3 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-tight">Coord.</p>
                          {isEditing ? (
                            <Select value={cursoValue(c, "coordenador") || undefined} onValueChange={(v) => setCursoField(c.id, { coordenador: v })}>
                              <SelectTrigger className="h-5 text-[11px] border-0 px-0 shadow-none focus:ring-0 gap-1 max-w-[140px]"><SelectValue placeholder={coordOptions.length ? "Escolher" : "Sem docentes"} /></SelectTrigger>
                              <SelectContent>
                                {coordOptions.length === 0 ? (
                                  <div className="px-2 py-1.5 text-xs text-muted-foreground">Registe docentes primeiro.</div>
                                ) : coordOptions.map((co) => <SelectItem key={co} value={co} className="text-xs">{co}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-[11px] font-semibold leading-tight truncate max-w-[140px]">{c.coordenador || <span className="text-muted-foreground italic font-normal">Por atribuir</span>}</p>
                          )}
                        </div>
                      </div>
                      {isEditing && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={async () => {
                          if (!confirm(`Eliminar o curso "${c.name}"?`)) return;
                          await deleteCurso.mutateAsync(c.id);
                          toast.success("Curso eliminado");
                        }}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Add Faculdade dialog */}
      <Dialog open={openAddFac} onOpenChange={setOpenAddFac}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Faculdade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="fac-name" className="text-xs">Nome da Faculdade</Label>
                <Input id="fac-name" value={newFac.name} onChange={(e) => setNewFac({ ...newFac, name: e.target.value })} placeholder="Ex: Faculdade de Ciências Exatas" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fac-sigla" className="text-xs">Sigla</Label>
                <Input id="fac-sigla" value={newFac.sigla} onChange={(e) => setNewFac({ ...newFac, sigla: e.target.value.toUpperCase() })} placeholder="FCE" maxLength={8} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fac-decano" className="text-xs">Decano <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              {decanoOptions.length === 0 ? (
                <div className="text-xs text-muted-foreground border border-dashed border-border rounded-md px-3 py-2">
                  Nenhum docente registado. <Link to="/admin/docentes" className="text-primary underline">Adicionar em Docentes</Link>.
                </div>
              ) : (
                <Select value={newFac.decano || undefined} onValueChange={(v) => setNewFac({ ...newFac, decano: v })}>
                  <SelectTrigger id="fac-decano"><SelectValue placeholder="Escolher decano" /></SelectTrigger>
                  <SelectContent>
                    {decanoOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5"><Palette className="w-3 h-3" /> Cor da Faculdade</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {FAC_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewFac({ ...newFac, color: c })}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${newFac.color === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                  />
                ))}
                <span
                  className="ml-2 inline-flex items-center justify-center h-6 px-2 rounded-md text-[11px] font-bold tracking-wider shadow-sm"
                  style={{ backgroundColor: newFac.color, color: "#fff" }}
                >
                  {newFac.sigla || "SIGLA"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={submitNewFac} disabled={!newFac.name.trim() || createFac.isPending}>
              {createFac.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> A criar…</> : "Criar Faculdade"}
            </Button>
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
                <Label htmlFor="cur-code" className="text-xs">Sigla</Label>
                <Input id="cur-code" value={newCurso.code} onChange={(e) => setNewCurso({ ...newCurso, code: e.target.value })} placeholder="ARQ" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cur-years" className="text-xs">Duração (anos)</Label>
              <Input id="cur-years" type="number" min={1} max={8} value={newCurso.years} onChange={(e) => setNewCurso({ ...newCurso, years: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cur-coord" className="text-xs">Coordenador <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              {coordOptions.length === 0 ? (
                <div className="text-xs text-muted-foreground border border-dashed border-border rounded-md px-3 py-2">
                  Nenhum docente registado. <Link to="/admin/docentes" className="text-primary underline">Adicionar em Docentes</Link>.
                </div>
              ) : (
                <Select value={newCurso.coordenador || undefined} onValueChange={(v) => setNewCurso({ ...newCurso, coordenador: v })}>
                  <SelectTrigger id="cur-coord"><SelectValue placeholder="Escolher coordenador" /></SelectTrigger>
                  <SelectContent>
                    {coordOptions.map((co) => <SelectItem key={co} value={co}>{co}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground bg-muted/40 rounded-md px-3 py-2 border border-border">
              A propina mensal deste curso é criada automaticamente em <strong>0&nbsp;Kz</strong>. Define o valor em <Link to="/financas/configurar/receitas" className="text-primary underline">Finanças → Configurar Receitas → Propinas por Curso</Link>.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancelar</Button></DialogClose>
            <Button size="sm" onClick={submitNewCurso} disabled={!newCurso.name.trim() || !newCurso.code.trim() || createCurso.isPending}>
              {createCurso.isPending ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> A criar…</> : "Criar Curso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm save changes */}
      <AlertDialog open={!!confirmSaveFor} onOpenChange={(o) => !o && setConfirmSaveFor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Tens a certeza que queres guardar as alterações na faculdade{" "}
              <strong>{confirmSaveFor?.name}</strong>? Esta ação irá actualizar os dados em toda a plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => confirmSaveFor && performSave(confirmSaveFor)}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" /> Sim, guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
