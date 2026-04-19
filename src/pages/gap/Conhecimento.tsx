import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Library, Eye, Star, Plus, BookOpen } from "lucide-react";
import { gapArtigos, categoriaConfig, TicketCategoria } from "@/data/gapData";

export default function GapConhecimento() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<TicketCategoria | "all">("all");

  const filtered = useMemo(() => {
    return gapArtigos
      .filter(a => cat === "all" || a.categoria === cat)
      .filter(a => !search || a.titulo.toLowerCase().includes(search.toLowerCase()) || a.resumo.toLowerCase().includes(search.toLowerCase()));
  }, [search, cat]);

  const destacados = gapArtigos.filter(a => a.destaque);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Library className="w-6 h-6 text-purple-600" /> Base de Conhecimento
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Artigos e guias para o estudante e equipa
          </p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Artigo</Button>
      </div>

      {/* Destaques */}
      {destacados.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Em Destaque
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {destacados.map(a => (
              <Card key={a.id} className="p-5 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className={`text-[10px] ${categoriaConfig[a.categoria].color}`}>
                    {categoriaConfig[a.categoria].label}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {a.visualizacoes}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{a.titulo}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{a.resumo}</p>
                <p className="text-[10px] text-muted-foreground mt-2">Actualizado: {new Date(a.atualizado).toLocaleDateString("pt-AO")}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Pesquisar artigos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button variant={cat === "all" ? "default" : "outline"} size="sm" onClick={() => setCat("all")} className="h-9">Todas</Button>
          {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
            <Button
              key={c}
              variant={cat === c ? "default" : "outline"}
              size="sm"
              onClick={() => setCat(c)}
              className="h-9 text-xs"
            >
              {categoriaConfig[c].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">Nenhum artigo encontrado</p></Card>
        ) : (
          filtered.map(a => (
            <Card key={a.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{a.titulo}</p>
                    {a.destaque && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{a.resumo}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className={`text-[10px] ${categoriaConfig[a.categoria].color}`}>
                      {categoriaConfig[a.categoria].label}
                    </Badge>
                    <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" /> {a.visualizacoes} visualizações</span>
                    <span>Actualizado: {new Date(a.atualizado).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
