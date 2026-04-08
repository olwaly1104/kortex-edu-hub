import { useParams, Link, useNavigate } from "react-router-dom";
import { coordNotas, coordCursoInfo, coordTurmaTasks } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Clock, MapPin, User, CheckCircle, ArrowLeft, Users, GraduationCap } from "lucide-react";

export default function NotasTurmaDetail() {
  const { year, turma } = useParams();
  const yearNum = Number(year);
  const yearData = coordNotas.find(n => n.year === yearNum);
  const turmaData = yearData?.turmas.find(t => t.turma === turma);

  if (!turmaData) {
    return (
      <div className="p-6 lg:p-8 space-y-4 animate-fade-in">
        <Link to="/coordenador/notas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar às Notas
        </Link>
        <p className="text-muted-foreground">Turma não encontrada.</p>
      </div>
    );
  }

  const totalAprov = turmaData.avaliacoes.reduce((s, a) => s + a.aprovados, 0);
  const totalReprov = turmaData.avaliacoes.reduce((s, a) => s + a.reprovados, 0);
  const totalPart = totalAprov + totalReprov;
  const taxaAprovacao = totalPart > 0 ? Math.round((totalAprov / totalPart) * 100) : 0;
  const taxaReprovacao = totalPart > 0 ? Math.round((totalReprov / totalPart) * 100) : 0;
  const taxaConclusao = turmaData.avaliacoesTotal > 0 ? Math.round((turmaData.avaliacoesCompletas / turmaData.avaliacoesTotal) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to="/coordenador/notas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às Notas
      </Link>

      {/* Header + KPIs Card */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-foreground">Turma {turmaData.turma}</h1>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                turmaData.mediaGeral >= 14 ? "bg-accent/15 text-accent border-accent/30"
                : turmaData.mediaGeral >= 10 ? "bg-muted text-muted-foreground border-border"
                : "bg-destructive/15 text-destructive border-destructive/30"
              }`}
            >
              {turmaData.mediaGeral >= 14 ? "Excelente" : turmaData.mediaGeral >= 10 ? "Normal" : "Em Risco"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] gap-1"><GraduationCap className="w-3 h-3" />{coordCursoInfo.name}</Badge>
            <Badge variant="outline" className="text-[10px] gap-1">{yearNum}º Ano</Badge>
            <Badge variant="outline" className="text-[10px] gap-1">{coordCursoInfo.faculty}</Badge>
          </div>
        </div>

        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${turmaData.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{turmaData.mediaGeral}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-accent" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Aprovado</p>
              <p className={`text-sm font-bold ${taxaAprovacao >= 70 ? "text-accent" : taxaAprovacao >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaAprovacao}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-destructive" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Reprovado</p>
              <p className={`text-sm font-bold ${taxaReprovacao > 30 ? "text-destructive" : "text-foreground"}`}>{taxaReprovacao}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Avaliações</p>
              <p className="text-sm font-bold text-foreground">{turmaData.avaliacoesCompletas}<span className="text-xs text-muted-foreground font-medium">/{turmaData.avaliacoesTotal}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Clock className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Taxa Conclusão</p>
              <p className={`text-sm font-bold ${taxaConclusao >= 80 ? "text-accent" : taxaConclusao >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaConclusao}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-secondary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Participantes</p>
              <p className="text-sm font-bold text-foreground">{totalPart}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Avaliacoes list */}
      <div className="space-y-2">
        {turmaData.avaliacoes.map((a, i) => {
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
  );
}
