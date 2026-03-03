import { useState } from "react";
import { profAnnouncements, profDisciplines } from "@/data/professorData";
import { announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Megaphone, Search, Clock, Bell, Eye } from "lucide-react";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

export default function CoordinatorAnnouncements() {
  const [activeTab, setActiveTab] = useState<"disciplinas" | "institucionais">("disciplinas");
  const [filterDisc, setFilterDisc] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = profAnnouncements
    .filter(a => filterDisc === "all" || a.disciplineId === filterDisc)
    .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-secondary" /> Anúncios
          </h1>
          <p className="text-muted-foreground mt-1">Supervisão de comunicações do curso</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Eye className="w-3 h-3" /> Apenas leitura
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-border pb-0">
        {([
          { key: "disciplinas" as const, label: "Anúncios das Cadeiras", icon: Megaphone },
          { key: "institucionais" as const, label: "Anúncios Institucionais", icon: Bell },
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

      {activeTab === "disciplinas" && (
        <>
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

          {/* Announcement list */}
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
    </div>
  );
}
