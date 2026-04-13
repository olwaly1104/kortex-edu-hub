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
  Building2, User, Bell, Send, Trash2, Eye,
} from "lucide-react";
import { toast } from "sonner";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
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

  // My announcements state
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
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-secondary" /> Anúncios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Comunicações institucionais e do curso</p>
        </div>
        {activeTab === "meus" && (
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Anúncio
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "institucionais" as const, label: "Direcção Académica", icon: Building2 },
          { key: "meus" as const, label: "Meus Anúncios", icon: User },
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
          </button>
        ))}
      </div>

      {/* Direcção Académica */}
      {activeTab === "institucionais" && (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const style = typeStyles[ann.type] || typeStyles.geral;
            return (
              <Card
                key={ann.id}
                className="p-5 cursor-pointer hover:bg-muted/30 transition-colors group"
                onClick={() => setSelectedAnn(ann)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={style.bg}>{style.label}</Badge>
                    <span className="text-xs text-muted-foreground font-medium">{ann.author}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ann.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />08:00</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{ann.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ann.content}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Meus Anúncios */}
      {activeTab === "meus" && (
        <div className="space-y-3">
          {myAnns.length === 0 && (
            <div className="text-center py-12">
              <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Ainda não publicou nenhum anúncio.</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setShowCreate(true)}>
                <Plus className="w-4 h-4" /> Criar Primeiro Anúncio
              </Button>
            </div>
          )}
          {myAnns.map((ann) => {
            const style = typeStyles[ann.type] || typeStyles.geral;
            return (
              <Card key={ann.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={style.bg}>{style.label}</Badge>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Eye className="w-3 h-3" /> {ann.status === "publicado" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ann.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ann.time}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(ann.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{ann.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Dialog for Direcção Académica */}
      <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedAnn && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={(typeStyles[selectedAnn.type] || typeStyles.geral).bg}>
                    {(typeStyles[selectedAnn.type] || typeStyles.geral).label}
                  </Badge>
                </div>
                <DialogTitle className="text-lg">{selectedAnn.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 pt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{selectedAnn.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />08:00</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{selectedAnn.author}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="py-2">
                <p className="text-sm text-foreground leading-relaxed">{selectedAnn.content}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Novo Anúncio
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
