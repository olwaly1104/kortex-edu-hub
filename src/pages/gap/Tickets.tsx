import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, HelpCircle, User, Send, X, Calendar as CalendarIcon,
  Inbox, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  gapTickets, GapTicket, ticketStatusConfig, prioridadeConfig, categoriaConfig,
  TicketStatus, TicketCategoria,
} from "@/data/gapData";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function GapTickets() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<TicketStatus | "todos">("todos");
  const [categoria, setCategoria] = useState<TicketCategoria | "todas">("todas");
  const [mes, setMes] = useState<string>("todos");
  const [selected, setSelected] = useState<GapTicket | null>(null);

  const counts = useMemo(() => ({
    todos: gapTickets.length,
    aberto: gapTickets.filter(t => t.estado === "aberto").length,
    em_andamento: gapTickets.filter(t => t.estado === "em_andamento").length,
    aguarda_estudante: gapTickets.filter(t => t.estado === "aguarda_estudante").length,
    resolvido: gapTickets.filter(t => t.estado === "resolvido").length,
  }), []);

  const filtered = useMemo(() => {
    return gapTickets.filter(t => {
      if (estado !== "todos" && t.estado !== estado) return false;
      if (categoria !== "todas" && t.categoria !== categoria) return false;
      if (mes !== "todos") {
        const m = new Date(t.data).getMonth();
        if (m !== parseInt(mes)) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return (
          t.estudante.toLowerCase().includes(s) ||
          t.assunto.toLowerCase().includes(s) ||
          t.matricula.includes(search) ||
          t.id.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [search, estado, categoria, mes]);

  const isCategoriaActive = categoria !== "todas";
  const isMesActive = mes !== "todos";
  const isSearchActive = search !== "";
  const isEstadoActive = estado !== "todos";
  const hasActiveControls = isCategoriaActive || isMesActive || isSearchActive || isEstadoActive;

  const resetAll = () => {
    setEstado("todos"); setCategoria("todas"); setMes("todos"); setSearch("");
  };

  const estadoTabs: { key: TicketStatus | "todos"; label: string; icon: React.ElementType }[] = [
    { key: "todos", label: "Todos", icon: Inbox },
    { key: "aberto", label: "Abertos", icon: AlertCircle },
    { key: "em_andamento", label: "Em Andamento", icon: Clock },
    { key: "aguarda_estudante", label: "Aguarda Estudante", icon: Clock },
    { key: "resolvido", label: "Resolvidos", icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" /> Solicitações
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão de pedidos de apoio dos estudantes
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Nova Solicitação</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label>Estudante</Label>
                <Input placeholder="Nome ou matrícula" />
              </div>
              <div className="space-y-2">
                <Label>Assunto</Label>
                <Input placeholder="Resumo do pedido" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                        <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea placeholder="Detalhes do pedido..." className="resize-none" rows={4} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <DialogClose asChild><Button>Criar Solicitação</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Inbox className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{counts.todos}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-orange-700" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Abertos</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{counts.aberto}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Clock className="w-4 h-4 text-blue-700" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{counts.em_andamento}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-700" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Resolvidos</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{counts.resolvido}</p>
        </Card>
      </div>

      {/* Control box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Estado tabs (top row) */}
        <div className="flex flex-wrap gap-2">
          {estadoTabs.map(t => (
            <Button
              key={t.key}
              size="sm"
              variant={estado === t.key ? "default" : "outline"}
              onClick={() => setEstado(t.key)}
              className="text-xs gap-1.5"
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              <Badge variant="outline" className={cn("ml-1 text-[10px] h-4 px-1.5", estado === t.key && "bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground")}>
                {counts[t.key]}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Search + month + category + reset */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por estudante, assunto, matrícula..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1" />

          <Select value={mes} onValueChange={setMes}>
            <SelectTrigger className={cn("w-40 h-9 text-xs", isMesActive && "border-primary/50 bg-primary/5 text-primary")}>
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os meses</SelectItem>
              {MESES.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={categoria} onValueChange={v => setCategoria(v as TicketCategoria | "todas")}>
            <SelectTrigger className={cn("w-44 h-9 text-xs", isCategoriaActive && "border-primary/50 bg-primary/5 text-primary")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as áreas</SelectItem>
              {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
                <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1" onClick={resetAll}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}
        </div>

        {hasActiveControls && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isEstadoActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setEstado("todos")}>
                Estado: {ticketStatusConfig[estado as TicketStatus].label} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isCategoriaActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setCategoria("todas")}>
                Área: {categoriaConfig[categoria as TicketCategoria].label} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isMesActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5 text-primary border-primary/20 cursor-pointer hover:bg-primary/10" onClick={() => setMes("todos")}>
                Mês: {MESES[parseInt(mes)]} <X className="w-2.5 h-2.5" />
              </Badge>
            )}
            {isSearchActive && (
              <Badge variant="outline" className="text-[10px] gap-1 bg-secondary/10 text-secondary border-secondary/20 cursor-pointer hover:bg-secondary/15" onClick={() => setSearch("")}>
                Pesquisa: "{search}" <X className="w-2.5 h-2.5" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Estudante</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Assunto</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Área</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Prioridade</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Data</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const st = ticketStatusConfig[t.estado];
              const pr = prioridadeConfig[t.prioridade];
              const cat = categoriaConfig[t.categoria];
              return (
                <tr
                  key={t.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setSelected(t)}
                >
                  <td className="p-3"><span className="text-[11px] font-mono text-muted-foreground">{t.id}</span></td>
                  <td className="p-3">
                    <p className="font-medium text-foreground">{t.estudante}</p>
                    <p className="text-[11px] text-muted-foreground">{t.matricula} · {t.curso}</p>
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="text-foreground truncate">{t.assunto}</p>
                  </td>
                  <td className="p-3"><Badge variant="outline" className={cn("text-[10px]", cat.color)}>{cat.label}</Badge></td>
                  <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", pr.color)}>{pr.label}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{t.responsavel || "—"}</td>
                  <td className="p-3 text-center text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(t.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="p-3 text-center"><Badge variant="outline" className={cn("text-[10px]", st.color)}>{st.label}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma solicitação encontrada.</p>}
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (() => {
            const st = ticketStatusConfig[selected.estado];
            const pr = prioridadeConfig[selected.prioridade];
            const cat = categoriaConfig[selected.categoria];
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{selected.id}</span>
                  </div>
                  <DialogTitle className="text-lg">{selected.assunto}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <Badge variant="outline" className={`text-xs ${st.color}`}>{st.label}</Badge>
                  <Badge variant="outline" className={`text-xs ${pr.color}`}>Prioridade: {pr.label}</Badge>
                  <Badge variant="outline" className={`text-xs ${cat.color}`}>{cat.label}</Badge>
                  {selected.responsavel && (
                    <Badge variant="outline" className="text-xs">Responsável: {selected.responsavel}</Badge>
                  )}
                </div>

                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{selected.estudante}</span>
                    <span className="text-xs text-muted-foreground">· {selected.matricula}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selected.curso} · {selected.ano}º ano</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">Conversa</Label>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {(selected.mensagens && selected.mensagens.length > 0
                      ? selected.mensagens
                      : [{ autor: selected.estudante, isStaff: false, data: selected.data, texto: selected.descricao }]
                    ).map((m, i) => (
                      <div key={i} className={`flex ${m.isStaff ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${m.isStaff ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold">{m.autor}</span>
                            <span className={`text-[10px] ${m.isStaff ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {m.data}
                            </span>
                          </div>
                          <p className="text-xs">{m.texto}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Responder</Label>
                  <Textarea placeholder="Escreva uma resposta..." className="resize-none" rows={3} />
                </div>

                <DialogFooter className="gap-2">
                  <Select defaultValue={selected.estado}>
                    <SelectTrigger className="w-44 h-9 mr-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ticketStatusConfig) as TicketStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{ticketStatusConfig[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Fechar</Button>
                  <Button size="sm" className="gap-1.5"><Send className="w-3.5 h-3.5" /> Enviar Resposta</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
