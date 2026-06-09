import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { candidaturas, estadoColors, estadoLabels, type EstadoCandidatura } from "@/data/admissoesData";

type StatusFilter = "todas" | EstadoCandidatura;

export default function GapCandidaturas() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todas");

  const filtered = useMemo(() => {
    return candidaturas
      .filter(c => {
        if (status !== "todas" && c.estado !== status) return false;
        if (!search) return true;
        const s = search.toLowerCase();
        return c.nome.toLowerCase().includes(s) || c.bi.includes(search) || c.cursoOpcao1.toLowerCase().includes(s);
      })
      .sort((a, b) => new Date(b.dataSubmissao).getTime() - new Date(a.dataSubmissao).getTime());
  }, [search, status]);

  const kpis = {
    total: candidaturas.length,
    pendentes: candidaturas.filter(c => c.estado === "pendente").length,
    aprovados: candidaturas.filter(c => c.estado === "aprovado").length,
    incompletos: candidaturas.filter(c => c.estado === "incompleto").length,
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "incompleto", label: "Incompleto" },
    { key: "pendente", label: "Pendente" },
    { key: "aprovado", label: "Aprovado" },
    { key: "reprovado", label: "Reprovado" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Candidaturas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhamento de candidatos ao processo de admissão.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Candidaturas", value: kpis.total, icon: ClipboardList, iconBg: "bg-primary/10 text-primary" },
          { label: "Pendentes", value: kpis.pendentes, icon: Clock, iconBg: "bg-yellow-50 text-yellow-600" },
          { label: "Aprovados", value: kpis.aprovados, icon: CheckCircle, iconBg: "bg-green-50 text-green-600" },
          { label: "Incompletos", value: kpis.incompletos, icon: AlertCircle, iconBg: "bg-orange-50 text-orange-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
              </div>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", k.iconBg)}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Pesquisar nome, BI ou curso…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setStatus(f.key)}
                className={cn(
                  "px-2.5 h-8 text-[11px] font-medium rounded-md border transition-colors",
                  status === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
            {filtered.length} de {candidaturas.length}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma candidatura encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Candidato</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">1ª Opção</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Período</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Submissão</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/gap/candidaturas/${c.id}`)}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-3">
                      <p className="font-medium text-foreground leading-tight">{c.nome}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{c.bi}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground leading-tight">{c.cursoOpcao1}</p>
                      {c.cursoOpcao2 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">2ª: {c.cursoOpcao2}</p>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-foreground leading-tight">{c.periodo}</p>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <p className="text-xs text-foreground tabular-nums">
                        {new Date(c.dataSubmissao).toLocaleDateString("pt-AO")}
                      </p>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={cn("border-0 text-[10px]", estadoColors[c.estado])}>
                        {estadoLabels[c.estado]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
