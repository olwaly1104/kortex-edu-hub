import { useParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import {
  ArrowLeft, Phone, Mail, FileText, CheckCircle, XCircle, Clock,
  MessageSquare, Eye, GraduationCap, Calendar, User, CreditCard,
} from "lucide-react";

export default function CandidaturaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = candidaturas.find(x => x.id === id);

  if (!c) return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>
      <p className="text-muted-foreground text-center py-12">Candidatura não encontrada.</p>
    </div>
  );

  const opcoes = [c.cursoOpcao1, c.cursoOpcao2, c.cursoOpcao3].filter(Boolean);

  const actionsByState: Record<string, { label: string; variant: "default" | "destructive" }[]> = {
    pendente: [{ label: "Aprovar Documentos", variant: "default" }, { label: "Rejeitar Candidatura", variant: "destructive" }],
    docs_aprovados: [{ label: "Convocar para Prova", variant: "default" }],
    aguarda_resultados: [{ label: "Registar Resultado", variant: "default" }],
  };
  const actions = actionsByState[c.estado] || [];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" /> Detalhe da Candidatura
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Informações completas do candidato</p>
      </div>

      {/* Identity banner */}
      <Card className="px-5 py-3.5 border-l-4 border-l-primary space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{c.nome}</h2>
              <p className="text-xs text-muted-foreground font-mono">{c.bi}</p>
            </div>
          </div>
          <Badge className={`border-0 ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {opcoes.map((o, i) => (
            <Badge key={i} variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" /> {i + 1}ª Opção: {o}</Badge>
          ))}
          <Badge variant="outline" className="text-[10px]">{c.periodo}</Badge>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
            <MessageSquare className="w-3.5 h-3.5" /> Mensagem
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
        </div>
      </Card>

      {/* Personal Info */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Informações de Contacto</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { icon: Phone, iconBg: "bg-primary/10", iconColor: "text-primary", label: "Telefone", value: c.telefone },
            { icon: Mail, iconBg: "bg-secondary/10", iconColor: "text-secondary", label: "Email", value: c.email },
            { icon: Calendar, iconBg: "bg-primary/10", iconColor: "text-primary", label: "Data Submissão", value: new Date(c.dataSubmissao).toLocaleDateString("pt-AO") },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Linha do Tempo</h3>
        </div>
        <div className="p-5">
          <div className="relative pl-6 space-y-4">
            {c.historico.map((h, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                {i < c.historico.length - 1 && <div className="absolute -left-[18px] top-4 w-px h-full bg-border" />}
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] border-0 ${estadoColors[h.para]}`}>{estadoLabels[h.para]}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(h.data).toLocaleDateString("pt-AO")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">por {h.responsavel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" /> Documentos
          </h3>
        </div>
        <div className="divide-y divide-border">
          {c.documentos.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                {d.aprovado === true ? <CheckCircle className="w-4 h-4 text-accent" /> :
                 d.aprovado === false ? <XCircle className="w-4 h-4 text-destructive" /> :
                 <Clock className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-foreground">{d.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                {!d.entregue ? (
                  <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">Em falta</Badge>
                ) : (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="w-3 h-3" /> Ver</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pagamento
          </h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <p className="text-sm text-muted-foreground">Estado</p>
            <Badge variant="outline" className={`text-xs ${c.pagamento.estado === "confirmado" ? "bg-accent/15 text-accent border-accent/30" : "bg-secondary/10 text-secondary border-secondary/20"}`}>
              {c.pagamento.estado === "confirmado" ? "Confirmado" : "Pendente"}
            </Badge>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <p className="text-sm text-muted-foreground">Referência</p>
            <p className="text-sm font-semibold text-foreground font-mono">{c.pagamento.referencia}</p>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5">
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="text-sm font-semibold text-foreground">{c.pagamento.valor.toLocaleString("pt-AO")} Kz</p>
          </div>
          {(c.pagamento.comprovativo || c.pagamento.estado === "pendente") && (
            <div className="flex items-center justify-end gap-2 px-5 py-3.5">
              {c.pagamento.comprovativo && (
                <Button variant="outline" size="sm" className="gap-1 text-xs"><Eye className="w-3 h-3" /> Ver Comprovativo</Button>
              )}
              {c.pagamento.estado === "pendente" && (
                <Button size="sm" className="gap-1 text-xs"><CheckCircle className="w-3 h-3" /> Confirmar Pagamento</Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      {actions.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <div className="flex flex-wrap gap-3">
            {actions.map((a, i) => (
              <Button key={i} variant={a.variant} size="sm">{a.label}</Button>
            ))}
            <Button variant="outline" size="sm" className="gap-1"><MessageSquare className="w-3 h-3" /> Enviar Mensagem</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
