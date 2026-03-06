import { useState } from "react";
import { Link } from "react-router-dom";
import { coordNotas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight, Calendar, Clock, MapPin, User, CheckCircle, ArrowLeft } from "lucide-react";

export default function CoordenadorNotas() {
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  const allTurmas = coordNotas.flatMap(y => y.turmas.map(t => ({ ...t, year: y.year })));

  const mediaGeral = allTurmas.length > 0
    ? Math.round((allTurmas.reduce((s, t) => s + t.mediaGeral, 0) / allTurmas.length) * 10) / 10
    : coordCursoInfo.mediaGeral;
  const totalAvalCompletas = allTurmas.reduce((s, t) => s + t.avaliacoesCompletas, 0);
  const totalAvalTotal = allTurmas.reduce((s, t) => s + t.avaliacoesTotal, 0);

  const getTurmaAprovacao = (t: { avaliacoes: { aprovados: number; reprovados: number }[] }) => {
    const totalAprov = t.avaliacoes.reduce((s, a) => s + a.aprovados, 0);
    const totalPart = t.avaliacoes.reduce((s, a) => s + a.aprovados + a.reprovados, 0);
    return totalPart > 0 ? Math.round((totalAprov / totalPart) * 100) : 0;
  };

  const globalAprov = allTurmas.reduce((s, t) => s + t.avaliacoes.reduce((a, e) => a + e.aprovados, 0), 0);
  const globalReprov = allTurmas.reduce((s, t) => s + t.avaliacoes.reduce((a, e) => a + e.reprovados, 0), 0);
  const globalPart = globalAprov + globalReprov;
  const taxaAprovacao = globalPart > 0 ? Math.round((globalAprov / globalPart) * 100) : 0;
  const taxaReprovacao = globalPart > 0 ? Math.round((globalReprov / globalPart) * 100) : 0;
  const taxaConclusao = totalAvalTotal > 0 ? Math.round((totalAvalCompletas / totalAvalTotal) * 100) : 0;

  const selectedData = selectedTurma
    ? (() => {
        const [yr, tm] = selectedTurma.split("-");
        const yearData = coordNotas.find(n => n.year === Number(yr));
        const turma = yearData?.turmas.find(t => t.turma === tm);
        return turma ? { year: Number(yr), ...turma } : null;
      })()
    : null;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {selectedTurma && (
        <Link to="/coordenador/notas" onClick={(e) => { e.preventDefault(); setSelectedTurma(null); }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar às Turmas
        </Link>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Notas do Curso
        </h1>
        <p className="text-muted-foreground mt-1">{coordCursoInfo.name} · {coordCursoInfo.faculty}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{mediaGeral}/20</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avaliações</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAvalCompletas}<span className="text-sm text-muted-foreground font-medium">/{totalAvalTotal}</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Aprovado</span>
          </div>
          <p className={`text-2xl font-bold ${taxaAprovacao >= 70 ? "text-accent" : taxaAprovacao >= 50 ? "text-foreground" : "text-destructive"}`}>
            {taxaAprovacao}%
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><Award className="w-4 h-4 text-destructive" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Reprovado</span>
          </div>
          <p className={`text-2xl font-bold ${taxaReprovacao > 30 ? "text-destructive" : "text-foreground"}`}>
            {taxaReprovacao}%
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Conclusão</span>
          </div>
          <p className={`text-2xl font-bold ${taxaConclusao >= 80 ? "text-accent" : taxaConclusao >= 50 ? "text-foreground" : "text-destructive"}`}>
            {taxaConclusao}%
          </p>
        </Card>
      </div>




      {/* Years grid — 3 per row */}
      {!selectedTurma && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coordNotas.map(yearData => (
            <div key={yearData.year} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{yearData.year}º Ano</h2>
              <div className="space-y-1.5">
                {yearData.turmas.map(t => {
                  const turmaKey = `${yearData.year}-${t.turma}`;
                  return (
                    <Card
                      key={turmaKey}
                      className="p-3 transition-all cursor-pointer hover:shadow-md border-l-[3px] group"
                      style={{ borderLeftColor: t.mediaGeral >= 10 ? "hsl(var(--accent))" : "hsl(var(--destructive))" }}
                      onClick={() => setSelectedTurma(turmaKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-xs font-semibold text-foreground">Turma {t.turma}</p>
                          <Badge
                            variant="outline"
                            className={`text-[9px] ${
                              t.mediaGeral >= 14 ? "bg-accent/15 text-accent border-accent/30"
                              : t.mediaGeral >= 10 ? "bg-muted text-muted-foreground border-border"
                              : "bg-destructive/15 text-destructive border-destructive/30"
                            }`}
                          >
                            {t.mediaGeral >= 14 ? "Excelente" : t.mediaGeral >= 10 ? "Normal" : "Em Risco"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Média Geral</p>
                            <p className={`text-xs font-bold ${t.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{t.mediaGeral}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Aprov.</p>
                            <p className={`text-xs font-bold ${getTurmaAprovacao(t) >= 70 ? "text-accent" : getTurmaAprovacao(t) >= 50 ? "text-foreground" : "text-destructive"}`}>{getTurmaAprovacao(t)}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Reprov.</p>
                            <p className={`text-xs font-bold ${(100 - getTurmaAprovacao(t)) > 30 ? "text-destructive" : "text-foreground"}`}>{100 - getTurmaAprovacao(t)}%</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-muted-foreground uppercase leading-tight">Aval.</p>
                            <p className="text-xs font-bold text-foreground">{t.avaliacoesCompletas}/{t.avaliacoesTotal}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded turma detail */}
      {selectedData && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Turma {selectedData.turma}</h2>
            <Badge variant="outline" className="text-[10px]">{selectedData.year}º Ano</Badge>
             <Badge variant={selectedData.mediaGeral >= 10 ? "default" : "destructive"} className="text-[10px]">
               Média Geral {selectedData.mediaGeral}/20
            </Badge>
          </div>

          <div className="space-y-2">
            {selectedData.avaliacoes.map((a, i) => {
              const total = a.aprovados + a.reprovados;
              return (
                <Card key={`${a.code}-${i}`} className="p-4 border-l-[3px]" style={{ borderLeftColor: a.media >= 10 ? "hsl(var(--accent) / 0.6)" : "hsl(var(--destructive) / 0.6)" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground">{a.name}</p>
                        <Badge variant="outline" className="text-[10px] font-mono">{a.code}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mb-1.5">{a.cadeira}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{a.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>
                        <span className="flex items-center gap-1">{a.period}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{a.professor}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.local}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-3 shrink-0 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Média Geral</p>
                        <p className={`text-xs font-bold ${a.media >= 10 ? "text-accent" : "text-destructive"}`}>{a.media}/20</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Partic.</p>
                        <p className="text-xs font-bold text-foreground">{total}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Aprov.</p>
                        <p className="text-xs font-bold text-accent">{a.aprovados}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">% Aprov.</p>
                        <p className={`text-xs font-bold ${total > 0 && Math.round((a.aprovados / total) * 100) >= 70 ? "text-accent" : total > 0 && Math.round((a.aprovados / total) * 100) >= 50 ? "text-foreground" : "text-destructive"}`}>{total > 0 ? Math.round((a.aprovados / total) * 100) : 0}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Reprov.</p>
                        <p className="text-xs font-bold text-destructive">{a.reprovados}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">% Reprov.</p>
                        <p className={`text-xs font-bold ${total > 0 && Math.round((a.reprovados / total) * 100) > 30 ? "text-destructive" : "text-foreground"}`}>{total > 0 ? Math.round((a.reprovados / total) * 100) : 0}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
