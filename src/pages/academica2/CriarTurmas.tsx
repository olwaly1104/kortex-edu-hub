import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cursoTemplates, alocacaoCandidatos } from "@/data/academica2Data";
import { ArrowLeft, Check, Users, ChevronDown, ChevronRight, Building2, GraduationCap, Plus, Trash2, MapPin, ClipboardList, Layers, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Turma = { id: string; letra: string; capacidade: number; sala: string; turno: "Manhã" | "Tarde" | "Noite" };
type CursoTurmas = Record<number, Turma[]>; // year -> turmas

const salasPool = ["Sala 101", "Sala 102", "Sala 203", "Sala 204", "Anfiteatro A", "Anfiteatro B", "Lab. Info 1", "Lab. Info 2", "Auditório"];
const turnos: Turma["turno"][] = ["Manhã", "Tarde", "Noite"];
const LETRAS = ["A", "B", "C", "D", "E"];

const buildDefault = (years: number, estudantesEsperados: number): CursoTurmas => {
  const out: CursoTurmas = {};
  // year 1 receives most students (admission cohort); other years carry-over with 4 turmas
  for (let y = 1; y <= years; y++) {
    const total = y === 1 ? estudantesEsperados : Math.round(estudantesEsperados * 0.85);
    const nTurmas = y === 1 ? Math.min(5, Math.max(2, Math.ceil(total / 32))) : 4;
    const capacidade = Math.ceil(total / nTurmas);
    out[y] = Array.from({ length: nTurmas }, (_, i) => ({
      id: `t-${y}-${i}`,
      letra: LETRAS[i],
      capacidade,
      sala: salasPool[(y + i) % salasPool.length],
      turno: turnos[i % turnos.length],
    }));
  }
  return out;
};

export default function CriarTurmas() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, CursoTurmas>>(() =>
    Object.fromEntries(cursoTemplates.map(c => [c.id, buildDefault(c.years, c.estudantesEsperados)]))
  );

  const faculdades = useMemo(
    () => Array.from(new Set(cursoTemplates.map(c => c.faculty))),
    []
  );
  const [openFacs, setOpenFacs] = useState<Record<string, boolean>>({});
  const toggleFac = (f: string) => setOpenFacs(p => ({ ...p, [f]: !p[f] }));
  const [selectedCurso, setSelectedCurso] = useState<string>(cursoTemplates[0].id);

  const curso = cursoTemplates.find(c => c.id === selectedCurso)!;
  const cursoTurmas = data[selectedCurso];

  const update = (cid: string, ano: number, idx: number, patch: Partial<Turma>) =>
    setData(prev => ({
      ...prev,
      [cid]: { ...prev[cid], [ano]: prev[cid][ano].map((t, i) => i === idx ? { ...t, ...patch } : t) },
    }));

  const addTurma = (cid: string, ano: number) =>
    setData(prev => {
      const arr = prev[cid][ano];
      const nextLetra = LETRAS[arr.length] ?? `T${arr.length + 1}`;
      return { ...prev, [cid]: { ...prev[cid], [ano]: [...arr, { id: `t-${ano}-${arr.length}-${Date.now()}`, letra: nextLetra, capacidade: 32, sala: salasPool[0], turno: "Manhã" }] } };
    });

  const removeTurma = (cid: string, ano: number, idx: number) =>
    setData(prev => ({ ...prev, [cid]: { ...prev[cid], [ano]: prev[cid][ano].filter((_, i) => i !== idx) } }));

  const regenerate = () =>
    setData(Object.fromEntries(cursoTemplates.map(c => [c.id, buildDefault(c.years, c.estudantesEsperados)])));

  const confirmTurmas = () => {
    markOnboardingStepDone(user?.email, "aca.tur");
    toast.success("Turmas confirmadas para todos os cursos");
  };

  const totals = useMemo(() => {
    let turmas = 0, capacidade = 0;
    Object.values(data).forEach(c => Object.values(c).forEach(arr => arr.forEach(t => { turmas++; capacidade += t.capacidade; })));
    return { turmas, capacidade };
  }, [data]);

  const candidatosPorCurso = useMemo(() => {
    const m: Record<string, number> = {};
    alocacaoCandidatos.forEach(c => {
      const found = cursoTemplates.find(ct => ct.name === c.curso);
      if (found) m[found.id] = (m[found.id] ?? 0) + 1;
    });
    return m;
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <OnboardingStepBanner actions={
        <>
          <Button onClick={regenerate} size="sm" variant="outline" className="gap-1 h-8"><Wand2 className="w-3.5 h-3.5" /> Regenerar</Button>
          <Button onClick={confirmTurmas} size="sm" variant="outline" className="gap-1 h-8"><Check className="w-3.5 h-3.5" /> Confirmar</Button>
        </>
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
              <p className="text-muted-foreground mt-1 text-sm">Geração automática de turmas (A–E) por curso e ano. Configure capacidade, sala e turno.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={regenerate} className="gap-2"><Wand2 className="w-4 h-4" /> Regenerar Automático</Button>
              <Button onClick={confirmTurmas} className="gap-2"><Check className="w-4 h-4" /> Confirmar Turmas</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Building2 className="w-3.5 h-3.5" /><p className="text-xs">Faculdades</p></div><p className="text-2xl font-bold">{faculdades.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div><p className="text-2xl font-bold">{cursoTemplates.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Layers className="w-3.5 h-3.5" /><p className="text-xs">Turmas</p></div><p className="text-2xl font-bold text-primary">{totals.turmas}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Capacidade</p></div><p className="text-2xl font-bold">{totals.capacidade}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><ClipboardList className="w-3.5 h-3.5" /><p className="text-xs">Candidatos</p></div><p className="text-2xl font-bold">{alocacaoCandidatos.length}</p></Card>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-4">
        <Card className="p-3 h-fit space-y-2">
          {faculdades.map(fac => {
            const cursosOfFac = cursoTemplates.filter(c => c.faculty === fac);
            const isOpen = openFacs[fac];
            return (
              <div key={fac} className="space-y-1.5">
                <button onClick={() => toggleFac(fac)} className="w-full flex items-center gap-1.5 px-2 py-2 rounded-md hover:bg-muted/50 transition">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wide flex-1 text-left leading-tight break-words">{fac}</span>
                  <Badge variant="outline" className="text-[10px]">{cursosOfFac.length}</Badge>
                </button>
                {isOpen && (
                  <div className="space-y-0.5 pl-4 border-l ml-3">
                    {cursosOfFac.map(c => {
                      const isSel = selectedCurso === c.id;
                      const count = Object.values(data[c.id] ?? {}).reduce((a, r) => a + r.length, 0);
                      return (
                        <button key={c.id} onClick={() => setSelectedCurso(c.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-sm flex items-center justify-between transition ${
                            isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                          }`}>
                          <span className="truncate font-medium flex items-center gap-1.5">
                            <GraduationCap className="w-3 h-3 shrink-0 opacity-70" />
                            {c.name}
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
          <Card className="p-3 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-semibold">{curso.name} <span className="text-muted-foreground font-normal">({curso.code})</span></p>
              <p className="text-[11px] text-muted-foreground">{curso.faculty} · {curso.years} anos · {curso.estudantesEsperados} estudantes esperados</p>
            </div>
            <Badge variant="outline" className="text-[10px]">Candidatos alocados: {candidatosPorCurso[curso.id] ?? 0}</Badge>
          </Card>

          {Object.entries(cursoTurmas).map(([anoStr, turmas]) => {
            const ano = Number(anoStr);
            return (
              <Card key={ano} className="overflow-hidden">
                <div className="bg-primary/10 px-4 py-2.5 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-primary">{ano}º Ano</p>
                    <Badge variant="outline" className="text-[10px]">{turmas.length} turmas</Badge>
                    <Badge variant="outline" className="text-[10px]">{turmas.reduce((a, t) => a + t.capacidade, 0)} lugares</Badge>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => addTurma(curso.id, ano)} className="h-7 gap-1 text-xs">
                    <Plus className="w-3 h-3" /> Adicionar Turma
                  </Button>
                </div>
                <div className="grid grid-cols-[60px_1fr_110px_110px_36px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
                  <span>Turma</span><span>Sala</span><span>Turno</span><span>Capacidade</span><span></span>
                </div>
                <div className="divide-y">
                  {turmas.map((t, idx) => (
                    <div key={t.id} className="grid grid-cols-[60px_1fr_110px_110px_36px] gap-2 p-2 items-center">
                      <div className="flex items-center gap-1.5 font-bold text-primary text-sm pl-2">
                        <span>{curso.code}-{ano}{t.letra}</span>
                      </div>
                      <Select value={t.sala} onValueChange={v => update(curso.id, ano, idx, { sala: v })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{salasPool.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={t.turno} onValueChange={v => update(curso.id, ano, idx, { turno: v as Turma["turno"] })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{turnos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={t.capacidade} onChange={e => update(curso.id, ano, idx, { capacidade: +e.target.value })} className="h-8 text-xs" />
                      <Button size="icon" variant="ghost" onClick={() => removeTurma(curso.id, ano, idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild><Link to="/areaacademica/criador/cadeiras">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador/calendario">Próximo: Calendário <Check className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}
