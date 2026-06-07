import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cadeirasAcad, anosLetivos, cursoTemplates } from "@/data/academica2Data";
import { ArrowLeft, BookOpen, PlayCircle, FileText, ListChecks, CalendarDays, UserCog, Plus, Trash2, Save, Pencil, GraduationCap } from "lucide-react";
import { toast } from "sonner";

const docentesPool = [
  "Prof. Sofia Martins", "Prof. Carlos Mendes", "Prof. Ana Costa", "Prof. António Silva",
  "Prof. Pedro Ferreira", "Prof. Hugo Faria", "Prof. Sílvia Antunes", "Prof. Tomás Henriques",
  "Prof. Marta Lopes", "Prof. Rui Pinto",
];

type Aula = { id: string; n: number; titulo: string; data: string; duracao: number; conteudo: string; publicada: boolean };
type Conteudo = { id: string; tipo: "PDF" | "Vídeo" | "Slides" | "Link"; titulo: string; semana: number };
type Quiz = { id: string; titulo: string; perguntas: number; duracao: number; publicado: boolean };
type Evento = { id: string; data: string; titulo: string; tipo: "aula" | "avaliacao" | "entrega" };

const seedAulas = (cadeira: string): Aula[] =>
  Array.from({ length: 12 }, (_, i) => ({
    id: `a${i + 1}`,
    n: i + 1,
    titulo: `Aula ${i + 1} — ${cadeira}`,
    data: `${String(15 + i).padStart(2, "0")}/09/2025`,
    duracao: 90,
    conteudo: `Tópicos da aula ${i + 1}: introdução, desenvolvimento, exercícios práticos.`,
    publicada: i < 4,
  }));

const seedConteudos = (): Conteudo[] => [
  { id: "c1", tipo: "PDF", titulo: "Programa da Cadeira", semana: 1 },
  { id: "c2", tipo: "Slides", titulo: "Capítulo 1 — Introdução", semana: 1 },
  { id: "c3", tipo: "Vídeo", titulo: "Aula gravada — Sessão 1", semana: 1 },
  { id: "c4", tipo: "PDF", titulo: "Exercícios práticos S2", semana: 2 },
  { id: "c5", tipo: "Link", titulo: "Bibliografia complementar", semana: 3 },
];

const seedQuizzes = (): Quiz[] => [
  { id: "q1", titulo: "Quiz Diagnóstico", perguntas: 10, duracao: 15, publicado: true },
  { id: "q2", titulo: "Quiz Capítulo 1", perguntas: 15, duracao: 20, publicado: true },
  { id: "q3", titulo: "Quiz Mid-term", perguntas: 25, duracao: 40, publicado: false },
];

const seedCalendario = (): Evento[] => [
  { id: "e1", data: "15/09/2025", titulo: "1ª Aula", tipo: "aula" },
  { id: "e2", data: "20/10/2025", titulo: "Quiz Mid-term", tipo: "avaliacao" },
  { id: "e3", data: "10/11/2025", titulo: "Entrega trabalho prático", tipo: "entrega" },
  { id: "e4", data: "15/01/2026", titulo: "Exame 1ª Época", tipo: "avaliacao" },
];

export default function CadeiraDetail() {
  const { cadeiraId } = useParams();
  const cadeira = cadeirasAcad.find(c => c.id === cadeiraId) || cadeirasAcad[0];
  const curso = cursoTemplates.find(c => c.code === cadeira.curso);

  const [anoLetivo, setAnoLetivo] = useState(anosLetivos.find(a => a.status === "ativo")?.id || "2025-2026");
  const [meta, setMeta] = useState({
    nome: cadeira.cadeira,
    ects: cadeira.ects,
    ano: cadeira.ano,
    docente: cadeira.docente,
    descricao: `Cadeira de ${cadeira.cadeira} do ${cadeira.ano}º ano do curso ${cadeira.curso}. Conteúdos teóricos e práticos com avaliação contínua.`,
    publicada: cadeira.publicada,
  });
  const [editMeta, setEditMeta] = useState(false);

  const [aulas, setAulas] = useState<Aula[]>(() => seedAulas(cadeira.cadeira));
  const [conteudos, setConteudos] = useState<Conteudo[]>(seedConteudos);
  const [quizzes, setQuizzes] = useState<Quiz[]>(seedQuizzes);
  const [calendario, setCalendario] = useState<Evento[]>(seedCalendario);

  const updAula = (id: string, p: Partial<Aula>) => setAulas(a => a.map(x => x.id === id ? { ...x, ...p } : x));
  const addAula = () => setAulas(a => [...a, { id: `a${a.length + 1}-${Date.now()}`, n: a.length + 1, titulo: `Aula ${a.length + 1}`, data: "", duracao: 90, conteudo: "", publicada: false }]);
  const delAula = (id: string) => setAulas(a => a.filter(x => x.id !== id));

  const addConteudo = () => setConteudos(c => [...c, { id: `c-${Date.now()}`, tipo: "PDF", titulo: "Novo recurso", semana: 1 }]);
  const updConteudo = (id: string, p: Partial<Conteudo>) => setConteudos(c => c.map(x => x.id === id ? { ...x, ...p } : x));
  const delConteudo = (id: string) => setConteudos(c => c.filter(x => x.id !== id));

  const addQuiz = () => setQuizzes(q => [...q, { id: `q-${Date.now()}`, titulo: "Novo Quiz", perguntas: 10, duracao: 20, publicado: false }]);
  const updQuiz = (id: string, p: Partial<Quiz>) => setQuizzes(q => q.map(x => x.id === id ? { ...x, ...p } : x));
  const delQuiz = (id: string) => setQuizzes(q => q.filter(x => x.id !== id));

  const addEvento = () => setCalendario(c => [...c, { id: `e-${Date.now()}`, data: "", titulo: "Novo evento", tipo: "aula" }]);
  const updEvento = (id: string, p: Partial<Evento>) => setCalendario(c => c.map(x => x.id === id ? { ...x, ...p } : x));
  const delEvento = (id: string) => setCalendario(c => c.filter(x => x.id !== id));

  const kpis = useMemo(() => ({
    aulas: aulas.length,
    publicadas: aulas.filter(a => a.publicada).length,
    conteudos: conteudos.length,
    quizzes: quizzes.length,
    eventos: calendario.length,
  }), [aulas, conteudos, quizzes, calendario]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/areaacademica/cadeiras" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Voltar a Cadeiras
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="gap-1"><GraduationCap className="w-3 h-3" /> {curso?.name || cadeira.curso}</Badge>
              <Badge variant="outline">{meta.ano}º Ano</Badge>
              <Badge variant="outline">{meta.ects} ECTS</Badge>
              <Badge className={meta.publicada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                {meta.publicada ? "Publicada" : "Rascunho"}
              </Badge>
            </div>
            {editMeta ? (
              <Input value={meta.nome} onChange={e => setMeta(m => ({ ...m, nome: e.target.value }))}
                className="text-2xl font-bold h-11 mb-2" />
            ) : (
              <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> {meta.nome}</h1>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <UserCog className="w-4 h-4" /> Docente: <span className="font-medium text-foreground">{meta.docente}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={anoLetivo} onValueChange={setAnoLetivo}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={() => { setEditMeta(e => !e); if (editMeta) toast.success("Metadados guardados"); }}>
              {editMeta ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
              {editMeta ? "Guardar" : "Editar"}
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Aulas</p><p className="text-2xl font-bold">{kpis.aulas}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Publicadas</p><p className="text-2xl font-bold text-emerald-600">{kpis.publicadas}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Conteúdos</p><p className="text-2xl font-bold">{kpis.conteudos}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Quizzes</p><p className="text-2xl font-bold">{kpis.quizzes}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Eventos</p><p className="text-2xl font-bold">{kpis.eventos}</p></Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="info"><BookOpen className="w-4 h-4 mr-1" /> Informação</TabsTrigger>
          <TabsTrigger value="aulas"><PlayCircle className="w-4 h-4 mr-1" /> Aulas</TabsTrigger>
          <TabsTrigger value="conteudos"><FileText className="w-4 h-4 mr-1" /> Conteúdos</TabsTrigger>
          <TabsTrigger value="quizzes"><ListChecks className="w-4 h-4 mr-1" /> Quizzes</TabsTrigger>
          <TabsTrigger value="calendario"><CalendarDays className="w-4 h-4 mr-1" /> Calendário</TabsTrigger>
        </TabsList>

        {/* INFO */}
        <TabsContent value="info" className="mt-4">
          <Card className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>ECTS</Label>
                <Input type="number" value={meta.ects} onChange={e => setMeta(m => ({ ...m, ects: +e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Ano</Label>
                <Input type="number" min={1} max={6} value={meta.ano} onChange={e => setMeta(m => ({ ...m, ano: +e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>Docente</Label>
                <Select value={meta.docente} onValueChange={v => setMeta(m => ({ ...m, docente: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{docentesPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição / Ementa</Label>
              <Textarea rows={5} value={meta.descricao} onChange={e => setMeta(m => ({ ...m, descricao: e.target.value }))} className="mt-1" />
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Switch checked={meta.publicada} onCheckedChange={v => setMeta(m => ({ ...m, publicada: v }))} />
                <Label>Publicar cadeira no ano letivo {anosLetivos.find(a => a.id === anoLetivo)?.label}</Label>
              </div>
              <Button onClick={() => toast.success("Cadeira guardada")} className="gap-2"><Save className="w-4 h-4" /> Guardar</Button>
            </div>
          </Card>
        </TabsContent>

        {/* AULAS */}
        <TabsContent value="aulas" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Plano de Aulas — {anosLetivos.find(a => a.id === anoLetivo)?.label}</p>
              <Button size="sm" onClick={addAula} className="gap-1"><Plus className="w-4 h-4" /> Nova Aula</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-28">Data</TableHead>
                  <TableHead className="w-20">Min</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead className="w-24">Publicada</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aulas.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.n}</TableCell>
                    <TableCell><Input value={a.titulo} onChange={e => updAula(a.id, { titulo: e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input value={a.data} onChange={e => updAula(a.id, { data: e.target.value })} className="h-8 text-xs" placeholder="dd/mm/aaaa" /></TableCell>
                    <TableCell><Input type="number" value={a.duracao} onChange={e => updAula(a.id, { duracao: +e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input value={a.conteudo} onChange={e => updAula(a.id, { conteudo: e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Switch checked={a.publicada} onCheckedChange={v => updAula(a.id, { publicada: v })} /></TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => delAula(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* CONTEUDOS */}
        <TabsContent value="conteudos" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Recursos & Conteúdos</p>
              <Button size="sm" onClick={addConteudo} className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-24">Semana</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conteudos.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Select value={c.tipo} onValueChange={v => updConteudo(c.id, { tipo: v as Conteudo["tipo"] })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["PDF", "Vídeo", "Slides", "Link"] as const).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input value={c.titulo} onChange={e => updConteudo(c.id, { titulo: e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input type="number" value={c.semana} onChange={e => updConteudo(c.id, { semana: +e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => delConteudo(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* QUIZZES */}
        <TabsContent value="quizzes" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Quizzes</p>
              <Button size="sm" onClick={addQuiz} className="gap-1"><Plus className="w-4 h-4" /> Novo Quiz</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-24">Perguntas</TableHead>
                  <TableHead className="w-24">Duração</TableHead>
                  <TableHead className="w-24">Publicado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map(q => (
                  <TableRow key={q.id}>
                    <TableCell><Input value={q.titulo} onChange={e => updQuiz(q.id, { titulo: e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input type="number" value={q.perguntas} onChange={e => updQuiz(q.id, { perguntas: +e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input type="number" value={q.duracao} onChange={e => updQuiz(q.id, { duracao: +e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Switch checked={q.publicado} onCheckedChange={v => updQuiz(q.id, { publicado: v })} /></TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => delQuiz(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* CALENDARIO */}
        <TabsContent value="calendario" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Calendário da Cadeira</p>
              <Button size="sm" onClick={addEvento} className="gap-1"><Plus className="w-4 h-4" /> Novo Evento</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Data</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-36">Tipo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendario.map(e => (
                  <TableRow key={e.id}>
                    <TableCell><Input value={e.data} onChange={ev => updEvento(e.id, { data: ev.target.value })} className="h-8 text-xs" placeholder="dd/mm/aaaa" /></TableCell>
                    <TableCell><Input value={e.titulo} onChange={ev => updEvento(e.id, { titulo: ev.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell>
                      <Select value={e.tipo} onValueChange={v => updEvento(e.id, { tipo: v as Evento["tipo"] })}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aula">Aula</SelectItem>
                          <SelectItem value="avaliacao">Avaliação</SelectItem>
                          <SelectItem value="entrega">Entrega</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Button size="icon" variant="ghost" onClick={() => delEvento(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
