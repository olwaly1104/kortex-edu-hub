import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Check, Users, ChevronDown, ChevronRight, Building2, GraduationCap, Plus, Trash2, MapPin, ClipboardList, Layers, Eye, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type TurmaRow = {
  id: string;
  curso_id: string;
  ano: string;
  letra: string;
  sala: string | null;
  turno: string | null;
  capacidade: number;
};

const turnos = ["Manhã", "Tarde", "Noite"] as const;
const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function CriarTurmas() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: faculdades = [] } = useQuery({
    queryKey: ["faculdades-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faculdades").select("id,name,sigla").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: cursos = [] } = useQuery({
    queryKey: ["cursos-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cursos").select("id,name,code,years,faculdade_id").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: turmas = [], isLoading: loadingTurmas } = useQuery({
    queryKey: ["turmas-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("turmas").select("*").order("ano").order("letra");
      if (error) throw error;
      return (data ?? []) as TurmaRow[];
    },
  });

  const { data: estudantes = [] } = useQuery({
    queryKey: ["estudantes-all-lite"],
    queryFn: async () => {
      const { data, error } = await supabase.from("estudantes").select("id,nome,email,curso_id,ano,turma");
      if (error) throw error;
      return data ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: async (row: { curso_id: string; ano: string; letra: string }) => {
      const { error } = await supabase.from("turmas").insert({
        ...row,
        owner_user_id: user?.id!,
        capacidade: 32,
        turno: "Manhã",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turmas-all"] }),
    onError: (e: any) => toast.error(e.message || "Erro ao criar turma"),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<TurmaRow> }) => {
      const { error } = await supabase.from("turmas").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turmas-all"] }),
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("turmas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turmas-all"] }),
    onError: (e: any) => toast.error(e.message || "Erro ao remover"),
  });

  const facsWithCursos = useMemo(
    () => faculdades.filter((f) => cursos.some((c) => c.faculdade_id === f.id)),
    [faculdades, cursos]
  );

  const [openFacs, setOpenFacs] = useState<Record<string, boolean>>({});
  const toggleFac = (f: string) => setOpenFacs((p) => ({ ...p, [f]: !p[f] }));
  const [selectedCurso, setSelectedCurso] = useState<string>("");

  useEffect(() => {
    if (!selectedCurso && cursos.length) setSelectedCurso(cursos[0].id);
  }, [cursos, selectedCurso]);

  const curso = cursos.find((c) => c.id === selectedCurso);

  const turmasByCursoAno = useMemo(() => {
    const map: Record<string, Record<string, TurmaRow[]>> = {};
    turmas.forEach((t) => {
      map[t.curso_id] ??= {};
      map[t.curso_id][t.ano] ??= [];
      map[t.curso_id][t.ano].push(t);
    });
    return map;
  }, [turmas]);

  const countPorCurso = (cid: string) =>
    Object.values(turmasByCursoAno[cid] ?? {}).reduce((a, arr) => a + arr.length, 0);

  const totals = useMemo(() => ({
    turmas: turmas.length,
    capacidade: turmas.reduce((a, t) => a + (t.capacidade ?? 0), 0),
    estudantes: estudantes.length,
  }), [turmas, estudantes]);

  const [verTurma, setVerTurma] = useState<TurmaRow | null>(null);

  const estudantesVer = useMemo(() => {
    if (!verTurma) return [];
    return estudantes.filter(
      (e) => e.curso_id === verTurma.curso_id && String(e.ano) === String(verTurma.ano) && e.turma === verTurma.letra
    );
  }, [verTurma, estudantes]);

  const [novaTurma, setNovaTurma] = useState<{ curso_id: string; ano: string; letra: string; sala: string; turno: string; capacidade: number } | null>(null);

  const openAddTurma = (cid: string, ano: string) => {
    const existing = turmasByCursoAno[cid]?.[ano] ?? [];
    const used = new Set(existing.map((t) => t.letra));
    const nextLetra = LETRAS.find((l) => !used.has(l)) ?? `T${existing.length + 1}`;
    setNovaTurma({ curso_id: cid, ano, letra: nextLetra, sala: "", turno: "Manhã", capacidade: 32 });
  };

  const confirmarNovaTurma = async () => {
    if (!novaTurma) return;
    const letra = novaTurma.letra.trim().toUpperCase();
    if (!letra) { toast.error("Indique o nome/letra da turma"); return; }
    const existing = turmasByCursoAno[novaTurma.curso_id]?.[novaTurma.ano] ?? [];
    if (existing.some((t) => t.letra.toUpperCase() === letra)) {
      toast.error(`Já existe uma turma "${letra}" neste ano.`);
      return;
    }
    try {
      const { error } = await supabase.from("turmas").insert({
        curso_id: novaTurma.curso_id,
        ano: novaTurma.ano,
        letra,
        owner_user_id: user?.id!,
        sala: novaTurma.sala || null,
        turno: novaTurma.turno,
        capacidade: novaTurma.capacidade || 0,
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["turmas-all"] });
      toast.success("Turma criada");
      setNovaTurma(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar turma");
    }
  };

  const confirmTurmas = () => {
    markOnboardingStepDone(user?.email, "aca.tur");
    toast.success("Turmas confirmadas");
  };

  const anosDoCurso = useMemo(() => {
    if (!curso) return [] as string[];
    const set = new Set<string>();
    for (let i = 1; i <= curso.years; i++) set.add(String(i));
    Object.keys(turmasByCursoAno[curso.id] ?? {}).forEach((a) => set.add(a));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [curso, turmasByCursoAno]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <OnboardingStepBanner actions={
        <Button onClick={confirmTurmas} size="sm" variant="outline" className="gap-1 h-8"><Check className="w-3.5 h-3.5" /> Confirmar</Button>
      } />
      {!isOnboarding && (
        <div>
          <Link to="/areaacademica/criador" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Criador
          </Link>
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <Badge className="mb-2 gap-1"><ClipboardList className="w-3 h-3" /> Passo 4 de 6</Badge>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" /> Criar Turmas
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Configure turmas por curso e ano. Capacidade, sala e turno.</p>
            </div>
            <Button onClick={confirmTurmas} className="gap-2"><Check className="w-4 h-4" /> Confirmar Turmas</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Building2 className="w-3.5 h-3.5" /><p className="text-xs">Faculdades</p></div><p className="text-2xl font-bold">{facsWithCursos.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div><p className="text-2xl font-bold">{cursos.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Layers className="w-3.5 h-3.5" /><p className="text-xs">Turmas</p></div><p className="text-2xl font-bold text-primary">{totals.turmas}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Capacidade</p></div><p className="text-2xl font-bold">{totals.capacidade}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><ClipboardList className="w-3.5 h-3.5" /><p className="text-xs">Estudantes</p></div><p className="text-2xl font-bold">{totals.estudantes}</p></Card>
      </div>

      {cursos.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Ainda não existem cursos. Crie cursos e faculdades antes de configurar turmas.
        </Card>
      ) : (
      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <Card className="p-3 h-fit space-y-2">
          {facsWithCursos.map((fac) => {
            const cursosOfFac = cursos.filter((c) => c.faculdade_id === fac.id);
            const isOpen = openFacs[fac.id];
            return (
              <div key={fac.id} className="space-y-1.5">
                <button onClick={() => toggleFac(fac.id)} className="w-full flex items-center gap-1.5 px-2 py-2 rounded-md hover:bg-muted/50 transition">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wide flex-1 text-left leading-tight break-words">{fac.name}</span>
                  <Badge variant="outline" className="text-[10px]">{cursosOfFac.length}</Badge>
                </button>
                {isOpen && (
                  <div className="space-y-0.5 pl-4 border-l ml-3">
                    {cursosOfFac.map((c) => {
                      const isSel = selectedCurso === c.id;
                      return (
                        <button key={c.id} onClick={() => setSelectedCurso(c.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center justify-between transition ${
                            isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                          }`}>
                          <span className="truncate font-medium flex items-center gap-1.5">
                            <GraduationCap className="w-3 h-3 shrink-0 opacity-70" />
                            {c.name}
                          </span>
                          <Badge variant={isSel ? "secondary" : "outline"} className="text-[10px] ml-2">{countPorCurso(c.id)}</Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </Card>

        <div className="space-y-3 min-w-0">
          {curso && (
            <Card className="p-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold">{curso.name} <span className="text-muted-foreground font-normal">({curso.code})</span></p>
                <p className="text-[11px] text-muted-foreground">{faculdades.find((f) => f.id === curso.faculdade_id)?.name} · {curso.years} anos</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                Estudantes: {estudantes.filter((e) => e.curso_id === curso.id).length}
              </Badge>
            </Card>
          )}

          {loadingTurmas && (
            <Card className="p-6 text-center text-xs text-muted-foreground inline-flex items-center gap-2 justify-center w-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> A carregar turmas…
            </Card>
          )}

          {curso && anosDoCurso.map((ano) => {
            const arr = turmasByCursoAno[curso.id]?.[ano] ?? [];
            return (
              <Card key={ano} className="overflow-hidden">
                <div className="bg-primary/10 px-4 py-2.5 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-primary">{ano}º Ano</p>
                    <Badge variant="outline" className="text-[10px]">{arr.length} turmas</Badge>
                    <Badge variant="outline" className="text-[10px]">{arr.reduce((a, t) => a + t.capacidade, 0)} lugares</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addTurma(curso.id, ano)} disabled={createMut.isPending} className="h-7 gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Adicionar Turma
                  </Button>
                </div>
                {arr.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">Sem turmas configuradas.</div>
                ) : (
                  <>
                    <div className="grid grid-cols-[60px_1fr_110px_110px_70px_36px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
                      <span>Turma</span><span>Sala</span><span>Turno</span><span>Capacidade</span><span>Alunos</span><span></span>
                    </div>
                    <div className="divide-y">
                      {arr.map((t) => {
                        const codigo = `${curso.code}-${ano}${t.letra}`;
                        const nAlunos = estudantes.filter((e) => e.curso_id === curso.id && String(e.ano) === String(ano) && e.turma === t.letra).length;
                        return (
                          <div key={t.id} className="grid grid-cols-[60px_1fr_110px_110px_70px_36px] gap-2 p-2 items-center">
                            <div className="flex items-center gap-1.5 font-bold text-primary text-sm pl-2">
                              <span>{codigo}</span>
                            </div>
                            <Input value={t.sala ?? ""} placeholder="Sala"
                              onChange={(e) => updateMut.mutate({ id: t.id, patch: { sala: e.target.value } })}
                              className="h-8 text-xs" />
                            <Select value={t.turno ?? "Manhã"} onValueChange={(v) => updateMut.mutate({ id: t.id, patch: { turno: v } })}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{turnos.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                            <Input type="number" value={t.capacidade}
                              onChange={(e) => updateMut.mutate({ id: t.id, patch: { capacidade: +e.target.value || 0 } })}
                              className="h-8 text-xs" />
                            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setVerTurma(t)}>
                              <Eye className="w-3 h-3" /> Ver
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => {
                              if (confirm(`Remover turma ${codigo}?`)) deleteMut.mutate(t.id);
                            }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      </div>
      )}

      {!isOnboarding && (
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" asChild><Link to="/areaacademica/criador/cadeiras">Voltar</Link></Button>
          <Button asChild className="gap-2"><Link to="/areaacademica/criador/calendario">Próximo: Calendário <Check className="w-4 h-4" /></Link></Button>
        </div>
      )}

      <Dialog open={!!verTurma} onOpenChange={(o) => !o && setVerTurma(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Turma {verTurma && curso ? `${curso.code}-${verTurma.ano}${verTurma.letra}` : ""}</DialogTitle>
            <DialogDescription className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {verTurma?.sala || "—"}</span>
              <span>· {verTurma?.turno || "—"}</span>
              <span>· {estudantesVer.length}/{verTurma?.capacidade} alunos</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto border rounded-md">
            <div className="grid grid-cols-[40px_1fr_1fr] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b sticky top-0">
              <span>#</span><span>Nome</span><span>Email</span>
            </div>
            <div className="divide-y">
              {estudantesVer.map((e, i) => (
                <div key={e.id} className="grid grid-cols-[40px_1fr_1fr] gap-2 px-3 py-1.5 text-xs items-center">
                  <span className="text-muted-foreground">{i + 1}</span>
                  <span className="font-medium truncate">{e.nome}</span>
                  <span className="text-muted-foreground inline-flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" />{e.email}</span>
                </div>
              ))}
              {estudantesVer.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">Sem alunos alocados a esta turma.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
