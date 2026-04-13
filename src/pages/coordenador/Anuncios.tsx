import { useState } from "react";
import { announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Megaphone, Calendar, Clock, ChevronRight, Plus,
  Building2, User, Bell, Send, Trash2, Eye, AlertTriangle,
  CalendarDays, Tag,
} from "lucide-react";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: typeof AlertTriangle; label: string; className: string }> = {
  urgente: { icon: AlertTriangle, label: "Urgente", className: "bg-destructive/10 text-destructive border-destructive/20" },
  evento: { icon: CalendarDays, label: "Evento", className: "bg-secondary/10 text-secondary border-secondary/20" },
  academico: { icon: Tag, label: "Académico", className: "bg-primary/10 text-primary border-primary/20" },
  geral: { icon: Bell, label: "Geral", className: "bg-muted text-muted-foreground border-border" },
};

interface MyAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  date: string;
  time: string;
  status: "publicado" | "rascunho";
}

const initialMyAnnouncements: MyAnnouncement[] = [
  {
    id: "m1",
    title: "Alteração de Horário — Cálculo II",
    content: "A aula de Cálculo II de quarta-feira será transferida para sexta-feira, das 10h às 12h, na Sala 204. Esta alteração é válida apenas para esta semana.",
    type: "academico",
    date: "12/02/2024",
    time: "09:30",
    status: "publicado",
  },
  {
    id: "m2",
    title: "Reunião de Coordenação — Docentes do 2.º Ano",
    content: "Convoca-se todos os docentes do 2.º ano para uma reunião de coordenação pedagógica. Ordem de trabalhos: avaliações intercalares e plano de recuperação.",
    type: "geral",
    date: "14/02/2024",
    time: "14:00",
    status: "publicado",
  },
  {
    id: "m3",
    title: "Entrega de Notas Parciais — Prazo Limite",
    content: "Recorda-se aos docentes que o prazo limite para lançamento das notas parciais do 1.º semestre é dia 20 de Fevereiro.",
    type: "urgente",
    date: "10/02/2024",
    time: "08:00",
    status: "publicado",
  },
];

export default function CoordenadorAnuncios() {
  const [activeTab, setActiveTab] = useState<"institucionais" | "meus">("institucionais");
  const [selectedAnn, setSelectedAnn] = useState<typeof announcements[0] | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  const [myAnns, setMyAnns] = useState<MyAnnouncement[]>(initialMyAnnouncements);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("academico");

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha o título e o conteúdo do anúncio.");
      return;
    }
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
    const ann: MyAnnouncement = {
      id: `m${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      date: dateStr,
      time: timeStr,
      status: "publicado",
    };
    setMyAnns(prev => [ann, ...prev]);
    setNewTitle("");
    setNewContent("");
    setNewType("academico");
    setShowCreate(false);
    toast.success("Anúncio publicado com sucesso.");
  };

  const handleDelete = (id: string) => {
    setMyAnns(prev => prev.filter(a => a.id !== id));
    toast.success("Anúncio removido.");
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Anúncios</h1>
            <p className="text-[13px] text-muted-foreground">
              {unreadCount > 0
                ? <span>{unreadCount} por ler · {announcements.length} total</span>
                : "Todas as comunicações lidas"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => setReadIds(new Set(announcements.map(a => a.id)))}
            >
              <Eye className="w-3.5 h-3.5" /> Marcar tudo como lido
            </Button>
          )}
          {activeTab === "meus" && (
            <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Novo Anúncio
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "institucionais" as const, label: "Todos os Anúncios", icon: Building2, count: unreadCount },
          { key: "meus" as const, label: "Meus Anúncios", icon: User, count: 0 },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
            {tab.count > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground px-1">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Todos os Anúncios */}
      {activeTab === "institucionais" && (
        <div className="space-y-2">
          {announcements.map((ann) => {
            const config = typeConfig[ann.type] || typeConfig.geral;
            const TypeIcon = config.icon;
            const isUnread = !readIds.has(ann.id);
            return (
              <Card
                key={ann.id}
                className={`p-0 overflow-hidden cursor-pointer transition-all duration-200 group border ${isUnread ? "border-primary/30 bg-primary/[0.02] shadow-sm" : "border-border/60 hover:border-border"}`}
                onClick={() => {
                  setReadIds(prev => new Set(prev).add(ann.id));
                  setSelectedAnn(ann);
                }}
              >
                <div className="flex items-center gap-4 px-4 py-3.5">
                  {/* Unread dot */}
                  <div className="w-2 shrink-0 flex justify-center">
                    {isUnread && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  </div>

                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                    ann.type === "urgente" ? "bg-destructive/10" : ann.type === "evento" ? "bg-secondary/10" : ann.type === "academico" ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <TypeIcon className={`w-4 h-4 ${
                      ann.type === "urgente" ? "text-destructive" : ann.type === "evento" ? "text-secondary" : ann.type === "academico" ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`text-sm truncate group-hover:text-primary transition-colors ${isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>{ann.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{ann.author} · {ann.date}</p>
                  </div>

                  {/* Badge + Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] font-medium border ${config.className} hidden sm:flex`}>
                      {config.label}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Meus Anúncios */}
      {activeTab === "meus" && (
        <div className="space-y-3">
          {myAnns.length === 0 && (
            <Card className="border-dashed border-2 border-border">
              <div className="text-center py-14">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Sem anúncios publicados</p>
                <p className="text-xs text-muted-foreground mb-4">Crie o seu primeiro anúncio para comunicar com estudantes e docentes.</p>
                <Button variant="outline" className="gap-2" onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4" /> Criar Primeiro Anúncio
                </Button>
              </div>
            </Card>
          )}
          {myAnns.map((ann) => {
            const config = typeConfig[ann.type] || typeConfig.geral;
            const TypeIcon = config.icon;
            return (
              <Card key={ann.id} className="p-0 overflow-hidden border-border/80">
                <div className="flex">
                  <div className={`w-1 shrink-0 ${ann.type === "urgente" ? "bg-destructive" : ann.type === "evento" ? "bg-secondary" : ann.type === "academico" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`gap-1.5 text-[11px] font-medium border ${config.className}`}>
                          <TypeIcon className="w-3 h-3" /> {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground border-border">
                          <Eye className="w-3 h-3" /> {ann.status === "publicado" ? "Publicado" : "Rascunho"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDelete(ann.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <h3 className="text-[15px] font-semibold text-foreground mb-1.5">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ann.content}</p>

                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />{ann.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{ann.time}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
          {selectedAnn && (() => {
            const config = typeConfig[selectedAnn.type] || typeConfig.geral;
            const TypeIcon = config.icon;
            const stripeColor = selectedAnn.type === "urgente" ? "from-destructive to-destructive/80" : selectedAnn.type === "evento" ? "from-secondary to-secondary/80" : selectedAnn.type === "academico" ? "from-primary to-primary/80" : "from-muted-foreground/40 to-muted-foreground/20";
            return (
              <>
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${stripeColor} px-6 pt-6 pb-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="gap-1.5 text-[11px] font-medium border border-white/30 bg-white/15 text-white backdrop-blur-sm">
                      <TypeIcon className="w-3 h-3" /> {config.label}
                    </Badge>
                  </div>
                  <DialogHeader className="space-y-0">
                    <DialogTitle className="text-lg font-bold text-white leading-snug">{selectedAnn.title}</DialogTitle>
                    <DialogDescription className="sr-only">Detalhes do anúncio</DialogDescription>
                  </DialogHeader>
                </div>

                {/* Meta info */}
                <div className="px-6 pt-4 pb-3 flex items-center gap-3 flex-wrap border-b border-border">
                  <Badge variant="outline" className="gap-1.5 text-[11px] font-medium text-foreground/70 border-border">
                    <User className="w-3 h-3 text-primary" /> {selectedAnn.author}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> {selectedAnn.date}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> 08:00
                  </span>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selectedAnn.content}</p>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="w-4 h-4 text-primary" />
              </div>
              Novo Anúncio
            </DialogTitle>
            <DialogDescription>Publique um comunicado para estudantes e docentes do curso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Título</Label>
              <Input id="ann-title" placeholder="Ex: Alteração de Horário — Cálculo II" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-type">Categoria</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academico">Académico</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ann-content">Conteúdo</Label>
              <Textarea id="ann-content" placeholder="Escreva o conteúdo do anúncio..." rows={4} value={newContent} onChange={e => setNewContent(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} className="gap-2"><Send className="w-4 h-4" /> Publicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
