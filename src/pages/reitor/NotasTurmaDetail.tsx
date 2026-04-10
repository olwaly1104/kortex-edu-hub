import { useParams, Link } from "react-router-dom";
import { reitorFaculties } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Users, CheckCircle, BookOpen, GraduationCap, Calendar, Clock } from "lucide-react";
import { useMemo } from "react";

const getEstado = (media: number) =>
  media >= 14 ? { label: "Excelente", cls: "bg-accent/15 text-accent border-accent/30" }
  : media >= 10 ? { label: "Normal", cls: "bg-muted text-muted-foreground border-border" }
  : { label: "Em Risco", cls: "bg-destructive/15 text-destructive border-destructive/30" };

const cadeirasBase = [
  { name: "Cálculo I", code: "CAL1", professor: "Dr. António Silva" },
  { name: "Álgebra Linear", code: "ALG1", professor: "Dra. Maria Santos" },
  { name: "Física Aplicada", code: "FIS1", professor: "Dr. João Ferreira" },
  { name: "Introdução à Programação", code: "IPR1", professor: "Dra. Ana Costa" },
  { name: "Desenho Técnico", code: "DES1", professor: "Dr. Pedro Nunes" },
  { name: "Estatística", code: "EST1", professor: "Dr. Rui Tavares" },
  { name: "Mecânica dos Materiais", code: "MEC1", professor: "Dra. Teresa Lopes" },
  { name: "Química Geral", code: "QUI1", professor: "Dr. Carlos Mendes" },
];

function generateCadeiras(turmaId: string, count: number) {
  const seed = turmaId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: count }, (_, i) => {
    const base = cadeirasBase[(seed + i) % cadeirasBase.length];
    const media = +(10 + ((seed * (i + 1)) % 60) / 10).toFixed(1);
    const presenca = 72 + ((seed * (i + 2)) % 20);
    const aprovados = 15 + ((seed * (i + 3)) % 15);
    const reprovados = 2 + ((seed * (i + 1)) % 8);
    return { ...base, id: `${turmaId}-cad${i}`, media, presenca, aprovados, reprovados };
  });
}

function generateTurmas(courseId: string, years: number, estudantes: number) {
  const turmas: { id: string; name: string; year: number; estudantes: number; disciplinas: number; media: number; presenca: number; }[] = [];
  for (let y = 1; y <= years; y++) {
    const count = y <= 2 ? 2 : 1;
    for (let t = 0; t < count; t++) {
      const letter = String.fromCharCode(65 + t);
      const seed = (courseId + y + letter).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      turmas.push({
        id: `${courseId}-y${y}t${letter}`,
        name: `Turma ${letter}`,
        year: y,
        estudantes: Math.floor(estudantes / (years * count) + (seed % 10) - 5),
        disciplinas: 4 + (seed % 4),
        media: +(10 + (seed % 60) / 10).toFixed(1),
        presenca: 72 + (seed % 20),
      });
    }
  }
  return turmas;
}

export default function ReitorNotasTurmaDetail() {
  const { faculdadeId, cursoId, turmaId } = useParams();
  const fac = reitorFaculties.find(f => f.id === faculdadeId);
  const course = fac?.courses.find(c => c.id === cursoId);
  const turmas = useMemo(() => course ? generateTurmas(course.id, course.years, course.estudantes) : [], [course]);
  const turma = turmas.find(t => t.id === turmaId);
  const cadeiras = useMemo(() => turma ? generateCadeiras(turma.id, turma.disciplinas) : [], [turma]);

  if (!fac || !course || !turma) return (
    <div className="p-8 text-muted-foreground">
      <Link to="/reitor/notas" className="text-primary hover:underline">← Voltar às Notas</Link>
      <p className="mt-4">Turma não encontrada.</p>
    </div>
  );

  const estado = getEstado(turma.media);
  const totalAprov = cadeiras.reduce((s, c) => s + c.aprovados, 0);
  const totalReprov = cadeiras.reduce((s, c) => s + c.reprovados, 0);
  const totalPart = totalAprov + totalReprov;
  const taxaAprov = totalPart > 0 ? Math.round((totalAprov / totalPart) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <Link to="/reitor/notas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às Notas
      </Link>

      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="relative border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/6 via-primary/3 to-transparent" />
          <div className="relative px-5 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-tight">{turma.name}</h1>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${estado.cls}`}>{estado.label}</Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <BookOpen className="w-3 h-3" /> {course.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80">
                {turma.year}º Ano · {fac.name}
              </Badge>
              <Badge variant="outline" className="text-[11px] bg-background/80 gap-1">
                <GraduationCap className="w-3 h-3" /> {course.coordinator}
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Award className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Média Geral</p>
              <p className={`text-sm font-bold ${turma.media >= 10 ? "text-accent" : "text-destructive"}`}>{turma.media}/20</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Estudantes</p>
              <p className="text-sm font-bold text-foreground">{turma.estudantes}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><BookOpen className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Cadeiras</p>
              <p className="text-sm font-bold text-foreground">{turma.disciplinas}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-accent" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">% Aprovação</p>
              <p className={`text-sm font-bold ${taxaAprov >= 70 ? "text-accent" : taxaAprov >= 50 ? "text-foreground" : "text-destructive"}`}>{taxaAprov}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5 text-primary" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight">Presença</p>
              <p className={`text-sm font-bold ${turma.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{turma.presenca}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cadeiras Table */}
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">Cadeiras</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/20">
              <th className="text-left p-3 font-medium text-muted-foreground">Cadeira</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Professor</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Média</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Presença</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Aprovados</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Reprovados</th>
              <th className="text-center p-3 font-medium text-muted-foreground">% Aprov.</th>
            </tr>
          </thead>
          <tbody>
            {cadeiras.map(c => {
              const total = c.aprovados + c.reprovados;
              const pctAprov = total > 0 ? Math.round((c.aprovados / total) * 100) : 0;
              const cEstado = getEstado(c.media);
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-xs">{c.name}</p>
                      <Badge variant="outline" className="text-[9px] font-mono">{c.code}</Badge>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{c.professor}</td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-bold ${c.media >= 10 ? "text-accent" : "text-destructive"}`}>{c.media}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-medium ${c.presenca >= 75 ? "text-accent" : "text-destructive"}`}>{c.presenca}%</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-xs font-medium text-accent">{c.aprovados}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-xs font-medium text-destructive">{c.reprovados}</span>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className={`text-[9px] ${cEstado.cls}`}>{pctAprov}%</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
