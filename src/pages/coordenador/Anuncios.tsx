import { useState } from "react";
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
  CalendarDays, Tag, Search, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAnuncios, formatAnuncioDate, formatAnuncioTime, type Anuncio } from "@/hooks/useAnuncios";

const typeConfig: Record<string, { icon: typeof AlertTriangle; label: string; className: string }> = {
  urgente: { icon: AlertTriangle, label: "Urgente", className: "bg-destructive/10 text-destructive border-destructive/20" },
  evento: { icon: CalendarDays, label: "Evento", className: "bg-secondary/10 text-secondary border-secondary/20" },
  academico: { icon: Tag, label: "Académico", className: "bg-primary/10 text-primary border-primary/20" },
  geral: { icon: Bell, label: "Geral", className: "bg-muted text-muted-foreground border-border" },
  financas: { icon: Wallet, label: "Finanças", className: "bg-accent/10 text-accent border-accent/20" },
};

export default function CoordenadorAnuncios() {
  const { items, loading, uid, create, remove } = useAnuncios();

  const [activeTab, setActiveTab] = useState<"institucionais" | "meus">("institucionais");
  const [selectedAnn, setSelectedAnn] = useState<Anuncio | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredAnnouncements = items
    .filter(a => filterType === "all" || a.type === filterType)
    .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.content.toLowerCase().includes(searchTerm.toLowerCase()));

  const unreadCount = items.filter(a => !readIds.has(a.id)).length;

  const myAnns = items.filter(a => a.owner_user_id === uid);

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState("academico");
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha o título e o conteúdo do anúncio.");
      return;
    }
    setBusy(true);
    try {
      await create({ title: newTitle, content: newContent, type: newType });
      setNewTitle("");
      setNewContent("");
      setNewType("academico");
      setShowCreate(false);
      toast.success("Anúncio publicado com sucesso.");
    } catch (e) {
      toast.error("Não foi possível publicar o anúncio.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja remover este anúncio?")) return;
    try {
      await remove(id);
      toast.success("Anúncio removido.");
    } catch {
      toast.error("Não foi possível remover o anúncio.");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            Quadro de Comunicações
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-[46px]">
            Acompanhe avisos, eventos e comunicados institucionais
          </p>
        </div>
        {activeTab === "meus" && (
          <Button onClick={() => setShowCreate(true)} className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Novo Anúncio
          </Button>
        )}
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
        <>
          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-1.5 border border-border/50">
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Pesquisar anúncios..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="h-5 w-px bg-border/60 shrink-0" />
            <div className="flex items-center gap-0.5 shrink-0">
              {[
                { key: "all", label: "Todos", icon: null },
                { key: "urgente", label: "Urgente", icon: AlertTriangle },
                { key: "academico", label: "Académico", icon: Tag },
                { key: "evento", label: "Evento", icon: CalendarDays },
                { key: "geral", label: "Geral", icon: Bell },
                { key: "financas", label: "Finanças", icon: Wallet },
              ].map(f => {
                const active = filterType === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilterType(f.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      active
                        ? "bg-background text-foreground shadow-sm border border-border/80"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                  >
                    {f.icon && <f.icon className={`w-3 h-3 ${active ? "text-primary" : ""}`} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
          {filteredAnnouncements.map((ann) => {
            const config = typeConfig[ann.type] || typeConfig.geral;
            const TypeIcon = config.icon;
            return (
              <Card
                key={ann.id}
                className={`p-0 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 group ${!readIds.has(ann.id) ? "border-primary/40 bg-primary/[0.02]" : "border-border/80"}`}
                onClick={() => {
                  setReadIds(prev => new Set(prev).add(ann.id));
                  setSelectedAnn(ann);
                }}
              >
                <div className="flex">
                  <div className={`w-1 shrink-0 ${ann.type === "urgente" ? "bg-destructive" : ann.type === "evento" ? "bg-secondary" : ann.type === "academico" ? "bg-primary" : "bg-muted-foreground/30"}`} />

                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge variant="outline" className={`gap-1.5 text-[11px] font-medium border ${config.className}`}>
                        <TypeIcon className="w-3 h-3" /> {config.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                        {!readIds.has(ann.id) && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <h3 className="text-[15px] font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{ann.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">{ann.content}</p>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {ann.author && (
                        <>
                          <Badge variant="outline" className="gap-1.5 text-[11px] font-medium text-foreground/70 border-border">
                            <User className="w-3 h-3 text-primary" /> {ann.author}
                          </Badge>
                          <span className="text-muted-foreground/30">·</span>
                        </>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />{formatAnuncioDate(ann.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{formatAnuncioTime(ann.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {!loading && filteredAnnouncements.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum anúncio encontrado.</p>
          )}
        </div>
        </>
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
                <p className="text-xs text-muted-foreground mb-4">Crie o seu primeiro anúncio para comunicar com a comunidade.</p>
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
                          <Eye className="w-3 h-3" /> Publicado
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
                        <Calendar className="w-3 h-3" />{formatAnuncioDate(ann.created_at)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />{formatAnuncioTime(ann.created_at)}
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

                <div className="px-6 pt-4 pb-3 flex items-center gap-3 flex-wrap border-b border-border">
                  {selectedAnn.author && (
                    <Badge variant="outline" className="gap-1.5 text-[11px] font-medium text-foreground/70 border-border">
                      <User className="w-3 h-3 text-primary" /> {selectedAnn.author}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> {formatAnuncioDate(selectedAnn.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {formatAnuncioTime(selectedAnn.created_at)}
                  </span>
                </div>

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
            <DialogDescription>Publique um comunicado para a comunidade da instituição.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ann-title">Título</Label>
              <Input id="ann-title" placeholder="Ex: Alteração de Horário" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
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
                  <SelectItem value="financas">Finanças</SelectItem>
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
            <Button onClick={handleCreate} disabled={busy} className="gap-2"><Send className="w-4 h-4" /> Publicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
