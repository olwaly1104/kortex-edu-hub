import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Search, BookOpen, Layers, Mail, CheckCircle2, Settings2 } from "lucide-react";
import { cursoTemplates } from "@/data/academica2Data";
import { toast } from "sonner";

interface DocenteAcad {
  id: string;
  name: string;
  email: string;
  especialidade: string;
  titulo: string;
  // permissões: o que pode leccionar
  cursos: string[];     // course ids permitted
  anos: number[];       // year levels permitted
  cadeiras: string[];   // chair names permitted
  // atribuições reais
  atribuicoes: { curso: string; ano: number; cadeira: string }[];
}

const cadeirasPorEspecialidade: Record<string, string[]> = {
  "Matemática": ["Matemática I", "Matemática II", "Métodos Num.", "Estatística"],
  "Física": ["Física I", "Física II", "Estática", "Mec. Fluidos"],
  "Projecto": ["Projecto I", "Projecto II", "Projecto III", "Projecto Final"],
  "Construção": ["Construção I", "Construção II", "Materiais I", "Materiais"],
  "Informática": ["Programação", "Computação Gráfica", "Métodos Num."],
  "Desenho": ["Desenho Técnico I", "Desenho Técnico II", "Geometria Descritiva"],
  "História da Arte": ["História da Arte I", "História da Arte II", "Património"],
  "Estruturas": ["Estruturas I", "Estruturas II", "Resistência Materiais", "Pontes"],
  "Urbanismo": ["Urbanismo I", "Urbanismo II", "Planeamento", "Topografia"],
  "Direito": ["Direito Civil I", "Legislação"],
  "Medicina": ["Anatomia"],
};

const docentesAcad: DocenteAcad[] = [
  { id: "d1", name: "Prof. Sofia Martins", email: "sofia.martins@upra.kor", titulo: "Doutorada", especialidade: "Matemática",
    cursos: ["arq", "ec", "ei"], anos: [1, 2], cadeiras: cadeirasPorEspecialidade["Matemática"],
    atribuicoes: [{ curso: "ARQ", ano: 1, cadeira: "Matemática I" }, { curso: "ARQ", ano: 2, cadeira: "Matemática II" }] },
  { id: "d2", name: "Prof. Carlos Mendes", email: "carlos.mendes@upra.kor", titulo: "Doutorado", especialidade: "Desenho",
    cursos: ["arq"], anos: [1, 2], cadeiras: cadeirasPorEspecialidade["Desenho"],
    atribuicoes: [{ curso: "ARQ", ano: 1, cadeira: "Geometria Descritiva" }] },
  { id: "d3", name: "Prof. Ana Costa", email: "ana.costa@upra.kor", titulo: "Mestre", especialidade: "Desenho",
    cursos: ["arq", "ec"], anos: [1], cadeiras: ["Desenho Técnico I", "Desenho Técnico II"],
    atribuicoes: [{ curso: "ARQ", ano: 1, cadeira: "Desenho Técnico I" }] },
  { id: "d4", name: "Prof. António Silva", email: "antonio.silva@upra.kor", titulo: "Doutorado", especialidade: "Projecto",
    cursos: ["arq"], anos: [2, 3, 4, 5], cadeiras: cadeirasPorEspecialidade["Projecto"],
    atribuicoes: [{ curso: "ARQ", ano: 2, cadeira: "Projecto I" }, { curso: "ARQ", ano: 3, cadeira: "Projecto II" }] },
  { id: "d5", name: "Prof. Pedro Ferreira", email: "pedro.ferreira@upra.kor", titulo: "Doutorado", especialidade: "Estruturas",
    cursos: ["ec", "arq"], anos: [2, 3, 4], cadeiras: cadeirasPorEspecialidade["Estruturas"],
    atribuicoes: [{ curso: "EC", ano: 3, cadeira: "Resistência Materiais" }] },
  { id: "d6", name: "Prof. Hugo Faria", email: "hugo.faria@upra.kor", titulo: "Doutorado", especialidade: "Informática",
    cursos: ["ei", "ec"], anos: [1, 2, 3, 4], cadeiras: cadeirasPorEspecialidade["Informática"],
    atribuicoes: [{ curso: "EI", ano: 1, cadeira: "Programação" }] },
  { id: "d7", name: "Prof. Sílvia Antunes", email: "silvia.antunes@upra.kor", titulo: "Doutorada", especialidade: "Medicina",
    cursos: ["med"], anos: [1, 2], cadeiras: cadeirasPorEspecialidade["Medicina"],
    atribuicoes: [{ curso: "MED", ano: 1, cadeira: "Anatomia" }] },
  { id: "d8", name: "Prof. Tomás Henriques", email: "tomas.henriques@upra.kor", titulo: "Doutorado", especialidade: "Direito",
    cursos: ["dir"], anos: [1, 2, 3, 4], cadeiras: cadeirasPorEspecialidade["Direito"],
    atribuicoes: [{ curso: "DIR", ano: 1, cadeira: "Direito Civil I" }] },
  { id: "d9", name: "Prof. Luísa Brito", email: "luisa.brito@upra.kor", titulo: "Mestre", especialidade: "História da Arte",
    cursos: ["arq"], anos: [1, 2], cadeiras: cadeirasPorEspecialidade["História da Arte"],
    atribuicoes: [{ curso: "ARQ", ano: 1, cadeira: "História da Arte I" }] },
  { id: "d10", name: "Prof. João Almeida", email: "joao.almeida@upra.kor", titulo: "Doutorado", especialidade: "Construção",
    cursos: ["arq", "ec"], anos: [3, 4], cadeiras: cadeirasPorEspecialidade["Construção"],
    atribuicoes: [{ curso: "ARQ", ano: 3, cadeira: "Construção I" }] },
  { id: "d11", name: "Prof. Inês Carvalho", email: "ines.carvalho@upra.kor", titulo: "Doutorada", especialidade: "Urbanismo",
    cursos: ["arq"], anos: [2, 3, 4], cadeiras: cadeirasPorEspecialidade["Urbanismo"],
    atribuicoes: [{ curso: "ARQ", ano: 2, cadeira: "Urbanismo I" }] },
  { id: "d12", name: "Prof. Rui Santos", email: "rui.santos@upra.kor", titulo: "Doutorado", especialidade: "Física",
    cursos: ["ec", "arq"], anos: [1, 2], cadeiras: cadeirasPorEspecialidade["Física"],
    atribuicoes: [{ curso: "EC", ano: 1, cadeira: "Física I" }] },
];

const cursoName = (id: string) => cursoTemplates.find(c => c.id === id)?.name ?? id;
const cursoCode = (id: string) => cursoTemplates.find(c => c.id === id)?.code ?? id.toUpperCase();

export default function Docentes() {
  const [search, setSearch] = useState("");
  const [cursoFilter, setCursoFilter] = useState<string>("all");
  const [selected, setSelected] = useState<DocenteAcad | null>(null);

  const filtered = useMemo(() => docentesAcad.filter(d => {
    const s = search.toLowerCase();
    const matchS = !s || d.name.toLowerCase().includes(s) || d.especialidade.toLowerCase().includes(s) || d.email.toLowerCase().includes(s);
    const matchC = cursoFilter === "all" || d.cursos.includes(cursoFilter);
    return matchS && matchC;
  }), [search, cursoFilter]);

  const totalAtribuicoes = docentesAcad.reduce((a, d) => a + d.atribuicoes.length, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <Badge className="mb-2 gap-1"><GraduationCap className="w-3 h-3" /> Corpo Docente</Badge>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Docentes
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Catálogo completo de docentes com as cadeiras, cursos e anos que estão autorizados a leccionar.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total Docentes</p><p className="text-2xl font-bold">{docentesAcad.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Especialidades</p><p className="text-2xl font-bold">{new Set(docentesAcad.map(d => d.especialidade)).size}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Atribuições Activas</p><p className="text-2xl font-bold text-primary">{totalAtribuicoes}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Cursos Cobertos</p><p className="text-2xl font-bold">{new Set(docentesAcad.flatMap(d => d.cursos)).size}</p></Card>
      </div>

      <Card className="p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por nome, email ou especialidade…" className="pl-8 h-9" />
        </div>
        <Select value={cursoFilter} onValueChange={setCursoFilter}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cursos</SelectItem>
            {cursoTemplates.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Docente</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Cursos Permitidos</TableHead>
              <TableHead>Anos</TableHead>
              <TableHead className="text-center">Cadeiras</TableHead>
              <TableHead className="text-center">Atribuições</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(d => (
              <TableRow key={d.id} className="cursor-pointer" onClick={() => setSelected(d)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {d.name.split(" ").slice(-2).map(p => p[0]).join("")}
                    </AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{d.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{d.especialidade}</Badge></TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {d.cursos.slice(0, 3).map(c => (
                      <span
                        key={c}
                        title={cursoName(c)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 pl-1 pr-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        <span className="inline-flex items-center justify-center h-4 min-w-[28px] px-1 rounded bg-primary text-primary-foreground text-[9px] font-bold tracking-wide">
                          {cursoCode(c)}
                        </span>
                        <span className="text-muted-foreground truncate max-w-[90px]">{cursoName(c)}</span>
                      </span>
                    ))}
                    {d.cursos.length > 3 && (
                      <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                        +{d.cursos.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {d.anos.map(a => <Badge key={a} variant="outline" className="text-[10px]">{a}º</Badge>)}
                  </div>
                </TableCell>
                <TableCell className="text-center"><span className="text-sm font-semibold">{d.cadeiras.length}</span></TableCell>
                <TableCell className="text-center"><span className="text-sm font-semibold text-primary">{d.atribuicoes.length}</span></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="gap-1 h-8" onClick={(e) => { e.stopPropagation(); setSelected(d); }}>
                    <Settings2 className="w-3.5 h-3.5" /> Gerir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-10 h-10"><AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {selected.name.split(" ").slice(-2).map(p => p[0]).join("")}
                  </AvatarFallback></Avatar>
                  <div>
                    <p className="text-base">{selected.name}</p>
                    <p className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selected.email} · {selected.titulo}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Especialidade</p>
                    <p className="text-sm font-semibold mt-1">{selected.especialidade}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Cadeiras Permitidas</p>
                    <p className="text-sm font-semibold mt-1">{selected.cadeiras.length}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Atribuições</p>
                    <p className="text-sm font-semibold mt-1 text-primary">{selected.atribuicoes.length}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Layers className="w-3 h-3" /> Cursos Permitidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.cursos.map(c => <Badge key={c} variant="secondary">{cursoName(c)}</Badge>)}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Anos Lectivos Permitidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.anos.map(a => <Badge key={a} variant="outline">{a}º Ano</Badge>)}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Cadeiras que pode leccionar</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selected.cadeiras.map(c => (
                      <div key={c} className="text-xs px-2.5 py-1.5 rounded border bg-muted/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> {c}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Atribuições do Ano Lectivo Actual</p>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="h-8 text-[10px]">Curso</TableHead>
                          <TableHead className="h-8 text-[10px]">Ano</TableHead>
                          <TableHead className="h-8 text-[10px]">Cadeira</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.atribuicoes.map((a, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-1.5 text-xs"><Badge variant="secondary" className="text-[10px]">{a.curso}</Badge></TableCell>
                            <TableCell className="py-1.5 text-xs">{a.ano}º</TableCell>
                            <TableCell className="py-1.5 text-xs font-medium">{a.cadeira}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
                  <Button onClick={() => { toast.success("Permissões guardadas"); setSelected(null); }} className="gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Guardar Permissões
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
