import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, MessageSquare, Calendar, Clock, User,
  CheckCircle, AlertCircle, Clock3, ChevronRight, Filter,
} from "lucide-react";

type TicketStatus = "aberto" | "em_andamento" | "resolvido";
type TicketPriority = "alta" | "media" | "baixa";

interface Ticket {
  id: string;
  estudante: string;
  matricula: string;
  curso: string;
  assunto: string;
  categoria: string;
  descricao: string;
  estado: TicketStatus;
  prioridade: TicketPriority;
  data: string;
  ultimaResposta?: string;
}

interface Atendimento {
  id: string;
  estudante: string;
  matricula: string;
  motivo: string;
  data: string;
  hora: string;
  tipo: "presencial" | "online";
  estado: "agendado" | "concluido" | "cancelado";
}

const tickets: Ticket[] = [
  { id: "T001", estudante: "Ana Luísa Ferreira", matricula: "2024001", curso: "Eng. Informática", assunto: "Pedido de declaração de matrícula", categoria: "Documentação", descricao: "Preciso de uma declaração para apresentar no banco.", estado: "aberto", prioridade: "media", data: "2025-01-13" },
  { id: "T002", estudante: "Carlos Mendes", matricula: "2024015", curso: "Direito", assunto: "Erro na pauta de notas", categoria: "Notas", descricao: "A minha nota de Direito Civil II está incorrecta.", estado: "em_andamento", prioridade: "alta", data: "2025-01-12", ultimaResposta: "2025-01-13" },
  { id: "T003", estudante: "Maria João Santos", matricula: "2023042", curso: "Medicina", assunto: "Transferência de curso", categoria: "Transferência", descricao: "Gostaria de solicitar transferência para Enfermagem.", estado: "aberto", prioridade: "alta", data: "2025-01-11" },
  { id: "T004", estudante: "Pedro Almeida", matricula: "2024033", curso: "Economia", assunto: "Dúvida sobre propinas", categoria: "Finanças", descricao: "Preciso de esclarecimento sobre o valor das propinas do 2º semestre.", estado: "em_andamento", prioridade: "media", data: "2025-01-10", ultimaResposta: "2025-01-12" },
  { id: "T005", estudante: "Sofia Bernardo", matricula: "2023018", curso: "Eng. Civil", assunto: "Certificado de conclusão", categoria: "Documentação", descricao: "Solicito o certificado de conclusão do 1º ano.", estado: "resolvido", prioridade: "baixa", data: "2025-01-08", ultimaResposta: "2025-01-10" },
  { id: "T006", estudante: "João Baptista", matricula: "2024050", curso: "Gestão", assunto: "Horário de aulas incompatível", categoria: "Horários", descricao: "Tenho sobreposição de horários em duas cadeiras obrigatórias.", estado: "aberto", prioridade: "alta", data: "2025-01-13" },
];

const atendimentos: Atendimento[] = [
  { id: "A001", estudante: "Carlos Mendes", matricula: "2024015", motivo: "Revisão de nota", data: "2025-01-14", hora: "09:00", tipo: "presencial", estado: "agendado" },
  { id: "A002", estudante: "Maria João Santos", matricula: "2023042", motivo: "Orientação sobre transferência", data: "2025-01-14", hora: "10:30", tipo: "presencial", estado: "agendado" },
  { id: "A003", estudante: "Ana Luísa Ferreira", matricula: "2024001", motivo: "Entrega de documento", data: "2025-01-14", hora: "14:00", tipo: "online", estado: "agendado" },
  { id: "A004", estudante: "Pedro Almeida", matricula: "2024033", motivo: "Esclarecimento financeiro", data: "2025-01-15", hora: "11:00", tipo: "presencial", estado: "agendado" },
  { id: "A005", estudante: "Sofia Bernardo", matricula: "2023018", motivo: "Levantamento de certificado", data: "2025-01-10", hora: "09:30", tipo: "presencial", estado: "concluido" },
];

const statusConfig: Record<TicketStatus, { label: string; icon: React.ElementType; className: string }> = {
  aberto: { label: "Aberto", icon: AlertCircle, className: "bg-orange-100 text-orange-700 border-orange-200" },
  em_andamento: { label: "Em Andamento", icon: Clock3, className: "bg-blue-100 text-blue-700 border-blue-200" },
  resolvido: { label: "Resolvido", icon: CheckCircle, className: "bg-green-100 text-green-700 border-green-200" },
};

const prioridadeConfig: Record<TicketPriority, { label: string; className: string }> = {
  alta: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  media: { label: "Média", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  baixa: { label: "Baixa", className: "bg-muted text-muted-foreground border-border" },
};

const atendimentoEstadoConfig: Record<string, { label: string; className: string }> = {
  agendado: { label: "Agendado", className: "bg-blue-100 text-blue-700" },
  concluido: { label: "Concluído", className: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

export default function ApoioEstudante() {
  const [activeTab, setActiveTab] = useState("solicitacoes");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const abertos = tickets.filter(t => t.estado === "aberto").length;
  const emAndamento = tickets.filter(t => t.estado === "em_andamento").length;
  const atendimentosHoje = atendimentos.filter(a => a.data === "2025-01-14" && a.estado === "agendado").length;

  const filteredTickets = tickets
    .filter(t => filterStatus === "all" || t.estado === filterStatus)
    .filter(t =>
      t.estudante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.matricula.includes(searchTerm)
    );

  const filteredAtendimentos = atendimentos.filter(a =>
    a.estudante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.matricula.includes(searchTerm)
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Apoio ao Estudante</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão de solicitações e agendamento de atendimentos
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Novo Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Atendimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Estudante</Label>
                <Input placeholder="Nome ou matrícula do estudante" />
              </div>
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea placeholder="Descreva o motivo do atendimento..." className="resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <DialogClose asChild><Button>Agendar</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{abertos}</p>
              <p className="text-xs text-muted-foreground mt-1">Solicitações Abertas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{emAndamento}</p>
              <p className="text-xs text-muted-foreground mt-1">Em Andamento</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{atendimentosHoje}</p>
              <p className="text-xs text-muted-foreground mt-1">Atendimentos Hoje</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="solicitacoes" className="gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Solicitações
            </TabsTrigger>
            <TabsTrigger value="atendimentos" className="gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Atendimentos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 h-9 w-56"
            />
          </div>
          {activeTab === "solicitacoes" && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-9">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="aberto">Abertos</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="resolvido">Resolvidos</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === "solicitacoes" && (
        <div className="space-y-2">
          {filteredTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma solicitação encontrada</p>
            </Card>
          ) : (
            filteredTickets.map(ticket => {
              const status = statusConfig[ticket.estado];
              const prioridade = prioridadeConfig[ticket.prioridade];
              const StatusIcon = status.icon;
              return (
                <Card
                  key={ticket.id}
                  className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground truncate">{ticket.assunto}</p>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${prioridade.className}`}>
                          {prioridade.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{ticket.estudante}</span>
                        <span>·</span>
                        <span>{ticket.matricula}</span>
                        <span>·</span>
                        <span>{ticket.categoria}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={`text-[10px] gap-1 ${status.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(ticket.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === "atendimentos" && (
        <div className="space-y-2">
          {filteredAtendimentos.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhum atendimento encontrado</p>
            </Card>
          ) : (
            filteredAtendimentos.map(a => {
              const estadoCfg = atendimentoEstadoConfig[a.estado];
              return (
                <Card key={a.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-14 shrink-0">
                      <span className="text-lg font-bold text-foreground leading-none">
                        {new Date(a.data).getDate()}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {new Date(a.data).toLocaleDateString("pt-AO", { month: "short" })}
                      </span>
                    </div>
                    <div className="w-px h-10 bg-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{a.estudante}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.motivo}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {a.hora}
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {a.tipo === "presencial" ? "Presencial" : "Online"}
                      </Badge>
                      <Badge className={`text-[10px] border-0 ${estadoCfg.className}`}>
                        {estadoCfg.label}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (() => {
            const status = statusConfig[selectedTicket.estado];
            const prioridade = prioridadeConfig[selectedTicket.prioridade];
            const StatusIcon = status.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">{selectedTicket.assunto}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`text-xs gap-1 ${status.className}`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${prioridade.className}`}>
                      Prioridade: {prioridade.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{selectedTicket.categoria}</Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{selectedTicket.estudante}</span>
                      <span className="text-xs text-muted-foreground">({selectedTicket.matricula})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedTicket.curso}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Descrição</Label>
                    <p className="text-sm text-foreground">{selectedTicket.descricao}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Criado: {new Date(selectedTicket.data).toLocaleDateString("pt-AO")}</span>
                    {selectedTicket.ultimaResposta && (
                      <span>Última resposta: {new Date(selectedTicket.ultimaResposta).toLocaleDateString("pt-AO")}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Responder</Label>
                    <Textarea placeholder="Escreva uma resposta..." className="resize-none" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>Fechar</Button>
                  <Button size="sm">Enviar Resposta</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
