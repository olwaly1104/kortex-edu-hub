import { useEffect, useMemo, useState } from "react";
import { loadDocentes, syncDocentesFromDb, fullName } from "@/lib/peopleStorage";
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
import { ArrowLeft, BookOpen, PlayCircle, FileText, ListChecks, CalendarDays, UserCog, Plus, Trash2, Save, Pencil, GraduationCap, Eye, Download, FileType, Film, Image as ImageIcon, Link2, Scale, Lock, Unlock, ClipboardCheck, Clock, MapPin, Percent, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type ExameTipo = "1ª Época" | "2ª Época" | "Recurso" | "Especial";
type ExameEstado = "agendado" | "publicado" | "encerrado";
interface Exame {
  id: string;
  titulo: string;
  tipo: ExameTipo;
  data: string;
  hora: string;
  duracao: number;
  sala: string;
  peso: number;
  notaMinima: number;
  conteudos: string;
  bibliografia: string;
  observacoes: string;
  responsavel: string;
  estado: ExameEstado;
  attachments: Attachment[];
}

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

  const [criterio, setCriterio] = useState({
    avaliacaoContinua: 40,
    trabalhosPraticos: 20,
    examesFinais: 40,
    notaMinimaExame: 8,
    notaAprovacao: 10,
    presencaMinima: 75,
    observacoes: "Os alunos devem obter nota mínima de 8 em cada exame e cumprir a presença mínima de 75% para aprovação. A média final resulta da ponderação dos componentes de avaliação contínua, trabalhos práticos e exames finais.",
  });

  const initial = getCadeiraContent(cadeira.id, cadeira.cadeira);
  const [aulas, setAulas] = useState<Aula[]>(initial.aulas);
  const [conteudos, setConteudos] = useState<Conteudo[]>(initial.conteudos);
  const [quizzes, setQuizzes] = useState<Quiz[]>(initial.quizzes);
  const [calendario, setCalendario] = useState<Evento[]>(initial.calendario);
  const [exames, setExames] = useState<Exame[]>([
    {
      id: uid("ex"), titulo: `${cadeira.cadeira} — Exame 1ª Época`, tipo: "1ª Época",
      data: "15/01/2026", hora: "09:00", duracao: 120, sala: "Anfiteatro 1",
      peso: 40, notaMinima: 8,
      conteudos: "Capítulos 1 a 5 — toda a matéria leccionada no 1º semestre, incluindo exercícios das fichas práticas e conteúdos das aulas teóricas.",
      bibliografia: "Manual da cadeira (Cap. 1–5); Slides das aulas; Fichas de exercícios 1 a 4.",
      observacoes: "Exame presencial. Material permitido: máquina de calcular não programável e formulário oficial. Duração: 2h.",
      responsavel: cadeira.docente, estado: "publicado",
      attachments: [
        { id: uid("at"), name: "Guia do Exame — 1ª Época.pdf", tipo: "PDF", size: "420 KB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
        { id: uid("at"), name: "Formulário Oficial.pdf", tipo: "PDF", size: "180 KB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      ],
    },
    {
      id: uid("ex"), titulo: `${cadeira.cadeira} — Exame 2ª Época`, tipo: "2ª Época",
      data: "12/02/2026", hora: "09:00", duracao: 120, sala: "Anfiteatro 1",
      peso: 40, notaMinima: 8,
      conteudos: "Toda a matéria do semestre (Cap. 1 a 5).",
      bibliografia: "Manual da cadeira; Slides das aulas.",
      observacoes: "Para estudantes reprovados ou faltosos à 1ª época.",
      responsavel: cadeira.docente, estado: "agendado",
      attachments: [
        { id: uid("at"), name: "Guia do Exame — 2ª Época.pdf", tipo: "PDF", size: "410 KB", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      ],
    },
  ]);
  const [locked, setLocked] = useState(true);
  const [selectedExameId, setSelectedExameId] = useState<string | null>(null);

  const updExame = (id: string, p: Partial<Exame>) => setExames(xs => xs.map(x => x.id === id ? { ...x, ...p } : x));
  const delExame = (id: string) => setExames(xs => xs.filter(x => x.id !== id));
  const addExame = () => setExames(xs => [...xs, {
    id: uid("ex"), titulo: "Novo Exame", tipo: "1ª Época",
    data: "", hora: "09:00", duracao: 120, sala: "",
    peso: 40, notaMinima: 8, conteudos: "", bibliografia: "", observacoes: "",
    responsavel: meta.docente, estado: "agendado", attachments: [],
  }]);
  const addExameAttachs = (id: string, files: File[]) => {
    const ex = exames.find(x => x.id === id); if (!ex || !files.length) return;
    const novos: Attachment[] = files.map(f => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const tipo: Attachment["tipo"] =
        ["mp4", "mov", "webm"].includes(ext) ? "Vídeo" :
        ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? "Imagem" :
        ["ppt", "pptx"].includes(ext) ? "Slides" :
        ["doc", "docx"].includes(ext) ? "DOCX" : "PDF";
      return { id: uid("at"), name: f.name, tipo, size: `${(f.size / 1024).toFixed(0)} KB`, url: URL.createObjectURL(f) };
    });
    updExame(id, { attachments: [...ex.attachments, ...novos] });
    toast.success(`${files.length} ficheiro(s) anexado(s) ao exame`);
  };
  const delExameAttach = (exId: string, atId: string) => {
    const ex = exames.find(x => x.id === exId); if (!ex) return;
    updExame(exId, { attachments: ex.attachments.filter(a => a.id !== atId) });
  };

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={locked ? "outline" : "default"}
              onClick={() => { setLocked(l => !l); toast.success(locked ? "Edição desbloqueada" : "Conteúdo bloqueado"); }}
              className="gap-2 h-9"
            >
              {locked ? <><Lock className="w-4 h-4" /> Bloqueado</> : <><Unlock className="w-4 h-4" /> A editar</>}
            </Button>
            <Select value={anoLetivo} onValueChange={setAnoLetivo}>
              <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{anosLetivos.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
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
          <TabsTrigger value="conteudos"><FileText className="w-4 h-4 mr-1" /> Conteúdos por Aula</TabsTrigger>
          <TabsTrigger value="exames"><ClipboardCheck className="w-4 h-4 mr-1" /> Exames</TabsTrigger>
          <TabsTrigger value="recursos"><FileType className="w-4 h-4 mr-1" /> Recursos</TabsTrigger>
          <TabsTrigger value="quizzes"><ListChecks className="w-4 h-4 mr-1" /> Quizzes</TabsTrigger>
          <TabsTrigger value="calendario"><CalendarDays className="w-4 h-4 mr-1" /> Calendário</TabsTrigger>
          <TabsTrigger value="criterio"><Scale className="w-4 h-4 mr-1" /> Critério</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card className="p-6 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div><Label>Nome</Label><Input disabled={locked} value={meta.nome} onChange={e => setMeta(m => ({ ...m, nome: e.target.value }))} className="mt-1" /></div>
              <div><Label>ECTS</Label><Input disabled={locked} type="number" value={meta.ects} onChange={e => setMeta(m => ({ ...m, ects: +e.target.value }))} className="mt-1" /></div>
              <div><Label>Ano</Label><Input disabled={locked} type="number" min={1} max={6} value={meta.ano} onChange={e => setMeta(m => ({ ...m, ano: +e.target.value }))} className="mt-1" /></div>
              <div className="md:col-span-3">
                <Label>Docente</Label>
                <Select value={meta.docente} onValueChange={v => setMeta(m => ({ ...m, docente: v }))} disabled={locked}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{docentesPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Descrição / Ementa</Label><Textarea disabled={locked} rows={5} value={meta.descricao} onChange={e => setMeta(m => ({ ...m, descricao: e.target.value }))} className="mt-1" /></div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2"><Switch disabled={locked} checked={meta.publicada} onCheckedChange={v => setMeta(m => ({ ...m, publicada: v }))} /><Label>Publicar no ano letivo {anosLetivos.find(a => a.id === anoLetivo)?.label}</Label></div>
              <Button onClick={() => toast.success("Cadeira guardada")} className="gap-2" disabled={locked}><Save className="w-4 h-4" /> Guardar</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="aulas" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Plano de Aulas — {anosLetivos.find(a => a.id === anoLetivo)?.label}</p>
              {!locked && <Button size="sm" onClick={addAula} className="gap-1"><Plus className="w-4 h-4" /> Nova Aula</Button>}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-28">Data</TableHead>
                  <TableHead className="w-20">Min</TableHead>
                  <TableHead className="w-24">Conteúdos</TableHead>
                  <TableHead className="w-32">Quiz</TableHead>
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
                    <TableCell>{a.quizId ? <Badge variant="outline" className="gap-1"><ListChecks className="w-3 h-3" />1</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Badge className={a.publicada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                        {a.publicada ? "Publicada" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/areaacademica/cadeiras/${cadeira.id}/aula/${a.id}`)}><Pencil className="w-4 h-4" /></Button>
                      {!locked && <Button size="icon" variant="ghost" onClick={() => delAula(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="conteudos" className="mt-4 space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Conteúdos organizados por Aula</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ficheiros (PDF, DOCX, vídeo) e links associados a cada aula.</p>
            </div>
            <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" /> {aulas.reduce((s, a) => s + a.attachments.length, 0)} ficheiros</Badge>
          </Card>

          {aulas.map(a => {
            const inputId = `aula-up-${a.id}`;
            const addAttachs = (files: File[]) => {
              if (!files.length) return;
              const novos: Attachment[] = files.map(f => {
                const ext = f.name.split(".").pop()?.toLowerCase() || "";
                const tipo: Attachment["tipo"] =
                  ["mp4", "mov", "webm"].includes(ext) ? "Vídeo" :
                  ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? "Imagem" :
                  ["ppt", "pptx"].includes(ext) ? "Slides" :
                  ["doc", "docx"].includes(ext) ? "DOCX" : "PDF";
                return { id: uid("at"), name: f.name, tipo, size: `${(f.size / 1024).toFixed(0)} KB`, url: URL.createObjectURL(f) };
              });
              updAula(a.id, { attachments: [...a.attachments, ...novos] });
              toast.success(`${files.length} ficheiro(s) adicionado(s) à ${a.titulo}`);
            };
            const addLink = () => {
              const url = window.prompt("URL do link:");
              if (!url) return;
              const name = window.prompt("Título:", url) || url;
              updAula(a.id, { attachments: [...a.attachments, { id: uid("at"), name, tipo: "Link", url }] });
            };
            const updAttach = (atId: string, p: Partial<Attachment>) =>
              updAula(a.id, { attachments: a.attachments.map(x => x.id === atId ? { ...x, ...p } : x) });
            const delAttach = (atId: string) =>
              updAula(a.id, { attachments: a.attachments.filter(x => x.id !== atId) });

            return (
              <Card key={a.id} className="overflow-hidden border-l-4 border-l-primary">
                <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-muted/40 border-b">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground font-bold text-sm shrink-0">
                      {a.n}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/areaacademica/cadeiras/${cadeira.id}/aula/${a.id}`} className="font-semibold text-sm hover:text-primary truncate block">
                        Aula {a.n} · {a.titulo}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{a.data || "Sem data"} · {a.duracao} min · {a.attachments.length} ficheiros</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input id={inputId} type="file" multiple className="hidden"
                      onChange={e => { addAttachs(Array.from(e.target.files || [])); e.target.value = ""; }} />
                    {!locked && (
                      <>
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => document.getElementById(inputId)?.click()}>
                          <Plus className="w-3.5 h-3.5" /> Ficheiro
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={addLink}>
                          <Link2 className="w-3.5 h-3.5" /> Link
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  {a.attachments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic px-2 py-4 text-center">Sem conteúdos para esta aula.</p>
                  ) : (
                    <div className="divide-y rounded-md border">
                      {a.attachments.map(at => (
                        <div key={at.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/40">
                          <span className="shrink-0">{typeIcon(at.tipo)}</span>
                          <Input disabled={locked} value={at.name} onChange={e => updAttach(at.id, { name: e.target.value })} className="h-7 text-xs border-none shadow-none px-1 focus-visible:ring-1" placeholder="Nome do ficheiro" />
                          <Badge variant="outline" className="text-[10px] h-5 shrink-0">{at.tipo}</Badge>
                          <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{at.size || "—"}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild><a href={at.url} target="_blank" rel="noreferrer" title="Abrir"><Eye className="w-3.5 h-3.5" /></a></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild><a href={at.url} download={at.name} title="Descarregar"><Download className="w-3.5 h-3.5" /></a></Button>
                          {!locked && <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => delAttach(at.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="exames" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary" /> Exames da Cadeira ({exames.length})</p>
                <p className="text-xs text-muted-foreground mt-0.5">Provas presenciais — clique numa linha para ver e editar todos os detalhes.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1"><Percent className="w-3 h-3" /> Peso total: {exames.reduce((s, e) => s + (e.peso || 0), 0)}%</Badge>
                {!locked && <Button size="sm" onClick={addExame} className="gap-1"><Plus className="w-4 h-4" /> Novo Exame</Button>}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-28">Data</TableHead>
                  <TableHead className="w-20">Hora</TableHead>
                  <TableHead className="w-20">Duração</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead className="w-24">Sala</TableHead>
                  <TableHead className="w-20">Peso</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exames.map(ex => (
                  <TableRow key={ex.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelectedExameId(ex.id)}>
                    <TableCell>
                      <Badge className={
                        ex.tipo === "1ª Época" ? "bg-blue-100 text-blue-700" :
                        ex.tipo === "2ª Época" ? "bg-amber-100 text-amber-700" :
                        ex.tipo === "Recurso" ? "bg-purple-100 text-purple-700" :
                        "bg-rose-100 text-rose-700"
                      }>{ex.tipo}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{ex.titulo}</TableCell>
                    <TableCell className="text-xs">{ex.data || "—"}</TableCell>
                    <TableCell className="text-xs">{ex.hora}</TableCell>
                    <TableCell className="text-xs">{ex.duracao} min</TableCell>
                    <TableCell className="text-xs">{ex.responsavel}</TableCell>
                    <TableCell className="text-xs">{ex.sala || "—"}</TableCell>
                    <TableCell className="text-xs font-medium">{ex.peso}%</TableCell>
                    <TableCell>
                      <Badge className={
                        ex.estado === "publicado" ? "bg-emerald-100 text-emerald-700" :
                        ex.estado === "agendado" ? "bg-slate-100 text-slate-700" :
                        "bg-zinc-200 text-zinc-700"
                      }>{ex.estado === "publicado" ? "Publicado" : ex.estado === "agendado" ? "Agendado" : "Encerrado"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={locked} onClick={() => { updExame(ex.id, { estado: ex.estado === "publicado" ? "agendado" : "publicado" }); toast.success(ex.estado === "publicado" ? "Despublicado" : "Publicado"); }} title="Publicar/Despublicar">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!locked && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => delExame(ex.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {exames.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">Sem exames. Adicione o primeiro.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <Dialog open={!!selectedExameId} onOpenChange={open => !open && setSelectedExameId(null)}>
            {(() => {
              const ex = exames.find(x => x.id === selectedExameId);
              if (!ex) return null;
              const dialogInputId = `ex-dlg-up-${ex.id}`;
              return (
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                      {ex.titulo}
                      <Badge className={
                        ex.tipo === "1ª Época" ? "bg-blue-100 text-blue-700" :
                        ex.tipo === "2ª Época" ? "bg-amber-100 text-amber-700" :
                        ex.tipo === "Recurso" ? "bg-purple-100 text-purple-700" :
                        "bg-rose-100 text-rose-700"
                      }>{ex.tipo}</Badge>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Tipo</Label>
                        <Select value={ex.tipo} onValueChange={v => updExame(ex.id, { tipo: v as ExameTipo })} disabled={locked}>
                          <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1ª Época">1ª Época</SelectItem>
                            <SelectItem value="2ª Época">2ª Época</SelectItem>
                            <SelectItem value="Recurso">Recurso</SelectItem>
                            <SelectItem value="Especial">Especial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label className="text-xs">Data</Label><Input disabled={locked} value={ex.data} onChange={e => updExame(ex.id, { data: e.target.value })} placeholder="dd/mm/aaaa" className="h-9 mt-1" /></div>
                      <div><Label className="text-xs">Hora</Label><Input disabled={locked} value={ex.hora} onChange={e => updExame(ex.id, { hora: e.target.value })} placeholder="09:00" className="h-9 mt-1" /></div>
                      <div><Label className="text-xs">Duração (min)</Label><Input disabled={locked} type="number" value={ex.duracao} onChange={e => updExame(ex.id, { duracao: +e.target.value })} className="h-9 mt-1" /></div>
                      <div><Label className="text-xs">Sala</Label><Input disabled={locked} value={ex.sala} onChange={e => updExame(ex.id, { sala: e.target.value })} className="h-9 mt-1" /></div>
                      <div><Label className="text-xs">Peso (%)</Label><Input disabled={locked} type="number" min={0} max={100} value={ex.peso} onChange={e => updExame(ex.id, { peso: +e.target.value })} className="h-9 mt-1" /></div>
                      <div><Label className="text-xs">Nota Mínima (0-20)</Label><Input disabled={locked} type="number" min={0} max={20} value={ex.notaMinima} onChange={e => updExame(ex.id, { notaMinima: +e.target.value })} className="h-9 mt-1" /></div>
                      <div>
                        <Label className="text-xs">Docente Responsável</Label>
                        <Select value={ex.responsavel} onValueChange={v => updExame(ex.id, { responsavel: v })} disabled={locked}>
                          <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{docentesPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div><Label className="text-xs">Título</Label><Input disabled={locked} value={ex.titulo} onChange={e => updExame(ex.id, { titulo: e.target.value })} className="h-9 mt-1 font-medium" /></div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Conteúdos Avaliados</Label>
                        <Textarea disabled={locked} rows={4} value={ex.conteudos} onChange={e => updExame(ex.id, { conteudos: e.target.value })} className="mt-1 text-sm" placeholder="Capítulos, tópicos e matérias incluídas no exame." />
                      </div>
                      <div>
                        <Label className="text-xs">Bibliografia</Label>
                        <Textarea disabled={locked} rows={4} value={ex.bibliografia} onChange={e => updExame(ex.id, { bibliografia: e.target.value })} className="mt-1 text-sm" placeholder="Manual, slides, fichas e leituras recomendadas." />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Observações / Instruções</Label>
                      <Textarea disabled={locked} rows={3} value={ex.observacoes} onChange={e => updExame(ex.id, { observacoes: e.target.value })} className="mt-1 text-sm" placeholder="Material permitido, duração, regras específicas..." />
                    </div>

                    <div className="rounded-md border">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
                        <p className="text-xs font-semibold">Guia do Exame e Anexos ({ex.attachments.length})</p>
                        <div className="flex gap-2">
                          <input id={dialogInputId} type="file" multiple className="hidden" onChange={e => { addExameAttachs(ex.id, Array.from(e.target.files || [])); e.target.value = ""; }} />
                          {!locked && (
                            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => document.getElementById(dialogInputId)?.click()}>
                              <Plus className="w-3.5 h-3.5" /> Carregar
                            </Button>
                          )}
                        </div>
                      </div>
                      {ex.attachments.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic px-3 py-3">Sem ficheiros anexados.</p>
                      ) : (
                        <div className="divide-y">
                          {ex.attachments.map(at => (
                            <div key={at.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/40">
                              <span className="shrink-0">{typeIcon(at.tipo)}</span>
                              <Input disabled={locked} value={at.name} onChange={e => updExame(ex.id, { attachments: ex.attachments.map(a => a.id === at.id ? { ...a, name: e.target.value } : a) })} className="h-7 text-xs border-none shadow-none px-1 focus-visible:ring-1" />
                              <Badge variant="outline" className="text-[10px] h-5 shrink-0">{at.tipo}</Badge>
                              <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{at.size || "—"}</span>
                              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild><a href={at.url} target="_blank" rel="noreferrer" title="Abrir"><Eye className="w-3.5 h-3.5" /></a></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild><a href={at.url} download={at.name} title="Descarregar"><Download className="w-3.5 h-3.5" /></a></Button>
                              {!locked && <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => delExameAttach(ex.id, at.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <Badge className={
                        ex.estado === "publicado" ? "bg-emerald-100 text-emerald-700" :
                        ex.estado === "agendado" ? "bg-slate-100 text-slate-700" :
                        "bg-zinc-200 text-zinc-700"
                      }>{ex.estado === "publicado" ? "Publicado" : ex.estado === "agendado" ? "Agendado" : "Encerrado"}</Badge>
                      <Button size="sm" variant="outline" onClick={() => setSelectedExameId(null)}>Fechar</Button>
                    </div>
                  </div>
                </DialogContent>
              );
            })()}
          </Dialog>
        </TabsContent>

        <TabsContent value="recursos" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <p className="text-sm font-semibold">Recursos da Cadeira ({conteudos.length})</p>
                <p className="text-xs text-muted-foreground mt-0.5">Material transversal: programa, bibliografia, guiões — não associado a aulas específicas.</p>
              </div>
              <div className="flex gap-2">
                <input
                  id="conteudo-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    const novos: Conteudo[] = files.map(f => {
                      const ext = f.name.split(".").pop()?.toLowerCase() || "";
                      const tipo: Conteudo["tipo"] =
                        ["mp4", "mov", "webm"].includes(ext) ? "Vídeo" :
                        ["png", "jpg", "jpeg", "gif", "webp"].includes(ext) ? "Imagem" :
                        ["ppt", "pptx"].includes(ext) ? "Slides" :
                        ["doc", "docx"].includes(ext) ? "DOCX" : "PDF";
                      return { id: uid("c"), tipo, titulo: f.name.replace(/\.[^/.]+$/, ""), semana: 1, size: `${(f.size / 1024).toFixed(0)} KB`, url: URL.createObjectURL(f) };
                    });
                    const next = [...conteudos, ...novos];
                    setConteudos(next); persist({ conteudos: next });
                    toast.success(`${files.length} ficheiro(s) carregado(s)`);
                    e.target.value = "";
                  }}
                />
                {!locked && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => document.getElementById("conteudo-upload")?.click()}>
                      <FileText className="w-4 h-4" /> Carregar Ficheiros
                    </Button>
                    <Button size="sm" onClick={addConteudo} className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
                  </>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="divide-y rounded-md border">
                {conteudos.map(c => (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/40">
                    <span className="shrink-0">{typeIcon(c.tipo)}</span>
                    <Input disabled={locked} value={c.titulo} onChange={e => updConteudo(c.id, { titulo: e.target.value })} className="h-7 text-xs border-none shadow-none px-1 focus-visible:ring-1" placeholder="Título" />
                    <Badge variant="outline" className="text-[10px] h-5 shrink-0">{c.tipo}</Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      <Label className="text-[10px] text-muted-foreground">Sem.</Label>
                      <Input disabled={locked} type="number" value={c.semana} onChange={e => updConteudo(c.id, { semana: +e.target.value })} className="h-6 text-xs w-12 px-1" />
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 w-16 text-right">{c.size || "—"}</span>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild><a href={c.url} target="_blank" rel="noreferrer" title="Pré-visualizar"><Eye className="w-3.5 h-3.5" /></a></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" asChild><a href={c.url} download={c.titulo} title="Descarregar"><Download className="w-3.5 h-3.5" /></a></Button>
                    {!locked && <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => delConteudo(c.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>}
                  </div>
                ))}
                {conteudos.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sem recursos. Carregue ficheiros transversais à cadeira.</p>}
              </div>
            </div>
          </Card>
        </TabsContent>



        <TabsContent value="quizzes" className="mt-4">
          <Card>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm font-semibold">Quizzes</p>
              {!locked && <Button size="sm" onClick={addQuiz} className="gap-1"><Plus className="w-4 h-4" /> Novo Quiz</Button>}
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
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={locked} onClick={() => { updQuiz(q.id, { publicado: !q.publicado }); toast.success(q.publicado ? "Despublicado" : "Publicado"); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {!locked && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => delQuiz(q.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
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
              {!locked && <Button size="sm" onClick={addEvento} className="gap-1"><Plus className="w-4 h-4" /> Novo Evento</Button>}
            </div>
            <Table>
              <TableHeader><TableRow><TableHead className="w-32">Data</TableHead><TableHead>Título</TableHead><TableHead className="w-36">Tipo</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
              <TableBody>
                {calendario.map(e => (
                  <TableRow key={e.id}>
                    <TableCell><Input disabled={locked} value={e.data} onChange={ev => updEvento(e.id, { data: ev.target.value })} className="h-8 text-xs" placeholder="dd/mm/aaaa" /></TableCell>
                    <TableCell><Input disabled={locked} value={e.titulo} onChange={ev => updEvento(e.id, { titulo: ev.target.value })} className="h-8 text-xs" /></TableCell>
                    <TableCell>
                      <Select value={e.tipo} onValueChange={v => updEvento(e.id, { tipo: v as Evento["tipo"] })} disabled={locked}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aula">Aula</SelectItem>
                          <SelectItem value="avaliacao">Avaliação</SelectItem>
                          <SelectItem value="entrega">Entrega</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{!locked && <Button size="icon" variant="ghost" onClick={() => delEvento(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="criterio" className="mt-4">
          <Card className="p-6 space-y-5">
            <div>
              <p className="text-sm font-semibold flex items-center gap-2"><Scale className="w-4 h-4 text-primary" /> Critério de Avaliação</p>
              <p className="text-xs text-muted-foreground mt-1">Defina a ponderação de cada componente e os requisitos de aprovação. O total dos pesos deve somar 100%.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Avaliação Contínua (%)</Label>
                <Input disabled={locked} type="number" min={0} max={100} value={criterio.avaliacaoContinua} onChange={e => setCriterio(c => ({ ...c, avaliacaoContinua: +e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Trabalhos Práticos (%)</Label>
                <Input disabled={locked} type="number" min={0} max={100} value={criterio.trabalhosPraticos} onChange={e => setCriterio(c => ({ ...c, trabalhosPraticos: +e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Exames Finais (%)</Label>
                <Input disabled={locked} type="number" min={0} max={100} value={criterio.examesFinais} onChange={e => setCriterio(c => ({ ...c, examesFinais: +e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-2">
              <span className="text-xs text-muted-foreground">Total dos pesos</span>
              <Badge className={criterio.avaliacaoContinua + criterio.trabalhosPraticos + criterio.examesFinais === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                {criterio.avaliacaoContinua + criterio.trabalhosPraticos + criterio.examesFinais}%
              </Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
              <div>
                <Label className="text-xs">Nota Mínima por Exame (0-20)</Label>
                <Input disabled={locked} type="number" min={0} max={20} value={criterio.notaMinimaExame} onChange={e => setCriterio(c => ({ ...c, notaMinimaExame: +e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Nota de Aprovação (0-20)</Label>
                <Input disabled={locked} type="number" min={0} max={20} value={criterio.notaAprovacao} onChange={e => setCriterio(c => ({ ...c, notaAprovacao: +e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Presença Mínima (%)</Label>
                <Input disabled={locked} type="number" min={0} max={100} value={criterio.presencaMinima} onChange={e => setCriterio(c => ({ ...c, presencaMinima: +e.target.value }))} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea disabled={locked} rows={5} value={criterio.observacoes} onChange={e => setCriterio(c => ({ ...c, observacoes: e.target.value }))} className="mt-1" />
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button disabled={locked} onClick={() => toast.success("Critério de avaliação guardado")} className="gap-2"><Save className="w-4 h-4" /> Guardar Critério</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
