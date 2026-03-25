import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sessoesProva, candidaturas } from "@/data/admissoesData";
import { Award, Send, CheckCircle, XCircle, Clock, Users, Search, X } from "lucide-react";

const MIN_PASSING_GRADE = 10;

type StatusFilter = "todas" | "aprovado" | "reprovado" | "pendente";

export default function SecretariaResultados() {
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("todas");

  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    candidaturas.forEach(c => { if (c.nota !== undefined) init[c.id] = String(c.nota); });
    return init;
  });

  const updateGrade = (id: string, val: string) => {
    setGrades(prev => ({ ...prev, [id]: val }));
  };

  const getResult = (id: string): "aprovado" | "reprovado" | null => {
    const g = grades[id];
    if (!g || isNaN(Number(g))) return null;
    return Number(g) >= MIN_PASSING_GRADE ? "aprovado" : "reprovado";
  };

  // Get all candidates that have been in exam sessions
  const allSessionCandidateIds = sessoesProva.flatMap(s => s.candidatosIds);
  const allSessionCandidates = candidaturas.filter(c => allSessionCandidateIds.includes(c.id));

  const sessionCandidates = useMemo(() => {
    let list = selectedSession === "all"
      ? allSessionCandidates
      : (() => {
          const session = sessoesProva.find(s => s.id === selectedSession);
          return session ? candidaturas.filter(c => session.candidatosIds.includes(c.id)) : [];
        })();

    list = list.filter(c => !search || c.nome.toLowerCase().includes(search.toLowerCase()));

    if (filterStatus !== "todas") {
      list = list.filter(c => {
        const result = getResult(c.id);
        if (filterStatus === "pendente") return result === null;
        return result === filterStatus;
      });
    }

    return list;
  }, [selectedSession, search, filterStatus, grades]);

  const totalAvaliados = allSessionCandidates.filter(c => getResult(c.id) !== null).length;
  const totalAprovados = allSessionCandidates.filter(c => getResult(c.id) === "aprovado").length;
  const totalReprovados = allSessionCandidates.filter(c => getResult(c.id) === "reprovado").length;
  const totalPendentes = allSessionCandidates.filter(c => getResult(c.id) === null).length;

  const hasActiveControls = search !== "" || filterStatus !== "todas" || selectedSession !== "all";

  return (
    <div className="p-6 lg:p-8 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Resultados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Notas das provas de admissão e resultados finais</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-4 h-4 text-primary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Avaliados</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalAvaliados}<span className="text-sm text-muted-foreground font-normal">/{allSessionCandidates.length}</span></p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-accent" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aprovados</span>
          </div>
          <p className="text-2xl font-bold text-accent">{totalAprovados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="w-4 h-4 text-destructive" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reprovados</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{totalReprovados}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Clock className="w-4 h-4 text-secondary" /></div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendentes</span>
          </div>
          <p className={`text-2xl font-bold ${totalPendentes > 0 ? "text-secondary" : "text-foreground"}`}>{totalPendentes}</p>
        </Card>
      </div>

      {/* Controls box */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Session toggles */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={selectedSession === "all" ? "default" : "outline"} onClick={() => setSelectedSession("all")} className="text-xs">
            Todas as Sessões
          </Button>
          {sessoesProva.map(s => (
            <Button key={s.id} size="sm" variant={selectedSession === s.id ? "default" : "outline"} onClick={() => setSelectedSession(selectedSession === s.id ? "all" : s.id)} className="text-xs">
              {s.curso} — {new Date(s.data).toLocaleDateString("pt-AO")}
            </Button>
          ))}
        </div>

        <div className="border-t border-border" />

        {/* Search + Status + Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Pesquisar candidato..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>

          {hasActiveControls && (
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1" onClick={() => { setSearch(""); setFilterStatus("todas"); setSelectedSession("all"); }}>
              <X className="w-3 h-3" /> Limpar
            </Button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {([
              { key: "todas" as StatusFilter, label: "Todas" },
              { key: "aprovado" as StatusFilter, label: "Aprovado" },
              { key: "reprovado" as StatusFilter, label: "Reprovado" },
              { key: "pendente" as StatusFilter, label: "Pendente" },
            ]).map(s => (
              <Button key={s.key} size="sm" variant={filterStatus === s.key ? "default" : "outline"} onClick={() => setFilterStatus(s.key)} className="text-xs">
                {s.label}
              </Button>
            ))}

            <div className="w-px h-6 bg-border" />

            <Badge variant="outline" className="text-xs gap-1">
              <Award className="w-3 h-3" /> Nota mínima: {MIN_PASSING_GRADE}/20
            </Badge>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Candidato</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Curso</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Sessão</th>
              <th className="text-center p-3 font-medium text-muted-foreground w-[120px]">Nota (0-20)</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {sessionCandidates.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted-foreground py-12">
                  <Award className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium">Nenhum candidato encontrado</p>
                </td>
              </tr>
            )}
            {sessionCandidates.map(c => {
              const result = getResult(c.id);
              const sessao = sessoesProva.find(s => s.candidatosIds.includes(c.id));
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.nome}</p>
                        <p className="text-[11px] text-muted-foreground">{c.telefone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-foreground">{c.cursoOpcao1}</td>
                  <td className="p-3">
                    {sessao && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">{new Date(sessao.data).toLocaleDateString("pt-AO")}</p>
                        <p>{sessao.sala} · {sessao.hora}</p>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Input
                      type="number" min={0} max={20}
                      value={grades[c.id] || ""}
                      onChange={e => updateGrade(c.id, e.target.value)}
                      className="h-8 w-20 text-center mx-auto"
                      placeholder="—"
                    />
                  </td>
                  <td className="p-3 text-center">
                    {result === "aprovado" && <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px]">Aprovado</Badge>}
                    {result === "reprovado" && <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[10px]">Reprovado</Badge>}
                    {result === null && <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {sessionCandidates.length > 0 && (
        <div className="flex justify-end">
          <Button className="gap-2"><Send className="w-4 h-4" /> Submeter Resultados</Button>
        </div>
      )}
    </div>
  );
}
