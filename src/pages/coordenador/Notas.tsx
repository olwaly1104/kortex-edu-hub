import { useState } from "react";
import { coordNotas, coordCursoInfo } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, ChevronRight, Calendar, Clock, MapPin, User } from "lucide-react";

export default function CoordenadorNotas() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  const data = selectedYear ? coordNotas.filter(n => n.year === selectedYear) : coordNotas;

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

  const turmasForYear = selectedYear ? data[0]?.turmas ?? [] : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Notas do Curso</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Média Geral</p>
          <p className={`text-2xl font-bold ${mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{mediaGeral}/20</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Avaliações</p>
          <p className="text-2xl font-bold text-foreground">{totalAvalCompletas}<span className="text-sm text-muted-foreground font-medium">/{totalAvalTotal}</span></p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Turmas</p>
          <p className="text-2xl font-bold text-foreground">{totalTurmas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Taxa Conclusão</p>
          <p className={`text-2xl font-bold ${totalAvalTotal > 0 && (totalAvalCompletas / totalAvalTotal) >= 0.8 ? "text-accent" : "text-secondary"}`}>
            {totalAvalTotal > 0 ? Math.round((totalAvalCompletas / totalAvalTotal) * 100) : 0}%
          </p>
        </Card>
      </div>

      {/* Year filter */}
      <div className="flex flex-wrap gap-2">
        {[null, ...coordCursoInfo.years.map(y => y.year)].map(y => (
          <Button key={String(y)} size="sm" variant={selectedYear === y ? "default" : "outline"} onClick={() => { setSelectedYear(y); setSelectedTurma(null); }}>
            {y === null ? "Todos os Anos" : `${y}º Ano`}
          </Button>
        ))}
      </div>

      {/* Turma filter — only when year selected */}
      {selectedYear && turmasForYear.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={selectedTurma === null ? "default" : "outline"} onClick={() => setSelectedTurma(null)}>
            Todas as Turmas
          </Button>
          {turmasForYear.map(t => {
            const key = `${selectedYear}-${t.turma}`;
            return (
              <Button key={key} size="sm" variant={selectedTurma === key ? "default" : "outline"} onClick={() => setSelectedTurma(selectedTurma === key ? null : key)}>
                Turma {t.turma}
              </Button>
            );
          })}
        </div>
      )}

      {/* Turma cards */}
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

                    {isExpanded && (
                      <div className="ml-4 mt-2 space-y-1.5 animate-fade-in">
                        {t.avaliacoes.map((a, i) => {
                          const total = a.aprovados + a.reprovados;
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
                                <div className="grid grid-cols-4 gap-4 shrink-0 text-center">
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Média</p>
                                    <p className={`text-xs font-bold ${a.media >= 10 ? "text-accent" : "text-destructive"}`}>{a.media}/20</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground uppercase">Participantes</p>
                                    <p className="text-xs font-bold text-foreground">{total}</p>
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
