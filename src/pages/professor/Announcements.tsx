import { useState } from "react";
import { profAnnouncements, profDisciplines } from "@/data/professorData";
const announcements: any[] = [];
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Plus, CheckCircle, Edit, Search, Clock, Send, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function ProfessorAnnouncements() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"institucionais" | "meus">("institucionais");
  const [showForm, setShowForm] = useState(false);
  const [filterDisc, setFilterDisc] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formDisc, setFormDisc] = useState(profDisciplines[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<"rascunho" | "publicado">("publicado");

  const filtered = profAnnouncements
    .filter(a => filterDisc === "all" || a.disciplineId === filterDisc)
    .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = () => {
    if (!formTitle || !formContent) {
      toast({ title: "Campos obrigatórios", description: "Preencha o título e o conteúdo.", variant: "destructive" });
      return;
    }
    toast({ title: "Anúncio criado!", description: `"${formTitle}" foi ${formStatus === "publicado" ? "publicado" : "guardado como rascunho"}.` });
    setShowForm(false);
    setFormTitle("");
    setFormContent("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-secondary" /> Anúncios
          </h1>
          <p className="text-muted-foreground mt-1">Comunicações institucionais e os seus anúncios</p>
        </div>
        {activeTab === "meus" && (
          <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" /> {showForm ? "Cancelar" : "Novo Anúncio"}
          </Button>
        )}
      </div>

      {/* Tabs - institutional first */}
      <div className="flex gap-1.5 border-b border-border pb-0">
        {([
          { key: "institucionais" as const, label: "Anúncios Institucionais", icon: Bell },
          { key: "meus" as const, label: "Os Meus Anúncios", icon: Megaphone },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
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

      {activeTab === "institucionais" && (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const style = typeStyles[ann.type] || typeStyles.geral;
            return (
              <Card key={ann.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge className={style.bg}>{style.label}</Badge>
                  <span className="text-xs text-muted-foreground shrink-0">{ann.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{ann.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
                <p className="text-xs text-muted-foreground mt-3">— {ann.author}</p>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "meus" && (
        <>
          {showForm && (
            <Card className="p-6 border-2 border-primary/20 space-y-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" /> Novo Anúncio
              </h2>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadeira *</label>
                <select value={formDisc} onChange={e => setFormDisc(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {profDisciplines.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Título *</label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ex: Alteração de sala para próxima aula" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Conteúdo *</label>
                <textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Escreva o conteúdo do anúncio..." className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</label>
                <div className="flex gap-2">
                  {([
                    { value: "publicado" as const, label: "Publicar Agora", icon: Send },
                    { value: "rascunho" as const, label: "Guardar Rascunho", icon: Edit },
                  ]).map(s => (
                    <button key={s.value} onClick={() => setFormStatus(s.value)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${formStatus === s.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      <s.icon className="w-3.5 h-3.5" /> {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button onClick={handleSubmit} className="gap-2">
                  {formStatus === "publicado" ? <Send className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {formStatus === "publicado" ? "Publicar" : "Guardar"}
                </Button>
              </div>
            </Card>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Pesquisar anúncio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setFilterDisc("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDisc === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>Todas</button>
              {profDisciplines.map(d => (
                <button key={d.id} onClick={() => setFilterDisc(d.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterDisc === d.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{d.code}</button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 text-accent"><CheckCircle className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-foreground">{profAnnouncements.filter(a => a.status === "publicado").length}</p><p className="text-xs text-muted-foreground">Publicados</p></div>
            </Card>
            <Card className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"><Edit className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold text-foreground">{profAnnouncements.filter(a => a.status === "rascunho").length}</p><p className="text-xs text-muted-foreground">Rascunhos</p></div>
            </Card>
          </div>

          {/* My announcements list */}
          <div className="space-y-3">
            {filtered.map(ann => {
              const disc = profDisciplines.find(d => d.id === ann.disciplineId);
              return (
                <Card key={ann.id} className="p-5 border-l-[3px]" style={{ borderLeftColor: disc?.color }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{ann.title}</p>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: (disc?.color || "") + "40", color: disc?.color }}>{disc?.code}</Badge>
                    </div>
                    <Badge className={ann.status === "publicado" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}>
                      {ann.status === "publicado" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /><span>{ann.date}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span>{disc?.turmas.map(t => t.name).join(", ")}</span>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Nenhum anúncio encontrado.</p>}
          </div>
        </>
      )}
    </div>
  );
}
