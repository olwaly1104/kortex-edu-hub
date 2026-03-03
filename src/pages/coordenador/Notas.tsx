import { useState } from "react";
import { coordNotas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp, ChevronRight, ClipboardList } from "lucide-react";

export default function CoordenadorNotas() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [expandedTurma, setExpandedTurma] = useState<string | null>(null);

  const data = selectedYear ? coordNotas.filter(n => n.year === selectedYear) : coordNotas;

  // Compute KPIs
  const allTurmas = data.flatMap(y => y.turmas);
  const mediaGeral = selectedYear
    ? coordCursoInfo.years.find(y => y.year === selectedYear)?.mediaGeral ?? coordCursoInfo.mediaGeral
    : coordCursoInfo.mediaGeral;
  const totalAvalCompletas = allTurmas.reduce((s, t) => s + t.avaliacoesCompletas, 0);
  const totalAvalTotal = allTurmas.reduce((s, t) => s + t.avaliacoesTotal, 0);
  const totalTurmas = allTurmas.length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas do Curso</h1>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-medium">Ano:</span>
        <button
          onClick={() => { setSelectedYear(null); setExpandedTurma(null); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >Todos</button>
        {coordCursoInfo.years.map(y => (
          <button
            key={y.year}
            onClick={() => { setSelectedYear(y.year); setExpandedTurma(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === y.year ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >{y.year}º Ano</button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Média Geral</span>
          </div>
          <p className={`text-2xl font-bold ${mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{mediaGeral}/20</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avaliações</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAvalCompletas}<span className="text-sm text-muted-foreground font-medium">/{totalAvalTotal}</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Turmas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalTurmas}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Taxa Conclusão</span>
          </div>
          <p className={`text-2xl font-bold ${totalAvalTotal > 0 && (totalAvalCompletas / totalAvalTotal) >= 0.8 ? "text-accent" : "text-secondary"}`}>
            {totalAvalTotal > 0 ? Math.round((totalAvalCompletas / totalAvalTotal) * 100) : 0}%
          </p>
        </Card>
      </div>

      {/* Year > Turma listing */}
      {data.map(yearData => (
        <div key={yearData.year}>
          <h2 className="text-lg font-semibold text-foreground mb-3">{yearData.year}º Ano</h2>
          <div className="space-y-2">
            {yearData.turmas.map(t => {
              const turmaKey = `${yearData.year}-${t.turma}`;
              const isExpanded = expandedTurma === turmaKey;
              return (
                <div key={turmaKey}>
                  <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-md border-l-[3px] ${t.mediaGeral >= 10 ? "border-l-accent" : "border-l-destructive"}`}
                    onClick={() => setExpandedTurma(isExpanded ? null : turmaKey)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">Turma {t.turma}</p>
                          <Badge variant="outline" className="text-[10px]">{yearData.year}º Ano</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 shrink-0 text-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                          <p className={`text-sm font-bold ${t.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{t.mediaGeral}/20</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Avaliações</p>
                          <p className="text-sm font-bold text-foreground">{t.avaliacoesCompletas}/{t.avaliacoesTotal}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </Card>

                  {/* Expanded: discipline details */}
                  {isExpanded && (
                    <div className="ml-4 mt-2 space-y-1.5 animate-fade-in">
                      {t.disciplinas.map(d => {
                        const total = d.aprovados + d.reprovados;
                        const taxa = total > 0 ? Math.round((d.aprovados / total) * 100) : 0;
                        return (
                          <Card key={d.code} className={`p-3 border-l-[3px] ${d.media >= 10 ? "border-l-accent/50" : "border-l-destructive/50"}`}>
                            <div className="flex items-center gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-semibold text-foreground">{d.name}</p>
                                  <Badge variant="outline" className="text-[10px] font-mono">{d.code}</Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                                  <p className={`text-xs font-bold ${d.media >= 10 ? "text-accent" : "text-destructive"}`}>{d.media}/20</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase">Aprov.</p>
                                  <p className="text-xs font-bold text-accent">{d.aprovados}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase">Reprov.</p>
                                  <p className="text-xs font-bold text-destructive">{d.reprovados}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground uppercase">Sucesso</p>
                                  <Badge variant={taxa >= 80 ? "default" : "secondary"} className="text-[10px]">{taxa}%</Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
