import { useState, useMemo } from "react";
import { announcements } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Clock, User, Plus, ChevronDown, AlertTriangle, BookOpen, CalendarDays, Info, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: React.ElementType; accent: string; iconBg: string }> = {
  urgente: { label: "Urgente", icon: AlertTriangle, accent: "text-destructive", iconBg: "bg-destructive/10" },
  evento: { label: "Evento", icon: CalendarDays, accent: "text-secondary", iconBg: "bg-secondary/10" },
  academico: { label: "Académico", icon: BookOpen, accent: "text-primary", iconBg: "bg-primary/10" },
  geral: { label: "Geral", icon: Info, accent: "text-muted-foreground", iconBg: "bg-muted" },
};

const myAnnouncements = [
  { id: "my1", title: "Alteração de Horário — Turma A", content: "A aula de quarta-feira da Turma A passa para as 14h00, sala 204. Esta alteração é válida a partir da próxima semana.", type: "academico", date: "13/02/2024", author: "Você" },
  { id: "my2", title: "Reunião de Coordenação", content: "Reunião com todos os docentes do curso agendada para sexta-feira, 16/02, às 10h00 na sala de reuniões.", type: "evento", date: "10/02/2024", author: "Você" },
  { id: "my3", title: "Entrega de Relatórios — Prazo Final", content: "Lembrete: o prazo final para entrega dos relatórios de estágio é dia 28/02. Não serão aceites entregas após esta data.", type: "urgente", date: "08/02/2024", author: "Você" },
];

export default function StudentAnnouncements() {
  const [tab, setTab] = useState<"todos" | "meus">("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
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
        {([["todos", "Todos os Anúncios"], ["meus", "Meus Anúncios"]] as const).map(([key, label]) => (
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

      {/* Feed */}
      <div className="space-y-px rounded-xl border border-border overflow-hidden bg-card">
        {sourceData.length > 0 ? sourceData.map((ann, i) => {
          const config = typeConfig[ann.type] || typeConfig.geral;
          const Icon = config.icon;
          const isExpanded = expandedId === ann.id;
          const isUrgent = ann.type === "urgente";

          return (
            <div
              key={ann.id}
              onClick={() => setExpandedId(isExpanded ? null : ann.id)}
              className={cn(
                "cursor-pointer transition-colors",
                "hover:bg-muted/40",
                isExpanded && "bg-muted/30",
                i > 0 && "border-t border-border"
              )}
            >
              {/* Main row */}
              <div className="flex items-center gap-3.5 px-4 sm:px-5 py-3.5">
                {/* Icon */}
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.iconBg)}>
                  <Icon className={cn("w-3.5 h-3.5", config.accent)} />
                </div>

                {/* Title + Author */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn("text-sm font-semibold text-foreground truncate", isUrgent && "text-destructive")}>{ann.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                      <User className="w-3 h-3 shrink-0" /> {ann.author}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> {ann.date}
                    </span>
                  </div>
                </div>

                {/* Category badge + chevron */}
                <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">{config.label}</Badge>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground/40 shrink-0 transition-transform", isExpanded && "rotate-180")} />
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-4 pl-[60px] sm:pl-[68px]">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{ann.content}</p>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-16">
            <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {tab === "meus" ? "Ainda não publicou nenhum anúncio." : "Nenhum anúncio encontrado."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
