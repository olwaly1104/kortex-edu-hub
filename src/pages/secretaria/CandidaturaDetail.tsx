import { useParams, useNavigate } from "react-router-dom";
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
  const docsEntregues = c.documentos.filter(d => d.entregue).length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
              {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{c.nome}</h1>
              <p className="text-sm text-muted-foreground font-mono">{c.bi}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.telefone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
              </div>
            </div>
          </div>
          <Badge className={`border-0 ${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {opcoes.map((o, i) => (
            <Badge key={i} variant="outline" className="text-xs gap-1"><GraduationCap className="w-3 h-3" /> {i + 1}ª: {o}</Badge>
          ))}
          <Badge variant="outline" className="text-xs">{c.periodo}</Badge>
          <Badge variant="outline" className="text-xs">Docs {docsEntregues}/{c.documentos.length}</Badge>
          {c.nota !== undefined && <Badge variant="outline" className="text-xs">Nota: {c.nota}/20</Badge>}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs"><MessageSquare className="w-3.5 h-3.5" /> Mensagem</Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Mail className="w-3.5 h-3.5" /> Email</Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
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
              <FileText className="w-4 h-4" /> Documentos ({docsEntregues}/{c.documentos.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {c.documentos.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {d.aprovado === true ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                   d.aprovado === false ? <XCircle className="w-4 h-4 text-red-600" /> :
                   d.entregue ? <Clock className="w-4 h-4 text-yellow-600" /> :
                   <XCircle className="w-4 h-4 text-muted-foreground/40" />}
                  <span className="text-sm text-foreground">{d.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!d.entregue ? (
                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">Em falta</Badge>
                  ) : d.aprovado === true ? (
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-600 border-green-200">Aprovado</Badge>
                  ) : d.aprovado === false ? (
                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">Rejeitado</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-600 border-yellow-200">Pendente</Badge>
                  )}
                  {d.entregue && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="w-3 h-3" /> Ver</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Approve/Reject buttons for pending state */}
          {c.estado === "pendente" && docsEntregues === c.documentos.length && (
            <div className="p-4 border-t bg-muted/20 flex items-center gap-3">
              <Button size="sm" className="gap-1.5 flex-1">
                <CheckCircle className="w-4 h-4" /> Aprovar Todos os Documentos
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5">
                <XCircle className="w-4 h-4" /> Rejeitar
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Payment - view only */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pagamento
          </h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Estado</p>
            <Badge variant="outline" className={`text-xs ${c.pagamento.estado === "confirmado" ? "bg-green-50 text-green-600 border-green-200" : "bg-yellow-50 text-yellow-600 border-yellow-200"}`}>
              {c.pagamento.estado === "confirmado" ? "Confirmado" : "Pendente"}
            </Badge>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Referência</p>
            <p className="text-sm font-medium text-foreground font-mono">{c.pagamento.referencia}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Valor</p>
            <p className="text-sm font-medium text-foreground">{c.pagamento.valor.toLocaleString("pt-AO")} Kz</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Comprovativo</p>
            {c.pagamento.comprovativo ? (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7"><Eye className="w-3 h-3" /> Ver</Button>
            ) : (
              <span className="text-sm text-muted-foreground">Não submetido</span>
            )}
          </div>
        </div>
      </Card>

      {/* Actions based on state */}
      {c.estado === "docs_aprovados" && (
        <Card className="p-4 flex items-center gap-3">
          <Button className="gap-1.5"><Calendar className="w-4 h-4" /> Convocar para Prova</Button>
          <Button variant="outline" className="gap-1.5"><MessageSquare className="w-4 h-4" /> Enviar Mensagem</Button>
        </Card>
      )}
    </div>
  );
}
