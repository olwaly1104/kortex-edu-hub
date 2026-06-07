import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { getCadeiraContent, setCadeiraContent, uid, type Aula, type Conteudo, type Quiz, type Evento, type Attachment } from "@/data/cadeiraContentData";
import { ArrowLeft, BookOpen, PlayCircle, FileText, ListChecks, CalendarDays, UserCog, Plus, Trash2, Save, Pencil, GraduationCap, Eye, Download, FileType, Film, Image as ImageIcon, Link2 } from "lucide-react";
import { toast } from "sonner";

const docentesPool = [
  "Prof. Sofia Martins", "Prof. Carlos Mendes", "Prof. Ana Costa", "Prof. António Silva",
  "Prof. Pedro Ferreira", "Prof. Hugo Faria", "Prof. Sílvia Antunes", "Prof. Tomás Henriques",
];

const typeIcon = (t: Attachment["tipo"]) => {
  switch (t) {
    case "Vídeo": return <Film className="w-4 h-4 text-purple-600" />;
    case "Imagem": return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    case "Link": return <Link2 className="w-4 h-4 text-blue-600" />;
    case "Slides": return <FileType className="w-4 h-4 text-orange-600" />;
    case "DOCX": return <FileText className="w-4 h-4 text-sky-600" />;
    default: return <FileText className="w-4 h-4 text-red-600" />;
  }
};

export default function CadeiraDetail() {
  const { cadeiraId } = useParams();
  const navigate = useNavigate();
  const cadeira = cadeirasAcad.find(c => c.id === cadeiraId) || cadeirasAcad[0];
  const curso = cursoTemplates.find(c => c.code === cadeira.curso);

  const [anoLetivo, setAnoLetivo] = useState(anosLetivos.find(a => a.status === "ativo")?.id || "2025-2026");
  const [meta, setMeta] = useState({
    nome: cadeira.cadeira, ects: cadeira.ects, ano: cadeira.ano,
    docente: cadeira.docente,
    descricao: `Cadeira de ${cadeira.cadeira} do ${cadeira.ano}º ano do curso ${cadeira.curso}.`,
    publicada: cadeira.publicada,
  });

  const initial = getCadeiraContent(cadeira.id, cadeira.cadeira);
  const [aulas, setAulas] = useState<Aula[]>(initial.aulas);
  const [conteudos, setConteudos] = useState<Conteudo[]>(initial.conteudos);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initial.quizzes);
  const [calendario, setCalendario] = useState<Evento[]>(initial.calendario);

  const persist = (patch: Partial<ReturnType<typeof getCadeiraContent>>) => {
    setCadeiraContent(cadeira.id, { aulas, conteudos, quizzes, calendario, ...patch });
  };

  const updAula = (id: string, p: Partial<Aula>) => {
    const next = aulas.map(x => x.id === id ? { ...x, ...p } : x);
    setAulas(next); persist({ aulas: next });
  };
  const addAula = () => {
    const next = [...aulas, { id: uid("a"), n: aulas.length + 1, titulo: `Aula ${aulas.length + 1}`, data: "", duracao: 90, descricao: "", publicada: false, attachments: [] }];
    setAulas(next); persist({ aulas: next });
  };
  const delAula = (id: string) => { const next = aulas.filter(x => x.id !== id); setAulas(next); persist({ aulas: next }); };

  const addConteudo = () => {
    const next: Conteudo[] = [...conteudos, { id: uid("c"), tipo: "PDF", titulo: "Novo recurso", semana: 1, size: "—", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }];
    setConteudos(next); persist({ conteudos: next });
  };
  const updConteudo = (id: string, p: Partial<Conteudo>) => { const next = conteudos.map(x => x.id === id ? { ...x, ...p } : x); setConteudos(next); persist({ conteudos: next }); };
  const delConteudo = (id: string) => { const next = conteudos.filter(x => x.id !== id); setConteudos(next); persist({ conteudos: next }); };

  const addQuiz = () => {
    const novo: Quiz = { id: uid("q"), titulo: "Novo Quiz", descricao: "", duracao: 20, publicado: false, questions: [] };
    const next = [...quizzes, novo];
    setQuizzes(next); persist({ quizzes: next });
    navigate(`/areaacademica/cadeiras/${cadeira.id}/quiz/${novo.id}`);
  };
  const updQuiz = (id: string, p: Partial<Quiz>) => { const next = quizzes.map(x => x.id === id ? { ...x, ...p } : x); setQuizzes(next); persist({ quizzes: next }); };
  const delQuiz = (id: string) => { const next = quizzes.filter(x => x.id !== id); setQuizzes(next); persist({ quizzes: next }); };

  const addEvento = () => { const next = [...calendario, { id: uid("e"), data: "", titulo: "Novo evento", tipo: "aula" as const }]; setCalendario(next); persist({ calendario: next }); };
  const updEvento = (id: string, p: Partial<Evento>) => { const next = calendario.map(x => x.id === id ? { ...x, ...p } : x); setCalendario(next); persist({ calendario: next }); };
  const delEvento = (id: string) => { const next = calendario.filter(x => x.id !== id); setCalendario(next); persist({ calendario: next }); };

  const kpis = useMemo(() => ({
    aulas: aulas.length, publicadas: aulas.filter(a => a.publicada).length,
    conteudos: conteudos.length, quizzes: quizzes.length, eventos: calendario.length,
  }), [aulas, conteudos, quizzes, calendario]);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/areaacademica/cadeiras" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Voltar a Cadeiras
      </Link>

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
            <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary" /> {meta.nome}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <UserCog className="w-4 h-4" /> Docente: <span className="font-medium text-foreground">{meta.docente}</span>
            </div>
          </div>
          <Select value={anoLetivo} onValueChange={setAnoLetivo}>
            <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Aulas</p><p className="text-2xl font-bold">{kpis.aulas}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Publicadas</p><p className="text-2xl font-bold text-emerald-600">{kpis.publicadas}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Conteúdos</p><p className="text-2xl font-bold">{kpis.conteudos}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Quizzes</p><p className="text-2xl font-bold">{kpis.quizzes}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Eventos</p><p className="text-2xl font-bold">{kpis.eventos}</p></Card>
      </div>

      <Tabs defaultValue="aulas">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="info"><BookOpen className="w-4 h-4 mr-1" /> Informação</TabsTrigger>
          <TabsTrigger value="aulas"><PlayCircle className="w-4 h-4 mr-1" /> Aulas</TabsTrigger>
          <TabsTrigger value="conteudos"><FileText className="w-4 h-4 mr-1" /> Conteúdos</TabsTrigger>
          <TabsTrigger value="quizzes"><ListChecks className="w-4 h-4 mr-1" /> Quizzes</TabsTrigger>
          <TabsTrigger value="calendario"><CalendarDays className="w-4 h-4 mr-1" /> Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Nome</Label><Input value={meta.nome} onChange={e => setMeta(m => ({ ...m, nome: e.target.value }))} className="mt-1" /></div>
              <div><Label>ECTS</Label><Input type="number" value={meta.ects} onChange={e => setMeta(m => ({ ...m, ects: +e.target.value }))} className="mt-1" /></div>
              <div><Label>Ano</Label><Input type="number" min={1} max={6} value={meta.ano} onChange={e => setMeta(m => ({ ...m, ano: +e.target.value }))} className="mt-1" /></div>
              <div className="md:col-span-3">
                <Label>Docente</Label>
                <Select value={meta.docente} onValueChange={v => setMeta(m => ({ ...m, docente: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{docentesPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Descrição / Ementa</Label><Textarea rows={5} value={meta.descricao} onChange={e => setMeta(m => ({ ...m, descricao: e.target.value }))} className="mt-1" /></div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2"><Switch checked={meta.publicada} onCheckedChange={v => setMeta(m => ({ ...m, publicada: v }))} /><Label>Publicar no ano letivo {anosLetivos.find(a => a.id === anoLetivo)?.label}</Label></div>
              <Button onClick={() => toast.success("Cadeira guardada")} className="gap-2"><Save className="w-4 h-4" /> Guardar</Button>
            </div>
          </Card>
        </TabsContent>

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
                  <TableHead className="w-24">Recursos</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aulas.map(a => (
                  <TableRow key={a.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">{a.n}</TableCell>
                    <TableCell><Link to={`/areaacademica/cadeiras/${cadeira.id}/aula/${a.id}`} className="font-medium hover:text-primary">{a.titulo}</Link></TableCell>
                    <TableCell className="text-xs">{a.data || "—"}</TableCell>
                    <TableCell className="text-xs">{a.duracao}</TableCell>
                    <TableCell><Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" />{a.attachments.length}</Badge></TableCell>
                    <TableCell>
                      <Badge className={a.publicada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                        {a.publicada ? "Publicada" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/areaacademica/cadeiras/${cadeira.id}/aula/${a.id}`)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => delAula(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="conteudos" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Recursos & Conteúdos</p>
              <Button size="sm" onClick={addConteudo} className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-24">Semana</TableHead>
                  <TableHead className="w-24">Tamanho</TableHead>
                  <TableHead className="w-32">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conteudos.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {typeIcon(c.tipo)}
                        <Select value={c.tipo} onValueChange={v => updConteudo(c.id, { tipo: v as Conteudo["tipo"] })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{(["PDF", "Slides", "DOCX", "Vídeo", "Imagem", "Link"] as const).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell><Input value={c.titulo} onChange={e => updConteudo(c.id, { titulo: e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell><Input type="number" value={c.semana} onChange={e => updConteudo(c.id, { semana: +e.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.size || "—"}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" asChild><a href={c.url} target="_blank" rel="noreferrer" title="Pré-visualizar"><Eye className="w-4 h-4" /></a></Button>
                      <Button size="icon" variant="ghost" asChild><a href={c.url} download title="Descarregar"><Download className="w-4 h-4" /></a></Button>
                      <Button size="icon" variant="ghost" onClick={() => delConteudo(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Quizzes</p>
              <Button size="sm" onClick={addQuiz} className="gap-1"><Plus className="w-4 h-4" /> Novo Quiz</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
              {quizzes.map(q => (
                <Card key={q.id} className="p-4 hover:border-primary/40 transition">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-sm">{q.titulo}</p>
                    <Badge className={q.publicado ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{q.publicado ? "Publicado" : "Rascunho"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2rem]">{q.descricao || "Sem descrição"}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" /> {q.questions.length} perg.</span>
                    <span>{q.duracao} min</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1" onClick={() => navigate(`/areaacademica/cadeiras/${cadeira.id}/quiz/${q.id}`)}>
                      <Pencil className="w-3 h-3" /> Abrir
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { updQuiz(q.id, { publicado: !q.publicado }); toast.success(q.publicado ? "Despublicado" : "Publicado"); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => delQuiz(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </Card>
              ))}
              {quizzes.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-6">Sem quizzes. Crie o primeiro.</p>}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Calendário da Cadeira</p>
              <Button size="sm" onClick={addEvento} className="gap-1"><Plus className="w-4 h-4" /> Novo Evento</Button>
            </div>
            <Table>
              <TableHeader><TableRow><TableHead className="w-32">Data</TableHead><TableHead>Título</TableHead><TableHead className="w-36">Tipo</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
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
