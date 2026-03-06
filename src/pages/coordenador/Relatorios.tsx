import { coordCursoInfo, coordEstudantes, coordDocentes } from "@/data/institutionData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, BookOpen, TrendingUp, Award, CheckCircle, XCircle, Clock, ClipboardList } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export default function CoordenadorRelatorios() {
  const info = coordCursoInfo;
  const avgTaxaSucesso = Math.round(info.years.reduce((s, y) => s + y.taxaSucesso, 0) / info.years.length);

  // Data for charts
  const yearPerformance = info.years.map(y => ({
    name: `${y.year}º Ano`,
    média: y.mediaGeral,
    sucesso: y.taxaSucesso,
    estudantes: y.estudantes,
  }));

  // Student distribution by status
  const excelente = coordEstudantes.filter(e => e.status === "excelente").length;
  const normal = coordEstudantes.filter(e => e.status === "normal").length;
  const risco = coordEstudantes.filter(e => e.status === "risco").length;
  const statusData = [
    { name: "Excelente", value: excelente },
    { name: "Normal", value: normal },
    { name: "Em Risco", value: risco },
  ];
  const STATUS_COLORS = ["hsl(var(--accent))", "hsl(var(--primary))", "hsl(var(--destructive))"];

  // Radar data per year
  const radarData = info.years.map(y => {
    const yStudents = coordEstudantes.filter(e => e.year === y.year);
    const avgPresenca = yStudents.length > 0 ? Math.round(yStudents.reduce((s, e) => s + e.presenca, 0) / yStudents.length) : 0;
    const avgEntrega = yStudents.length > 0 ? Math.round(yStudents.reduce((s, e) => s + e.taxaEntrega, 0) / yStudents.length) : 0;
    return {
      ano: `${y.year}º Ano`,
      Média: Math.round((y.mediaGeral / 20) * 100),
      Sucesso: y.taxaSucesso,
      Presença: avgPresenca,
      Entrega: avgEntrega,
    };
  });

  // Students per year bar
  const studentsPerYear = info.years.map(y => {
    const yStudents = coordEstudantes.filter(e => e.year === y.year);
    return {
      name: `${y.year}º Ano`,
      excelente: yStudents.filter(e => e.status === "excelente").length,
      normal: yStudents.filter(e => e.status === "normal").length,
      risco: yStudents.filter(e => e.status === "risco").length,
    };
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Relatórios e Análise
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{info.name} — Ano Lectivo 2024/2025</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Estudantes", value: info.totalEstudantes, icon: Users, bg: "bg-primary/10", color: "text-primary" },
          { label: "Cadeiras", value: info.disciplinasActivas, icon: BookOpen, bg: "bg-secondary/10", color: "text-secondary" },
          { label: "Média Geral", value: `${info.mediaGeral}/20`, icon: Award, bg: "bg-accent/10", color: "text-accent", valueColor: "text-accent" },
          { label: "Taxa de Sucesso", value: `${avgTaxaSucesso}%`, icon: TrendingUp, bg: "bg-accent/10", color: "text-accent", valueColor: avgTaxaSucesso >= 70 ? "text-accent" : "text-destructive" },
        ].map(k => (
          <div key={k.label} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.bg}`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${k.valueColor || "text-foreground"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Média + Taxa de Sucesso por Ano */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" /> Média Geral por Ano
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={yearPerformance} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`${value}/20`, "Média"]}
              />
              <Bar dataKey="média" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Taxa de Sucesso por Ano
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={yearPerformance} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`${value}%`, "Sucesso"]}
              />
              <Bar dataKey="sucesso" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: Radar + Pie */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-secondary" /> Desempenho Comparativo por Ano
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="ano" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Radar name="Média" dataKey="Média" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Sucesso" dataKey="Sucesso" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Presença" dataKey="Presença" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.1} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Distribuição de Estudantes
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                dataKey="value"
                stroke="hsl(var(--card))"
                strokeWidth={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[i] }} />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Stacked bar — status per year */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" /> Estado dos Estudantes por Ano
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={studentsPerYear} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="excelente" name="Excelente" stackId="a" fill="hsl(var(--accent))" radius={[0, 0, 0, 0]} />
            <Bar dataKey="normal" name="Normal" stackId="a" fill="hsl(var(--primary))" />
            <Bar dataKey="risco" name="Em Risco" stackId="a" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Year detail table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Resumo por Ano Curricular</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Ano</th>
                <th className="px-5 py-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estudantes</th>
                <th className="px-5 py-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Turmas</th>
                <th className="px-5 py-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Cadeiras</th>
                <th className="px-5 py-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Média</th>
                <th className="px-5 py-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Sucesso</th>
                <th className="px-5 py-3 text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {info.years.map(y => {
                const statusLabel = y.taxaSucesso >= 85 ? "Excelente" : y.taxaSucesso < 70 ? "Em Risco" : "Normal";
                const statusClass = y.taxaSucesso >= 85 ? "bg-accent/10 text-accent border-accent/30" : y.taxaSucesso < 70 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30";
                return (
                  <tr key={y.year} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-foreground">{y.year}º Ano</td>
                    <td className="px-5 py-3 text-center text-foreground">{y.estudantes}</td>
                    <td className="px-5 py-3 text-center text-foreground">{y.turmas}</td>
                    <td className="px-5 py-3 text-center text-foreground">{y.disciplinas}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-semibold ${y.mediaGeral >= 10 ? "text-accent" : "text-destructive"}`}>{y.mediaGeral}/20</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-semibold ${y.taxaSucesso >= 70 ? "text-accent" : "text-destructive"}`}>{y.taxaSucesso}%</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge className={`text-[10px] border ${statusClass}`}>{statusLabel}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
