import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cursoTemplates, cadeirasTemplate } from "@/data/academica2Data";
import { getCadeiraContent } from "@/data/cadeiraContentData";
import { BookOpen, Check, ArrowLeft, Plus, Trash2, Eye, FileText, Video, ClipboardList, Calendar, User, Clock, GraduationCap, FileSignature, MapPin } from "lucide-react";
import { toast } from "sonner";

const buildExames = (cadeiraName: string) => ([
  { id: "ex1", epoca: "1ª Época", data: "12 Jun 2026", hora: "09:00", duracao: 120, sala: "Auditório A", peso: "50%", tipo: "Presencial" },
  { id: "ex2", epoca: "2ª Época", data: "03 Jul 2026", hora: "14:00", duracao: 120, sala: "Auditório B", peso: "50%", tipo: "Presencial" },
  { id: "ex3", epoca: "Época Especial", data: "18 Set 2026", hora: "10:00", duracao: 120, sala: "Sala 204", peso: "100%", tipo: "Presencial" },
]);

const docentesPool = [
  "Prof. Sofia Martins", "Prof. Carlos Mendes", "Prof. Ana Costa", "Prof. António Silva",
  "Prof. Pedro Ferreira", "Prof. Hugo Faria", "Prof. Sílvia Antunes", "Prof. Tomás Henriques",
  "Prof. Luísa Brito", "Prof. João Almeida", "Prof. Inês Carvalho", "Prof. Rui Santos",
  "Prof. Margarida Sá", "Prof. Bruno Tavares", "Prof. Cláudia Nunes",
];

type CadeiraAlloc = { name: string; docente: string; ects: number; semestre: 1 | 2 };

export default function GerarCadeiras() {
  const cursosWithCadeiras = Object.keys(cadeirasTemplate);
  const [cadeiraCurso, setCadeiraCurso] = useState<string>(cursosWithCadeiras[0]);

  const [cadeirasAlloc, setCadeirasAlloc] = useState<Record<string, CadeiraAlloc[][]>>(() => {
    const out: Record<string, CadeiraAlloc[][]> = {};
    Object.entries(cadeirasTemplate).forEach(([cid, anos]) => {
      out[cid] = anos.map(arr => arr.map((n, i) => ({
        name: n,
        docente: docentesPool[(i + cid.length) % docentesPool.length],
        ects: 6,
        semestre: (i % 2 === 0 ? 1 : 2) as 1 | 2,
      })));
    });
    return out;
  });

  const update = (cid: string, ano: number, idx: number, patch: Partial<CadeiraAlloc>) => {
    setCadeirasAlloc(prev => {
      const copy = { ...prev };
      copy[cid] = copy[cid].map((row, i) => i !== ano ? row : row.map((c, j) => j === idx ? { ...c, ...patch } : c));
      return copy;
    });
  };

  const addCadeira = (cid: string, ano: number) => {
    setCadeirasAlloc(prev => {
      const copy = { ...prev };
      copy[cid] = copy[cid].map((row, i) => i !== ano ? row : [...row, { name: "Nova Cadeira", docente: docentesPool[0], ects: 6, semestre: 1 }]);
      return copy;
    });
  };

  const removeCadeira = (cid: string, ano: number, idx: number) => {
    setCadeirasAlloc(prev => {
      const copy = { ...prev };
      copy[cid] = copy[cid].map((row, i) => i !== ano ? row : row.filter((_, j) => j !== idx));
      return copy;
    });
  };

  const total = useMemo(() =>
    Object.values(cadeirasAlloc).reduce((acc, anos) => acc + anos.reduce((a, r) => a + r.length, 0), 0)
  , [cadeirasAlloc]);

  const cursoTotal = useMemo(() =>
    cadeirasAlloc[cadeiraCurso]?.reduce((a, r) => a + r.length, 0) ?? 0
  , [cadeirasAlloc, cadeiraCurso]);

  const confirmAll = () => toast.success("Cadeiras alocadas para todos os cursos");

  const [preview, setPreview] = useState<{ cid: string; ano: number; idx: number } | null>(null);
  const previewCadeira = preview ? cadeirasAlloc[preview.cid][preview.ano][preview.idx] : null;
  const previewCurso = preview ? cursoTemplates.find(c => c.id === preview.cid) : null;
  const previewContent = preview && previewCadeira
    ? getCadeiraContent(`sim-${preview.cid}-${preview.ano}-${preview.idx}`, previewCadeira.name)
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
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
            <p className="text-muted-foreground mt-1 text-sm">Alocar cadeiras, docente, ECTS, semestre e banco de quizzes por curso e por ano.</p>
          </div>
          <Button onClick={confirmAll} className="gap-2"><Check className="w-4 h-4" /> Confirmar Alocação</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total Cadeiras</p><p className="text-2xl font-bold">{total}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Cursos</p><p className="text-2xl font-bold">{cursosWithCadeiras.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Docentes Disp.</p><p className="text-2xl font-bold">{docentesPool.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Cadeiras do Curso</p><p className="text-2xl font-bold text-primary">{cursoTotal}</p></Card>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-4">
        <Card className="p-2 h-fit">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground px-2 py-1.5">Cursos</p>
          {cursosWithCadeiras.map(cid => {
            const curso = cursoTemplates.find(c => c.id === cid);
            const isSel = cadeiraCurso === cid;
            const count = cadeirasAlloc[cid].reduce((a, r) => a + r.length, 0);
            return (
              <button key={cid} onClick={() => setCadeiraCurso(cid)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition ${
                  isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"
                }`}>
                <span className="truncate font-medium">{curso?.name}</span>
                <Badge variant={isSel ? "secondary" : "outline"} className="text-[10px] ml-2">{count}</Badge>
              </button>
            );
          })}
        </Card>

        <div className="space-y-3 min-w-0">
          {cadeirasAlloc[cadeiraCurso].map((cadeiras, ano) => (
            <Card key={ano} className="overflow-hidden">
              <div className="bg-primary/10 px-4 py-2.5 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-primary">{ano + 1}º Ano</p>
                  <Badge variant="outline" className="text-[10px]">{cadeiras.length} cadeiras</Badge>
                </div>
                <Button size="sm" variant="ghost" onClick={() => addCadeira(cadeiraCurso, ano)} className="h-7 gap-1 text-xs">
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
              </div>
              <div className="grid grid-cols-[1fr_180px_90px_70px_36px_36px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
                <span>Cadeira</span><span>Docente</span><span>Semestre</span><span>ECTS</span><span></span><span></span>
              </div>
              <div className="divide-y">
                {cadeiras.map((c, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_180px_90px_70px_36px_36px] gap-2 p-2 items-center">
                    <Input value={c.name} onChange={e => update(cadeiraCurso, ano, idx, { name: e.target.value })} className="h-8 text-xs" />
                    <Select value={c.docente} onValueChange={v => update(cadeiraCurso, ano, idx, { docente: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{docentesPool.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={String(c.semestre)} onValueChange={v => update(cadeiraCurso, ano, idx, { semestre: +v as 1 | 2 })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1º Sem</SelectItem>
                        <SelectItem value="2">2º Sem</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" value={c.ects} onChange={e => update(cadeiraCurso, ano, idx, { ects: +e.target.value })} className="h-8 text-xs" />
                    <Button size="icon" variant="ghost" onClick={() => setPreview({ cid: cadeiraCurso, ano, idx })} className="h-8 w-8 text-muted-foreground hover:text-primary" title="Ver Cadeira">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeCadeira(cadeiraCurso, ano, idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {previewCadeira && previewContent && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px]">Pré-visualização</Badge>
                  <Badge variant="secondary" className="text-[10px]">{previewCurso?.code} · {(preview?.ano ?? 0) + 1}º Ano</Badge>
                  <Badge variant="outline" className="text-[10px]">{previewCadeira.semestre}º Sem</Badge>
                </div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-5 h-5 text-primary" /> {previewCadeira.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-xs pt-1">
                  <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> {previewCadeira.docente}</span>
                  <span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {previewCadeira.ects} ECTS</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> 60h lectivas</span>
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="visao" className="w-full">
                <div className="px-6 border-b">
                  <TabsList className="h-10 bg-transparent p-0 gap-1">
                    <TabsTrigger value="visao" className="data-[state=active]:bg-primary/10">Visão Geral</TabsTrigger>
                    <TabsTrigger value="aulas" className="data-[state=active]:bg-primary/10">Aulas ({previewContent.aulas.length})</TabsTrigger>
                    <TabsTrigger value="conteudos" className="data-[state=active]:bg-primary/10">Conteúdos ({previewContent.conteudos.length})</TabsTrigger>
                    <TabsTrigger value="quizzes" className="data-[state=active]:bg-primary/10">Quizzes ({previewContent.quizzes.length})</TabsTrigger>
                    <TabsTrigger value="calendario" className="data-[state=active]:bg-primary/10">Calendário</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[60vh]">
                  <div className="p-6">
                    <TabsContent value="visao" className="mt-0 space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        <Card className="p-3"><p className="text-[10px] text-muted-foreground uppercase">Aulas</p><p className="text-xl font-bold">{previewContent.aulas.length}</p></Card>
                        <Card className="p-3"><p className="text-[10px] text-muted-foreground uppercase">Conteúdos</p><p className="text-xl font-bold">{previewContent.conteudos.length}</p></Card>
                        <Card className="p-3"><p className="text-[10px] text-muted-foreground uppercase">Quizzes</p><p className="text-xl font-bold">{previewContent.quizzes.length}</p></Card>
                        <Card className="p-3"><p className="text-[10px] text-muted-foreground uppercase">Estudantes</p><p className="text-xl font-bold">{previewCurso?.estudantesEsperados ?? 0}</p></Card>
                      </div>
                      <Card className="p-4">
                        <h3 className="text-sm font-semibold mb-2">Descrição</h3>
                        <p className="text-sm text-muted-foreground">Cadeira de {previewCadeira.name} do curso de {previewCurso?.name}, leccionada por {previewCadeira.docente} no {previewCadeira.semestre}º semestre. Inclui componente teórica e prática, com avaliação contínua através de quizzes e exame final presencial.</p>
                      </Card>
                      <Card className="p-4">
                        <h3 className="text-sm font-semibold mb-2">Plano Pedagógico</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground list-disc pl-5">
                          <li>{previewContent.aulas.length} aulas teórico-práticas (90 min cada)</li>
                          <li>{previewContent.quizzes.length} quizzes de avaliação contínua</li>
                          <li>1 trabalho prático em grupo</li>
                          <li>Exame final presencial (1ª e 2ª época)</li>
                        </ul>
                      </Card>
                    </TabsContent>

                    <TabsContent value="aulas" className="mt-0 space-y-2">
                      {previewContent.aulas.map(a => (
                        <Card key={a.id} className="p-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{a.n}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.titulo}</p>
                            <p className="text-xs text-muted-foreground">{a.data} · {a.duracao} min · {a.attachments.length} anexos</p>
                          </div>
                          <Badge variant={a.publicada ? "default" : "outline"} className="text-[10px]">{a.publicada ? "Publicada" : "Rascunho"}</Badge>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="conteudos" className="mt-0 space-y-2">
                      {previewContent.conteudos.map(c => (
                        <Card key={c.id} className="p-3 flex items-center gap-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.titulo}</p>
                            <p className="text-xs text-muted-foreground">Semana {c.semana} · {c.size}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{c.tipo}</Badge>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="quizzes" className="mt-0 space-y-2">
                      {previewContent.quizzes.map(q => (
                        <Card key={q.id} className="p-3">
                          <div className="flex items-center gap-3">
                            <ClipboardList className="w-4 h-4 text-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{q.titulo}</p>
                              <p className="text-xs text-muted-foreground">{q.descricao}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{q.questions.length} perguntas · {q.duracao} min</Badge>
                          </div>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="calendario" className="mt-0 space-y-2">
                      {previewContent.calendario.map(e => (
                        <Card key={e.id} className="p-3 flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-primary" />
                          <div className="flex-1"><p className="text-sm font-medium">{e.titulo}</p><p className="text-xs text-muted-foreground">{e.data}</p></div>
                          <Badge variant="outline" className="text-[10px] capitalize">{e.tipo}</Badge>
                        </Card>
                      ))}
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>

              <div className="px-6 py-3 border-t bg-muted/20 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreview(null)}>Fechar</Button>
                <Button className="gap-2" onClick={() => { toast.success(`Conteúdo de "${previewCadeira.name}" confirmado`); setPreview(null); }}>
                  <Check className="w-4 h-4" /> Confirmar Conteúdo
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" asChild><Link to="/areaacademica/criador/cursos">Voltar</Link></Button>
        <Button asChild className="gap-2"><Link to="/areaacademica/criador">Concluir e voltar ao Criador <Check className="w-4 h-4" /></Link></Button>
      </div>
    </div>
  );
}
