import { useState } from "react";
import { announcements } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Megaphone, Search, Calendar, User, ChevronRight } from "lucide-react";

const typeStyles: Record<string, { dot: string; label: string }> = {
  urgente: { dot: "bg-destructive", label: "Urgente" },
  evento: { dot: "bg-secondary", label: "Evento" },
  academico: { dot: "bg-primary", label: "Académico" },
  geral: { dot: "bg-muted-foreground", label: "Geral" },
};

const allAnnouncements = [
  ...announcements,
  { id: "a5", title: "Manutenção do Portal Académico", content: "O portal académico estará indisponível no sábado, 17 de Fevereiro, entre as 08:00 e as 14:00 para manutenção programada. Pedimos que realizem todas as operações necessárias antes desse período.", type: "geral" as const, date: "14/02/2024", author: "Direcção de Informática" },
  { id: "a6", title: "Prazo de Entrega de Notas do 1º Semestre", content: "Relembramos que o prazo final para lançamento de notas do 1º semestre é dia 28 de Fevereiro. Todos os docentes devem submeter as pautas até essa data. O não cumprimento poderá resultar em atrasos na publicação dos resultados finais.", type: "academico" as const, date: "13/02/2024", author: "Direcção Académica" },
];

export default function CoordenadorAnuncios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAnn, setSelectedAnn] = useState<typeof allAnnouncements[0] | null>(null);

  const filtered = allAnnouncements
    .filter(a => filterType === "all" || a.type === filterType)
    .filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> Anúncios
        </h1>
        <p className="text-muted-foreground mt-1">Comunicações institucionais e avisos</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar anúncio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {[
            { key: "all", label: "Todos" },
            { key: "urgente", label: "Urgente" },
            { key: "academico", label: "Académico" },
            { key: "evento", label: "Evento" },
            { key: "geral", label: "Geral" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === f.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
        {filtered.map((ann) => {
          const style = typeStyles[ann.type] || typeStyles.geral;
          const isLong = ann.content.length > 120;

          return (
            <div
              key={ann.id}
              className="bg-card px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
              onClick={() => isLong ? setSelectedAnn(ann) : null}
            >
              <div className="flex items-start gap-4">
                {/* Left: dot + content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${style.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">{ann.title}</h3>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-normal">{style.label}</Badge>
                    </div>
                    <p className={`text-sm text-muted-foreground leading-relaxed ${isLong ? "line-clamp-2" : ""}`}>
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{ann.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ann.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: arrow if long */}
                {isLong && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center bg-card">Nenhum anúncio encontrado.</p>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg leading-snug">{selectedAnn?.title}</DialogTitle>
          </DialogHeader>
          {selectedAnn && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px] font-normal">{typeStyles[selectedAnn.type]?.label}</Badge>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedAnn.author}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedAnn.date}</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{selectedAnn.content}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
