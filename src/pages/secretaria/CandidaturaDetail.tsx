import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { candidaturas, estadoColors, estadoLabels } from "@/data/admissoesData";
import { ArrowLeft, Phone, Mail, FileText, CheckCircle2, XCircle, Clock, MessageSquare, Eye } from "lucide-react";

export default function CandidaturaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const c = candidaturas.find(x => x.id === id);

  if (!c) return (
    <div className="p-6">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
      <p className="mt-4 text-muted-foreground">Candidatura não encontrada.</p>
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
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
          {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{c.nome}</h1>
            <Badge className={`${estadoColors[c.estado]}`}>{estadoLabels[c.estado]}</Badge>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {c.telefone}</span>
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {opcoes.map((o, i) => (
              <Badge key={i} variant="outline" className="text-xs">{i + 1}ª Opção: {o}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Linha do Tempo</CardTitle></CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-4">
              {c.historico.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  {i < c.historico.length - 1 && <div className="absolute -left-[18px] top-4 w-px h-full bg-border" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[10px] ${estadoColors[h.para]}`}>{estadoLabels[h.para]}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(h.data).toLocaleDateString("pt-AO")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">por {h.responsavel}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Documentos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {c.documentos.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    {d.aprovado === true ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                     d.aprovado === false ? <XCircle className="w-4 h-4 text-destructive" /> :
                     <Clock className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-sm">{d.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!d.entregue ? (
                      <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-200">Em falta</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="w-3 h-3" /> Ver</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Pagamento</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <Badge className={c.pagamento.estado === "confirmado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {c.pagamento.estado === "confirmado" ? "Confirmado" : "Pendente"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referência</p>
              <p className="text-sm font-medium">{c.pagamento.referencia}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-sm font-medium">{c.pagamento.valor.toLocaleString("pt-AO")} Kz</p>
            </div>
            {c.pagamento.comprovativo && (
              <Button variant="outline" size="sm" className="gap-1"><Eye className="w-3 h-3" /> Ver Comprovativo</Button>
            )}
            {c.pagamento.estado === "pendente" && (
              <Button size="sm" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmar Pagamento</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {(actions.length > 0) && (
        <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-muted/30">
          {actions.map((a, i) => (
            <Button key={i} variant={a.variant} size="sm">{a.label}</Button>
          ))}
          <Button variant="outline" size="sm" className="gap-1"><MessageSquare className="w-3 h-3" /> Enviar Mensagem</Button>
        </div>
      )}
    </div>
  );
}
