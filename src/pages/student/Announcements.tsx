import { useState, useMemo } from "react";
import { announcements } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Search, Pin, Clock, User, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig: Record<string, { label: string; dot: string; badge: string }> = {
  urgente: { label: "Urgente", dot: "bg-destructive", badge: "bg-destructive/10 text-destructive border-destructive/20" },
  evento: { label: "Evento", dot: "bg-secondary", badge: "bg-secondary/10 text-secondary border-secondary/20" },
  academico: { label: "Académico", dot: "bg-primary", badge: "bg-primary/10 text-primary border-primary/20" },
  geral: { label: "Geral", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-border" },
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

  const filtered = useMemo(() => {
    return announcements
      .filter(a => activeFilter === "todos" || a.type === activeFilter)
      .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
  }, [activeFilter, search]);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anúncios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {announcements.length} anúncios publicados
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
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

      {/* Table */}
      <Card className="overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">Anúncio</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-2.5 font-medium hidden lg:table-cell">Autor</th>
                <th className="text-left px-4 py-2.5 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length > 0 ? filtered.map(ann => {
                const config = typeConfig[ann.type] || typeConfig.geral;
                return (
                  <tr key={ann.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", config.dot)} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-foreground truncate">{ann.title}</p>
                            {ann.type === "urgente" && <Pin className="w-3 h-3 text-destructive shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{ann.content}</p>
                          <Badge variant="outline" className={cn("text-[10px] mt-1.5 md:hidden", config.badge)}>
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <Badge variant="outline" className={cn("text-[10px]", config.badge)}>
                        {config.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{ann.author}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {ann.date}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    Nenhum anúncio encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
