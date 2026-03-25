import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { candidaturas, sessoesProva, estadoColors, estadoLabels, type EstadoCandidatura } from "@/data/admissoesData";
import { AlertTriangle, Clock, CalendarDays, Users } from "lucide-react";

const pipelineStates: EstadoCandidatura[] = ["pendente", "docs_aprovados", "convocado", "aguarda_resultados", "aprovado", "reprovado", "desistiu"];

export default function SecretariaDashboard() {
  const counts = pipelineStates.map(s => ({ state: s, count: candidaturas.filter(c => c.estado === s).length }));
  
  const pendingDocs = candidaturas.filter(c => c.estado === "pendente");
  const unconfirmedPayments = candidaturas.filter(c => c.pagamento.estado === "pendente").length;
  const missingDocs = candidaturas.filter(c => c.estado === "pendente" && c.documentos.some(d => !d.entregue)).length;

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingSessions = sessoesProva.filter(s => {
    const d = new Date(s.data);
    return d >= now && d <= in7days;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Secretaria Académica</h1>
        <p className="text-muted-foreground">Painel operacional de admissões</p>
      </div>

      {/* Alerts */}
      {(unconfirmedPayments > 0 || missingDocs > 0) && (
        <div className="flex flex-wrap gap-3">
          {unconfirmedPayments > 0 && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>{unconfirmedPayments}</strong> pagamento(s) por confirmar</span>
            </div>
          )}
          {missingDocs > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>{missingDocs}</strong> candidatura(s) com documentos em falta</span>
            </div>
          )}
        </div>
      )}

      {/* Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Pipeline de Candidaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {counts.map(({ state, count }) => (
              <div key={state} className="text-center p-3 rounded-lg border bg-card">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <Badge className={`mt-1 text-[10px] ${estadoColors[state]}`}>{estadoLabels[state]}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fila de Ação */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Fila de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma candidatura pendente de revisão.</p>
            ) : (
              <div className="space-y-3">
                {pendingDocs.map(c => {
                  const daysWaiting = Math.floor((now.getTime() - new Date(c.dataSubmissao).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">{c.cursoOpcao1}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${daysWaiting > 14 ? "text-destructive" : "text-muted-foreground"}`}>
                        {daysWaiting} dias
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Provas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Próximas Provas (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma prova nos próximos 7 dias.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="text-sm font-medium">{s.curso}</p>
                      <p className="text-xs text-muted-foreground">{s.sala} · {s.hora}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(s.data).toLocaleDateString("pt-AO")}</p>
                      <p className="text-xs text-muted-foreground">{s.candidatosIds.length}/{s.capacidadeMax} candidatos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
