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
  Plus, Calendar as CalendarIcon, Clock, MapPin, Video, Search, Users, FileText,
} from "lucide-react";
import { gapAtendimentos, ticketCategoriaConfig as categoriaConfig, TicketCategoria } from "@/data/gapData";

const estadoConfig: Record<string, { label: string; color: string }> = {
  agendado: { label: "Agendado", color: "bg-blue-100 text-blue-700 border-blue-200" },
  concluido: { label: "Concluído", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700 border-red-200" },
  remarcar: { label: "Remarcar", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function GapAtendimentos() {
  const [filter, setFilter] = useState<"todos" | "hoje" | "agendados" | "concluidos">("agendados");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const today = "2025-01-16";
    return gapAtendimentos
      .filter(a => {
        if (filter === "hoje") return a.data === today;
        if (filter === "agendados") return a.estado === "agendado";
        if (filter === "concluidos") return a.estado === "concluido";
        return true;
      })
      .filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return a.estudante.toLowerCase().includes(s) || a.matricula.includes(search) || a.motivo.toLowerCase().includes(s);
      })
      .sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora));
  }, [filter, search]);

  const counts = {
    todos: gapAtendimentos.length,
    hoje: gapAtendimentos.filter(a => a.data === "2025-01-16").length,
    agendados: gapAtendimentos.filter(a => a.estado === "agendado").length,
    concluidos: gapAtendimentos.filter(a => a.estado === "concluido").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Agendamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sessões de apoio agendadas e concluídas
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label>Estudante</Label>
                <Input placeholder="Nome ou matrícula" />
              </div>
              <div className="space-y-2">
                <Label>Motivo</Label>
                <Textarea placeholder="Descreva o motivo..." className="resize-none" rows={3} />
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
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Data</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>Hora</Label><Input type="time" /></div>
                <div className="space-y-2"><Label>Duração</Label><Input placeholder="50 min" /></div>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="helena">Dra. Helena Cabral</SelectItem>
                    <SelectItem value="joao">Dr. João Tavares</SelectItem>
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

      <Tabs value={filter} onValueChange={v => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="todos">Todos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.todos}</Badge></TabsTrigger>
          <TabsTrigger value="hoje">Hoje <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.hoje}</Badge></TabsTrigger>
          <TabsTrigger value="agendados">Agendados <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.agendados}</Badge></TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos <Badge variant="outline" className="ml-1.5 text-[10px]">{counts.concluidos}</Badge></TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Pesquisar agendamentos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">Nenhum agendamento encontrado</p></Card>
        ) : (
          filtered.map(a => {
            const cat = categoriaConfig[a.categoria];
            const est = estadoConfig[a.estado];
            return (
              <Card key={a.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center w-14 shrink-0">
                    <p className="text-lg font-bold text-foreground leading-none">
                      {new Date(a.data).getDate()}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {new Date(a.data).toLocaleDateString("pt-AO", { month: "short" })}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-foreground">{a.estudante}</p>
                      <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{a.motivo}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a.responsavel}</span>
                      {a.sala && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.sala}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {a.hora}
                      <span className="text-[10px] opacity-70">· {a.duracao}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] gap-1">
                      {a.tipo === "online" ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                      {a.tipo === "online" ? "Online" : "Presencial"}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${est.color}`}>{est.label}</Badge>
                  </div>
                </div>
                {a.notas && (
                  <div className="mt-3 pt-3 border-t border-border flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground italic">{a.notas}</p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
