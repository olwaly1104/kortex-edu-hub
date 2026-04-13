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
import { Megaphone, Search, Pin, Clock, User, Plus, ChevronDown, AlertTriangle, BookOpen, CalendarDays, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: React.ElementType; dot: string; bg: string; border: string }> = {
  urgente: { label: "Urgente", icon: AlertTriangle, dot: "bg-destructive", bg: "bg-destructive/8", border: "border-destructive/20" },
  evento: { label: "Evento", icon: CalendarDays, dot: "bg-secondary", bg: "bg-secondary/8", border: "border-secondary/20" },
  academico: { label: "Académico", icon: BookOpen, dot: "bg-primary", bg: "bg-primary/8", border: "border-primary/20" },
  geral: { label: "Geral", icon: Info, dot: "bg-muted-foreground", bg: "bg-muted/50", border: "border-border" },
};

const categories = [
  { key: "todos", label: "Todos" },
  { key: "urgente", label: "Urgente" },
  { key: "academico", label: "Académico" },
  { key: "evento", label: "Evento" },
  { key: "geral", label: "Geral" },
];

export default function StudentAnnouncements() {
  const [activeFilter, setActiveFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("geral");
  const [newContent, setNewContent] = useState("");

  const filtered = useMemo(() => {
    return announcements
      .filter(a => activeFilter === "todos" || a.type === activeFilter)
      .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
  }, [activeFilter, search]);

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

      {/* Announcements feed */}
      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map(ann => {
          const config = typeConfig[ann.type] || typeConfig.geral;
          const Icon = config.icon;
          const isExpanded = expandedId === ann.id;
          const isUrgent = ann.type === "urgente";

          return (
            <Card
              key={ann.id}
              onClick={() => setExpandedId(isExpanded ? null : ann.id)}
              className={cn(
                "overflow-hidden cursor-pointer transition-all hover:shadow-md border",
                isUrgent && "border-destructive/30",
                isExpanded && "shadow-md"
              )}
            >
              {/* Color accent bar */}
              <div className={cn("h-1", isUrgent ? "bg-destructive" : config.dot)} />

              <div className="p-4 sm:p-5">
                {/* Top row: badge + date */}
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant="outline" className={cn("text-[10px] gap-1 font-medium", config.bg, config.border)}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {ann.date}
                  </div>
                </div>

                {/* Title */}
                <div className="flex items-start gap-2 mb-1.5">
                  {isUrgent && <Pin className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />}
                  <h3 className={cn("font-semibold text-foreground text-[15px] leading-snug", isUrgent && "text-destructive")}>{ann.title}</h3>
                </div>

                {/* Content preview or full */}
                <p className={cn(
                  "text-sm text-muted-foreground leading-relaxed mt-1",
                  !isExpanded && "line-clamp-2"
                )}>
                  {ann.content}
                </p>

                {/* Author + expand hint */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{ann.author}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>
            </Card>
          );
        }) : (
          <div className="text-center py-16">
            <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum anúncio encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
