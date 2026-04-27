import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Mail, MessageCircle, Users, Phone, MapPin, UserCheck, Calendar, GraduationCap,
  HelpCircle, Clock, CheckCircle2, AlertCircle, CalendarDays, Heart, Inbox, BookOpen,
} from "lucide-react";
import {
  gapEstudantesSeguimento, solicitacoes, gapAtendimentos,
  estadoSolicitacaoConfig, tipoConfig, destinoConfig,
} from "@/data/gapData";
import { cn } from "@/lib/utils";

const riscoConfig = {
  alto:  { label: "Risco Alto",  bg: "bg-destructive/10 text-destructive border-destructive/30" },
  medio: { label: "Risco Médio", bg: "bg-amber-100 text-amber-700 border-amber-200" },
  baixo: { label: "Risco Baixo", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export default function GapEstudanteProfile() {
  const { matricula } = useParams();
  const navigate = useNavigate();
  const discente = gapEstudantesSeguimento.find(e => e.matricula === matricula);

  if (!discente) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
        <p className="text-muted-foreground text-center py-12">Discente não encontrado.</p>
      </div>
    );
  }

  const r = riscoConfig[discente.risco];
  const sols = solicitacoes.filter(s => s.matricula === discente.matricula);
  const atendimentos = gapAtendimentos.filter(a => a.matricula === discente.matricula);

  const pendentes = sols.filter(s => s.estado === "recebida").length;
  const emExecucao = sols.filter(s => s.estado === "em_execucao").length;
  const concluidas = sols.filter(s => s.estado === "concluida").length;

  const email = `${discente.nome.toLowerCase().split(" ").slice(0, 2).join(".")}@upra.kor`;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Perfil do Discente
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações pessoais e histórico de solicitações</p>
      </div>

      {/* Identity banner */}
      <Card className="px-5 py-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {discente.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-foreground">{discente.nome}</h2>
              <Badge variant="outline" className={`text-xs ${r.bg}`}>{r.label}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <Badge variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> {discente.curso}</Badge>
              <Badge variant="outline" className="text-[10px]">{discente.ano}º Ano</Badge>
              <Badge variant="outline" className="text-[10px] font-mono">{discente.matricula}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                <Mail className="w-3.5 h-3.5" /> Email
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações Pessoais</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Mail className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Email</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{email}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Phone className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Telefone</p>
            </div>
            <p className="text-sm font-semibold text-foreground">+244 923 000 000</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><MapPin className="w-4 h-4 text-accent" /></div>
              <p className="text-sm text-muted-foreground">Morada</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Rua da Samba, Nº 45, Luanda</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
            </div>
            <p className="text-sm font-semibold text-foreground">15/03/2001</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><UserCheck className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Encarregado de Educação</p>
            </div>
            <p className="text-sm font-semibold text-foreground">Maria Santos</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Phone className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Nº Encarregado</p>
            </div>
            <p className="text-sm font-semibold text-foreground">+244 912 345 678</p>
          </div>
        </div>
      </Card>

      {/* Informações de Solicitações */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações de Solicitações</h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Inbox className="w-4 h-4 text-primary" /></div>
              <p className="text-sm text-muted-foreground">Total de Solicitações</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{sols.length}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-pink-600" /></div>
              <p className="text-sm text-muted-foreground">Agendamentos GAP</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{atendimentos.length}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Heart className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Acompanhamentos</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{discente.acompanhamentos} sessões</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-secondary" /></div>
              <p className="text-sm text-muted-foreground">Último Contacto</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {new Date(discente.ultimoContacto).toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </Card>

      {/* Histórico de Solicitações */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Histórico de Solicitações
          </h3>
        </div>
        <div className="divide-y divide-border">
          {sols.length > 0 ? sols.map(s => {
            const st = estadoSolicitacaoConfig[s.estado];
            const dest = destinoConfig[s.destino];
            const tipoCfg = tipoConfig[s.tipo];
            return (
              <Link
                key={s.id}
                to={`/gap/solicitacoes/${s.id}`}
                className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{tipoCfg?.label ?? s.tipo}</p>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">{s.id}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(s.dataSubmissao).toLocaleDateString("pt-AO", { day: "2-digit", month: "short", year: "numeric" })} · {dest.label}
                  </p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", st.color)}>{st.label}</Badge>
              </Link>
            );
          }) : (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">Sem solicitações registadas.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
