import { useState } from "react";
import { announcements } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Megaphone, Search, Calendar, User, ArrowRight } from "lucide-react";

const typeConfig: Record<string, { label: string; color: string; bgLight: string }> = {
  urgente: { label: "Urgente", color: "text-destructive", bgLight: "bg-destructive/8 text-destructive border-destructive/20" },
  evento: { label: "Evento", color: "text-secondary", bgLight: "bg-secondary/10 text-secondary-foreground border-secondary/20" },
  academico: { label: "Académico", color: "text-primary", bgLight: "bg-primary/8 text-primary border-primary/20" },
  geral: { label: "Geral", color: "text-muted-foreground", bgLight: "bg-muted text-muted-foreground border-border" },
};

const allAnnouncements = [
  ...announcements,
  { id: "a5", title: "Manutenção do Portal Académico", content: "O portal académico estará indisponível no sábado, 17 de Fevereiro, entre as 08:00 e as 14:00 para manutenção programada. Pedimos que realizem todas as operações necessárias antes desse período.", type: "geral" as const, date: "14/02/2024", author: "Direcção de Informática" },
  { id: "a6", title: "Prazo de Entrega de Notas do 1º Semestre", content: "Relembramos que o prazo final para lançamento de notas do 1º semestre é dia 28 de Fevereiro. Todos os docentes devem submeter as pautas até essa data. O não cumprimento poderá resultar em atrasos na publicação dos resultados finais aos estudantes e respectivas famílias.", type: "academico" as const, date: "13/02/2024", author: "Direcção Académica" },
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
      <div className="space-y-3">
        {filtered.map((ann) => {
          const config = typeConfig[ann.type] || typeConfig.geral;
          const isLong = ann.content.length > 140;

          return (
            <div
              key={ann.id}
              className="rounded-lg border border-border bg-card p-5 hover:shadow-sm transition-all group"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <Badge variant="outline" className={`text-[11px] font-medium px-2 py-0.5 ${config.bgLight}`}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {ann.date}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> {ann.author}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-semibold text-foreground mb-1.5">{ann.title}</h3>

              {/* Content preview */}
              <p className={`text-sm text-muted-foreground leading-relaxed ${isLong ? "line-clamp-2" : ""}`}>
                {ann.content}
              </p>

              {/* Read more */}
              {isLong && (
                <button
                  onClick={() => setSelectedAnn(ann)}
                  className="mt-2.5 text-xs font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Ler mais <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhum anúncio encontrado.</p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg leading-snug pr-6">{selectedAnn?.title}</DialogTitle>
          </DialogHeader>
          {selectedAnn && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <Badge variant="outline" className={`text-[11px] font-medium ${typeConfig[selectedAnn.type]?.bgLight}`}>
                  {typeConfig[selectedAnn.type]?.label}
                </Badge>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {selectedAnn.author}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedAnn.date}</span>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-foreground leading-relaxed">{selectedAnn.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
