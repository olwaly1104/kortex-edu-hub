import { useState, useMemo } from "react";
import { announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
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
import { useAuth } from "@/contexts/AuthContext";

const typeConfig: Record<string, { label: string; icon: React.ElementType; accent: string; accentBg: string }> = {
  urgente: { label: "Urgente", icon: AlertTriangle, accent: "text-destructive", accentBg: "bg-destructive" },
  evento: { label: "Evento", icon: CalendarDays, accent: "text-secondary", accentBg: "bg-secondary" },
  academico: { label: "Académico", icon: BookOpen, accent: "text-primary", accentBg: "bg-primary" },
  geral: { label: "Geral", icon: Info, accent: "text-muted-foreground", accentBg: "bg-muted-foreground" },
};

const categories = [
  { key: "todos", label: "Todos" },
  { key: "urgente", label: "Urgente" },
  { key: "academico", label: "Académico" },
  { key: "evento", label: "Evento" },
  { key: "geral", label: "Geral" },
];

// Simulated "my announcements"
const myAnnouncements = [
  { id: "my1", title: "Alteração de Horário — Turma A", content: "A aula de quarta-feira da Turma A passa para as 14h00, sala 204. Esta alteração é válida a partir da próxima semana.", type: "academico", date: "13/02/2024", author: "Você" },
  { id: "my2", title: "Reunião de Coordenação", content: "Reunião com todos os docentes do curso agendada para sexta-feira, 16/02, às 10h00 na sala de reuniões.", type: "evento", date: "10/02/2024", author: "Você" },
  { id: "my3", title: "Entrega de Relatórios — Prazo Final", content: "Lembrete: o prazo final para entrega dos relatórios de estágio é dia 28/02. Não serão aceites entregas após esta data.", type: "urgente", date: "08/02/2024", author: "Você" },
];

export default function StudentAnnouncements() {
  const [tab, setTab] = useState<"todos" | "meus">("todos");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("geral");
  const [newContent, setNewContent] = useState("");

  const sourceData = tab === "meus" ? myAnnouncements : announcements;

  const filtered = useMemo(() => {
    return sourceData
      .filter(a => activeFilter === "todos" || a.type === activeFilter)
      .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
  }, [activeFilter, search, sourceData]);

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha o título e o conteúdo do anúncio.");
      return;
    }
    toast.success(`Anúncio "${newTitle}" publicado com sucesso.`);
    setNewTitle("");
    setNewType("geral");
    setNewContent("");
    setDialogOpen(false);
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anúncios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} anúncio{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Publicar Anúncio</DialogTitle>
            </DialogHeader>
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

      {/* Tabs: Todos / Meus Anúncios */}
      <div className="flex items-center gap-4 mb-5 border-b border-border">
        <button
          onClick={() => { setTab("todos"); setActiveFilter("todos"); setSearch(""); setExpandedId(null); }}
          className={cn(
            "pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "todos" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Todos os Anúncios
        </button>
        <button
          onClick={() => { setTab("meus"); setActiveFilter("todos"); setSearch(""); setExpandedId(null); }}
          className={cn(
            "pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            tab === "meus" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Meus Anúncios
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveFilter(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeFilter === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar anúncios..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2.5">
        {filtered.length > 0 ? filtered.map(ann => {
          const config = typeConfig[ann.type] || typeConfig.geral;
          const Icon = config.icon;
          const isExpanded = expandedId === ann.id;
          const isUrgent = ann.type === "urgente";

          return (
            <div
              key={ann.id}
              onClick={() => setExpandedId(isExpanded ? null : ann.id)}
              className={cn(
                "group rounded-xl border bg-card cursor-pointer transition-all",
                "hover:border-primary/20 hover:shadow-sm",
                isExpanded && "border-primary/25 shadow-sm",
                isUrgent && !isExpanded && "border-destructive/20"
              )}
            >
              <div className="flex items-start gap-4 p-4 sm:px-5">
                {/* Left accent icon */}
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  isUrgent ? "bg-destructive/10" : "bg-muted"
                )}>
                  <Icon className={cn("w-4 h-4", config.accent)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{ann.title}</h3>
                    <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">{config.label}</Badge>
                  </div>
                  <p className={cn(
                    "text-[13px] text-muted-foreground leading-relaxed",
                    !isExpanded && "line-clamp-1"
                  )}>
                    {ann.content}
                  </p>
                </div>

                {/* Right meta */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{ann.date}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground/50 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-0 ml-[52px] sm:ml-[52px]">
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3 h-3" /> {ann.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {ann.date}
                      </span>
                      <Badge variant="outline" className="text-[10px] sm:hidden">{config.label}</Badge>
                    </div>
                  </div>
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
