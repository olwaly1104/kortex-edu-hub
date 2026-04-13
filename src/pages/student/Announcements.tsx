import { useState } from "react";
import { announcements } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, AlertTriangle, BookOpen, CalendarDays, Info, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: React.ElementType; stripe: string; badge: string }> = {
  urgente: { label: "Urgente", icon: AlertTriangle, stripe: "bg-destructive", badge: "bg-destructive/10 text-destructive" },
  evento: { label: "Evento", icon: CalendarDays, stripe: "bg-secondary", badge: "bg-secondary/10 text-secondary" },
  academico: { label: "Académico", icon: BookOpen, stripe: "bg-primary", badge: "bg-primary/10 text-primary" },
  geral: { label: "Geral", icon: Info, stripe: "bg-muted-foreground", badge: "bg-muted text-muted-foreground" },
};

const myAnnouncements = [
  { id: "my1", title: "Alteração de Horário — Turma A", content: "A aula de quarta-feira da Turma A passa para as 14h00, sala 204. Esta alteração é válida a partir da próxima semana.", type: "academico", date: "13/02/2024", author: "Coordenação de Curso" },
  { id: "my2", title: "Reunião de Coordenação", content: "Reunião com todos os docentes do curso agendada para sexta-feira, 16/02, às 10h00 na sala de reuniões.", type: "evento", date: "10/02/2024", author: "Coordenação de Curso" },
  { id: "my3", title: "Entrega de Relatórios — Prazo Final", content: "Lembrete: o prazo final para entrega dos relatórios de estágio é dia 28/02. Não serão aceites entregas após esta data.", type: "urgente", date: "08/02/2024", author: "Coordenação de Curso" },
];

export default function StudentAnnouncements() {
  const [tab, setTab] = useState<"todos" | "meus">("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("geral");
  const [newContent, setNewContent] = useState("");

  const sourceData = tab === "meus" ? myAnnouncements : announcements;

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha o título e o conteúdo do anúncio.");
      return;
    }
    toast.success(`Anúncio "${newTitle}" publicado com sucesso.`);
    setNewTitle(""); setNewType("geral"); setNewContent(""); setDialogOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anúncios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sourceData.length} anúncio{sourceData.length !== 1 ? "s" : ""}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Novo Anúncio</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader><DialogTitle>Publicar Anúncio</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Título</Label>
                <Input placeholder="Título do anúncio" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Categoria</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="academico">Académico</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Conteúdo</Label>
                <Textarea placeholder="Escreva o conteúdo do anúncio..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate}>Publicar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-5 border-b border-border">
        {([["todos", "Todos"], ["meus", "Publicados por mim"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setExpandedId(null); }}
            className={cn(
              "pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Announcements list */}
      <div className="space-y-3">
        {sourceData.length > 0 ? sourceData.map(ann => {
          const config = typeConfig[ann.type] || typeConfig.geral;
          const Icon = config.icon;
          const isExpanded = expandedId === ann.id;

          return (
            <div
              key={ann.id}
              onClick={() => setExpandedId(isExpanded ? null : ann.id)}
              className={cn(
                "flex rounded-lg border bg-card overflow-hidden cursor-pointer transition-all hover:shadow-sm",
                isExpanded && "shadow-sm"
              )}
            >
              {/* Left colour stripe */}
              <div className={cn("w-1 shrink-0", config.stripe)} />

              <div className="flex-1 px-4 py-3.5 min-w-0">
                {/* Row 1: category + date */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide", config.badge, "rounded px-1.5 py-0.5")}>
                    <Icon className="w-3 h-3" /> {config.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {ann.date}
                  </span>
                </div>

                {/* Row 2: title */}
                <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">{ann.title}</h3>

                {/* Row 3: content */}
                <p className={cn(
                  "text-[13px] text-muted-foreground leading-relaxed",
                  !isExpanded && "line-clamp-1"
                )}>
                  {ann.content}
                </p>

                {/* Row 4: author (visible when expanded) */}
                {isExpanded && (
                  <p className="text-[11px] text-muted-foreground mt-2.5 pt-2.5 border-t border-border/50">
                    Publicado por <span className="font-medium text-foreground">{ann.author}</span>
                  </p>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-16">
            <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "meus" ? "Ainda não publicou nenhum anúncio." : "Nenhum anúncio disponível."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
