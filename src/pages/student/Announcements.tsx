import { useState } from "react";
import { announcements } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Plus, AlertTriangle, BookOpen, CalendarDays, Info, Megaphone, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  urgente: { label: "Urgente", icon: AlertTriangle, color: "text-destructive" },
  evento: { label: "Evento", icon: CalendarDays, color: "text-secondary" },
  academico: { label: "Académico", icon: BookOpen, color: "text-primary" },
  geral: { label: "Geral", icon: Info, color: "text-muted-foreground" },
};

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-primary/15 text-primary",
    "bg-secondary/15 text-secondary",
    "bg-destructive/15 text-destructive",
    "bg-accent text-accent-foreground",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const myAnnouncements = [
  { id: "my1", title: "Alteração de Horário — Turma A", content: "A aula de quarta-feira da Turma A passa para as 14h00, sala 204. Esta alteração é válida a partir da próxima semana.", type: "academico", date: "13/02/2024", author: "Você" },
  { id: "my2", title: "Reunião de Coordenação", content: "Reunião com todos os docentes do curso agendada para sexta-feira, 16/02, às 10h00 na sala de reuniões.", type: "evento", date: "10/02/2024", author: "Você" },
  { id: "my3", title: "Entrega de Relatórios — Prazo Final", content: "Lembrete: o prazo final para entrega dos relatórios de estágio é dia 28/02. Não serão aceites entregas após esta data.", type: "urgente", date: "08/02/2024", author: "Você" },
];

export default function StudentAnnouncements() {
  const [tab, setTab] = useState<"todos" | "meus">("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("geral");
  const [newContent, setNewContent] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const sourceData = tab === "meus" ? myAnnouncements : announcements;

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
          <p className="text-sm text-muted-foreground mt-0.5">{sourceData.length} publicações</p>
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
      <div className="flex items-center gap-4 mb-6 border-b border-border">
        {([["todos", "Feed"], ["meus", "Meus Anúncios"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "pb-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Social feed */}
      <div className="max-w-2xl mx-auto space-y-4">
        {sourceData.length > 0 ? sourceData.map(ann => {
          const config = typeConfig[ann.type] || typeConfig.geral;
          const Icon = config.icon;
          const isLiked = liked.has(ann.id);
          const isUrgent = ann.type === "urgente";

          return (
            <div key={ann.id} className={cn(
              "rounded-xl border bg-card overflow-hidden transition-all",
              isUrgent && "border-destructive/25"
            )}>
              {/* Author header */}
              <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className={cn("text-xs font-bold", getAvatarColor(ann.author))}>
                    {getInitials(ann.author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{ann.author}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {ann.date}
                    </span>
                    <span className="text-muted-foreground/30">·</span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4 gap-1 border-border">
                      <Icon className={cn("w-2.5 h-2.5", config.color)} />
                      {config.label}
                    </Badge>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-3">
                <h3 className={cn("text-[15px] font-bold text-foreground mb-1.5", isUrgent && "text-destructive")}>
                  {ann.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {ann.content}
                </p>
              </div>

              {/* Actions bar */}
              <div className="flex items-center gap-1 px-3 py-2 border-t border-border/50">
                <button
                  onClick={(e) => toggleLike(ann.id, e)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    isLiked ? "text-destructive bg-destructive/8" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                  Útil
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Comentar
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-auto">
                  <Share2 className="w-4 h-4" />
                  Partilhar
                </button>
              </div>
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
