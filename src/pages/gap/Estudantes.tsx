import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Heart, AlertTriangle, Clock, CheckCircle, Filter, ChevronRight } from "lucide-react";
import { gapEstudantesSeguimento, ticketCategoriaConfig as categoriaConfig, gapTickets, gapAtendimentos, type TicketCategoria } from "@/data/gapData";

const riscoConfig = {
  alto: { label: "Risco Alto", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  medio: { label: "Risco Médio", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  baixo: { label: "Risco Baixo", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

export default function GapEstudantes() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"todos" | "alto" | "medio" | "baixo">("todos");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<"todas" | TicketCategoria>("todas");
  const [responsavel, setResponsavel] = useState<string>("todos");

  const responsaveis = useMemo(
    () => Array.from(new Set(gapEstudantesSeguimento.map(e => e.responsavel))),
    []
  );

  const enriched = useMemo(() => {
    return gapEstudantesSeguimento.map(e => {
      const tickets = gapTickets.filter(t => t.matricula === e.matricula);
      const ats = gapAtendimentos.filter(a => a.matricula === e.matricula);
      const abertos = tickets.filter(t => t.estado === "aberto" || t.estado === "em_andamento").length;
      const proxAg = ats.find(a => a.estado === "agendado");
      const cat = (tickets[0]?.categoria || ats[0]?.categoria || "academico") as TicketCategoria;
      return { ...e, tickets: tickets.length, abertos, proxAg, categoria: cat };
    });
  }, []);

  const filtered = useMemo(() => {
    return enriched
      .filter(e => filter === "todos" || e.risco === filter)
      .filter(e => categoria === "todas" || e.categoria === categoria)
      .filter(e => responsavel === "todos" || e.responsavel === responsavel)
      .filter(e => {
        if (!search) return true;
        const s = search.toLowerCase();
        return e.nome.toLowerCase().includes(s) || e.matricula.includes(search) || e.curso.toLowerCase().includes(s);
      });
  }, [enriched, filter, categoria, responsavel, search]);

  const counts = {
    todos: enriched.length,
    alto: enriched.filter(e => e.risco === "alto").length,
    medio: enriched.filter(e => e.risco === "medio").length,
    baixo: enriched.filter(e => e.risco === "baixo").length,
  };

  const isFiltered = filter !== "todos" || categoria !== "todas" || responsavel !== "todos" || search !== "";
  const resetAll = () => { setFilter("todos"); setCategoria("todas"); setResponsavel("todos"); setSearch(""); };

  const tabs: { key: typeof filter; label: string; count: number; icon: typeof Heart }[] = [
    { key: "todos", label: "Todos", count: counts.todos, icon: Heart },
    { key: "alto",  label: "Risco Alto", count: counts.alto, icon: AlertTriangle },
    { key: "medio", label: "Risco Médio", count: counts.medio, icon: Clock },
    { key: "baixo", label: "Risco Baixo", count: counts.baixo, icon: CheckCircle },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Estudantes em Seguimento</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Estudantes sob acompanhamento activo do GAP — psicológico, vocacional, social e académico.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span> de {counts.todos} estudantes
        </div>
      </div>

      {/* KPIs — clean compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.todos, icon: Heart, iconBg: "bg-pink-50 text-pink-600" },
          { label: "Risco Alto", value: counts.alto, icon: AlertTriangle, iconBg: "bg-destructive/10 text-destructive" },
          { label: "Risco Médio", value: counts.medio, icon: Clock, iconBg: "bg-amber-50 text-amber-600" },
          { label: "Risco Baixo", value: counts.baixo, icon: CheckCircle, iconBg: "bg-emerald-50 text-emerald-600" },
        ].map(s => (
          <Card key={s.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Control box — unified */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap gap-1 p-2 bg-muted/30 border-b border-border">
          {tabs.map(t => {
            const active = filter === t.key;
            return (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all ${
                  active ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={`ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[10px] font-semibold tabular-nums ${
                  active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>{t.count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar nome, matrícula ou curso..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex-1" />
          <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
            <SelectTrigger className={`h-9 w-[180px] text-xs ${categoria !== "todas" ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
              <Filter className="w-3.5 h-3.5 mr-1.5 shrink-0" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {(Object.keys(categoriaConfig) as TicketCategoria[]).map(k => (
                <SelectItem key={k} value={k}>{categoriaConfig[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={responsavel} onValueChange={setResponsavel}>
            <SelectTrigger className={`h-9 w-[200px] text-xs ${responsavel !== "todos" ? "border-primary/50 bg-primary/5 text-primary" : ""}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              {responsaveis.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          {isFiltered && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground hover:text-destructive" onClick={resetAll}>Limpar</Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Estudante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Solicitações</TableHead>
              <TableHead className="text-center">Agendamentos</TableHead>
              <TableHead>Risco</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => {
              const r = riscoConfig[e.risco];
              const Icon = r.icon;
              const cat = categoriaConfig[e.categoria];
              return (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => navigate(`/gap/estudantes/${e.matricula}`)}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{e.nome}</p>
                        <p className="text-[11px] text-muted-foreground">{e.matricula}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">{e.curso}</p>
                      <p className="text-[11px] text-muted-foreground">{e.ano}º ano</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm font-semibold text-foreground">{e.tickets}</div>
                      {e.abertos > 0 && <div className="text-[10px] text-orange-600">{e.abertos} aberta{e.abertos > 1 ? "s" : ""}</div>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-semibold text-foreground">{e.acompanhamentos}</span>
                    </TableCell>
                    <TableCell>
                      {e.proxAg ? (
                        <div>
                          <p className="text-xs font-medium text-foreground">{new Date(e.proxAg.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })} · {e.proxAg.hora}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{e.proxAg.motivo}</p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-foreground">{e.responsavel}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${r.color}`}>
                        <Icon className="w-3 h-3" /> {r.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="p-8 text-center"><p className="text-sm text-muted-foreground">Nenhum estudante encontrado</p></div>
        )}
      </Card>
    </div>
  );
}
