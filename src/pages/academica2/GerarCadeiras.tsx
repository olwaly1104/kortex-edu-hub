import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Check, ArrowLeft, Plus, Trash2, GraduationCap, Eye,
  Building2, ChevronDown, ChevronRight, Users, Timer, Loader2,
} from "lucide-react";
import { CadeiraPreviewDialog } from "@/components/admin/CadeiraPreviewDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFaculdades, useCursos,
  useCadeiras, useCreateCadeira, useUpdateCadeira, useDeleteCadeira,
  type CadeiraRow,
} from "@/lib/useInstitution";

export default function GerarCadeiras() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();

  const { data: faculdades = [], isLoading: facLoading } = useFaculdades();
  const { data: cursos = [], isLoading: curLoading } = useCursos();
  const { data: cadeiras = [], isLoading: cadLoading } = useCadeiras();

  const createCadeira = useCreateCadeira();
  const updateCadeira = useUpdateCadeira();
  const deleteCadeira = useDeleteCadeira();

  const loading = facLoading || curLoading || cadLoading;

  const [cadeiraCurso, setCadeiraCurso] = useState<string>("");
  const [openFacs, setOpenFacs] = useState<Record<string, boolean>>({});
  const [previewCadeira, setPreviewCadeira] = useState<CadeiraRow | null>(null);
  const toggleFac = (f: string) => setOpenFacs(p => ({ ...p, [f]: !p[f] }));

  // Auto-select first curso when data arrives.
  if (!cadeiraCurso && cursos.length > 0) {
    setTimeout(() => setCadeiraCurso(cursos[0].id), 0);
  }

  const selectedCurso = cursos.find(c => c.id === cadeiraCurso);
  const cadeirasByCurso = useMemo(() => {
    const map: Record<string, CadeiraRow[]> = {};
    cadeiras.forEach(c => {
      (map[c.curso_id] ||= []).push(c);
    });
    return map;
  }, [cadeiras]);

  const cadeirasOfSelected = cadeirasByCurso[cadeiraCurso] ?? [];
  const anosRange = useMemo(() => {
    const years = selectedCurso?.years ?? 4;
    return Array.from({ length: years }, (_, i) => i);
  }, [selectedCurso]);

  const cadeirasByAno = useMemo(() => {
    const map: Record<number, CadeiraRow[]> = {};
    cadeirasOfSelected.forEach(c => {
      (map[c.ano] ||= []).push(c);
    });
    return map;
  }, [cadeirasOfSelected]);

  const total = cadeiras.length;
  const cursoTotal = cadeirasOfSelected.length;
  const docentesUsados = useMemo(() => {
    const s = new Set<string>();
    cadeiras.forEach(c => { if (c.docente) s.add(c.docente); });
    return s.size;
  }, [cadeiras]);
  const minutosAula = total * 8 * 90;

  const facsWithCursos = useMemo(
    () => faculdades.filter(f => cursos.some(c => c.faculdade_id === f.id)),
    [faculdades, cursos]
  );

  const handleAdd = (ano: number) => {
    if (!cadeiraCurso) return;
    const ordem = (cadeirasByAno[ano]?.length ?? 0);
    createCadeira.mutate(
      { curso_id: cadeiraCurso, ano, name: "Nova Cadeira", ects: 6, semestre: "1", ordem },
      { onError: (e: any) => toast.error(e.message ?? "Erro ao criar cadeira") }
    );
  };

  const handleUpdate = (id: string, patch: Partial<CadeiraRow>) => {
    updateCadeira.mutate(
      { id, patch: patch as any },
      { onError: (e: any) => toast.error(e.message ?? "Erro ao atualizar") }
    );
  };

  const handleDelete = (id: string) => {
    deleteCadeira.mutate(id, {
      onError: (e: any) => toast.error(e.message ?? "Erro ao remover"),
    });
  };

  const confirmAll = () => {
    markOnboardingStepDone(user?.email, "aca.cad");
    toast.success("Alocação confirmada");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <OnboardingStepBanner actions={
        <Button onClick={confirmAll} size="sm" variant="outline" className="gap-1 h-8">
          <Check className="w-3.5 h-3.5" /> Confirmar Alocação
        </Button>
      } />
      {!isOnboarding && (
        <div>
          <Link to="/areaacademica/criador" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Criador
          </Link>
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <Badge className="mb-2 gap-1"><BookOpen className="w-3 h-3" /> Passo 3 de 6</Badge>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" /> Confirmar Cadeiras
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Alocar cadeiras, docente, ECTS e semestre por curso e por ano.
              </p>
            </div>
            <Button onClick={confirmAll} className="gap-2"><Check className="w-4 h-4" /> Confirmar Alocação</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Building2 className="w-3.5 h-3.5" /><p className="text-xs">Faculdades</p></div>
          <p className="text-2xl font-bold">{facsWithCursos.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div>
          <p className="text-2xl font-bold">{cursos.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><BookOpen className="w-3.5 h-3.5" /><p className="text-xs">Cadeiras</p></div>
          <p className="text-2xl font-bold text-primary">{total}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Docentes</p></div>
          <p className="text-2xl font-bold">{docentesUsados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Timer className="w-3.5 h-3.5" /><p className="text-xs">Minutos de Aula</p></div>
          <p className="text-2xl font-bold">{minutosAula.toLocaleString("pt-PT")}<span className="text-xs text-muted-foreground font-normal ml-1">min</span></p>
        </Card>
      </div>

      {loading ? (
        <Card className="p-12 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> A carregar…
        </Card>
      ) : cursos.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Ainda não existem cursos. Crie faculdades e cursos antes de alocar cadeiras.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-[260px_1fr] gap-4">
          <Card className="p-3 h-fit space-y-2">
            {facsWithCursos.map(fac => {
              const cursosOfFac = cursos.filter(c => c.faculdade_id === fac.id);
              const isOpen = openFacs[fac.id];
              return (
                <div key={fac.id} className="space-y-1.5">
                  <button
                    onClick={() => toggleFac(fac.id)}
                    className="w-full flex items-center gap-1.5 px-2 py-2 rounded-md hover:bg-muted/50 transition"
                  >
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-wide flex-1 text-left leading-tight break-words">{fac.name}</span>
                    <Badge variant="outline" className="text-[10px]">{cursosOfFac.length}</Badge>
                  </button>
                  {isOpen && (
                    <div className="space-y-0.5 pl-4 border-l ml-3">
                      {cursosOfFac.map(curso => {
                        const isSel = cadeiraCurso === curso.id;
                        const count = cadeirasByCurso[curso.id]?.length ?? 0;
                        return (
                          <button
                            key={curso.id}
                            onClick={() => setCadeiraCurso(curso.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center justify-between transition ${
                              isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                            }`}
                          >
                            <span className="truncate font-medium flex items-center gap-1.5">
                              <GraduationCap className="w-3 h-3 shrink-0 opacity-70" />
                              {curso.name}
                            </span>
                            <Badge variant={isSel ? "secondary" : "outline"} className="text-[10px] ml-2">{count}</Badge>
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
            {!selectedCurso ? (
              <Card className="p-12 text-center text-sm text-muted-foreground">
                Selecione um curso na barra lateral.
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{selectedCurso.name}</span> · {cursoTotal} cadeiras
                  </p>
                </div>
                {anosRange.map(ano => {
                  const list = (cadeirasByAno[ano] ?? []);
                  return (
                    <Card key={ano} className="overflow-hidden">
                      <div className="bg-primary/10 px-4 py-2.5 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-primary">{ano + 1}º Ano</p>
                          <Badge variant="outline" className="text-[10px]">{list.length} cadeiras</Badge>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleAdd(ano)} disabled={createCadeira.isPending} className="h-7 gap-1 text-xs">
                          <Plus className="w-3 h-3" /> Adicionar
                        </Button>
                      </div>
                      <div className="grid grid-cols-[1fr_180px_90px_70px_36px_36px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
                        <span>Cadeira</span><span>Docente</span><span>Semestre</span><span>ECTS</span><span></span><span></span>
                      </div>
                      {list.length === 0 ? (
                        <div className="p-4 text-xs text-muted-foreground text-center">
                          Sem cadeiras neste ano. Clique em "Adicionar".
                        </div>
                      ) : (
                        <div className="divide-y">
                          {list.map(c => (
                            <div key={c.id} className="grid grid-cols-[1fr_180px_90px_70px_36px_36px] gap-2 p-2 items-center">
                              <Input
                                defaultValue={c.name}
                                onBlur={e => {
                                  const v = e.target.value.trim();
                                  if (v && v !== c.name) handleUpdate(c.id, { name: v });
                                }}
                                className="h-8 text-xs"
                              />
                              <Input
                                defaultValue={c.docente ?? ""}
                                placeholder="Docente"
                                onBlur={e => {
                                  const v = e.target.value.trim();
                                  if (v !== (c.docente ?? "")) handleUpdate(c.id, { docente: v || null } as any);
                                }}
                                className="h-8 text-xs"
                              />
                              <Select
                                value={c.semestre}
                                onValueChange={v => handleUpdate(c.id, { semestre: v })}
                              >
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1º Sem</SelectItem>
                                  <SelectItem value="2">2º Sem</SelectItem>
                                  <SelectItem value="anual">Anual</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                value={String(c.ects)}
                                onValueChange={v => handleUpdate(c.id, { ects: Number(v) })}
                              >
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {[3, 4, 5, 6, 7.5, 9, 12].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild><Link to="/areaacademica/criador/cursos">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador">Concluir e voltar ao Criador <Check className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}
