import { useState } from "react";
import { announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Megaphone, Search, Clock, ChevronDown, ChevronUp, User, Calendar, Tag } from "lucide-react";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive text-destructive-foreground", label: "Urgente" },
  evento: { bg: "bg-secondary text-secondary-foreground", label: "Evento" },
  academico: { bg: "bg-primary text-primary-foreground", label: "Académico" },
  geral: { bg: "bg-muted text-foreground", label: "Geral" },
};

const allAnnouncements = [
  ...announcements,
  { id: "a5", title: "Manutenção do Portal Académico", content: "O portal académico estará indisponível no sábado, 17 de Fevereiro, entre as 08:00 e as 14:00 para manutenção programada. Pedimos que realizem todas as operações necessárias antes desse período.", type: "geral" as const, date: "14/02/2024", author: "Direcção de Informática" },
  { id: "a6", title: "Prazo de Entrega de Notas do 1º Semestre", content: "Relembramos que o prazo final para lançamento de notas do 1º semestre é dia 28 de Fevereiro. Todos os docentes devem submeter as pautas até essa data.", type: "academico" as const, date: "13/02/2024", author: "Direcção Académica" },
];

export default function CoordenadorAnuncios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = allAnnouncements
    .filter(a => filterType === "all" || a.type === filterType)
    .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.author.toLowerCase().includes(searchTerm.toLowerCase()));

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

      {/* Announcements list */}
      <div className="space-y-3">
        {filtered.map((ann) => {
          const style = typeStyles[ann.type] || typeStyles.geral;
          const isExpanded = expandedId === ann.id;

          return (
            <Card
              key={ann.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedId(isExpanded ? null : ann.id)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge className={`${style.bg} shrink-0`}>{style.label}</Badge>
                    <h3 className="font-semibold text-foreground truncate">{ann.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ann.date}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {!isExpanded && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{ann.content}</p>
                )}

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <p className="text-sm text-foreground leading-relaxed">{ann.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> {ann.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {ann.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> {style.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum anúncio encontrado.</p>
        )}
      </div>
    </div>
  );
}
