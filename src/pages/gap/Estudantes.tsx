import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Heart, AlertTriangle, Clock, CheckCircle, User, Calendar } from "lucide-react";
import { gapEstudantesSeguimento } from "@/data/gapData";

const riscoConfig = {
  alto: { label: "Risco Alto", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  medio: { label: "Risco Médio", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  baixo: { label: "Risco Baixo", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

export default function GapEstudantes() {
  const [filter, setFilter] = useState<"todos" | "alto" | "medio" | "baixo">("todos");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return gapEstudantesSeguimento
      .filter(e => filter === "todos" || e.risco === filter)
      .filter(e => {
        if (!search) return true;
        const s = search.toLowerCase();
        return e.nome.toLowerCase().includes(s) || e.matricula.includes(search) || e.curso.toLowerCase().includes(s);
      });
  }, [filter, search]);

  const counts = {
    todos: gapEstudantesSeguimento.length,
    alto: gapEstudantesSeguimento.filter(e => e.risco === "alto").length,
    medio: gapEstudantesSeguimento.filter(e => e.risco === "medio").length,
    baixo: gapEstudantesSeguimento.filter(e => e.risco === "baixo").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-600" /> Estudantes em Seguimento
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Estudantes com acompanhamento activo do GAP
        </p>
      </div>

      <Tabs value={filter} onValueChange={v => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="todos">Todos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.todos}</Badge></TabsTrigger>
          <TabsTrigger value="alto">Risco Alto <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.alto}</Badge></TabsTrigger>
          <TabsTrigger value="medio">Risco Médio <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.medio}</Badge></TabsTrigger>
          <TabsTrigger value="baixo">Risco Baixo <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.baixo}</Badge></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map(e => {
          const r = riscoConfig[e.risco];
          const Icon = r.icon;
          return (
            <Card key={e.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{e.nome}</p>
                    <Badge variant="outline" className={`text-[10px] gap-1 shrink-0 ${r.color}`}>
                      <Icon className="w-3 h-3" /> {r.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.matricula} · {e.curso} · {e.ano}º ano</p>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">{e.motivo}</Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5" /> {e.acompanhamentos} acompanh.
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" /> Últ.: {new Date(e.ultimoContacto).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Responsável: {e.responsavel}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">Nenhum estudante encontrado</p></Card>
      )}
    </div>
  );
}
