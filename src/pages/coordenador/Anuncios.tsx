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
import { Megaphone, Search, Calendar, User, Tag, FileText } from "lucide-react";

const typeStyles: Record<string, { bg: string; label: string }> = {
  urgente: { bg: "bg-destructive/10 text-destructive border-destructive/20", label: "Urgente" },
  evento: { bg: "bg-secondary/10 text-secondary-foreground border-secondary/20", label: "Evento" },
  academico: { bg: "bg-primary/10 text-primary border-primary/20", label: "Académico" },
  geral: { bg: "bg-muted text-muted-foreground border-border", label: "Geral" },
};

const allAnnouncements = [
  ...announcements,
  { id: "a5", title: "Manutenção do Portal Académico", content: "O portal académico estará indisponível no sábado, 17 de Fevereiro, entre as 08:00 e as 14:00 para manutenção programada. Pedimos que realizem todas as operações necessárias antes desse período.", type: "geral" as const, date: "14/02/2024", author: "Direcção de Informática" },
  { id: "a6", title: "Prazo de Entrega de Notas do 1º Semestre", content: "Relembramos que o prazo final para lançamento de notas do 1º semestre é dia 28 de Fevereiro. Todos os docentes devem submeter as pautas até essa data.", type: "academico" as const, date: "13/02/2024", author: "Direcção Académica" },
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

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Título</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Categoria</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Emitido por</th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Data</th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ann, idx) => {
              const style = typeStyles[ann.type] || typeStyles.geral;
              return (
                <tr
                  key={ann.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-card" : "bg-card/50"}`}
                  onClick={() => setSelectedAnn(ann)}
                >
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-foreground">{ann.title}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="outline" className={`text-[11px] ${style.bg}`}>{style.label}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-muted-foreground">{ann.author}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-muted-foreground">{ann.date}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button variant="ghost" size="sm" className="text-xs text-primary h-7">
                      Ver detalhes
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum anúncio encontrado.</p>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAnn} onOpenChange={() => setSelectedAnn(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">{selectedAnn?.title}</DialogTitle>
          </DialogHeader>
          {selectedAnn && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" /> Categoria</p>
                  <Badge variant="outline" className={typeStyles[selectedAnn.type]?.bg}>
                    {typeStyles[selectedAnn.type]?.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3" /> Emitido por</p>
                  <p className="font-medium text-foreground">{selectedAnn.author}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</p>
                  <p className="font-medium text-foreground">{selectedAnn.date}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4 space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"><FileText className="w-3 h-3" /> Conteúdo</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedAnn.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
