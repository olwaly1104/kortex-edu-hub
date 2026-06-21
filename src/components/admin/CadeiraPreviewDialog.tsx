import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PlayCircle, FileText, ClipboardList, Info, Calendar, Clock, GraduationCap, User } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cadeira: { name: string; docente?: string | null; ects?: number; semestre?: string; ano?: number } | null;
};

export function CadeiraPreviewDialog({ open, onOpenChange, cadeira }: Props) {
  if (!cadeira) return null;

  // Mock content as students see it
  const aulas = Array.from({ length: 8 }, (_, i) => ({
    n: i + 1,
    titulo: `Aula ${i + 1} — Tópico ${i + 1}`,
    data: `${10 + i} Out`,
    duracao: 90,
  }));
  const conteudos = [
    { tipo: "PDF", titulo: "Programa da Cadeira", semana: 1 },
    { tipo: "Slides", titulo: "Introdução e Objetivos", semana: 1 },
    { tipo: "PDF", titulo: "Bibliografia Recomendada", semana: 1 },
    { tipo: "DOCX", titulo: "Ficha de Exercícios 1", semana: 2 },
  ];
  const avaliacoes = [
    { titulo: "Teste Intercalar", data: "15 Nov", peso: "30%" },
    { titulo: "Trabalho de Grupo", data: "20 Dez", peso: "30%" },
    { titulo: "Exame Final", data: "20 Jan", peso: "40%" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[10px] gap-1"><BookOpen className="w-3 h-3" /> Pré-visualização do estudante</Badge>
          </div>
          <DialogTitle className="text-xl">{cadeira.name}</DialogTitle>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
            {cadeira.docente && <span className="inline-flex items-center gap-1"><User className="w-3 h-3" /> {cadeira.docente}</span>}
            {cadeira.ano !== undefined && <span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {cadeira.ano + 1}º Ano</span>}
            {cadeira.semestre && <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {cadeira.semestre === "anual" ? "Anual" : `${cadeira.semestre}º Semestre`}</span>}
            {cadeira.ects !== undefined && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {cadeira.ects} ECTS</span>}
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <Tabs defaultValue="info">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="info" className="gap-1.5 text-xs"><Info className="w-3.5 h-3.5" /> Informação</TabsTrigger>
              <TabsTrigger value="aulas" className="gap-1.5 text-xs"><PlayCircle className="w-3.5 h-3.5" /> Aulas</TabsTrigger>
              <TabsTrigger value="conteudos" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" /> Conteúdos</TabsTrigger>
              <TabsTrigger value="avaliacoes" className="gap-1.5 text-xs"><ClipboardList className="w-3.5 h-3.5" /> Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4 space-y-3">
              <div className="rounded-lg border p-4 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Descrição</p>
                  <p className="text-sm">Esta cadeira aborda os fundamentos teóricos e práticos, com aulas expositivas, trabalhos em grupo e avaliação contínua.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total de Aulas</p><p className="text-sm font-semibold">{aulas.length}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avaliações</p><p className="text-sm font-semibold">{avaliacoes.length}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Conteúdos</p><p className="text-sm font-semibold">{conteudos.length}</p></div>
                  <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Modalidade</p><p className="text-sm font-semibold">Presencial</p></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aulas" className="mt-4 space-y-2">
              {aulas.map(a => (
                <div key={a.n} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 transition">
                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{a.n}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">{a.data} · {a.duracao} min</p>
                  </div>
                  <PlayCircle className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="conteudos" className="mt-4 space-y-2">
              {conteudos.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 transition">
                  <Badge variant="outline" className="text-[10px]">{c.tipo}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">Semana {c.semana}</p>
                  </div>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </TabsContent>

            <TabsContent value="avaliacoes" className="mt-4 space-y-2">
              {avaliacoes.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <ClipboardList className="w-4 h-4 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">{a.data}</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{a.peso}</Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
