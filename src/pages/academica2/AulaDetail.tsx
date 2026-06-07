import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cadeirasAcad } from "@/data/academica2Data";
import { getCadeiraContent, setCadeiraContent, uid, type Aula, type Attachment } from "@/data/cadeiraContentData";
import { ArrowLeft, PlayCircle, Plus, Save, Trash2, Download, Eye, Upload, FileText, FileType, Film, Image as ImageIcon, Link2, CalendarDays, Clock, ListChecks } from "lucide-react";

import { toast } from "sonner";

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

const SAMPLE = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export default function AulaDetail() {
  const { cadeiraId, aulaId } = useParams();
  const cadeira = cadeirasAcad.find(c => c.id === cadeiraId) || cadeirasAcad[0];
  const content = getCadeiraContent(cadeira.id, cadeira.cadeira);
  const initial = content.aulas.find(a => a.id === aulaId) || content.aulas[0];

  const [aula, setAula] = useState<Aula>(initial);
  const upd = (p: Partial<Aula>) => setAula(a => ({ ...a, ...p }));
  const fileInputId = "aula-file-input";

  const save = () => {
    const nextAulas = content.aulas.map(a => a.id === aula.id ? aula : a);
    setCadeiraContent(cadeira.id, { ...content, aulas: nextAulas });
    toast.success("Aula guardada");
  };

  const addAttachment = () => {
    const next: Attachment = { id: uid("at"), name: "Novo documento.pdf", tipo: "PDF", size: "—", url: SAMPLE };
    upd({ attachments: [...aula.attachments, next] });
  };
  const updAttachment = (id: string, p: Partial<Attachment>) =>
    upd({ attachments: aula.attachments.map(x => x.id === id ? { ...x, ...p } : x) });
  const delAttachment = (id: string) => upd({ attachments: aula.attachments.filter(x => x.id !== id) });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
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
    upd({ attachments: [...aula.attachments, ...novos] });
    toast.success(`${files.length} ficheiro(s) carregado(s)`);
    e.target.value = "";
  };

  const previewable = aula.attachments.find(a => a.tipo === "PDF" || a.tipo === "Vídeo" || a.tipo === "Imagem");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to={`/areaacademica/cadeiras/${cadeira.id}`} className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="w-3 h-3" /> Voltar à Cadeira
      </Link>

      <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline">Aula {aula.n}</Badge>
            <Badge variant="outline">{cadeira.cadeira}</Badge>
            <Badge variant="outline" className="gap-1"><CalendarDays className="w-3 h-3" /> {aula.data || "Sem data"}</Badge>
            <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> {aula.duracao} min</Badge>
            {aula.quizId && (() => {
              const q = content.quizzes.find(x => x.id === aula.quizId);
              return q ? <Badge className="bg-blue-100 text-blue-700 gap-1"><ListChecks className="w-3 h-3" /> Quiz: {q.titulo}</Badge> : null;
            })()}
            <Badge className={aula.publicada ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{aula.publicada ? "Publicada" : "Rascunho"}</Badge>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><PlayCircle className="w-6 h-6 text-primary" /> {aula.titulo}</h1>
        </div>
        <Button onClick={save} className="gap-2"><Save className="w-4 h-4" /> Guardar</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 lg:col-span-2">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3"><Label>Título</Label><Input value={aula.titulo} onChange={e => upd({ titulo: e.target.value })} className="mt-1" /></div>
            <div><Label>Número</Label><Input type="number" value={aula.n} onChange={e => upd({ n: +e.target.value })} className="mt-1" /></div>
            <div><Label>Data</Label><Input value={aula.data} onChange={e => upd({ data: e.target.value })} className="mt-1" placeholder="dd/mm/aaaa" /></div>
            <div><Label>Duração (min)</Label><Input type="number" value={aula.duracao} onChange={e => upd({ duracao: +e.target.value })} className="mt-1" /></div>
          </div>
          <div><Label>Descrição / Conteúdo da aula</Label><Textarea rows={6} value={aula.descricao} onChange={e => upd({ descricao: e.target.value })} className="mt-1" /></div>
          <div className="flex items-center gap-2 border-t pt-4">
            <Switch checked={aula.publicada} onCheckedChange={v => upd({ publicada: v })} />
            <Label>Publicar aula para estudantes</Label>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-3">Pré-visualização</p>
          {previewable ? (
            previewable.tipo === "Vídeo" ? (
              <video controls src={previewable.url} className="w-full rounded-md border" />
            ) : previewable.tipo === "Imagem" ? (
              <img src={previewable.url} alt={previewable.name} className="w-full rounded-md border" />
            ) : (
              <iframe src={previewable.url} className="w-full h-72 rounded-md border" title={previewable.name} />
            )
          ) : (
            <div className="h-72 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground text-center px-4">
              Sem recurso para pré-visualizar. Adicione um PDF, vídeo ou imagem.
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b">
          <p className="text-sm font-semibold">Materiais da Aula ({aula.attachments.length})</p>
          <div className="flex gap-2">
            <input id={fileInputId} type="file" multiple className="hidden" onChange={handleUpload} />
            <Button size="sm" variant="outline" className="gap-1" onClick={() => document.getElementById(fileInputId)?.click()}>
              <Upload className="w-4 h-4" /> Carregar Ficheiros
            </Button>
            <Button size="sm" onClick={addAttachment} className="gap-1"><Plus className="w-4 h-4" /> Adicionar</Button>
          </div>
        </div>
        <div className="divide-y">
          {aula.attachments.map(at => (
            <div key={at.id} className="p-3 flex items-center gap-3 hover:bg-muted/40">
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">{typeIcon(at.tipo)}</div>
              <div className="flex-1 min-w-0 grid sm:grid-cols-3 gap-2">
                <Input value={at.name} onChange={e => updAttachment(at.id, { name: e.target.value })} className="h-8 text-xs sm:col-span-2" />
                <Select value={at.tipo} onValueChange={v => updAttachment(at.id, { tipo: v as Attachment["tipo"] })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{(["PDF", "Slides", "DOCX", "Vídeo", "Imagem", "Link"] as const).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right shrink-0">{at.size || "—"}</span>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" asChild><a href={at.url} target="_blank" rel="noreferrer" title="Pré-visualizar"><Eye className="w-4 h-4" /></a></Button>
                <Button size="icon" variant="ghost" asChild><a href={at.url} download title="Descarregar"><Download className="w-4 h-4" /></a></Button>
                <Button size="icon" variant="ghost" onClick={() => delAttachment(at.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
          {aula.attachments.length === 0 && <p className="p-6 text-sm text-muted-foreground text-center">Sem materiais. Carregue PDFs, slides, vídeos ou docs.</p>}
        </div>
      </Card>
    </div>
  );
}
