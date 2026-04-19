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
import { gapEstudantesSeguimento, categoriaConfig, gapTickets, gapAtendimentos, type TicketCategoria } from "@/data/gapData";

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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total em Seguimento", value: counts.todos, color: "text-primary bg-primary/10", icon: Heart },
          { label: "Risco Alto", value: counts.alto, color: "text-destructive bg-destructive/10", icon: AlertTriangle },
          { label: "Risco Médio", value: counts.medio, color: "text-amber-600 bg-amber-100", icon: Clock },
          { label: "Risco Baixo", value: counts.baixo, color: "text-emerald-600 bg-emerald-100", icon: CheckCircle },
        ].map(s => (
          <Card key={s.label} className="p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls — 2 lines */}
      <Card className="p-4 space-y-3">
        <Tabs value={filter} onValueChange={v => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="todos">Todos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.todos}</Badge></TabsTrigger>
            <TabsTrigger value="alto">Risco Alto <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.alto}</Badge></TabsTrigger>
            <TabsTrigger value="medio">Risco Médio <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.medio}</Badge></TabsTrigger>
            <TabsTrigger value="baixo">Risco Baixo <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.baixo}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar nome, matrícula ou curso..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={categoria} onValueChange={v => setCategoria(v as typeof categoria)}>
            <SelectTrigger className="h-9 w-[180px]"><Filter className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {(Object.keys(categoriaConfig) as TicketCategoria[]).map(k => (
                <SelectItem key={k} value={k}>{categoriaConfig[k].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={responsavel} onValueChange={setResponsavel}>
            <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              {responsaveis.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Estudante</TableHead>
              <TableHead>Curso</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-center">Solicitações</TableHead>
              <TableHead className="text-center">Acompanh.</TableHead>
              <TableHead>Próx. Agend.</TableHead>
              <TableHead>Responsável</TableHead>
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
