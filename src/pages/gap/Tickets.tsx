import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, HelpCircle, ChevronRight, User, Send, Filter, Tag,
} from "lucide-react";
import {
  gapTickets, GapTicket, ticketStatusConfig, prioridadeConfig, categoriaConfig,
  TicketStatus, TicketCategoria,
} from "@/data/gapData";

export default function GapTickets() {
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<TicketStatus | "all">("all");
  const [categoria, setCategoria] = useState<TicketCategoria | "all">("all");
  const [selected, setSelected] = useState<GapTicket | null>(null);

  const filtered = useMemo(() => {
    return gapTickets.filter(t => {
      if (estado !== "all" && t.estado !== estado) return false;
      if (categoria !== "all" && t.categoria !== categoria) return false;
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
  }, [search, estado, categoria]);

  const counts: Record<TicketStatus | "all", number> = {
    all: gapTickets.length,
    aberto: gapTickets.filter(t => t.estado === "aberto").length,
    em_andamento: gapTickets.filter(t => t.estado === "em_andamento").length,
    aguarda_estudante: gapTickets.filter(t => t.estado === "aguarda_estudante").length,
    resolvido: gapTickets.filter(t => t.estado === "resolvido").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
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

      {/* Tabs por estado */}
      <Tabs value={estado} onValueChange={v => setEstado(v as TicketStatus | "all")}>
        <TabsList>
          <TabsTrigger value="all">Todos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.all}</Badge></TabsTrigger>
          <TabsTrigger value="aberto">Abertos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.aberto}</Badge></TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.em_andamento}</Badge></TabsTrigger>
          <TabsTrigger value="aguarda_estudante">Aguarda <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.aguarda_estudante}</Badge></TabsTrigger>
          <TabsTrigger value="resolvido">Resolvidos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.resolvido}</Badge></TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por estudante, assunto, matrícula..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={categoria} onValueChange={v => setCategoria(v as TicketCategoria | "all")}>
          <SelectTrigger className="w-48 h-9">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {(Object.keys(categoriaConfig) as TicketCategoria[]).map(c => (
              <SelectItem key={c} value={c}>{categoriaConfig[c].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma solicitação encontrada</p>
          </Card>
        ) : (
          filtered.map(t => {
            const st = ticketStatusConfig[t.estado];
            const pr = prioridadeConfig[t.prioridade];
            const cat = categoriaConfig[t.categoria];
            return (
              <Card
                key={t.id}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelected(t)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                      <p className="text-sm font-semibold text-foreground truncate">{t.assunto}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{t.estudante} · {t.curso}</span>
                      <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                      {t.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] gap-1">
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${pr.color}`}>{pr.label}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(t.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail dialog with conversation */}
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

                {/* Conversa */}
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
