import { useState } from "react";
import { coordNotas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp, ChevronRight, ClipboardList, Calendar, Clock, MapPin, User } from "lucide-react";

export default function CoordenadorNotas() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  const data = selectedYear ? coordNotas.filter(n => n.year === selectedYear) : coordNotas;

  // Compute KPIs based on selected turma or all
  const allTurmas = data.flatMap(y => y.turmas);
  const filteredTurmas = selectedTurma
    ? allTurmas.filter(t => `${data.find(y => y.turmas.includes(t))?.year}-${t.turma}` === selectedTurma)
    : allTurmas;

  const mediaGeral = filteredTurmas.length > 0
    ? Math.round((filteredTurmas.reduce((s, t) => s + t.mediaGeral, 0) / filteredTurmas.length) * 10) / 10
    : selectedYear
      ? coordCursoInfo.years.find(y => y.year === selectedYear)?.mediaGeral ?? coordCursoInfo.mediaGeral
      : coordCursoInfo.mediaGeral;
  const totalAvalCompletas = filteredTurmas.reduce((s, t) => s + t.avaliacoesCompletas, 0);
  const totalAvalTotal = filteredTurmas.reduce((s, t) => s + t.avaliacoesTotal, 0);
  const totalTurmas = filteredTurmas.length;

  // Get turmas for the selected year (for turma toggle)
  const turmasForYear = selectedYear ? data[0]?.turmas ?? [] : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas do Curso</h1>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">Ano:</span>
        <button
          onClick={() => { setSelectedYear(null); setSelectedTurma(null); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
        >Todos</button>
        {coordCursoInfo.years.map(y => (
          <button
            key={y.year}
            onClick={() => { setSelectedYear(y.year); setSelectedTurma(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedYear === y.year ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >{y.year}º Ano</button>
        ))}
      </div>

      {/* Turma selector — only when a year is selected */}
      {selectedYear && turmasForYear.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Turma:</span>
          <button
            onClick={() => setSelectedTurma(null)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${
              selectedTurma === null
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >Todas</button>
          {turmasForYear.map(t => {
            const key = `${selectedYear}-${t.turma}`;
            return (
              <button
                key={key}
                onClick={() => setSelectedTurma(selectedTurma === key ? null : key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${
                  selectedTurma === key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >Turma {t.turma}</button>
            );
          })}
        </div>
      )}

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

      {/* Turma cards — show when a specific turma is selected, or all turmas when no turma filter */}
      {data.map(yearData => {
        const visibleTurmas = selectedTurma
          ? yearData.turmas.filter(t => `${yearData.year}-${t.turma}` === selectedTurma)
          : yearData.turmas;
        if (visibleTurmas.length === 0) return null;

        return (
          <div key={yearData.year}>
            <h2 className="text-lg font-semibold text-foreground mb-3">{yearData.year}º Ano</h2>
            <div className="space-y-2">
              {visibleTurmas.map(t => {
                const turmaKey = `${yearData.year}-${t.turma}`;
                // If a turma is selected via toggle, auto-expand it
                const isExpanded = selectedTurma === turmaKey;
                return (
                  <div key={turmaKey}>
                    <Card
                      className={`p-4 transition-all border-l-[3px] ${t.mediaGeral >= 10 ? "border-l-accent" : "border-l-destructive"} ${!selectedTurma ? "cursor-pointer hover:shadow-md" : ""}`}
                      onClick={() => {
                        if (!selectedTurma) {
                          setSelectedYear(yearData.year);
                          setSelectedTurma(turmaKey);
                        }
                      }}
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
                        {!selectedTurma && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </Card>

                    {/* Expanded: avaliações when turma is selected */}
                    {isExpanded && (
                      <div className="ml-4 mt-2 space-y-1.5 animate-fade-in">
                        {t.avaliacoes.map((a, i) => {
                          const total = a.aprovados + a.reprovados;
                          const taxa = total > 0 ? Math.round((a.aprovados / total) * 100) : 0;
                          return (
                            <Card key={`${a.code}-${i}`} className={`p-4 border-l-[3px] ${a.media >= 10 ? "border-l-accent/50" : "border-l-destructive/50"}`}>
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
                                <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                                    <p className={`text-xs font-bold ${a.media >= 10 ? "text-accent" : "text-destructive"}`}>{a.media}/20</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Aprov.</p>
                                    <p className="text-xs font-bold text-accent">{a.aprovados}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Reprov.</p>
                                    <p className="text-xs font-bold text-destructive">{a.reprovados}</p>
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
        );
      })}
    </div>
  );
}