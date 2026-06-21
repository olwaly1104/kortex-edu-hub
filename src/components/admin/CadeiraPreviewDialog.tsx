import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, User, Users, Clock, MapPin, Video, FileText, GraduationCap,
  ClipboardList, Play, FolderOpen, Award, Megaphone, BookMarked,
  Lock, Unlock, Plus, Trash2, Pencil, X, CheckCircle, Eye,
  FileType2, Image as ImageIcon, Presentation, Link as LinkIcon, Upload, Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";

type MatTipo = "PDF" | "Slides" | "DOCX" | "Imagem" | "Vídeo" | "Link";
type Material = { id: string; nome: string; tipo: MatTipo };
type Aula = { id: string; n: number; titulo: string; sumario: string; duracao: string; data: string; hora: string; materiais: Material[] };
type Avaliacao = { id: string; titulo: string; data: string; hora: string; peso: number };
type Anuncio = { id: string; titulo: string; texto: string; data: string };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cadeira: { id?: string; name: string; docente?: string | null; ects?: number; semestre?: string; ano?: number } | null;
};

const extToTipo = (name: string): MatTipo => {
  const e = name.split(".").pop()?.toLowerCase() ?? "";
  if (e === "pdf") return "PDF";
  if (["ppt", "pptx", "key"].includes(e)) return "Slides";
  if (["doc", "docx", "odt", "rtf", "txt"].includes(e)) return "DOCX";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(e)) return "Imagem";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e)) return "Vídeo";
  return "Link";
};

const tipoMeta: Record<MatTipo, { icon: any; bg: string; fg: string }> = {
  PDF:    { icon: FileType2,    bg: "bg-red-100",     fg: "text-red-600" },
  Slides: { icon: Presentation, bg: "bg-orange-100",  fg: "text-orange-600" },
  DOCX:   { icon: FileText,     bg: "bg-blue-100",    fg: "text-blue-600" },
  Imagem: { icon: ImageIcon,    bg: "bg-purple-100",  fg: "text-purple-600" },
  "Vídeo":{ icon: Video,        bg: "bg-pink-100",    fg: "text-pink-600" },
  Link:   { icon: LinkIcon,     bg: "bg-slate-100",   fg: "text-slate-600" },
};

const TipoIcon = ({ tipo, size = "md" }: { tipo: MatTipo; size?: "sm" | "md" }) => {
  const m = tipoMeta[tipo];
  const Icon = m.icon;
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const ic = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <div className={`${dim} rounded-lg flex items-center justify-center shrink-0 ${m.bg}`}>
      <Icon className={`${ic} ${m.fg}`} />
    </div>
  );
};

const seed = (name: string) => ({
  resumo: `${name} apresenta os fundamentos teóricos e práticos da disciplina, com aulas expositivas, trabalhos em grupo e avaliação contínua.`,
  sala: "Sala A-2.1",
  horario: "Segundas e Quartas · 14:00 – 15:30",
  aulas: Array.from({ length: 8 }, (_, i): Aula => ({
    id: `a-${i + 1}`,
    n: i + 1,
    titulo: `Aula ${i + 1} — Tópico ${i + 1}`,
    sumario: "Sumário da aula com objetivos, conteúdos abordados e referências.",
    duracao: "90 min",
    data: `2025-10-${String(10 + i).padStart(2, "0")}`,
    hora: "14:00",
    materiais: i % 2 === 0
      ? [{ id: `am-${i}-1`, nome: `Slides Aula ${i + 1}.pptx`, tipo: "Slides" as MatTipo }]
      : [{ id: `am-${i}-1`, nome: `Notas Aula ${i + 1}.pdf`, tipo: "PDF" as MatTipo }],
  })),
  avaliacoes: [
    { id: "ev1", titulo: "Teste Intercalar",   data: "2025-11-15", hora: "10:00", peso: 30 },
    { id: "ev2", titulo: "Trabalho de Grupo",  data: "2025-12-20", hora: "14:00", peso: 30 },
    { id: "ev3", titulo: "Exame Final",        data: "2026-01-20", hora: "09:00", peso: 40 },
  ] as Avaliacao[],
  anuncios: [
    { id: "an1", titulo: "Bem-vindos à cadeira", texto: "Consultem o programa e a bibliografia.", data: "2025-09-01" },
  ] as Anuncio[],
});

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function CadeiraPreviewDialog({ open, onOpenChange, cadeira }: Props) {
  const [locked, setLocked] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, setState] = useState(() => seed(cadeira?.name ?? "Cadeira"));
  const [nome, setNome] = useState(cadeira?.name ?? "");
  const [docente, setDocente] = useState(cadeira?.docente ?? "");
  const [ects, setEcts] = useState(String(cadeira?.ects ?? 6));
  const [semestre, setSemestre] = useState(cadeira?.semestre ?? "1");
  const uploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (open && cadeira) {
      setState(seed(cadeira.name));
      setNome(cadeira.name);
      setDocente(cadeira.docente ?? "");
      setEcts(String(cadeira.ects ?? 6));
      setSemestre(cadeira.semestre ?? "1");
      setLocked(false);
    }
  }, [open, cadeira?.id]);

  const totalPeso = useMemo(() => state.avaliacoes.reduce((a, e) => a + (e.peso || 0), 0), [state.avaliacoes]);
  const totalConteudos = useMemo(() => state.aulas.reduce((a, x) => a + x.materiais.length, 0), [state.aulas]);

  if (!cadeira) return null;

  const ro = locked;

  const addAula = () => setState(s => ({
    ...s,
    aulas: [...s.aulas, { id: uid("a"), n: s.aulas.length + 1, titulo: `Aula ${s.aulas.length + 1} — Nova`, sumario: "", duracao: "90 min", data: "", hora: "14:00", materiais: [] }],
  }));
  const removeAula = (id: string) => setState(s => ({ ...s, aulas: s.aulas.filter(a => a.id !== id).map((a, i) => ({ ...a, n: i + 1 })) }));
  const updAula = (id: string, patch: Partial<Aula>) => setState(s => ({ ...s, aulas: s.aulas.map(a => a.id === id ? { ...a, ...patch } : a) }));

  const onUploadToAula = (aulaId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    const novos: Material[] = Array.from(files).map(f => ({ id: uid("am"), nome: f.name, tipo: extToTipo(f.name) }));
    setState(s => ({ ...s, aulas: s.aulas.map(a => a.id === aulaId ? { ...a, materiais: [...a.materiais, ...novos] } : a) }));
    toast.success(`${novos.length} ficheiro(s) adicionado(s)`);
  };
  const removeMatFromAula = (aulaId: string, matId: string) =>
    setState(s => ({ ...s, aulas: s.aulas.map(a => a.id === aulaId ? { ...a, materiais: a.materiais.filter(m => m.id !== matId) } : a) }));
  const renameMat = (aulaId: string, matId: string, nome: string) =>
    setState(s => ({ ...s, aulas: s.aulas.map(a => a.id === aulaId ? { ...a, materiais: a.materiais.map(m => m.id === matId ? { ...m, nome } : m) } : a) }));

  const addEval = () => setState(s => ({ ...s, avaliacoes: [...s.avaliacoes, { id: uid("ev"), titulo: "Nova avaliação", data: "", hora: "10:00", peso: 0 }] }));
  const removeEval = (id: string) => setState(s => ({ ...s, avaliacoes: s.avaliacoes.filter(e => e.id !== id) }));
  const updEval = (id: string, patch: Partial<Avaliacao>) => setState(s => ({ ...s, avaliacoes: s.avaliacoes.map(e => e.id === id ? { ...e, ...patch } : e) }));

  const addAnuncio = () => setState(s => ({ ...s, anuncios: [...s.anuncios, { id: uid("an"), titulo: "Novo anúncio", texto: "", data: "" }] }));
  const removeAnuncio = (id: string) => setState(s => ({ ...s, anuncios: s.anuncios.filter(a => a.id !== id) }));
  const updAnuncio = (id: string, patch: Partial<Anuncio>) => setState(s => ({ ...s, anuncios: s.anuncios.map(a => a.id === id ? { ...a, ...patch } : a) }));

  const handleLockClick = () => {
    if (locked) { setLocked(false); toast.info("Cadeira desbloqueada — pode editar novamente"); }
    else setConfirmOpen(true);
  };
  const confirmLock = () => { setLocked(true); setConfirmOpen(false); toast.success("Cadeira confirmada e bloqueada"); };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
          {/* Top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-5 py-2.5 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1"><Eye className="w-3 h-3" /> Vista do estudante</Badge>
              {locked ? (
                <Badge className="text-[10px] gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><Lock className="w-3 h-3" /> Bloqueada</Badge>
              ) : (
                <Badge className="text-[10px] gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100"><Pencil className="w-3 h-3" /> Modo edição</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={locked ? "outline" : "default"} onClick={handleLockClick} className="h-8 gap-1.5">
                {locked ? <><Unlock className="w-3.5 h-3.5" /> Desbloquear</> : <><Lock className="w-3.5 h-3.5" /> Bloquear e Confirmar</>}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
            </div>
          </div>

          {/* Hero header */}
          <Card className="rounded-none border-0 border-b shadow-none">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent" />
              <div className="relative px-5 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {ro ? (
                      <h1 className="text-xl font-bold tracking-tight leading-tight">{nome}</h1>
                    ) : (
                      <Input value={nome} onChange={e => setNome(e.target.value)} className="text-xl font-bold h-10 max-w-xl" />
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0"><BookOpen className="w-3 h-3 mr-1" /> Cadeira</Badge>
                </div>

                {ro ? (
                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-3xl">{state.resumo}</p>
                ) : (
                  <Textarea value={state.resumo} onChange={e => setState(s => ({ ...s, resumo: e.target.value }))} className="text-[13px] min-h-[60px] max-w-3xl" placeholder="Resumo da cadeira" />
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1.5">
                    <User className="w-3 h-3" />
                    {ro ? (docente || "Sem docente") : (
                      <input value={docente || ""} onChange={e => setDocente(e.target.value)} placeholder="Docente" className="bg-transparent outline-none w-32" />
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <Users className="w-3 h-3" /> {cadeira.ano !== undefined ? `${cadeira.ano + 1}º Ano` : "—"}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <MapPin className="w-3 h-3" />
                    {ro ? state.sala : (
                      <input value={state.sala} onChange={e => setState(s => ({ ...s, sala: e.target.value }))} className="bg-transparent outline-none w-24" />
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <Clock className="w-3 h-3" />
                    {ro ? state.horario : (
                      <input value={state.horario} onChange={e => setState(s => ({ ...s, horario: e.target.value }))} className="bg-transparent outline-none w-56" />
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {ro ? `${ects} ECTS` : (
                      <>
                        <input type="number" value={ects} onChange={e => setEcts(e.target.value)} className="bg-transparent outline-none w-10" /> ECTS
                      </>
                    )}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                    {ro ? (semestre === "anual" ? "Anual" : `${semestre}º Semestre`) : (
                      <Select value={semestre} onValueChange={setSemestre}>
                        <SelectTrigger className="h-5 border-0 bg-transparent p-0 text-[11px] w-24"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1º Semestre</SelectItem>
                          <SelectItem value="2">2º Semestre</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4 border-t">
              {[
                { icon: Award,       label: "Avaliações", value: state.avaliacoes.length },
                { icon: Video,       label: "Aulas",      value: state.aulas.length },
                { icon: FolderOpen,  label: "Conteúdos",  value: totalConteudos },
                { icon: Megaphone,   label: "Anúncios",   value: state.anuncios.length },
                { icon: CheckCircle, label: "Peso total", value: `${totalPeso}%` },
              ].map((k, i) => {
                const Icon = k.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">{k.label}</p>
                      <p className="text-sm font-bold">{k.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Tabs */}
          <div className="px-5 py-4">
            <Tabs defaultValue="info" className="space-y-4">
              <div className="border-b overflow-x-auto">
                <TabsList className="bg-transparent h-auto p-0 gap-0">
                  {[
                    { value: "info",     icon: BookMarked, label: "Informação" },
                    { value: "lessons",  icon: Video,      label: "Aulas" },
                    { value: "exams",    icon: Award,      label: "Avaliações" },
                    { value: "anuncios", icon: Megaphone,  label: "Anúncios" },
                  ].map(tab => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-current data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2.5 text-sm gap-2"
                    >
                      <tab.icon className="w-4 h-4" />{tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Informação geral (FIRST) */}
              <TabsContent value="info" className="space-y-3">
                <Card className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BookMarked className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Informação do curso</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Nome da Cadeira</p>
                      {ro ? <p className="text-sm font-medium">{nome}</p> : <Input value={nome} onChange={e => setNome(e.target.value)} className="h-9" />}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Docente</p>
                      {ro ? <p className="text-sm">{docente || "—"}</p> : <Input value={docente || ""} onChange={e => setDocente(e.target.value)} className="h-9" />}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Semestre</p>
                      {ro ? <p className="text-sm">{semestre === "anual" ? "Anual" : `${semestre}º Semestre`}</p> :
                        <Select value={semestre} onValueChange={setSemestre}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1º Semestre</SelectItem>
                            <SelectItem value="2">2º Semestre</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">ECTS</p>
                      {ro ? <p className="text-sm">{ects}</p> : <Input type="number" value={ects} onChange={e => setEcts(e.target.value)} className="h-9" />}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Sala</p>
                      {ro ? <p className="text-sm">{state.sala}</p> : <Input value={state.sala} onChange={e => setState(s => ({ ...s, sala: e.target.value }))} className="h-9" />}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Horário</p>
                      {ro ? <p className="text-sm">{state.horario}</p> : <Input value={state.horario} onChange={e => setState(s => ({ ...s, horario: e.target.value }))} className="h-9" />}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Resumo / Apresentação</p>
                      {ro ? <p className="text-sm leading-relaxed">{state.resumo}</p> :
                        <Textarea value={state.resumo} onChange={e => setState(s => ({ ...s, resumo: e.target.value }))} className="min-h-[80px]" />}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Aulas — with conteudos nested below each */}
              <TabsContent value="lessons" className="space-y-3">
                {state.aulas.map(a => (
                  <Card key={a.id} className="p-4 border-l-[3px] border-l-primary/40 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-14 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 text-muted-foreground/60" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{a.n}</span>
                          {ro
                            ? <h4 className="font-medium truncate">{a.titulo}</h4>
                            : <Input value={a.titulo} onChange={e => updAula(a.id, { titulo: e.target.value })} className="h-7 text-sm font-medium" />}
                        </div>
                        {ro
                          ? <p className="text-xs text-muted-foreground line-clamp-2">{a.sumario}</p>
                          : <Textarea value={a.sumario} onChange={e => updAula(a.id, { sumario: e.target.value })} className="text-xs min-h-[40px]" placeholder="Sumário" />}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                            {ro ? a.duracao :
                              <Input value={a.duracao} onChange={e => updAula(a.id, { duracao: e.target.value })} className="h-6 text-xs w-20" />}
                          </span>
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />
                            {ro ? (a.data || "—") :
                              <Input type="date" value={a.data} onChange={e => updAula(a.id, { data: e.target.value })} className="h-6 text-xs w-36" />}
                          </span>
                          <span className="flex items-center gap-1">
                            {ro ? `às ${a.hora}` :
                              <Input type="time" value={a.hora} onChange={e => updAula(a.id, { hora: e.target.value })} className="h-6 text-xs w-24" />}
                          </span>
                        </div>
                      </div>
                      {!ro && (
                        <Button size="icon" variant="ghost" onClick={() => removeAula(a.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Conteúdos da aula */}
                    <div className="pl-24 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                          <FolderOpen className="w-3 h-3" /> Conteúdos da aula ({a.materiais.length})
                        </p>
                        {!ro && (
                          <>
                            <input
                              ref={el => (uploadRefs.current[a.id] = el)}
                              type="file"
                              multiple
                              className="hidden"
                              onChange={e => { onUploadToAula(a.id, e.target.files); e.target.value = ""; }}
                            />
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                              onClick={() => uploadRefs.current[a.id]?.click()}>
                              <Upload className="w-3 h-3" /> Carregar ficheiro
                            </Button>
                          </>
                        )}
                      </div>
                      {a.materiais.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Sem conteúdos.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {a.materiais.map(m => (
                            <div key={m.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-muted/40 border">
                              <TipoIcon tipo={m.tipo} size="sm" />
                              <div className="flex-1 min-w-0">
                                {ro
                                  ? <p className="text-xs font-medium truncate">{m.nome}</p>
                                  : <Input value={m.nome} onChange={e => renameMat(a.id, m.id, e.target.value)} className="h-6 text-xs" />}
                              </div>
                              {/* Tipo is LOCKED — derived from upload, never editable */}
                              <Badge variant="outline" className="text-[10px] gap-1 cursor-not-allowed" title="Tipo bloqueado — definido pelo formato do ficheiro">
                                <Lock className="w-2.5 h-2.5" /> {m.tipo}
                              </Badge>
                              {!ro && (
                                <Button size="icon" variant="ghost" onClick={() => removeMatFromAula(a.id, m.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {!ro && <Button variant="outline" size="sm" onClick={addAula} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar aula</Button>}
              </TabsContent>

              {/* Avaliações */}
              <TabsContent value="exams" className="space-y-2">
                <Card className="overflow-hidden">
                  <div className="divide-y">
                    {state.avaliacoes.map(ev => (
                      <div key={ev.id} className="px-4 py-3 flex items-center gap-3">
                        <ClipboardList className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="flex-1 grid grid-cols-[1fr_140px_100px_80px] gap-2">
                          {ro ? <p className="text-sm font-medium">{ev.titulo}</p> :
                            <Input value={ev.titulo} onChange={e => updEval(ev.id, { titulo: e.target.value })} className="h-8 text-sm" />}
                          {ro ? <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{ev.data || "—"}</p> :
                            <Input type="date" value={ev.data} onChange={e => updEval(ev.id, { data: e.target.value })} className="h-8 text-xs" />}
                          {ro ? <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{ev.hora}</p> :
                            <Input type="time" value={ev.hora} onChange={e => updEval(ev.id, { hora: e.target.value })} className="h-8 text-xs" />}
                          {ro ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 w-fit">{ev.peso}%</Badge> :
                            <Input type="number" value={ev.peso} onChange={e => updEval(ev.id, { peso: Number(e.target.value) })} className="h-8 text-xs" />}
                        </div>
                        {!ro && (
                          <Button size="icon" variant="ghost" onClick={() => removeEval(ev.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="flex items-center justify-between">
                  {!ro && <Button variant="outline" size="sm" onClick={addEval} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar avaliação</Button>}
                  <p className={`text-xs ml-auto ${totalPeso === 100 ? "text-emerald-600" : "text-amber-600"}`}>Peso total: <span className="font-semibold">{totalPeso}%</span></p>
                </div>
              </TabsContent>

              {/* Anúncios */}
              <TabsContent value="anuncios" className="space-y-2">
                {state.anuncios.map(an => (
                  <Card key={an.id} className="p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-primary" />
                      {ro ? <p className="text-sm font-semibold flex-1">{an.titulo}</p> :
                        <Input value={an.titulo} onChange={e => updAnuncio(an.id, { titulo: e.target.value })} className="h-8 text-sm font-semibold" />}
                      {ro ? <span className="text-[11px] text-muted-foreground">{an.data}</span> :
                        <Input type="date" value={an.data} onChange={e => updAnuncio(an.id, { data: e.target.value })} className="h-7 text-xs w-36" />}
                      {!ro && (
                        <Button size="icon" variant="ghost" onClick={() => removeAnuncio(an.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    {ro ? <p className="text-xs text-muted-foreground">{an.texto}</p> :
                      <Textarea value={an.texto} onChange={e => updAnuncio(an.id, { texto: e.target.value })} className="text-xs min-h-[50px]" placeholder="Texto do anúncio" />}
                  </Card>
                ))}
                {!ro && <Button variant="outline" size="sm" onClick={addAnuncio} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Adicionar anúncio</Button>}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar e bloquear cadeira?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que pretende confirmar e bloquear esta cadeira? Após bloqueada, deixa de ser editável até desbloquear novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLock}>Sim, confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
