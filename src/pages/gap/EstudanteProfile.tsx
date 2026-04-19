import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Heart, AlertTriangle, Clock, CheckCircle, User, Mail, Phone,
  CalendarDays, HelpCircle, MessageSquare, FileText, MapPin, GraduationCap,
} from "lucide-react";
import {
  gapEstudantesSeguimento, gapTickets, gapAtendimentos,
  categoriaConfig, ticketStatusConfig, prioridadeConfig,
} from "@/data/gapData";

const riscoConfig = {
  alto: { label: "Risco Alto", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  medio: { label: "Risco Médio", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  baixo: { label: "Risco Baixo", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

export default function GapEstudanteProfile() {
  const { matricula } = useParams();
  const navigate = useNavigate();
  const estudante = gapEstudantesSeguimento.find(e => e.matricula === matricula);

  if (!estudante) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Estudante não encontrado.</p>
        <Button onClick={() => navigate("/gap/estudantes")} className="mt-4" variant="outline">Voltar</Button>
      </div>
    );
  }

  const tickets = gapTickets.filter(t => t.matricula === estudante.matricula);
  const atendimentos = gapAtendimentos.filter(a => a.matricula === estudante.matricula);
  const r = riscoConfig[estudante.risco];
  const RIcon = r.icon;
  const ticketsAbertos = tickets.filter(t => t.estado === "aberto" || t.estado === "em_andamento").length;
  const atsConcluidos = atendimentos.filter(a => a.estado === "concluido").length;
  const atsAgendados = atendimentos.filter(a => a.estado === "agendado").length;

  const initials = estudante.nome.split(" ").map(n => n[0]).slice(0, 2).join("");
  const email = `${estudante.nome.toLowerCase().split(" ").slice(0, 2).join(".")}@upra.kor`;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Link to="/gap/estudantes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar a Estudantes
      </Link>

      {/* Header card */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 via-card to-card border-border">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{estudante.nome}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Matrícula <span className="font-mono">{estudante.matricula}</span> · {estudante.curso} · {estudante.ano}º ano
                </p>
              </div>
              <Badge variant="outline" className={`text-xs gap-1.5 ${r.color}`}>
                <RIcon className="w-3.5 h-3.5" /> {r.label}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">+244 923 000 000</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">Responsável: {estudante.responsavel}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button size="sm" className="gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Enviar mensagem</Button>
              <Button size="sm" variant="outline" className="gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Agendar atendimento</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Solicitações", value: tickets.length, color: "text-primary bg-primary/10", icon: HelpCircle },
          { label: "Solicitações Abertas", value: ticketsAbertos, color: "text-orange-600 bg-orange-100", icon: Clock },
          { label: "Agendamentos", value: atsAgendados, color: "text-emerald-600 bg-emerald-100", icon: CalendarDays },
          { label: "Atendimentos Concluídos", value: atsConcluidos, color: "text-pink-600 bg-pink-100", icon: Heart },
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

      {/* Plano de acompanhamento */}
      <Card className="p-5">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" /> Plano de Acompanhamento
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Motivo principal</p>
            <p className="font-medium text-foreground">{estudante.motivo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Último contacto</p>
            <p className="font-medium text-foreground">
              {new Date(estudante.ultimoContacto).toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Acompanhamentos realizados</p>
            <p className="font-medium text-foreground">{estudante.acompanhamentos} sessões</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Profissional responsável</p>
            <p className="font-medium text-foreground">{estudante.responsavel}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="solicitacoes">
        <TabsList>
          <TabsTrigger value="solicitacoes">Solicitações <Badge variant="outline" className="ml-1.5 text-[10px]">{tickets.length}</Badge></TabsTrigger>
          <TabsTrigger value="agendamentos">Agendamentos <Badge variant="outline" className="ml-1.5 text-[10px]">{atendimentos.length}</Badge></TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="solicitacoes" className="mt-4 space-y-2">
          {tickets.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">Sem solicitações registadas</p></Card>
          ) : tickets.map(t => {
            const cat = categoriaConfig[t.categoria];
            const st = ticketStatusConfig[t.estado];
            const pr = prioridadeConfig[t.prioridade];
            return (
              <Card key={t.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{t.assunto}</p>
                      <span className="text-[10px] text-muted-foreground font-mono">{t.id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.descricao}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${pr.color}`}>{pr.label}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {new Date(t.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="agendamentos" className="mt-4 space-y-2">
          {atendimentos.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-sm text-muted-foreground">Sem agendamentos registados</p></Card>
          ) : atendimentos.map(a => {
            const cat = categoriaConfig[a.categoria];
            return (
              <Card key={a.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center shrink-0 w-14">
                    <p className="text-sm font-bold text-foreground">{a.hora}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(a.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.motivo}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {a.responsavel}</span>
                      <span>· {a.duracao}</span>
                      {a.sala && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.sala}</span>}
                    </div>
                    {a.notas && <p className="text-[11px] text-muted-foreground mt-1.5 italic">"{a.notas}"</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${cat.color}`}>{cat.label}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{a.estado}</Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Linha do tempo</h3>
            <div className="space-y-3">
              {[...tickets.map(t => ({ data: t.data, tipo: "Solicitação", texto: t.assunto, color: "bg-primary" })),
                ...atendimentos.map(a => ({ data: a.data, tipo: "Atendimento", texto: a.motivo, color: "bg-emerald-500" }))]
                .sort((a, b) => b.data.localeCompare(a.data))
                .map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ev.color}`} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(ev.data).toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })} · {ev.tipo}
                      </p>
                      <p className="text-sm text-foreground">{ev.texto}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
