import { OnboardingStepBanner, markOnboardingStepDone, useIsOnboardingStep } from "@/components/admin/OnboardingStepBanner";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cursoTemplates } from "@/data/academica2Data";
import { ArrowLeft, Check, Users, ChevronDown, ChevronRight, Building2, GraduationCap, Search, Shuffle, UserPlus, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const LETRAS = ["A", "B", "C", "D", "E"];
const CAPACIDADE = 32;
const NOMES = ["Sofia", "Bernardo", "Mariana", "Tiago", "Inês", "Rafael", "Beatriz", "Henrique", "Carolina", "André", "Mafalda", "Diogo", "Joana", "Pedro", "Catarina", "Miguel", "Rita", "João", "Ana", "Bruno", "Filipa", "Ricardo", "Sara", "Tomás", "Helena", "Vasco", "Clara", "Manuel", "Patrícia", "Luís"];
const APELIDOS = ["Andrade", "Sá", "Reis", "Mendes", "Pacheco", "Cunha", "Lopes", "Rocha", "Pereira", "Silva", "Santos", "Costa", "Ferreira", "Oliveira", "Martins", "Carvalho", "Almeida", "Ribeiro", "Pinto", "Nunes"];

type Student = { id: string; name: string; email: string; ano: number };

// deterministic seed
const seed = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };
const pick = <T,>(arr: T[], n: number) => arr[n % arr.length];

const buildStudents = (cursoId: string, ano: number, count: number): Student[] => {
  const base = seed(`${cursoId}-${ano}`);
  return Array.from({ length: count }, (_, i) => {
    const n = pick(NOMES, base + i * 7);
    const a = pick(APELIDOS, base + i * 13 + 3);
    return {
      id: `${cursoId}-${ano}-${i}`,
      name: `${n} ${a}`,
      email: `${n}.${a}`.toLowerCase().replace(/\s+/g, "") + `${i}@upra.kor`,
      ano,
    };
  });
};

const studentsByYear = (years: number, base: number): number[] => {
  // 1st year = full cohort, upper years progressively smaller (mock attrition)
  return Array.from({ length: years }, (_, i) => Math.max(8, Math.round(base * (i === 0 ? 1 : 0.85 - i * 0.05))));
};

export default function CriarTurmas() {
  const isOnboarding = useIsOnboardingStep();
  const { user } = useAuth();

  // Build all students per curso/ano once
  const allStudents = useMemo(() => {
    const map: Record<string, Record<number, Student[]>> = {};
    cursoTemplates.forEach(c => {
      map[c.id] = {};
      const counts = studentsByYear(c.years, Math.round(c.estudantesEsperados / c.years));
      for (let y = 1; y <= c.years; y++) map[c.id][y] = buildStudents(c.id, y, counts[y - 1]);
    });
    return map;
  }, []);

  // Number of turmas per (curso, ano)
  const turmasCount = useMemo(() => {
    const m: Record<string, Record<number, number>> = {};
    cursoTemplates.forEach(c => {
      m[c.id] = {};
      for (let y = 1; y <= c.years; y++) {
        const total = allStudents[c.id][y].length;
        m[c.id][y] = Math.min(5, Math.max(1, Math.ceil(total / CAPACIDADE)));
      }
    });
    return m;
  }, [allStudents]);

  // Allocation: studentId -> turma letter ("" = unassigned)
  const [alloc, setAlloc] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    cursoTemplates.forEach(c => {
      for (let y = 1; y <= c.years; y++) {
        const nT = turmasCount[c.id][y];
        allStudents[c.id][y].forEach((s, i) => { out[s.id] = LETRAS[i % nT]; });
      }
    });
    return out;
  });

  const faculdades = useMemo(() => Array.from(new Set(cursoTemplates.map(c => c.faculty))), []);
  const [openFacs, setOpenFacs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(faculdades.map(f => [f, true]))
  );
  const [openCursos, setOpenCursos] = useState<Record<string, boolean>>({ [cursoTemplates[0].id]: true });
  const [selected, setSelected] = useState<{ cursoId: string; ano: number }>({ cursoId: cursoTemplates[0].id, ano: 1 });
  const [search, setSearch] = useState("");
  const [filterTurma, setFilterTurma] = useState<string>("all");

  const curso = cursoTemplates.find(c => c.id === selected.cursoId)!;
  const yearStudents = allStudents[selected.cursoId][selected.ano];
  const nTurmas = turmasCount[selected.cursoId][selected.ano];
  const letras = LETRAS.slice(0, nTurmas);

  const countByTurma = useMemo(() => {
    const m: Record<string, number> = { "": 0 };
    letras.forEach(l => m[l] = 0);
    yearStudents.forEach(s => { const t = alloc[s.id] || ""; m[t] = (m[t] || 0) + 1; });
    return m;
  }, [alloc, yearStudents, letras]);

  const assign = (sid: string, t: string) => setAlloc(p => ({ ...p, [sid]: t }));

  const autoDistribute = () => {
    setAlloc(p => {
      const out = { ...p };
      yearStudents.forEach((s, i) => { out[s.id] = letras[i % nTurmas]; });
      return out;
    });
    toast.success(`${yearStudents.length} estudantes redistribuídos`);
  };

  const clearAll = () => {
    setAlloc(p => { const out = { ...p }; yearStudents.forEach(s => { out[s.id] = ""; }); return out; });
    toast("Alocação limpa para este ano");
  };

  const confirmTurmas = () => {
    markOnboardingStepDone(user?.email, "aca.tur");
    toast.success("Alocação de turmas confirmada");
  };

  const filtered = yearStudents.filter(s => {
    if (filterTurma !== "all" && (alloc[s.id] || "") !== (filterTurma === "none" ? "" : filterTurma)) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totals = useMemo(() => {
    let students = 0, turmas = 0, allocated = 0;
    cursoTemplates.forEach(c => {
      for (let y = 1; y <= c.years; y++) {
        const arr = allStudents[c.id][y];
        students += arr.length;
        turmas += turmasCount[c.id][y];
        arr.forEach(s => { if (alloc[s.id]) allocated++; });
      }
    });
    return { students, turmas, allocated };
  }, [allStudents, turmasCount, alloc]);

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
              <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-primary" /> Alocar Estudantes a Turmas</h1>
              <p className="text-muted-foreground mt-1 text-sm">Selecione um ano e atribua cada estudante a uma turma (A–E).</p>
            </div>
            <Button onClick={confirmTurmas} className="gap-2"><Check className="w-4 h-4" /> Confirmar Alocação</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Building2 className="w-3.5 h-3.5" /><p className="text-xs">Faculdades</p></div><p className="text-2xl font-bold">{faculdades.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><GraduationCap className="w-3.5 h-3.5" /><p className="text-xs">Cursos</p></div><p className="text-2xl font-bold">{cursoTemplates.length}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><p className="text-xs">Estudantes</p></div><p className="text-2xl font-bold">{totals.students}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Check className="w-3.5 h-3.5" /><p className="text-xs">Alocados</p></div><p className="text-2xl font-bold text-primary">{totals.allocated}<span className="text-sm text-muted-foreground font-normal"> / {totals.students}</span></p></Card>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        {/* Tree: Faculdade > Curso > Ano */}
        <Card className="p-2 h-fit max-h-[calc(100vh-260px)] overflow-y-auto">
          {faculdades.map(fac => {
            const cursosOfFac = cursoTemplates.filter(c => c.faculty === fac);
            const facOpen = openFacs[fac];
            return (
              <div key={fac} className="mb-1">
                <button onClick={() => setOpenFacs(p => ({ ...p, [fac]: !p[fac] }))}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/60 transition">
                  {facOpen ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wide flex-1 text-left leading-tight">{fac}</span>
                </button>
                {facOpen && cursosOfFac.map(c => {
                  const cOpen = openCursos[c.id];
                  return (
                    <div key={c.id} className="ml-4">
                      <button onClick={() => setOpenCursos(p => ({ ...p, [c.id]: !p[c.id] }))}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/60 transition">
                        {cOpen ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                        <GraduationCap className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium flex-1 text-left truncate">{c.name}</span>
                      </button>
                      {cOpen && (
                        <div className="ml-6 border-l pl-2 space-y-0.5 mb-1">
                          {Array.from({ length: c.years }, (_, i) => i + 1).map(y => {
                            const isSel = selected.cursoId === c.id && selected.ano === y;
                            const total = allStudents[c.id][y].length;
                            const aloc = allStudents[c.id][y].filter(s => alloc[s.id]).length;
                            return (
                              <button key={y} onClick={() => setSelected({ cursoId: c.id, ano: y })}
                                className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between transition ${
                                  isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                                }`}>
                                <span>{y}º Ano</span>
                                <span className={`text-[10px] tabular-nums ${isSel ? "opacity-90" : "text-muted-foreground"}`}>{aloc}/{total}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Card>

        {/* Main: ano detail */}
        <div className="space-y-3 min-w-0">
          <Card className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{curso.faculty}</p>
                <p className="text-base font-bold">{curso.name} <span className="text-muted-foreground font-normal">({curso.code})</span> · {selected.ano}º Ano</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={clearAll} className="gap-1 h-8">Limpar</Button>
                <Button size="sm" onClick={autoDistribute} className="gap-1 h-8"><Shuffle className="w-3.5 h-3.5" /> Distribuir Automaticamente</Button>
              </div>
            </div>

            {/* Turma cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
              <button onClick={() => setFilterTurma("none")}
                className={`p-3 rounded-lg border text-left transition ${filterTurma === "none" ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30" : "hover:border-amber-300"}`}>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Por alocar</p>
                <p className="text-xl font-bold text-amber-600">{countByTurma[""] || 0}</p>
              </button>
              {letras.map(l => {
                const c = countByTurma[l] || 0;
                const over = c > CAPACIDADE;
                const isSel = filterTurma === l;
                return (
                  <button key={l} onClick={() => setFilterTurma(l)}
                    className={`p-3 rounded-lg border text-left transition ${isSel ? "border-primary bg-primary/10" : "hover:border-primary/40"}`}>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Turma {curso.code}-{selected.ano}{l}</p>
                    <p className={`text-xl font-bold tabular-nums ${over ? "text-destructive" : "text-primary"}`}>{c}<span className="text-xs text-muted-foreground font-normal">/{CAPACIDADE}</span></p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Filters + Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-3 border-b flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Procurar estudante…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-sm" />
              </div>
              <Select value={filterTurma} onValueChange={setFilterTurma}>
                <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  <SelectItem value="none">Por alocar</SelectItem>
                  {letras.map(l => <SelectItem key={l} value={l}>Turma {l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-[10px]">{filtered.length} estudante(s)</Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Estudante</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[180px]">Turma</TableHead>
                  <TableHead className="w-[200px] text-right">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, i) => {
                  const cur = alloc[s.id] || "";
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-muted-foreground tabular-nums text-xs">{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.email}</TableCell>
                      <TableCell>
                        <Select value={cur || "__none"} onValueChange={v => assign(s.id, v === "__none" ? "" : v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">— Por alocar —</SelectItem>
                            {letras.map(l => <SelectItem key={l} value={l}>{curso.code}-{selected.ano}{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          {letras.map(l => (
                            <Button key={l} size="sm" variant={cur === l ? "default" : "outline"}
                              onClick={() => assign(s.id, l)} className="h-7 w-7 p-0 text-[11px] font-bold">
                              {l}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    <UserPlus className="w-5 h-5 mx-auto mb-1 opacity-50" />
                    Nenhum estudante corresponde aos filtros.
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild><Link to="/areaacademica/criador/cadeiras">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador/calendario">Próximo: Calendário <Check className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}
